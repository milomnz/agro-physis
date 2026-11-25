import { useMemo } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Button from "../../components/Button";
import Card from "../../components/Card";
import EmptyState from "../../components/EmptyState";
import LoadingView from "../../components/LoadingView";
import Notice from "../../components/Notice";
import Screen from "../../components/Screen";
import ScreenTitle from "../../components/ScreenTitle";
import { useAccessibility } from "../../accessibility/context";
import { useDiagnosis } from "../../hooks/useDiagnosis";
import { useScreenSpeech } from "../../hooks/useScreenSpeech";
import { colors, gradients, space, type } from "../../theme/tokens";
import OptionButton from "./components/OptionButton";
import PestMatchCard from "./components/PestMatchCard";

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
    photo,
    question,
    questionIndex,
    totalQuestions,
    answers,
    results,
    diagnosisSource,
    uploadedImageUrl,
    savingPestKey,
    savedPestIds,
    chooseCrop,
    changeCrop,
    takePhoto,
    pickFromGallery,
    clearPhoto,
    continueToQuestions,
    answer,
    goBack,
    restart,
    showLocalFallbackButton,
    saveMatchToHistory,
    useLocalDiagnosisNow,
    dismissError,
  } = useDiagnosis();

  const speechMessage = useMemo(() => {
    if (stage === "crop") {
      return crops.length === 0
        ? "Diagnosticar plaga. Aún no tienes cultivos registrados."
        : "Diagnosticar plaga. ¿Qué cultivo quieres revisar? Selecciona un cultivo de la lista.";
    }

    if (stage === "photo") {
      return photo
        ? `Foto de la hoja lista para ${crop?.species ?? "el cultivo"}. Pulsa continuar al cuestionario de síntomas.`
        : `Captura una foto de la hoja de ${crop?.species ?? "tu cultivo"} con la cámara o elígela de la galería.`;
    }

    if (stage === "analyzing") {
      return (
        <Screen>
          <View className="flex-1 justify-center gap-4 px-6">
            <LoadingView label="Analizando la hoja y los síntomas…" />
            {showLocalFallbackButton ? (
              <Card className="gap-3">
                <Text className={`${type.caption} text-center ${palette.sub}`}>
                  El análisis con inteligencia artificial está tardando más de
                  lo habitual.
                </Text>
                <Button
                  text="Usar diagnóstico local ahora"
                  icon="flash-outline"
                  secondary
                  onPress={useLocalDiagnosisNow}
                />
              </Card>
            ) : null}
          </View>
        </Screen>
      );
    }

    if (stage === "question" && question) {
      const optionsText = question.options
        .map((option) => option.label)
        .join(", ");
      return `Pregunta ${questionIndex + 1} de ${totalQuestions}. ${question.title}. Opciones: ${optionsText}.`;
    }

    if (stage === "result") {
      if (results.length === 0) {
        return `Resultado del diagnóstico para ${crop?.species ?? "el cultivo"}. No encontramos coincidencias.`;
      }
      const topMatches = results
        .map((match, index) => {
          const position = index === 0 ? "Más probable" : `Opción ${index + 1}`;
          return `${position}: ${match.pest.commonName}, severidad ${match.pest.severity}, coincide con ${match.score} de ${match.answered} respuestas`;
        })
        .join(". ");
      return `Resultado del diagnóstico para ${crop?.species ?? "el cultivo"}. ${topMatches}. Puedes guardar el resultado en el historial del cultivo.`;
    }

    return null;
  }, [
    stage,
    crops.length,
    crop?.species,
    photo,
    question,
    questionIndex,
    totalQuestions,
    results,
  ]);

  useScreenSpeech(speechMessage, !loading);

  if (loading) {
    return <LoadingView label="Preparando el diagnóstico…" />;
  }

  if (stage === "analyzing") {
    return <LoadingView label="Analizando la hoja y los síntomas…" />;
  }

  const previewUri = uploadedImageUrl ?? photo?.uri ?? null;

  return (
    <Screen>
      <ScrollView
        contentContainerClassName="gap-4"
        contentContainerStyle={{
          padding: space.gutter,
          paddingBottom: insets.bottom + space.gutter,
        }}
      >
        {error ? (
          <Notice variant="error" onDismiss={dismissError}>
            {error}
          </Notice>
        ) : null}

        {stage === "crop" ? (
          <>
            <ScreenTitle
              icon="medkit"
              title="¿Qué cultivo quieres revisar?"
              subtitle="Toma una foto de la hoja, responde 3 preguntas y obtén el diagnóstico por voz."
            />
            {crops.length === 0 ? (
              <EmptyState
                icon="nutrition"
                title="Aún no tienes cultivos registrados"
                message="Registra primero un cultivo para poder diagnosticar sus hojas."
              >
                <Button
                  text="Registrar cultivo"
                  icon="add"
                  onPress={() => router.push("/crops/new")}
                />
              </EmptyState>
            ) : (
              crops.map((item) => (
                <OptionButton
                  key={item.id}
                  label={item.species}
                  sublabel={
                    item.farm?.name ? `Finca: ${item.farm.name}` : undefined
                  }
                  onPress={() => chooseCrop(item.id)}
                />
              ))
            )}
          </>
        ) : null}

        {stage === "photo" ? (
          <>
            <ScreenTitle
              icon="camera"
              title="Foto de la hoja afectada"
              subtitle={`Cultivo seleccionado: ${crop?.species ?? "—"}`}
            />

            <Card className="gap-4">
              {photo ? (
                <View className="gap-3">
                  <Image
                    source={{ uri: photo.uri }}
                    style={{ width: "100%", height: 220, borderRadius: 16 }}
                    resizeMode="cover"
                    accessible
                    accessibilityLabel={`Fotografía capturada de la hoja de ${crop?.species ?? "cultivo"}`}
                  />
                  <Button
                    text="Cambiar fotografía"
                    icon="camera-reverse-outline"
                    secondary
                    onPress={clearPhoto}
                  />
                </View>
              ) : (
                <View className="gap-3">
                  <Text className={`${type.body} ${palette.body}`}>
                    Toma una foto clara de la hoja o parte afectada para
                    analizarla con inteligencia artificial y guardarla como
                    evidencia en el historial del cultivo.
                  </Text>
                  <Button
                    text="Tomar foto con cámara"
                    icon="camera-outline"
                    onPress={takePhoto}
                  />
                  <Button
                    text="Elegir foto de la galería"
                    icon="images-outline"
                    secondary
                    onPress={pickFromGallery}
                  />
                </View>
              )}
            </Card>

            <Button
              text={photo ? "Continuar al cuestionario" : "Continuar sin foto"}
              icon="arrow-forward"
              secondary={!photo}
              onPress={continueToQuestions}
            />
            <Button
              text="Elegir otro cultivo"
              icon="swap-horizontal"
              secondary
              onPress={changeCrop}
            />
          </>
        ) : null}

        {stage === "question" && question ? (
          <>
            <Text className={`text-sm font-inter-semibold ${palette.sub}`}>
              {crop?.species ? `${crop.species} · ` : ""}Pregunta{" "}
              {questionIndex + 1} de {totalQuestions}
            </Text>
            <View
              className="flex-row gap-2"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              {Array.from({ length: totalQuestions }).map((_, index) => (
                <View
                  key={index}
                  className={`h-2 flex-1 rounded-chip ${highContrast ? "bg-crema/30" : "bg-azul/20"}`}
                  style={
                    index <= questionIndex
                      ? {
                          backgroundColor: colors.verde,
                          backgroundImage: gradients.leaf,
                        }
                      : undefined
                  }
                />
              ))}
            </View>
            <Text
              accessibilityRole="header"
              className={`${type.title} ${palette.title}`}
            >
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

        {stage === "result" ? (
          <>
            <ScreenTitle
              icon="medkit"
              title="Plagas más probables"
              subtitle={`Cultivo: ${crop?.species ?? "—"} · Motor: ${
                diagnosisSource === "gemini"
                  ? "IA Gemini Vision"
                  : "Catálogo asistido"
              }`}
            />

            {previewUri ? (
              <Card className="gap-2">
                <Text
                  className={`${type.caption} font-inter-semibold ${palette.sub}`}
                >
                  Evidencia fotográfica analizada
                </Text>
                <Image
                  source={{ uri: previewUri }}
                  style={{ width: "100%", height: 190, borderRadius: 14 }}
                  resizeMode="cover"
                  accessible
                  accessibilityLabel={`Hoja analizada de ${crop?.species ?? "cultivo"}`}
                />
              </Card>
            ) : null}

            {results.length === 0 ? (
              <Card>
                <Text className={`${type.subheading} ${palette.title}`}>
                  No encontramos coincidencias
                </Text>
                <Text className={`${type.body} ${palette.body}`}>
                  No se encontraron plagas coincidentes. Puedes registrar la
                  plaga manualmente.
                </Text>
                <Button
                  text="Registrar plaga"
                  icon="add"
                  onPress={() => router.push("/pests/new")}
                />
              </Card>
            ) : (
              results.map((match, index) => {
                const key = match.pest.id || match.pest.commonName;
                return (
                  <PestMatchCard
                    key={key}
                    match={match}
                    rank={index + 1}
                    savedPestId={savedPestIds[key]}
                    saving={savingPestKey === key}
                    onSaveToHistory={saveMatchToHistory}
                    onOpenDetail={(pestId) => router.push(`/pests/${pestId}`)}
                  />
                );
              })
            )}

            <Notice variant="warning" silent>
              Es una orientación basada en los síntomas y la fotografía.
              Confirma con un técnico agrónomo antes de aplicar un tratamiento.
            </Notice>
            <Button
              text="Volver a empezar"
              icon="refresh"
              secondary
              onPress={restart}
            />
            <Button
              text="Elegir otro cultivo"
              icon="swap-horizontal"
              secondary
              onPress={changeCrop}
            />
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
