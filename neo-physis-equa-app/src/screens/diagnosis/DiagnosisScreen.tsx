import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import ScreenTitle from '../../components/ScreenTitle';
import { useAccessibility } from '../../accessibility/context';
import { useDiagnosis } from '../../hooks/useDiagnosis';
import { colors, gradients, space, type } from '../../theme/tokens';
import OptionButton from './components/OptionButton';
import PestMatchCard from './components/PestMatchCard';

export default function DiagnosisScreen() {
  const router = useRouter();
  const { palette, highContrast } = useAccessibility();
  const insets = useSafeAreaInsets();
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
    return <LoadingView label="Preparando el diagnóstico…" />;
  }

  return (
    <Screen>
      <ScrollView
        contentContainerClassName="gap-4"
        contentContainerStyle={{ padding: space.gutter, paddingBottom: insets.bottom + space.gutter }}
      >
        {error ? <Notice variant="error">{error}</Notice> : null}

        {stage === 'crop' ? (
          <>
            <ScreenTitle
              icon="medkit"
              title="¿Qué cultivo quieres revisar?"
              subtitle="Responde unas preguntas y te decimos qué plagas de tu catálogo son más probables."
            />
            {crops.length === 0 ? (
              <EmptyState
                icon="nutrition"
                title="Aún no tienes cultivos registrados"
                message="El diagnóstico compara síntomas con las plagas de tus cultivos."
              >
                <Button text="Registrar cultivo" icon="add" onPress={() => router.push('/crops/new')} />
              </EmptyState>
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
          <EmptyState
            icon="bug"
            title={`${crop?.species ?? 'Este cultivo'} no tiene plagas registradas`}
            message="El cuestionario compara tus respuestas con las plagas que registraste. Agrega al menos una para poder usarlo."
          >
            <Button text="Registrar plaga" icon="add" onPress={() => router.push('/pests/new')} />
            <Button text="Elegir otro cultivo" icon="swap-horizontal" secondary onPress={changeCrop} />
          </EmptyState>
        ) : null}

        {stage === 'question' && question ? (
          <>
            <Text className={`text-sm font-inter-semibold ${palette.sub}`}>
              {crop?.species ? `${crop.species} · ` : ''}Pregunta {questionIndex + 1} de {totalQuestions}
            </Text>
            {/* El texto de arriba ya dice el avance; la barra es solo visual. */}
            <View
              className="flex-row gap-2"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              {Array.from({ length: totalQuestions }).map((_, index) => (
                <View
                  key={index}
                  className={`h-2 flex-1 rounded-chip ${highContrast ? 'bg-crema/30' : 'bg-azul/20'}`}
                  style={
                    index <= questionIndex
                      ? { backgroundColor: colors.verde, backgroundImage: gradients.leaf }
                      : undefined
                  }
                />
              ))}
            </View>
            <Text accessibilityRole="header" className={`${type.title} ${palette.title}`}>
              {question.title}
            </Text>
            {question.options.map((option) => (
              <OptionButton
                key={option.id}
                label={option.label}
                selected={answers[question.id] === option.id}
                onPress={() => answer(question.id, option.id)}
              />
            ))}
            <Button text="Atrás" icon="arrow-back" secondary onPress={goBack} />
          </>
        ) : null}

        {stage === 'result' ? (
          <>
            <ScreenTitle
              icon="medkit"
              title="Plagas más probables"
              subtitle={`Cultivo: ${crop?.species ?? '—'}`}
            />

            {results.length === 0 ? (
              <Card>
                <Text className={`${type.subheading} ${palette.title}`}>No encontramos coincidencias</Text>
                <Text className={`${type.body} ${palette.body}`}>
                  Ninguna plaga registrada para este cultivo menciona esos síntomas. Revisa los síntomas de
                  tu catálogo o registra una plaga nueva.
                </Text>
                <Button text="Registrar plaga" icon="add" onPress={() => router.push('/pests/new')} />
              </Card>
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

            <Notice variant="warning">
              Es una orientación basada en las plagas que registraste. Confirma con un técnico agrónomo
              antes de aplicar un tratamiento.
            </Notice>
            <Button text="Volver a empezar" icon="refresh" secondary onPress={restart} />
            <Button text="Elegir otro cultivo" icon="swap-horizontal" secondary onPress={changeCrop} />
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
