import { Text, View } from 'react-native';

import Badge from '../../../components/Badge';
import Card from '../../../components/Card';
import IconBadge from '../../../components/IconBadge';
import { useAccessibility } from '../../../accessibility/context';
import type { Pest } from '../../../services/pests';
import { type } from '../../../theme/tokens';

interface PestCardProps {
  pest: Pest;
  onPress: (pest: Pest) => void;
}

export default function PestCard({ pest, onPress }: PestCardProps) {
  const { palette } = useAccessibility();

  return (
    <Card
      onPress={() => onPress(pest)}
      accessibilityLabel={`Plaga ${pest.commonName}, severidad ${pest.severity}`}
      accessibilityHint="Abre el detalle de la plaga para editarla o eliminarla"
    >
      <View className="flex-row items-center gap-3">
        <IconBadge icon="bug" />
        <View className="flex-1 gap-1">
          <Text className={`${type.subheading} ${palette.title}`}>{pest.commonName}</Text>
          {pest.scientificName ? (
            <Text className={`${type.caption} italic ${palette.sub}`}>{pest.scientificName}</Text>
          ) : null}
        </View>
      </View>
      <View className="flex-row flex-wrap items-center gap-2">
        <Text className={`${type.caption} ${palette.sub}`}>Severidad:</Text>
        <Badge value={pest.severity} />
      </View>
      <Text className={`${type.caption} ${palette.sub}`}>
        Cultivo: {pest.crop?.species ?? 'No asociado'}
      </Text>
      {pest.symptoms.length > 0 ? (
        <Text className={`${type.caption} ${palette.faint}`} numberOfLines={2}>
          Síntomas: {pest.symptoms.join(', ')}
        </Text>
      ) : null}
    </Card>
  );
}
