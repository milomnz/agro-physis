import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import Button from '../../../components/Button';
import Card from '../../../components/Card';
import IconBadge from '../../../components/IconBadge';
import { useAccessibility } from '../../../accessibility/context';
import type { Farm } from '../../../services/farms';
import { type } from '../../../theme/tokens';

interface FarmCardProps {
  farm: Farm;
  onScan: (farm: Farm) => void;
  onOpen: (farm: Farm) => void;
}

export default function FarmCard({ farm, onScan, onOpen }: FarmCardProps) {
  const { highContrast, palette } = useAccessibility();
  const location =
    [farm.location?.vereda, farm.location?.municipio].filter(Boolean).join(', ') ||
    'Ubicación no especificada';

  return (
    <Card
      accessibilityLabel={`Finca ${farm.name}, altitud ${farm.altitude} metros sobre el nivel del mar`}
    >
      <View className="flex-row items-center gap-4">
        <IconBadge icon="leaf" />
        <View className="flex-1 gap-1">
          <Text className={`${type.subheading} ${palette.title}`}>{farm.name}</Text>
          <View className="flex-row items-center gap-1.5">
            <Ionicons name="location-outline" size={16} color={palette.icon} />
            <Text className={`flex-1 ${type.caption} ${palette.sub}`}>{location}</Text>
          </View>
        </View>
      </View>

      <Text
        className={`self-start rounded-chip px-3 py-1 ${type.data} ${
          highContrast ? 'bg-crema text-tinta' : 'bg-azul text-crema'
        }`}
      >
        {farm.altitude} m s. n. m.
      </Text>

      <Button
        text="Diagnosticar plagas"
        icon="scan-outline"
        onPress={() => onScan(farm)}
        accessibilityLabel={`Iniciar escáner de cámara para la finca ${farm.name}`}
        accessibilityHint="Abre el escáner de cámara para analizar plagas en este terreno"
      />
      <Button
        text="Ver y gestionar"
        icon="create-outline"
        onPress={() => onOpen(farm)}
        secondary
        accessibilityLabel={`Ver y gestionar la finca ${farm.name}`}
        accessibilityHint="Abre el detalle de la finca para editarla, eliminarla o ver sus cultivos"
      />
    </Card>
  );
}
