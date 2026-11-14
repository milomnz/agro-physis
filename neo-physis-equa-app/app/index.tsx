import { ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccessibility } from '../src/accessibility/context';
import { useSession } from '../src/hooks/useSession';

export default function Index() {
  const { palette } = useAccessibility();
  const { session, loading } = useSession();
  const hasToken = Boolean(session?.token);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }} className={`items-center justify-center ${palette.bg}`}>
        <ActivityIndicator size="large" color={palette.spinner} />
      </SafeAreaView>
    );
  }

  return <Redirect href={hasToken ? '/home' : '/login'} />;
}
