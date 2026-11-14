import { ActivityIndicator, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Button from '../../components/Button';
import ConfirmModal from '../../components/ConfirmModal';
import Notice from '../../components/Notice';
import { useAccessibility } from '../../accessibility/context';
import { useCropDetail } from '../../hooks/useCropDetail';
import CropFormFields from './CropFormFields';

export default function CropDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : undefined;
  const router = useRouter();
  const { palette } = useAccessibility();

  const {
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
  } = useCropDetail(id);

  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center ${palette.bg}`}>
        <ActivityIndicator color={palette.spinner} />
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
        <Text className={`text-2xl font-bricolage ${palette.title}`}>Cultivo</Text>
        <Text className={`mb-5 text-sm ${palette.sub}`}>
          Edita los datos del cultivo o gestiona sus plagas
        </Text>

        {saved ? (
          <Notice variant="success" className="mb-4">
            Cambios guardados correctamente
          </Notice>
        ) : null}
        {error ? (
          <Notice variant="error" className="mb-4">
            {error}
          </Notice>
        ) : null}

        <View className={`mb-6 rounded-2xl p-5 ${palette.card}`}>
          <Text className={`mb-4 text-lg font-bricolage ${palette.title}`}>Editar datos</Text>

          <CropFormFields control={control} />

          <Button
            text={saving ? 'Guardando…' : 'Guardar cambios'}
            onPress={onSubmit}
            disabled={saving}
          />
        </View>

        <View className={`mb-6 rounded-2xl p-5 ${palette.card}`}>
          <Text className={`mb-1 text-lg font-bricolage ${palette.title}`}>Plagas de este cultivo</Text>
          <Text className={`mb-4 text-sm ${palette.sub}`}>
            Registra y gestiona las plagas que afectan este cultivo.
          </Text>
          <Button text="Ver / registrar plagas →" onPress={() => router.push(`/pests?cropId=${id}`)} />
        </View>

        <Button text="Eliminar cultivo" danger onPress={requestDelete} disabled={deleting} />
      </KeyboardAwareScrollView>

      <ConfirmModal
        visible={confirmingDelete}
        title="Eliminar cultivo"
        message="¿Seguro que deseas eliminar este cultivo? También se eliminarán las plagas asociadas."
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </View>
  );
}
