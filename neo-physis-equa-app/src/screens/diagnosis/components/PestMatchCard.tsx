import { Text, View } from 'react-native';

import Badge from '../../../components/Badge';
import Card from '../../../components/Card';
import { useAccessibility } from '../../../accessibility/context';
import type { Pest } from '../../../services/pests';
import { type } from '../../../theme/tokens';
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
    <Card
      onPress={() => onPress(pest)}
      accessibilityLabel={`${position}: ${pest.commonName}, severidad ${pest.severity}. Coincide con ${score} de ${answered} respuestas`}
      accessibilityHint="Abre el detalle de la plaga"
    >
      <Text className={`text-xs font-inter-bold uppercase ${palette.sub}`}>{position}</Text>
      <View className="gap-0.5">
        <Text className={`${type.subheading} ${palette.title}`}>{pest.commonName}</Text>
        {pest.scientificName ? (
          <Text className={`${type.caption} italic ${palette.sub}`}>{pest.scientificName}</Text>
        ) : null}
      </View>

      <View className="flex-row flex-wrap items-center gap-2">
        <Text className={`${type.caption} ${palette.sub}`}>Severidad:</Text>
        <Badge value={pest.severity} />
      </View>

      <Text className={`${type.caption} font-inter-semibold ${palette.body}`}>
        Coincide con <Text className="font-mono-bold">{score}</Text> de{' '}
        <Text className="font-mono-bold">{answered}</Text> respuestas
      </Text>
      {pest.symptoms.length > 0 ? (
        <Text className={`${type.caption} ${palette.faint}`}>Síntomas: {pest.symptoms.join(', ')}</Text>
      ) : null}
    </Card>
  );
}
