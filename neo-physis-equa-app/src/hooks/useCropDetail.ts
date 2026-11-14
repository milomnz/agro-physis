import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';

import { deleteCrop, getCrop, updateCrop, type Crop, type UpdateCropData } from '../services/crops';
import { isUnauthorizedError } from '../services/api';
import type { CropFormValues } from '../utils/crop-validators';
import { useRequireSession } from './useRequireSession';

export function useCropDetail(id: string | undefined) {
    const router = useRouter();
    const sessionReady = useRequireSession();
    const [loading, setLoading] = useState(true);
    const [crop, setCrop] = useState<Crop | null>(null);
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
                const loadedCrop = await getCrop(id);
                if (cancelled) return;
                setCrop(loadedCrop);
                reset({
                    species: loadedCrop.species,
                    plantedDate: loadedCrop.plantedDate ? loadedCrop.plantedDate.slice(0, 10) : '',
                    growthStage: loadedCrop.growthStage,
                    notes: loadedCrop.notes ?? '',
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
        if (!id || !crop) return;
        setSaved(false);
        setError('');

        try {
            const patch: UpdateCropData = {};
            const species = (data.species ?? '').trim();
            const plantedDate = (data.plantedDate ?? '').trim() || null;
            const notes = (data.notes ?? '').trim() || null;
            const currentDate = crop.plantedDate ? crop.plantedDate.slice(0, 10) : null;
            if (species !== crop.species) patch.species = species;
            if (data.growthStage !== crop.growthStage) patch.growthStage = data.growthStage;
            if (plantedDate !== currentDate) patch.plantedDate = plantedDate;
            if (notes !== crop.notes) patch.notes = notes;

            if (Object.keys(patch).length > 0) {
                const updated = await updateCrop(id, patch);
                setCrop(updated);
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
