import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import { getCrops, type Crop } from '../services/crops';
import { createPest, type Severity } from '../services/pests';
import { isUnauthorizedError } from '../services/api';
import { useRequireSession } from './useRequireSession';

interface PestForm {
    cropId: string;
    commonName: string;
    scientificName: string;
    symptoms: string;
    severity: Severity;
}

export function useNewPest() {
    const router = useRouter();
    const params = useLocalSearchParams<{ cropId?: string }>();
    const initialCropId = typeof params.cropId === 'string' && params.cropId ? params.cropId : undefined;
    const sessionReady = useRequireSession();
    const [crops, setCrops] = useState<Crop[]>([]);
    const [loading, setLoading] = useState(true);

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<PestForm>({
        defaultValues: {
            cropId: initialCropId ?? '',
            commonName: '',
            scientificName: '',
            symptoms: '',
            severity: 'media',
        },
    });

    useEffect(() => {
        if (!sessionReady) return;
        let cancelled = false;

        (async () => {
            try {
                const data = await getCrops();
                if (cancelled) return;
                setCrops(data);
            } catch (err: unknown) {
                if (cancelled || isUnauthorizedError(err)) return;
                setError('root', {
                    type: 'manual',
                    message: err instanceof Error ? err.message : 'Error al cargar los cultivos',
                });
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [sessionReady, setError]);

    const onSubmit = handleSubmit(async (data) => {
        try {
            const pest = await createPest({
                cropId: data.cropId,
                commonName: (data.commonName ?? '').trim(),
                scientificName: (data.scientificName ?? '').trim() || null,
                severity: data.severity,
                symptoms: (data.symptoms ?? '')
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
            });
            router.replace(`/pests?cropId=${pest.cropId}`);
        } catch (err: unknown) {
            if (isUnauthorizedError(err)) return;
            setError('root', {
                type: 'manual',
                message: err instanceof Error ? err.message : 'Error inesperado del servidor',
            });
        }
    });

    const goToCrops = () => router.replace('/crops');

    return {
        control,
        crops,
        loading,
        submitting: isSubmitting,
        rootError: errors.root?.message,
        onSubmit,
        goToCrops,
    };
}