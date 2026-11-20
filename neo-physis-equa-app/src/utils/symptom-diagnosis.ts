import type { Pest, Severity } from '../services/pests';

export interface DiagnosisOption {
    id: string;
    label: string;
    keywords: string[];


}

export interface DiagnosisQuestion {
    id: string;
    title: string;
    options: DiagnosisOption[];

}

export type DiagnosisAnswers = Record<string, string>;


export interface PestMatch {
    pest: Pest;
    score: number;
    answered: number;
}


const NOT_SURE: DiagnosisOption = { id:'no-se', label:'No estoy seguro', keywords:[] };

export const DIAGNOSIS_QUESTIONS: DiagnosisQuestion[] = [
    {
        id:'zona',
        title: '¿Dónde ves el problema?',
        options: [
            { id: 'hojas', label: 'En las hojas', keywords: ['hoja', 'follaje', 'foliar']},
            NOT_SURE
        ]

    },
    {
        id: 'aspecto',
        title: '¿Cómo se ve la parte afectada?',
        options: [
            { id: 'manchas', label: 'Manchas', keywords: ['mancha', 'lesion', 'necros', 'pecas'] },
            { id: 'amarillo', label: 'Se pone amarilla', keywords: ['amarill', 'clorosis', 'palid', 'decolor'] },
            { id: 'agujeros', label: 'Agujeros o mordidas', keywords: ['agujero', 'mordid', 'roid', 'perfor', 'comid', 'defolia', 'galeria'] },
            { id: 'marchita', label: 'Se marchita o se seca', keywords: ['marchit', 'seca', 'mustia', 'mustio', 'decaim', 'caida'] },
            NOT_SURE
        ]
    },
    {
        id: 'señal', 
        title:'¿Ves algo sobre la planta?',
        options: [
            {
                id: 'insectos',
                label: 'Insectos, larvas o gusanos',
                keywords: ['insect', 'larva', 'oruga', 'gusano', 'pulgon', 'mosca', 'trips', 'cochinilla', 'escarabajo', 'broca', 'chinche'],

   
            },
            {
                id: 'polvo',
                    label: 'Polvo, moho o pelusa',
                    keywords: ['polvo', 'moho', 'hongo', 'pelusa', 'algodon', 'ceniza', 'roya', 'mildiu', 'oidio', 'pustula'],
            },
            {
                    id: 'telarana',
                    label: 'Telarañas o puntos diminutos',
                    keywords: ['telaran', 'acaro', 'arana', 'punto', 'diminut'],
            },
            {
                    id: 'nada',
                    label: 'No veo nada encima',
                    keywords: ['pudri', 'virus', 'mosaico', 'deform', 'enanismo', 'bacteria'],
            },
            NOT_SURE,
        ],
            
    },
];

const SEVERITY_RANK: Record<Severity, number> = { alta: 3, media: 2, baja: 1 };

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[áàä]/g, 'a')
    .replace(/[éèë]/g, 'e')
    .replace(/[íìï]/g, 'i')
    .replace(/[óòö]/g, 'o')
    .replace(/[úùü]/g, 'u')
    .replace(/ñ/g, 'n');
}


export function rankPests(pests: Pest[], answers: DiagnosisAnswers, limit = 3): PestMatch[] {
  const selected = DIAGNOSIS_QUESTIONS.map((q) => q.options.find((o) => o.id === answers[q.id])).filter(
    (o): o is DiagnosisOption => o !== undefined && o.keywords.length > 0,
  );
  if (selected.length === 0) return [];

  return pests
    .map((pest) => {
      const text = normalizeText([pest.commonName, pest.scientificName ?? '', ...pest.symptoms].join(' '));
      const score = selected.filter((option) => option.keywords.some((k) => text.includes(k))).length;
      return { pest, score, answered: selected.length };
    })
    .filter((match) => match.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        SEVERITY_RANK[b.pest.severity] - SEVERITY_RANK[a.pest.severity] ||
        a.pest.commonName.localeCompare(b.pest.commonName),
    )
    .slice(0, limit);
}
   