import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAccessibility } from '../src/accessibility/context';
import { useSession } from '../src/hooks/useSession';

export default function Index() {
  const { palette } = useAccessibility();
  const { session, loading } = useSession();
  const hasToken = Boolean(session?.token);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-crema">
        <ActivityIndicator size="large" color={palette.spinner} />
      </View>
    );
  }

  return <Redirect href={hasToken ? '/home' : '/login'} />;
}
