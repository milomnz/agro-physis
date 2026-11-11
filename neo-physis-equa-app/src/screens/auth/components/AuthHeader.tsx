import { Text, View } from 'react-native';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export default function AuthHeader({
  title,
  subtitle,
  titleClassName = 'text-2xl',
  subtitleClassName = '',
}: AuthHeaderProps) {
  return (
    <View className="items-center gap-1">
      <View className="mb-2 min-h-[64px] min-w-[64px] items-center justify-center rounded-2xl bg-turquesa px-2">
        <Text className="text-2xl font-bricolage text-crema">N</Text>
      </View>
      <Text className={`font-bricolage text-noche ${titleClassName}`}>{title}</Text>
      <Text className={`text-center text-turquesa ${subtitleClassName}`}>{subtitle}</Text>
    </View>
  );
}