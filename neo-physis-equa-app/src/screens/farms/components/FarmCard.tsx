import { Text, View } from 'react-native';

import Button from '../../../components/Button';
import { useAccessibility } from '../../../accessibility/context';
import type { Farm } from '../../../services/farms';

interface FarmCardProps {
  farm: Farm;
  onScan: (farm: Farm) => void;
  onOpen: (farm: Farm) => void;
}

export default function FarmCard({ farm, onScan, onOpen }: FarmCardProps) {
  const { highContrast, palette } = useAccessibility();

  return (
    <View
      accessibilityLabel={`Finca ${farm.name}, altitud ${farm.altitude} metros sobre el nivel del mar`}
      className={`gap-3 rounded-tarjeta border-2 p-4 ${
        highContrast ? 'border-crema bg-turquesa' : 'border-turquesa bg-crema'
      }`}
    >
      <View className="flex-row items-center justify-between gap-2">
        <Text className={`flex-1 text-lg font-inter-semibold ${palette.title}`}>{farm.name}</Text>
        <Text
          className={`rounded-chip border px-2.5 py-1 font-mono-medium text-[12px] ${
            highContrast ? 'border-crema bg-crema text-tinta' : 'border-turquesa bg-turquesa text-crema'
          }`}
        >
          {farm.altitude} m s. n. m.
        </Text>
      </View>

      <Text className={`text-sm ${palette.sub}`}>
        {[farm.location?.vereda, farm.location?.municipio]
          .filter(Boolean)
          .join(', ') || 'Ubicación no especificada'}
      </Text>

      <Button
        text="Diagnosticar plagas"
        onPress={() => onScan(farm)}
        accessibilityLabel={`Iniciar escáner de cámara para la finca ${farm.name}`}
        accessibilityHint="Abre el escáner de cámara para analizar plagas en este terreno"
      />
      <Button
        text="Ver y gestionar →"
        onPress={() => onOpen(farm)}
        secondary
        accessibilityLabel={`Ver y gestionar la finca ${farm.name}`}
        accessibilityHint="Abre el detalle de la finca para editarla, eliminarla o ver sus cultivos"
      />
    </View>
  );
}
