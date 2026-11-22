import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import Button from '../../components/Button';
import { useAccessibility } from '../../accessibility/context';
import { useDiagnosis } from '../../hooks/useDiagnosis';
import { colors } from '../../theme/tokens';
import OptionButton from './components/OptionButton';
import PestMatchCard from './components/PestMatchCard';

export default function DiagnosisScreen() {
  const router = useRouter();
  const { palette, highContrast } = useAccessibility();
  const {
    stage,
    loading,
    error,
    crops,
    crop,
    question,
    questionIndex,
    totalQuestions,
    answers,
    results,
    chooseCrop,
    changeCrop,
    answer,
    goBack,
    restart,
  } = useDiagnosis();

  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center ${palette.bg}`}>
        <ActivityIndicator color={palette.spinner} />
      </View>
    );
  }

  return (
    <ScrollView className={`flex-1 ${palette.bg}`} contentContainerClassName="gap-4 p-6">
      {error ? (
        <Text className={`rounded-xl p-3 text-center ${palette.errorBanner}`}>{error}</Text>
      ) : null}

      {stage === 'crop' ? (
        <>
          <Text className={`text-2xl font-bricolage ${palette.title}`}>¿Qué cultivo quieres revisar?</Text>
          <Text className={palette.sub}>
            Responde unas preguntas y te decimos qué plagas de tu catálogo son más probables.
          </Text>
          {crops.length === 0 ? (
            <View className="gap-3">
              <Text className={`text-lg font-inter-semibold ${palette.body}`}>
                Aún no tienes cultivos registrados
              </Text>
              <Button text="+ Registrar cultivo" onPress={() => router.push('/crops/new')} />
            </View>
          ) : (
            crops.map((item) => (
              <OptionButton
                key={item.id}
                label={item.species}
                sublabel={item.farm?.name ? `Finca: ${item.farm.name}` : undefined}
                onPress={() => chooseCrop(item.id)}
              />
            ))
          )}
        </>
      ) : null}

      {stage === 'empty' ? (
        <View className="gap-3">
          <Text className={`text-xl font-bricolage ${palette.title}`}>
            {crop?.species ?? 'Este cultivo'} no tiene plagas registradas
          </Text>
          <Text className={palette.body}>
            El cuestionario compara tus respuestas con las plagas que registraste. Agrega al menos una para
            poder usarlo.
          </Text>
          <Button text="+ Registrar plaga" onPress={() => router.push('/pests/new')} />
          <Button text="Elegir otro cultivo" secondary onPress={changeCrop} />
        </View>
      ) : null}

      {stage === 'question' && question ? (
        <>
          <Text className={`text-sm font-inter-semibold ${palette.sub}`}>
            {crop?.species ? `${crop.species} · ` : ''}Pregunta {questionIndex + 1} de {totalQuestions}
          </Text>
          <View
            className="flex-row gap-2"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {Array.from({ length: totalQuestions }).map((_, index) => (
              <View
                key={index}
                className="h-1.5 flex-1 rounded-full"
                style={{
                  backgroundColor: highContrast ? colors.crema : colors.azul,
                  opacity: index <= questionIndex ? 1 : 0.25,
                }}
              />
            ))}
          </View>
          <Text className={`text-2xl font-bricolage ${palette.title}`}>{question.title}</Text>
          {question.options.map((option) => (
            <OptionButton
              key={option.id}
              label={option.label}
              selected={answers[question.id] === option.id}
              onPress={() => answer(question.id, option.id)}
            />
          ))}
          <Button text="← Atrás" secondary onPress={goBack} />
        </>
      ) : null}

      {stage === 'result' ? (
        <>
          <Text className={`text-2xl font-bricolage ${palette.title}`}>Plagas más probables</Text>
          <Text className={palette.sub}>Cultivo: {crop?.species ?? '—'}</Text>

          {results.length === 0 ? (
            <View className={`gap-3 rounded-2xl p-5 ${palette.card}`}>
              <Text className={`text-lg font-inter-semibold ${palette.title}`}>
                No encontramos coincidencias
              </Text>
              <Text className={palette.body}>
                Ninguna plaga registrada para este cultivo menciona esos síntomas. Revisa los síntomas de tu
                catálogo o registra una plaga nueva.
              </Text>
              <Button text="+ Registrar plaga" onPress={() => router.push('/pests/new')} />
            </View>
          ) : (
            results.map((match, index) => (
              <PestMatchCard
                key={match.pest.id}
                match={match}
                rank={index + 1}
                onPress={(pest) => router.push(`/pests/${pest.id}`)}
              />
            ))
          )}

          <Text className={`text-xs ${palette.faint}`}>
            Es una orientación basada en las plagas que registraste. Confirma con un técnico agrónomo antes
            de aplicar un tratamiento.
          </Text>
          <Button text="Volver a empezar" secondary onPress={restart} />
          <Button text="Elegir otro cultivo" secondary onPress={changeCrop} />
        </>
      ) : null}
    </ScrollView>
  );
}