import { ActivityIndicator, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import Button from '../../components/Button';
import ConfirmModal from '../../components/ConfirmModal';
import Field from '../../components/Field';
import Notice from '../../components/Notice';
import Select from '../../components/Select';
import { useAccessibility } from '../../accessibility/context';
import { SEVERITIES } from '../../services/pests';
import { usePestDetail } from '../../hooks/usePestDetail';

export default function PestDetailScreen() {
    const { palette } = useAccessibility();
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
    } = usePestDetail();

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
                <Text className={`text-2xl font-bricolage ${palette.title}`}>Plaga</Text>
                <Text className={`mb-5 text-sm ${palette.sub}`}>Edita los datos del registro de plaga</Text>

                {saved ? (
                    <Notice variant="success" className="mb-4">
                        Cambios guardados correctamente
                    </Notice>
                ) : null}

                {screenError ? (
                    <Notice variant="error" className="mb-4">
                        {screenError}
                    </Notice>
                ) : null}

                <View className={`mb-6 gap-5 rounded-2xl p-5 ${palette.card}`}>
                    <Text className={`text-lg font-bricolage ${palette.title}`}>Editar datos</Text>

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
                        onPress={onSubmit}
                        disabled={saving}
                    />

                </View>

                <Button text="Eliminar plaga" danger onPress={requestDelete} disabled={deleting} />

            </KeyboardAwareScrollView>

            <ConfirmModal
                visible={confirmingDelete}
                title="Eliminar plaga"
                message="¿Seguro que deseas eliminar este registro de plaga?"
                loading={deleting}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </View>
    );
}