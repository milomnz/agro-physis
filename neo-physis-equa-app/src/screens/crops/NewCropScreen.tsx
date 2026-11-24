import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Control } from 'react-hook-form';
import Button from '../../components/Button';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import ScreenTitle from '../../components/ScreenTitle';
import Select from '../../components/Select';
import { useNewCrop } from '../../hooks/useNewCrop';
import { useScreenSpeech } from '../../hooks/useScreenSpeech';
import { space } from '../../theme/tokens';
import CropFormFields from './CropFormFields';
import { FARM_FIELD_RULES, type CropFormValues } from '../../utils/crop-validators';

export default function NewCropScreen() {
  const insets = useSafeAreaInsets();
  const {
    control,
    farms,
    loading,
    loadError,
    submitting,
    rootError,
    onSubmit,
    goToFarms,
    dismissRootError,
    dismissLoadError,
  } = useNewCrop();

  useScreenSpeech('Nuevo cultivo. Registra un cultivo asociado a una de tus fincas.', !loading);

  if (loading) {
    return <LoadingView label="Cargando tus fincas…" />;
  }

  return (
    <Screen>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          gap: 20,
          padding: space.gutter,
          paddingBottom: insets.bottom + space.gutter,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenTitle
          icon="nutrition"
          title="Nuevo cultivo"
          subtitle="Registra un cultivo asociado a una de tus fincas"
        />

        {farms.length === 0 ? (
          <EmptyState
            icon="leaf"
            title="Primero registra una finca"
            message="Para crear un cultivo primero necesitas registrar una finca."
          >
            <Button text="Ir a mis fincas" icon="leaf-outline" onPress={goToFarms} />
          </EmptyState>
        ) : (
          <>
            {rootError && (
              <Notice variant="error" onDismiss={dismissRootError}>
                {rootError}
              </Notice>
            )}
            {loadError ? (
              <Notice variant="error" onDismiss={dismissLoadError}>
                {loadError}
              </Notice>
            ) : null}

            <Card className="gap-5">
              <Select
                control={control}
                name="farmId"
                label="Finca *"
                options={farms.map((farm) => ({ value: farm.id, label: farm.name }))}
                empty="No tienes fincas registradas"
                rules={FARM_FIELD_RULES}
              />

              {/* NewCropFormValues extiende CropFormValues; los campos compartidos son compatibles */}
              <CropFormFields control={control as unknown as Control<CropFormValues>} optionalHints />

              <Button
                text={submitting ? 'Registrando…' : 'Registrar cultivo'}
                icon="checkmark"
                onPress={onSubmit}
                disabled={submitting}
              />
            </Card>
          </>
        )}
      </KeyboardAwareScrollView>
    </Screen>
  );
}
