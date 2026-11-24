import { Text } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import Card from '../../components/Card';
import ConfirmModal from '../../components/ConfirmModal';
import Field from '../../components/Field';
import LoadingView from '../../components/LoadingView';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import ScreenTitle from '../../components/ScreenTitle';
import Select from '../../components/Select';
import { useAccessibility } from '../../accessibility/context';
import { SEVERITIES } from '../../services/pests';
import { usePestDetail } from '../../hooks/usePestDetail';
import { space, type } from '../../theme/tokens';

export default function PestDetailScreen() {
  const { palette } = useAccessibility();
  const insets = useSafeAreaInsets();
  const {
    control,
    loading,
    saving,
    saved,
    screenError,
    confirmingDelete,
    deleting,
    onSubmit,
    requestDelete,
    cancelDelete,
    confirmDelete,
    dismissSaved,
    dismissError,
  } = usePestDetail();

  if (loading) {
    return <LoadingView label="Cargando la plaga…" />;
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
        <ScreenTitle icon="bug" title="Plaga" subtitle="Edita los datos del registro de plaga" />

        {saved ? (
          <Notice variant="success" onDismiss={dismissSaved} autoDismissMs={5000}>
            Cambios guardados correctamente
          </Notice>
        ) : null}

        {screenError ? (
          <Notice variant="error" onDismiss={dismissError}>
            {screenError}
          </Notice>
        ) : null}

        <Card className="gap-5">
          <Text accessibilityRole="header" className={`${type.heading} ${palette.title}`}>
            Editar datos
          </Text>

          <Field
            control={control}
            name="commonName"
            label="Nombre común *"
            autoCapitalize="words"
            rules={{
              required: 'El nombre común es obligatorio',
              maxLength: {
                value: 100,
                message: 'El nombre debe tener máximo 100 caracteres',
              },
            }}
          />

          <Field
            control={control}
            name="scientificName"
            label="Nombre científico"
            autoCapitalize="words"
            rules={{
              maxLength: {
                value: 200,
                message: 'El nombre científico debe tener máximo 200 caracteres',
              },
            }}
          />

          <Select
            control={control}
            name="severity"
            label="Severidad"
            options={SEVERITIES.map((severity) => ({
              value: severity,
              label: severity.charAt(0).toUpperCase() + severity.slice(1),
            }))}
          />

          <Field
            control={control}
            name="symptoms"
            label="Síntomas (separados por coma)"
            multiline
            numberOfLines={3}
            rules={{
              maxLength: {
                value: 1000,
                message: 'Los síntomas deben tener máximo 1000 caracteres',
              },
            }}
          />

          <Button
            text={saving ? 'Guardando…' : 'Guardar cambios'}
            icon="save-outline"
            onPress={onSubmit}
            disabled={saving}
          />
        </Card>

        <Button
          text="Eliminar plaga"
          icon="trash-outline"
          danger
          onPress={requestDelete}
          disabled={deleting}
        />
      </KeyboardAwareScrollView>

      <ConfirmModal
        visible={confirmingDelete}
        title="Eliminar plaga"
        message="¿Seguro que deseas eliminar este registro de plaga?"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </Screen>
  );
}
