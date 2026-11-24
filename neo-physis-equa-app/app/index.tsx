import { Redirect } from 'expo-router';
import LoadingView from '../src/components/LoadingView';
import { useSession } from '../src/hooks/useSession';

export default function Index() {
  const { session, loading } = useSession();
  const hasToken = Boolean(session?.token);

  if (loading) {
    return <LoadingView label="Revisando tu sesión…" />;
  }

  return <Redirect href={hasToken ? '/home' : '/login'} />;
}
