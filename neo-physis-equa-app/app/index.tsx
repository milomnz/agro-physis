import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useSession } from '../src/hooks/useSession';

export default function Index() {
  const { session, loading } = useSession();
  const hasToken = Boolean(session?.token);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-crema">
        <ActivityIndicator size="large" color="#17536D" />
      </View>
    );
  }

  return <Redirect href={hasToken ? '/home' : '/login'} />;
}