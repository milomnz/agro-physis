import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import { useSession } from './useSession';

export function useRequireSession(): boolean {
    const router = useRouter();
    const { session, loading } = useSession();
    const ready = !loading && Boolean(session?.token);

    useEffect(() => {
        if (!loading && !session?.token) {
            router.replace('/login');
        }
    }, [loading, session, router]);

    return ready;
}
