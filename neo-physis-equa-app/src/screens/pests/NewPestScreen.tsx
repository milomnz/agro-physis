import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import Field from '../../components/Field';
import LoadingView from '../../components/LoadingView';
import Notice from '../../components/Notice';
import Screen from '../../components/Screen';
import ScreenTitle from '../../components/ScreenTitle';
import Select from '../../components/Select';
import { SEVERITIES } from '../../services/pests';
import { useNewPest } from '../../hooks/useNewPest';
import { useScreenSpeech } from '../../hooks/useScreenSpeech';
import { space } from '../../theme/tokens';

export default function NewPestScreen() {
  const insets = useSafeAreaInsets();
  const { control, crops, loading, submitting, rootError, onSubmit, goToCrops, dismissRootError } =
    useNewPest();

  useScreenSpeech('Nueva plaga. Registra una plaga asociada a un cultivo.', !loading);

  if (loading) {
    return <LoadingView label="Cargando tus cultivos…" />;
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
          icon="bug"
          title="Nueva plaga"
          subtitle="Registra una plaga asociada a un cultivo"
        />

        {crops.length === 0 ? (
          <EmptyState
            icon="nutrition"
            title="Primero registra un cultivo"
            message="Para crear una plaga primero necesitas registrar un cultivo."
          >
            <Button text="Ir a mis cultivos" icon="nutrition-outline" onPress={goToCrops} />
          </EmptyState>
        ) : (
          <>
            {rootError && (
              <Notice variant="error" onDismiss={dismissRootError}>
                {rootError}
              </Notice>
            )}

            <Card className="gap-5">
              <Select
                control={control}
                name="cropId"
                label="Cultivo *"
                options={crops.map((crop) => ({
                  value: crop.id,
                  label: `${crop.species} (${crop.farm?.name ?? 'sin finca'})`,
                }))}
                empty="No tienes cultivos registrados"
                rules={{ required: 'Selecciona el cultivo afectado' }}
              />

              <Field
                control={control}
                name="commonName"
                label="Nombre común *"
                autoCapitalize="words"
                placeholder="ej. Pulgón, Gusano cogollero"
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
                placeholder="ej. Aphis gossypii (opcional)"
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
                placeholder="ej. hojas enrolladas, manchas, mordeduras"
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
                text={submitting ? 'Registrando…' : 'Registrar plaga'}
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
