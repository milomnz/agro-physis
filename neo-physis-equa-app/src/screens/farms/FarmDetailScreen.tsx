import { ActivityIndicator, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import Button from '../../components/Button';
import ConfirmModal from '../../components/ConfirmModal';
import Notice from '../../components/Notice';
import { useAccessibility } from '../../accessibility/context';
import { useFarmDetail } from '../../hooks/useFarmDetail';
import FarmFormFields from './components/FarmFormFields';

export default function FarmDetailScreen() {
  const { palette } = useAccessibility();
  const {
    farm,
    loading,
    saving,
    saved,
    screenError,
    confirmingDelete,
    deleting,
    control,
    errors,
    onSubmit,
    requestDelete,
    cancelDelete,
    confirmDelete,
    goToCrops,
    goToFarms,
    dismissSaved,
    dismissScreenError,
    dismissRootError,
  } = useFarmDetail();

  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center ${palette.bg}`}>
        <ActivityIndicator color={palette.spinner} size="large" />
      </View>
    );
  }

  if (!farm) {
    return (
      <View className={`flex-1 items-center justify-center gap-4 p-6 ${palette.bg}`}>
        <Text className={`text-lg font-inter-semibold ${palette.title}`}>No se pudo cargar la finca</Text>
        {screenError ? (
          <Notice variant="error" onDismiss={dismissScreenError}>
            {screenError}
          </Notice>
        ) : null}
        <Button text="Volver a mis fincas" onPress={goToFarms} />
      </View>
    );
  }

  return (
    <View className={`flex-1 ${palette.bg}`}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
      <Text className={`text-2xl font-bricolage ${palette.title}`}>Mi finca</Text>
      <Text className={`mb-5 text-sm ${palette.sub}`}>Gestiona los datos de tu terreno agrícola</Text>

      {saved ? (
        <Notice variant="success" className="mb-4" onDismiss={dismissSaved} autoDismissMs={5000}>
          Cambios guardados correctamente
        </Notice>
      ) : null}
      {screenError ? (
        <Notice variant="error" className="mb-4" onDismiss={dismissScreenError}>
          {screenError}
        </Notice>
      ) : null}
      {errors.root?.message ? (
        <Notice variant="error" className="mb-4" onDismiss={dismissRootError}>
          {errors.root.message}
        </Notice>
      ) : null}

      <View className={`mb-6 gap-5 rounded-2xl p-4 ${palette.card}`}>
        <Text className={`text-xl font-bricolage ${palette.title}`}>Editar datos</Text>

        <FarmFormFields control={control} />

        <Button
          text={saving ? 'Guardando…' : 'Guardar cambios'}
          onPress={onSubmit}
          disabled={saving}
          accessibilityHint="Guarda los cambios de los datos de la finca"
        />
      </View>

      <View className={`mb-6 gap-2 rounded-2xl p-4 ${palette.card}`}>
        <Text className={`text-xl font-bricolage ${palette.title}`}>Cultivos de esta finca</Text>
        <Text className={`text-sm ${palette.sub}`}>
          Desde aquí puedes registrar y gestionar los cultivos sembrados en {farm.name}.
        </Text>
        <Button
          text="Ver y registrar cultivos →"
          onPress={goToCrops}
          accessibilityHint="Abre la gestión de cultivos de esta finca"
        />
      </View>

      <Button
        text="Eliminar finca"
        onPress={requestDelete}
        secondary
        disabled={deleting}
        accessibilityHint="Elimina la finca y todos sus datos asociados"
      />
      </KeyboardAwareScrollView>

      <ConfirmModal
        visible={confirmingDelete}
        title="Eliminar finca"
        message={`¿Seguro que deseas eliminar la finca "${farm.name}"? Esta acción eliminará también sus cultivos y plagas asociadas.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </View>
  );
}
