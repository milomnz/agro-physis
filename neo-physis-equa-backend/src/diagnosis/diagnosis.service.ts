import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CropsService } from '../crops/crops.service';
import { PestsService } from '../pests/pests.service';
import { Severity } from '../pests/entities/pest.entity';
import { CloudinaryService } from './cloudinary.service';
import { AnalyzeDiagnosisDto } from './dto/analyze-diagnosis.dto';

export interface DiagnosisPestCandidate {
  id: string;
  cropId: string;
  commonName: string;
  scientificName: string | null;
  severity: Severity;
  symptoms: string[];
  affectedCrops: string[];
  imageReferences: string[];
}

export interface DiagnosisMatchItem {
  pest: DiagnosisPestCandidate;
  score: number;
  answered: number;
}

export interface DiagnosisAnalysisResult {
  imageUrl: string | null;
  source: 'gemini' | 'catalog';
  matches: DiagnosisMatchItem[];
}

interface GeminiCandidateResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

interface GeminiRawMatch {
  commonName?: unknown;
  scientificName?: unknown;
  severity?: unknown;
  symptoms?: unknown;
  score?: unknown;
}

const QUESTION_LABELS: Record<string, Record<string, { label: string; keywords: string[] }>> = {
  zona: {
    hojas: { label: 'En las hojas', keywords: ['hoja', 'follaje', 'foliar'] },
    tallos: { label: 'En tallos o ramas', keywords: ['tallo', 'rama', 'tronco', 'brote'] },
    frutos: { label: 'En frutos o flores', keywords: ['fruto', 'flor', 'grano', 'cereza', 'mazorca'] },
    raices: { label: 'En raíces o base', keywords: ['raiz', 'raices', 'cuello', 'base', 'suelo'] },
  },
  aspecto: {
    manchas: { label: 'Manchas', keywords: ['mancha', 'lesion', 'necros', 'pecas'] },
    amarillo: { label: 'Se pone amarilla', keywords: ['amarill', 'clorosis', 'palid', 'decolor'] },
    agujeros: {
      label: 'Agujeros o mordidas',
      keywords: ['agujero', 'mordid', 'mordedur', 'roid', 'perfor', 'comid', 'defolia', 'galeria'],
    },
    marchita: {
      label: 'Se marchita o se seca',
      keywords: ['marchit', 'seca', 'mustia', 'mustio', 'decaim', 'caida'],
    },
  },
  señal: {
    insectos: {
      label: 'Insectos, larvas o gusanos',
      keywords: [
        'insect',
        'larva',
        'oruga',
        'gusano',
        'pulgon',
        'mosca',
        'trips',
        'cochinilla',
        'escarabajo',
        'broca',
        'chinche',
      ],
    },
    polvo: {
      label: 'Polvo, moho o pelusa',
      keywords: ['polvo', 'moho', 'hongo', 'pelusa', 'algodon', 'ceniza', 'roya', 'mildiu', 'oidio', 'pustula'],
    },
    telarana: {
      label: 'Telarañas o puntos diminutos',
      keywords: ['telaran', 'acaro', 'arana', 'punto', 'diminut'],
    },
    nada: {
      label: 'No veo nada encima',
      keywords: ['pudri', 'virus', 'mosaico', 'deform', 'enanismo', 'bacteria'],
    },
  },
};

const BASE_PEST_CATALOG: Array<Omit<DiagnosisPestCandidate, 'id' | 'cropId' | 'imageReferences'>> = [
  {
    commonName: 'Roya foliar',
    scientificName: 'Hemileia vastatrix',
    severity: Severity.ALTA,
    symptoms: ['Manchas amarillas en las hojas', 'Polvo o pústulas anaranjadas en el envés', 'Caída de hojas'],
    affectedCrops: [],
  },
  {
    commonName: 'Tizón temprano',
    scientificName: 'Alternaria solani',
    severity: Severity.MEDIA,
    symptoms: ['Manchas oscuras concéntricas en las hojas', 'Amarillamiento foliar', 'Hojas que se secan'],
    affectedCrops: [],
  },
  {
    commonName: 'Gusano o larva defoliadora',
    scientificName: 'Spodoptera frugiperda',
    severity: Severity.ALTA,
    symptoms: ['Agujeros o mordeduras en las hojas', 'Presencia de larvas o gusanos en brotes y tallos'],
    affectedCrops: [],
  },
  {
    commonName: 'Pulgón o áfido',
    scientificName: 'Aphis gossypii',
    severity: Severity.MEDIA,
    symptoms: ['Hojas amarillas y enrolladas', 'Insectos pequeños agrupados en hojas y tallos tiernos'],
    affectedCrops: [],
  },
  {
    commonName: 'Ácaro o araña roja',
    scientificName: 'Tetranychus urticae',
    severity: Severity.MEDIA,
    symptoms: ['Puntos diminutos amarillos en las hojas', 'Telarañas finas', 'Hojas que se secan'],
    affectedCrops: [],
  },
  {
    commonName: 'Marchitez o pudrición radicular',
    scientificName: 'Fusarium oxysporum',
    severity: Severity.ALTA,
    symptoms: ['Planta que se marchita o se seca', 'Pudrición en raíces o base del tallo', 'Clorosis general'],
    affectedCrops: [],
  },
];

const SEVERITY_WEIGHT: Record<Severity, number> = {
  [Severity.ALTA]: 3,
  [Severity.MEDIA]: 2,
  [Severity.BAJA]: 1,
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[áàä]/g, 'a')
    .replace(/[éèë]/g, 'e')
    .replace(/[íìï]/g, 'i')
    .replace(/[óòö]/g, 'o')
    .replace(/[úùü]/g, 'u')
    .replace(/ñ/g, 'n');
}

@Injectable()
export class DiagnosisService {
  private readonly logger = new Logger(DiagnosisService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly cropsService: CropsService,
    private readonly pestsService: PestsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async analyze(ownerId: string, dto: AnalyzeDiagnosisDto): Promise<DiagnosisAnalysisResult> {
    const crop = await this.cropsService.findOne(dto.cropId, ownerId);
    const existingPests = await this.pestsService.findAll(ownerId, dto.cropId);

    const answeredEntries = this.extractAnsweredOptions(dto.answers);
    const answeredCount = Math.max(answeredEntries.length, 1);

    const [imageUrl, geminiMatches] = await Promise.all([
      dto.imageBase64
        ? this.cloudinaryService.uploadLeafImage(dto.imageBase64, dto.mimeType)
        : Promise.resolve(null),
      this.analyzeWithGemini(
        crop.species,
        crop.growthStage,
        answeredEntries.map((item) => item.label),
        answeredCount,
        dto.cropId,
        dto.imageBase64,
        dto.mimeType,
      ),
    ]);

    const attachImage = (items: DiagnosisMatchItem[]): DiagnosisMatchItem[] =>
      items.map((item) => ({
        ...item,
        pest: {
          ...item.pest,
          imageReferences: imageUrl
            ? [imageUrl]
            : item.pest.imageReferences,
        },
      }));

    if (geminiMatches && geminiMatches.length > 0) {
      return {
        imageUrl,
        source: 'gemini',
        matches: attachImage(geminiMatches),
      };
    }

    const fallbackMatches = this.rankCatalog(
      existingPests.map((p) => ({
        id: p.id,
        cropId: p.cropId,
        commonName: p.commonName,
        scientificName: p.scientificName ?? null,
        severity: p.severity,
        symptoms: p.symptoms ?? [],
        affectedCrops: p.affectedCrops ?? [],
        imageReferences: p.imageReferences ?? [],
      })),
      dto.cropId,
      crop.species,
      answeredEntries,
    );

    return {
      imageUrl,
      source: 'catalog',
      matches: attachImage(fallbackMatches),
    };
  }

  private extractAnsweredOptions(
    answers: Record<string, string> | undefined,
  ): Array<{ label: string; keywords: string[] }> {
    if (!answers) return [];
    const list: Array<{ label: string; keywords: string[] }> = [];

    for (const [questionId, optionId] of Object.entries(answers)) {
      const option = QUESTION_LABELS[questionId]?.[optionId];
      if (option) {
        list.push(option);
      }
    }

    return list;
  }

  private async analyzeWithGemini(
    species: string,
    growthStage: string,
    symptomLabels: string[],
    answeredCount: number,
    cropId: string,
    imageBase64?: string,
    mimeType = 'image/jpeg',
  ): Promise<DiagnosisMatchItem[] | null> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY')?.trim();
    if (!apiKey) {
      return null;
    }

    const prompt = [
      'Eres un fitopatólogo experto en agricultura latinoamericana.',
      `Cultivo: "${species}" (etapa: ${growthStage}).`,
      symptomLabels.length > 0
        ? `Síntomas observados por el agricultor: ${symptomLabels.join('; ')}.`
        : 'El agricultor solicita diagnóstico visual de la planta.',
      'Devuelve únicamente un arreglo JSON con entre 1 y 3 plagas o enfermedades probables ordenadas de mayor a menor probabilidad.',
      'Cada elemento del arreglo debe tener exactamente estas propiedades:',
      '- "commonName": nombre común claro en español (ej. "Roya del cafeto")',
      '- "scientificName": nombre científico en latín (ej. "Hemileia vastatrix")',
      '- "severity": únicamente "baja", "media" o "alta"',
      '- "symptoms": arreglo de 2 a 4 síntomas claros en español',
      `- "score": número entero entre 1 y ${answeredCount} indicando cuántos síntomas coinciden`,
    ].join('\n');

    const parts: Array<Record<string, unknown>> = [{ text: prompt }];

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '').trim();
      if (cleanBase64) {
        parts.push({
          inline_data: {
            mime_type: mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        });
      }
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          }),
        },
      );

      if (!response.ok) {
        this.logger.warn(`Gemini API respondió con estado ${response.status}. Usando catálogo local.`);
        return null;
      }

      const payload = (await response.json()) as GeminiCandidateResponse;
      const rawText = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!rawText) {
        return null;
      }

      const parsed = JSON.parse(rawText) as unknown;
      const list = Array.isArray(parsed) ? (parsed as GeminiRawMatch[]) : [];
      if (list.length === 0) {
        return null;
      }

      return list.slice(0, 3).map((item, idx) => {
        const rawSeverity = typeof item.severity === 'string' ? item.severity.toLowerCase() : 'media';
        const severity: Severity =
          rawSeverity === 'alta'
            ? Severity.ALTA
            : rawSeverity === 'baja'
              ? Severity.BAJA
              : Severity.MEDIA;

        const symptoms = Array.isArray(item.symptoms)
          ? item.symptoms.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
          : symptomLabels;

        const rawScore = typeof item.score === 'number' ? Math.round(item.score) : answeredCount - idx;
        const score = Math.min(Math.max(rawScore, 1), answeredCount);

        return {
          pest: {
            id: `gemini-${idx + 1}`,
            cropId,
            commonName:
              typeof item.commonName === 'string' && item.commonName.trim()
                ? item.commonName.trim()
                : `Plaga probable ${idx + 1}`,
            scientificName:
              typeof item.scientificName === 'string' && item.scientificName.trim()
                ? item.scientificName.trim()
                : null,
            severity,
            symptoms,
            affectedCrops: [species],
            imageReferences: [],
          },
          score,
          answered: answeredCount,
        };
      });
    } catch (error) {
      this.logger.warn(
        `No se pudo completar la consulta a Gemini: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }

  private rankCatalog(
    userPests: DiagnosisPestCandidate[],
    cropId: string,
    species: string,
    answeredEntries: Array<{ label: string; keywords: string[] }>,
  ): DiagnosisMatchItem[] {
    const baseCandidates: DiagnosisPestCandidate[] = BASE_PEST_CATALOG.map((item, index) => ({
      ...item,
      id: `catalog-${index + 1}`,
      cropId,
      affectedCrops: [species],
      imageReferences: [],
    }));

    const existingNames = new Set(userPests.map((p) => normalizeText(p.commonName)));
    const combined = [
      ...userPests,
      ...baseCandidates.filter((c) => !existingNames.has(normalizeText(c.commonName))),
    ];

    if (answeredEntries.length === 0) {
      return combined.slice(0, 3).map((pest) => ({
        pest,
        score: 1,
        answered: 1,
      }));
    }

    const scored = combined
      .map((pest) => {
        const text = normalizeText(
          [pest.commonName, pest.scientificName ?? '', ...pest.symptoms].join(' '),
        );
        const score = answeredEntries.filter((option) =>
          option.keywords.some((kw) => text.includes(kw)),
        ).length;
        return { pest, score, answered: answeredEntries.length };
      })
      .filter((item) => item.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          SEVERITY_WEIGHT[b.pest.severity] - SEVERITY_WEIGHT[a.pest.severity] ||
          a.pest.commonName.localeCompare(b.pest.commonName),
      );

    if (scored.length > 0) {
      return scored.slice(0, 3);
    }

    return combined.slice(0, 2).map((pest) => ({
      pest,
      score: 1,
      answered: answeredEntries.length,
    }));
  }
}