import { useEffect, useMemo, useState} from 'react';
import { useLocalSearchParams } from 'expo-router';

import { isUnauthorizedError } from '../services/api';
import { getCrops, type Crop } from '../services/crops';
import { getPests, type Pest } from '../services/pests';
import { DIAGNOSIS_QUESTIONS, rankPests, type DiagnosisAnswers } from '../utils/symptom-diagnosis';
import { useRequireSession } from './useRequireSession';


export function useDiagnosis() {
    const params = useLocalSearchParams<{ cropId: string }>();
    const initialCropId = typeof params.cropId === 'string' && params.cropId ? params.cropId : undefined;
    const sessionReady = useRequireSession();

    const [crops, setCrops] = useState<Crop[]>([]);
    const [cropId, setCropId] = useState<string | undefined>(initialCropId);
    const [pests, setPests] = useState<Pest[]>([]);
    const [loadingCrops, setLoadingCrops] = useState(true);
    const[loadingPests, setLoadingPests] = useState(Boolean(initialCropId));
    const [error, setError] = useState('');
    const [questionIndex, setQuestionsIndex] = useState(0);
    const [answers, setAnswers] = useState<DiagnosisAnswers>({});

    const totalQuestions = DIAGNOSIS_QUESTIONS.length;

    //Cultivos del usuarios
    useEffect(() => {
        if (!sessionReady) return;

        let cancelled = false;

        (async () => {
            try {
                const data = await getCrops();
                if (!cancelled) setCrops(data);
            } catch (err: unknown) {
                if (cancelled || isUnauthorizedError(err)) return;
                setError(err instanceof Error ? err.message : 'Error al cargar los cultivos');
            } finally {
                if (!cancelled) setLoadingCrops(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [sessionReady]);

    // 2) Plagas del cultivo elegido
    useEffect(() => {
        if (!sessionReady || !cropId) return;

        let cancelled = false;

        (async () => {
            try {
                const data = await getPests(cropId);
                if (!cancelled) setPests(data);
            } catch (err: unknown) {
                if (cancelled || isUnauthorizedError(err)) return;
                setError(err instanceof Error ? err.message : 'Error al cargar las plagas');
            } finally {
                if (!cancelled) setLoadingPests(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [cropId, sessionReady]);

    const loading = loadingCrops || loadingPests;
    const crop = crops.find((c) => c.id === cropId);
    const question = DIAGNOSIS_QUESTIONS[questionIndex];

    // En qué pantalla estamos
    const stage: 'crop' | 'empty' | 'question' | 'result' = !cropId
        ? 'crop'
        : pests.length === 0
          ? 'empty'
          : questionIndex >= totalQuestions
            ? 'result'
            : 'question';

    const results = useMemo(
        () => (stage === 'result' ? rankPests(pests, answers) : []),
        [stage, pests, answers],
    );

    const chooseCrop = (id: string) => {
        setError('');
        setPests([]);
        setAnswers({});
        setQuestionsIndex(0);
        setLoadingPests(true);
        setCropId(id);
    };

    const changeCrop = () => {
        setError('');
        setPests([]);
        setAnswers({});
        setQuestionsIndex(0);
        setCropId(undefined);
    };

    const answer = (questionId: string, optionId: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
        setQuestionsIndex((index) => index + 1);
    };

    // Desde la primera pregunta, "Atrás" vuelve a elegir cultivo.
    const goBack = () => {
        if (questionIndex > 0) setQuestionsIndex((index) => index - 1);
        else changeCrop();
    };

    const restart = () => {
        setAnswers({});
        setQuestionsIndex(0);
    };

    return {
        stage,
        loading,
        error,
        crops,
        crop,
        question,
        questionIndex,
        totalQuestions,
        answers,
        results,
        chooseCrop,
        changeCrop,
        answer,
        goBack,
        restart,
    };
}
    

