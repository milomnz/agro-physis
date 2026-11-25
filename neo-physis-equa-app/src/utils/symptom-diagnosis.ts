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
        id: 'zona',
        title: '¿Dónde ves el problema?',
        options: [
            { id: 'hojas', label: 'En las hojas', keywords: ['hoja', 'follaje', 'foliar'] },
            { id: 'tallos', label: 'En tallos o ramas', keywords: ['tallo', 'rama', 'tronco', 'brote'] },
            { id: 'frutos', label: 'En frutos o flores', keywords: ['fruto', 'flor', 'grano', 'cereza', 'mazorca'] },
            { id: 'raices', label: 'En raíces o base', keywords: ['raiz', 'raices', 'cuello', 'base', 'suelo'] },
            NOT_SURE,
        ],
    },
    {
        id: 'aspecto',
        title: '¿Cómo se ve la parte afectada?',
        options: [
            { id: 'manchas', label: 'Manchas', keywords: ['mancha', 'lesion', 'necros', 'pecas'] },
            { id: 'amarillo', label: 'Se pone amarilla', keywords: ['amarill', 'clorosis', 'palid', 'decolor'] },
            { id: 'agujeros', label: 'Agujeros o mordidas', keywords: ['agujero', 'mordid','mordedur', 'roid', 'perfor', 'comid', 'defolia', 'galeria'] },
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

const LOCAL_BASE_PESTS: Pest[] = [
  {
    id: 'local-catalog-1',
    cropId: '',
    commonName: 'Roya foliar',
    scientificName: 'Hemileia vastatrix',
    severity: 'alta',
    symptoms: ['Manchas amarillas en las hojas', 'Polvo o pústulas anaranjadas en el envés', 'Caída de hojas'],
    affectedCrops: [],
    imageReferences: [],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'local-catalog-2',
    cropId: '',
    commonName: 'Tizón temprano',
    scientificName: 'Alternaria solani',
    severity: 'media',
    symptoms: ['Manchas oscuras concéntricas en las hojas', 'Amarillamiento foliar', 'Hojas que se secan'],
    affectedCrops: [],
    imageReferences: [],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'local-catalog-3',
    cropId: '',
    commonName: 'Gusano o larva defoliadora',
    scientificName: 'Spodoptera frugiperda',
    severity: 'alta',
    symptoms: ['Agujeros o mordeduras en las hojas', 'Presencia de larvas o gusanos en brotes y tallos'],
    affectedCrops: [],
    imageReferences: [],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'local-catalog-4',
    cropId: '',
    commonName: 'Pulgón o áfido',
    scientificName: 'Aphis gossypii',
    severity: 'media',
    symptoms: ['Hojas amarillas y enrolladas', 'Insectos pequeños agrupados en hojas y tallos tiernos', 'Frutos o flores afectados'],
    affectedCrops: [],
    imageReferences: [],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'local-catalog-5',
    cropId: '',
    commonName: 'Ácaro o araña roja',
    scientificName: 'Tetranychus urticae',
    severity: 'media',
    symptoms: ['Puntos diminutos amarillos en las hojas', 'Telarañas finas', 'Hojas que se secan'],
    affectedCrops: [],
    imageReferences: [],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'local-catalog-6',
    cropId: '',
    commonName: 'Marchitez o pudrición radicular',
    scientificName: 'Fusarium oxysporum',
    severity: 'alta',
    symptoms: ['Planta que se marchita o se seca', 'Pudrición en raíces o base del tallo', 'No se observa nada encima de la hoja'],
    affectedCrops: [],
    imageReferences: [],
    createdAt: '',
    updatedAt: '',
  },
];

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
  const existingNames = new Set(pests.map((p) => normalizeText(p.commonName)));
  const pool = [
    ...pests,
    ...LOCAL_BASE_PESTS.filter((item) => !existingNames.has(normalizeText(item.commonName))),
  ];

  const selected = DIAGNOSIS_QUESTIONS.map((q) =>
    q.options.find((o) => o.id === answers[q.id]),
  ).filter((o): o is DiagnosisOption => o !== undefined && o.keywords.length > 0);

  if (selected.length === 0) {
    return pool.slice(0, limit).map((pest) => ({ pest, score: 1, answered: 1 }));
  }

  const matches = pool
    .map((pest) => {
      const text = normalizeText(
        [pest.commonName, pest.scientificName ?? '', ...pest.symptoms].join(' '),
      );
      const score = selected.filter((option) =>
        option.keywords.some((k) => text.includes(k)),
      ).length;
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

  if (matches.length > 0) {
    return matches;
  }

  return pool.slice(0, 2).map((pest) => ({
    pest,
    score: 1,
    answered: selected.length,
  }));
}