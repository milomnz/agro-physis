import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import type { GrowthStage } from './crops';
import type { Severity } from './pests';

export const PEST_ALERTS_CHANNEL_ID = 'pest-alerts';
export const CROP_REMINDERS_CHANNEL_ID = 'crop-reminders';

export const CROP_REMINDER_INTERVAL_HOURS: Record<Severity, number> = {
  alta: 12,
  media: 24,
  baja: 36,
};

export const CROP_REMINDER_INTERVAL_SECONDS: Record<Severity, number> = {
  alta: CROP_REMINDER_INTERVAL_HOURS.alta * 3600,
  media: CROP_REMINDER_INTERVAL_HOURS.media * 3600,
  baja: CROP_REMINDER_INTERVAL_HOURS.baja * 3600,
};

export interface CropReminderParams {
  cropId: string;
  cropName?: string;
  pestName: string;
  severity: Severity;
}

export const CROP_STAGE_REMINDER_DAYS = 30;
export const CROP_STAGE_REMINDER_SECONDS = CROP_STAGE_REMINDER_DAYS * 24 * 3600;

export const NEXT_GROWTH_STAGE: Record<GrowthStage, GrowthStage | null> = {
  vegetativo: 'floración',
  floración: 'fructificación',
  fructificación: 'producción',
  producción: null,
};

export interface CropStageReminderParams {
  cropId: string;
  species: string;
  growthStage: GrowthStage;
  plantedDate?: string | null;
  delaySeconds?: number;
}

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

let androidChannelsConfigured = false;

async function crearCanalConFallback(
  id: string,
  config: Notifications.NotificationChannelInput,
): Promise<boolean> {
  try {
    await Notifications.setNotificationChannelAsync(id, config);
    return true;
  } catch {
    try {
      await Notifications.setNotificationChannelAsync(id, {
        name: config.name,
        importance: config.importance,
      });
      return true;
    } catch (err) {
      console.warn(`[notifications] No se pudo configurar el canal "${id}":`, err);
      return false;
    }
  }
}

export async function configurarCanalesAndroid(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  if (androidChannelsConfigured) return true;

  const [, remindersReady] = await Promise.all([
    crearCanalConFallback(PEST_ALERTS_CHANNEL_ID, {
      name: 'Alertas de plagas',
      description: 'Alertas inmediatas de plagas de severidad media y alta',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
      lightColor: '#17506B',
    }),
    crearCanalConFallback(CROP_REMINDERS_CHANNEL_ID, {
      name: 'Recordatorios de cultivos',
      description: 'Recordatorios periódicos para revisar cultivos con plagas registradas',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 200, 150, 200],
      enableVibrate: true,
      lightColor: '#17506B',
    }),
  ]);

  androidChannelsConfigured = remindersReady;
  return remindersReady;
}

async function asegurarPermisosNotificaciones(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') {
    return true;
  }

  const { status: requestedStatus } = await Notifications.requestPermissionsAsync();
  return requestedStatus === 'granted';
}

function resolverProjectId(): string | undefined {
  const fromExpoConfig = Constants.expoConfig?.extra?.eas?.projectId;
  if (typeof fromExpoConfig === 'string' && fromExpoConfig.trim().length > 0) {
    return fromExpoConfig.trim();
  }

  const fromEasConfig = Constants.easConfig?.projectId;
  if (typeof fromEasConfig === 'string' && fromEasConfig.trim().length > 0) {
    return fromEasConfig.trim();
  }

  return undefined;
}

export async function obtenerTokenPushAsync(): Promise<string | null> {
  if (Platform.OS === 'web' || !Device.isDevice) {
    return null;
  }

  try {
    const granted = await asegurarPermisosNotificaciones();
    if (!granted) {
      return null;
    }

    await configurarCanalesAndroid();
    const projectId = resolverProjectId();
    if (!projectId) {
      console.warn('[notifications] No se encontró projectId de EAS para registrar token push.');
      return null;
    }

    const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenResult.data || null;
  } catch (err) {
    console.warn('[notifications] No se pudo obtener el token push de Expo:', err);
    return null;
  }
}

function construirMensajeRecordatorio(params: CropReminderParams): string {
  const cropLabel = params.cropName?.trim() || 'tu cultivo';
  const pestLabel = params.pestName.trim() || 'la plaga registrada';

  switch (params.severity) {
    case 'alta':
      return `Revisión prioritaria en ${cropLabel} por alerta alta de ${pestLabel}.`;
    case 'media':
      return `Revisión programada en ${cropLabel} por alerta media de ${pestLabel}.`;
    case 'baja':
      return `Revisión preventiva en ${cropLabel} por ${pestLabel}.`;
  }
}

async function cancelarNotificacionesCultivoPorTipo(cropId: string, tipo: string): Promise<void> {
  if (Platform.OS === 'web' || !cropId) return;

  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const matching = scheduled.filter(
      (item) => item.content.data?.tipo === tipo && item.content.data?.cropId === cropId,
    );

    await Promise.all(
      matching.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)),
    );
  } catch (err) {
    console.warn(`[notifications] No se pudo cancelar el recordatorio (${tipo}) del cultivo:`, err);
  }
}

export async function cancelarRecordatorioCultivo(cropId: string): Promise<void> {
  await cancelarNotificacionesCultivoPorTipo(cropId, 'crop-reminder');
}

export async function programarRecordatorioCultivo(params: CropReminderParams): Promise<void> {
  if (Platform.OS === 'web' || !params.cropId) return;

  try {

    const granted = await asegurarPermisosNotificaciones();
    if (!granted) {
      return;
    }

    const channelsReady = await configurarCanalesAndroid();

    await cancelarRecordatorioCultivo(params.cropId);

    const seconds = CROP_REMINDER_INTERVAL_SECONDS[params.severity];
    const body = construirMensajeRecordatorio(params);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Revisar cultivo',
        body,
        sound: 'default',
        data: {
          tipo: 'crop-reminder',
          cropId: params.cropId,
          severity: params.severity,
          route: `/crops/${params.cropId}`,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: true,
        ...(Platform.OS === 'android' && channelsReady ? { channelId: CROP_REMINDERS_CHANNEL_ID } : {}),
      },
    });
  } catch (err) {
    console.warn('[notifications] No se pudo programar el recordatorio del cultivo:', err);
  }
}

function obtenerSiguienteEtapa(stage: GrowthStage): GrowthStage | null {
  return NEXT_GROWTH_STAGE[stage] ?? null;
}

export async function cancelarRecordatorioEtapaCultivo(cropId: string): Promise<void> {
  await cancelarNotificacionesCultivoPorTipo(cropId, 'crop-stage-reminder');
}

export async function programarRecordatorioEtapaCultivo(
  params: CropStageReminderParams,
): Promise<void> {
  if (Platform.OS === 'web' || !params.cropId) return;

  try {
    // Cancela cualquier recordatorio previo antes de comprobar si llegó a "producción".
    await cancelarRecordatorioEtapaCultivo(params.cropId);

    const nextStage = obtenerSiguienteEtapa(params.growthStage);
    if (!nextStage) {
      return;
    }

    const granted = await asegurarPermisosNotificaciones();
    if (!granted) {
      return;
    }

    const channelsReady = await configurarCanalesAndroid();
    const speciesLabel = params.species.trim() || 'cultivo';
    const seconds = params.delaySeconds ?? CROP_STAGE_REMINDER_SECONDS;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `¿Tu ${speciesLabel} ya cambió?`,
        body: `Lleva ${CROP_STAGE_REMINDER_DAYS} días en ${params.growthStage}. Si ya está en ${nextStage}, actualízalo.`,
        sound: 'default',
        data: {
          tipo: 'crop-stage-reminder',
          cropId: params.cropId,
          currentStage: params.growthStage,
          nextStage,
          route: `/crops/${params.cropId}`,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false,
        ...(Platform.OS === 'android' && channelsReady ? { channelId: CROP_REMINDERS_CHANNEL_ID } : {}),
      },
    });
  } catch (err) {
    console.warn('[notifications] No se pudo programar el recordatorio de etapa del cultivo:', err);
  }
}

export async function cancelarTodosLosRecordatoriosLocales(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (err) {
    console.warn('[notifications] No se pudieron cancelar los recordatorios locales:', err);
  }
}
