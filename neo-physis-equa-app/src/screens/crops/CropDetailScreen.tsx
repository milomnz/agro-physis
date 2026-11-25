import { Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Button from "../../components/Button";
import Card from "../../components/Card";
import ConfirmModal from "../../components/ConfirmModal";
import LoadingView from "../../components/LoadingView";
import Notice from "../../components/Notice";
import Screen from "../../components/Screen";
import ScreenTitle from "../../components/ScreenTitle";
import { useAccessibility } from "../../accessibility/context";
import { useCropDetail } from "../../hooks/useCropDetail";
import { useScreenSpeech } from "../../hooks/useScreenSpeech";
import { space, type } from "../../theme/tokens";
import CropFormFields from "./CropFormFields";

export default function CropDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = typeof params.id === "string" ? params.id : undefined;
  const router = useRouter();
  const { palette } = useAccessibility();
  const insets = useSafeAreaInsets();
  const {
    crop,
    control,
    loading,
    saving,
    saved,
    error,
    confirmingDelete,
    deleting,
    onSubmit,
    requestDelete,
    cancelDelete,
    confirmDelete,
    dismissSaved,
    dismissError,
  } = useCropDetail(id);

  useScreenSpeech(
    crop
      ? `Detalle de cultivo ${crop.species}. Etapa ${crop.growthStage}.`
      : null,
    !loading && Boolean(crop),
  );

  if (loading) {
    return <LoadingView label="Cargando el cultivo…" />;
  }

  return (
    <Screen>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          gap: 20,
          padding: space.gutter,
          paddingBottom: insets.bottom + 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenTitle
          icon="nutrition"
          title="Cultivo"
          subtitle="Edita los datos del cultivo o gestiona sus plagas"
        />

        {saved ? (
          <Notice
            variant="success"
            onDismiss={dismissSaved}
            autoDismissMs={5000}
          >
            Cambios guardados correctamente
          </Notice>
        ) : null}
        {error ? (
          <Notice variant="error" onDismiss={dismissError}>
            {error}
          </Notice>
        ) : null}

        <Card className="gap-5">
          <Text
            accessibilityRole="header"
            className={`${type.heading} ${palette.title}`}
          >
            Editar datos
          </Text>

          <CropFormFields control={control} />

          <Button
            text={saving ? "Guardando…" : "Guardar cambios"}
            icon="save-outline"
            onPress={onSubmit}
            disabled={saving}
          />
        </Card>

        <Card>
          <Text
            accessibilityRole="header"
            className={`${type.heading} ${palette.title}`}
          >
            Plagas de este cultivo
          </Text>
          <Text className={`${type.caption} ${palette.sub}`}>
            Registra y gestiona las plagas que afectan este cultivo.
          </Text>
          <Button
            text="Ver y registrar plagas"
            icon="bug-outline"
            onPress={() => router.push(`/pests?cropId=${id}`)}
          />
          <Button
            text="Diagnosticar hoja de este cultivo"
            icon="medkit-outline"
            secondary
            onPress={() => router.push(`/diagnosis?cropId=${id}`)}
          />
        </Card>

        <Button
          text="Eliminar cultivo"
          icon="trash-outline"
          danger
          onPress={requestDelete}
          disabled={deleting}
        />
      </KeyboardAwareScrollView>

      <ConfirmModal
        visible={confirmingDelete}
        title="Eliminar cultivo"
        message="¿Seguro que deseas eliminar este cultivo? También se eliminarán las plagas asociadas."
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Screen>
  );
}
