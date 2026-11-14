import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import { deleteCrop, getCrop, updateCrop, type UpdateCropData } from '../services/crops';
import { isUnauthorizedError } from '../services/api';
import type { CropFormValues } from '../screens/crops/validators';
import { useRequireSession } from './useRequireSession';

export function useCropDetail(id: string | undefined) {
    const router = useRouter();
    const sessionReady = useRequireSession();
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting },
    } = useForm<CropFormValues>();

    useEffect(() => {
        if (!sessionReady) return;
        if (!id) {
            setError('Identificador de cultivo no válido');
            setLoading(false);
            return;
        }

        // Ignore the response if `id` changes or the screen unmounts mid-request.
        let cancelled = false;
        setLoading(true);

        (async () => {
            try {
                const crop = await getCrop(id);
                if (cancelled) return;
                reset({
                    species: crop.species,
                    plantedDate: crop.plantedDate ? crop.plantedDate.slice(0, 10) : '',
                    growthStage: crop.growthStage,
                    notes: crop.notes ?? '',
                });
            } catch (err: unknown) {
                if (cancelled) return;
                if (isUnauthorizedError(err)) return;
                setError(err instanceof Error ? err.message : 'Error al cargar el cultivo');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [id, sessionReady, reset]);

    const onSubmit = handleSubmit(async (data) => {
        if (!id) return;
        setSaved(false);
        setError('');

        try {
            const current = await getCrop(id);
            const patch: UpdateCropData = {};
            const species = data.species.trim();
            const plantedDate = data.plantedDate.trim() || null;
            const notes = data.notes.trim() || null;
            const currentDate = current.plantedDate ? current.plantedDate.slice(0, 10) : null;
            if (species !== current.species) patch.species = species;
            if (data.growthStage !== current.growthStage) patch.growthStage = data.growthStage;
            if (plantedDate !== currentDate) patch.plantedDate = plantedDate;
            if (notes !== current.notes) patch.notes = notes;

            if (Object.keys(patch).length > 0) {
                await updateCrop(id, patch);
            }
            setSaved(true);
        } catch (err: unknown) {
            if (isUnauthorizedError(err)) return;
            setError(err instanceof Error ? err.message : 'Error al guardar los cambios');
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
        setError('');
        try {
            await deleteCrop(id);
            setConfirmingDelete(false);
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/crops');
            }
        } catch (err: unknown) {
            if (isUnauthorizedError(err)) return;
            setConfirmingDelete(false);
            setError(err instanceof Error ? err.message : 'Error al eliminar el cultivo');
        } finally {
            setDeleting(false);
        }
    };

    return {
        control,
        loading,
        saving: isSubmitting,
        saved,
        error,
        confirmingDelete,
        deleting,
        onSubmit,
        requestDelete,
        cancelDelete,
        confirmDelete,
    };
}
