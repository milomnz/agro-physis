import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { deleteFarm, getFarm, updateFarm, type Farm } from '../services/farms';
import { isUnauthorizedError } from '../services/api';
import { useFarmForm } from './useFarmForm';
import { useRequireSession } from './useRequireSession';

export function useFarmDetail() {
    const params = useLocalSearchParams<{ id?: string }>();
    const id = typeof params.id === 'string' && params.id ? params.id : undefined;
    const router = useRouter();
    const sessionReady = useRequireSession();

    const [farm, setFarm] = useState<Farm | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [screenError, setScreenError] = useState('');
    const [saved, setSaved] = useState(false);

    const { control, handleSubmit, reset, errors } = useFarmForm();

    useEffect(() => {
        if (!sessionReady) return;
        if (!id) {
            setScreenError('Identificador de finca no válido');
            setLoading(false);
            return;
        }

        (async () => {
            try {
                const data = await getFarm(id);
                setFarm(data);
                reset({
                    name: data.name,
                    vereda: data.location?.vereda ?? '',
                    municipio: data.location?.municipio ?? '',
                    altitude: String(data.altitude ?? ''),
                });
            } catch (err: unknown) {
                if (isUnauthorizedError(err)) return;
                setScreenError(err instanceof Error ? err.message : 'Error al cargar la finca');
            } finally {
                setLoading(false);
            }
        })();
    }, [id, sessionReady, reset]);

    const onSubmit = handleSubmit(async (data) => {
        if (!farm) return;
        setSaving(true);
        setSaved(false);
        setScreenError('');

        try {
            const patch: Record<string, unknown> = {};
            const name = data.name.trim();
            const parsedAltitude = parseFloat(data.altitude);
            if (name !== farm.name) patch.name = name;

            const newLocation: Record<string, string> = {};
            if (data.vereda.trim() !== (farm.location?.vereda ?? '')) newLocation.vereda = data.vereda.trim();
            if (data.municipio.trim() !== (farm.location?.municipio ?? '')) newLocation.municipio = data.municipio.trim();
            if (Object.keys(newLocation).length > 0) patch.location = { ...(farm.location ?? {}), ...newLocation };

            if (parsedAltitude !== farm.altitude) patch.altitude = parsedAltitude;

            if (Object.keys(patch).length === 0) {
                reset({
                    name,
                    vereda: data.vereda.trim(),
                    municipio: data.municipio.trim(),
                    altitude: data.altitude,
                });
                setSaved(true);
                return;
            }

            const updated = await updateFarm(farm.id, patch);
            setFarm(updated);
            reset({
                name: updated.name,
                vereda: updated.location?.vereda ?? '',
                municipio: updated.location?.municipio ?? '',
                altitude: String(updated.altitude ?? ''),
            });
            setSaved(true);
        } catch (err: unknown) {
            if (isUnauthorizedError(err)) return;
            setScreenError(err instanceof Error ? err.message : 'Error al guardar los cambios');
        } finally {
            setSaving(false);
        }
    });

    const requestDelete = () => {
        if (!farm) return;
        setConfirmingDelete(true);
    };

    const cancelDelete = () => {
        if (deleting) return;
        setConfirmingDelete(false);
    };

    const confirmDelete = async () => {
        if (!farm) return;
        setDeleting(true);
        setScreenError('');
        try {
            await deleteFarm(farm.id);
            setConfirmingDelete(false);
            router.replace('/farms');
        } catch (err: unknown) {
            if (isUnauthorizedError(err)) return;
            setConfirmingDelete(false);
            setScreenError(err instanceof Error ? err.message : 'Error al eliminar la finca');
        } finally {
            setDeleting(false);
        }
    };

    const goToCrops = () => {
        if (!farm) return;
        router.push(`/crops?farmId=${farm.id}`);
    };

    return {
        farm,
        loading,
        saving,
        saved,
        screenError,
        confirmingDelete,
        deleting,
        control,
        errors,
        onSubmit,
        requestDelete,
        cancelDelete,
        confirmDelete,
        goToCrops,
        goToFarms: () => router.replace('/farms'),
    };
}
