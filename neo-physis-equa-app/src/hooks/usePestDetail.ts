import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import { deletePest, getPest, updatePest, type Severity } from '../services/pests';
import { isUnauthorizedError } from '../services/api';
import { useRequireSession } from './useRequireSession';

interface PestForm {
    commonName: string;
    scientificName: string;
    symptoms: string;
    severity: Severity;
}

export function usePestDetail() {
    const params = useLocalSearchParams<{ id?: string }>();
    const id = typeof params.id === 'string' && params.id ? params.id : undefined;
    const router = useRouter();
    const sessionReady = useRequireSession();

    const [loading, setLoading] = useState(true);
    const [pest, setPest] = useState<Awaited<ReturnType<typeof getPest>> | null>(null);
    const [saving, setSaving] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [screenError, setScreenError] = useState('');
    const [saved, setSaved] = useState(false);

    const { control, handleSubmit, reset } = useForm<PestForm>();

    useEffect(() => {
        if (!sessionReady) return;
        if (!id) {
            setScreenError('Identificador de plaga no válido');
            setLoading(false);
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const loadedPest = await getPest(id);
                if (cancelled) return;
                setPest(loadedPest);
                reset({
                    commonName: loadedPest.commonName,
                    scientificName: loadedPest.scientificName ?? '',
                    symptoms: loadedPest.symptoms.join(', '),
                    severity: loadedPest.severity,
                });
            } catch (err: unknown) {
                if (cancelled || isUnauthorizedError(err)) return;
                setScreenError(err instanceof Error ? err.message : 'Error al cargar la plaga');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [id, sessionReady, reset]);

    const onSubmit = handleSubmit(async (data) => {
        if (!id || !pest) return;
        setSaving(true);
        setSaved(false);
        setScreenError('');

        try {
            const patch: Record<string, unknown> = {};
            const commonName = (data.commonName ?? '').trim();
            const scientificName = (data.scientificName ?? '').trim() || null;
            const symptoms = (data.symptoms ?? '')
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            if (commonName !== pest.commonName) patch.commonName = commonName;
            if (scientificName !== pest.scientificName) patch.scientificName = scientificName;
            if (data.severity !== pest.severity) patch.severity = data.severity;
            if (symptoms.join('|') !== pest.symptoms.join('|')) patch.symptoms = symptoms;

            if (Object.keys(patch).length > 0) {
                const updated = await updatePest(id, patch);
                setPest(updated);
            }
            setSaved(true);
        } catch (err: unknown) {
            if (isUnauthorizedError(err)) return;
            setScreenError(err instanceof Error ? err.message : 'Error al guardar los cambios');
        } finally {
            setSaving(false);
        }
    });

    const requestDelete = () => {
        if (!id) return;
        setConfirmingDelete(true);
    };

    const cancelDelete = () => {
        if (deleting) return;
        setConfirmingDelete(false);
    };

    const confirmDelete = async () => {
        if (!id) return;
        setDeleting(true);
        setScreenError('');
        try {
            await deletePest(id);
            setConfirmingDelete(false);
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/pests');
            }
        } catch (err: unknown) {
            if (isUnauthorizedError(err)) return;
            setConfirmingDelete(false);
            setScreenError(err instanceof Error ? err.message : 'Error al eliminar la plaga');
        } finally {
            setDeleting(false);
        }
    };

    return {
        control,
        loading,
        saving,
        saved,
        screenError,
        confirmingDelete,
        deleting,
        onSubmit,
        requestDelete,
        cancelDelete,
        confirmDelete,
        dismissSaved: () => setSaved(false),
        dismissError: () => setScreenError(''),
    };
}