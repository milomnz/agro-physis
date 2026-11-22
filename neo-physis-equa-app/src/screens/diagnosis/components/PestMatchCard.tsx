import { Pressable, Text, View } from 'react-native';

import Badge from '../../../components/Badge';
import { useAccessibility } from '../../../accessibility/context';
import type { Pest } from '../../../services/pests';
import type { PestMatch } from '../../../utils/symptom-diagnosis';

interface PestMatchCardProps {
  match: PestMatch;
  rank: number;
  onPress: (pest: Pest) => void;
}

export default function PestMatchCard({ match, rank, onPress }: PestMatchCardProps) {
  const { palette } = useAccessibility();
  const { pest, score, answered } = match;
  const position = rank === 1 ? 'Más probable' : `Opción ${rank}`;

  return (
    <Pressable
      onPress={() => onPress(pest)}
      accessibilityRole="button"
      accessibilityLabel={`${position}: ${pest.commonName}, severidad ${pest.severity}. Coincide con ${score} de ${answered} respuestas`}
      accessibilityHint="Abre el detalle de la plaga"
      className={`rounded-2xl p-4 ${palette.card}`}
    >
      <Text className={`text-xs font-inter-bold uppercase ${palette.sub}`}>{position}</Text>
      <Text className={`mt-1 text-lg font-inter-semibold ${palette.title}`}>{pest.commonName}</Text>
      {pest.scientificName ? (
        <Text className={`text-xs italic ${palette.sub}`}>{pest.scientificName}</Text>
      ) : null}

      <View className="mt-2 flex-row flex-wrap items-center gap-2">
        <Text className={`text-sm ${palette.sub}`}>Severidad:</Text>
        <Badge value={pest.severity} />
      </View>

      <Text className={`mt-2 text-sm font-inter-semibold ${palette.body}`}>
        Coincide con {score} de {answered} respuestas
      </Text>
      {pest.symptoms.length > 0 ? (
        <Text className={`mt-1 text-xs ${palette.sub}`}>Síntomas: {pest.symptoms.join(', ')}</Text>
      ) : null}
    </Pressable>
  );
}