import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { getPests, type Pest } from '../services/pests';
import { getCrops, type Crop } from '../services/crops';
import { isUnauthorizedError } from '../services/api';
import { useDebouncedValue } from './useDebouncedValue';
import { useRequireSession } from './useRequireSession';

export function usePestList() {
    const router = useRouter();
    const params = useLocalSearchParams<{ cropId?: string }>();
    const initialCropId = typeof params.cropId === 'string' && params.cropId ? params.cropId : undefined;
    const sessionReady = useRequireSession();

    const [pests, setPests] = useState<Pest[]>([]);
    const [crops, setCrops] = useState<Crop[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCrop, setSelectedCrop] = useState<string | undefined>(initialCropId);
    const [error, setError] = useState('');
    const [warning, setWarning] = useState('');

    const debouncedSearch = useDebouncedValue(search, 300);

    useEffect(() => {
        setSelectedCrop(initialCropId);
    }, [initialCropId]);

    // Reload on every focus: the list stays mounted while other screens are open.
    useFocusEffect(
        useCallback(() => {
            if (!sessionReady) return;

            // Ignore the response if focus is lost before the request finishes.
            let cancelled = false;

            (async () => {
                try {
                    const [pestsData, cropsData] = await Promise.all([getPests(), getCrops()]);
                    if (cancelled) return;
                    setPests(pestsData);
                    setCrops(cropsData);
                    setError('');
                    setWarning('');
                } catch (err: unknown) {
                    if (cancelled || isUnauthorizedError(err)) return;
                    setError(err instanceof Error ? err.message : 'Error al cargar las plagas');
                } finally {
                    // Only the first load shows the spinner; refocus reloads are silent.
                    if (!cancelled) setLoading(false);
                }
            })();

            return () => {
                cancelled = true;
                setWarning('');
            };
        }, [sessionReady]),
    );

    const selectedCropLabel = crops.find((c) => c.id === selectedCrop)?.species;

    const filteredPests = pests.filter((pest) => {
        const matchesCrop = selectedCrop ? pest.cropId === selectedCrop : true;
        const q = debouncedSearch.trim().toLowerCase();
        const matchesSearch =
            !q ||
            pest.commonName.toLowerCase().includes(q) ||
            (pest.scientificName ?? '').toLowerCase().includes(q) ||
            (pest.crop?.species ?? '').toLowerCase().includes(q);
        return matchesCrop && matchesSearch;
    });

    const goToNew = () => {
        if (crops.length === 0) {
            setWarning('Para crear una plaga necesitas tener al menos un cultivo registrado.');
            return;
        }
        const query = selectedCrop ? `?cropId=${encodeURIComponent(selectedCrop)}` : '';
        router.push(`/pests/new${query}`);
    };

    const goToDetail = (id: string) => router.push(`/pests/${id}`);

    const goToCrops = () => router.push('/crops');

    return {
        pests,
        crops,
        filteredPests,
        loading,
        error,
        warning,
        search,
        setSearch,
        selectedCrop,
        setSelectedCrop,
        selectedCropLabel,
        goToNew,
        goToDetail,
        goToCrops,
        dismissError: () => setError(''),
        dismissWarning: () => setWarning(''),
    };
}