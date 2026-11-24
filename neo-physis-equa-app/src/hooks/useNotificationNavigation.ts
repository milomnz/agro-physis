import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useRouter, useSegments, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';

import { useAccessibility } from '../accessibility/context';
import { useFeedback } from '../feedback/context';
import { useSession } from './useSession';

const SAFE_NOTIFICATION_ROUTE_REGEX = /^\/(crops|pests|farms)\/[A-Za-z0-9_-]+$/;

export function parseSafeNotificationRoute(data: Record<string, unknown> | undefined): Href | null {
  const rawRoute = data?.route;
  if (typeof rawRoute !== 'string') return null;

  const normalized = rawRoute.trim();
  if (!SAFE_NOTIFICATION_ROUTE_REGEX.test(normalized)) {
    return null;
  }

  if (normalized === '/crops/new' || normalized === '/pests/new') {
    return null;
  }

  return normalized as Href;
}

export function useNotificationNavigation(): void {
  const router = useRouter();
  const segments = useSegments();
  const { session, loading } = useSession();
  const { actionFeedback } = useAccessibility();
  const { notifyWarning } = useFeedback();

  const [pendingRoute, setPendingRoute] = useState<Href | null>(null);
  const lastHandledResponseKeyRef = useRef<string | null>(null);
  const hadSessionRef = useRef(false);
  const actionFeedbackRef = useRef(actionFeedback);
  const notifyWarningRef = useRef(notifyWarning);

  actionFeedbackRef.current = actionFeedback;
  notifyWarningRef.current = notifyWarning;

  const enqueueResponse = useCallback((response: Notifications.NotificationResponse | null) => {
    if (!response) return;

    const responseKey = `${response.notification.request.identifier}:${response.notification.date}`;
    if (lastHandledResponseKeyRef.current === responseKey) {
      return;
    }

    const safeRoute = parseSafeNotificationRoute(response.notification.request.content.data);
    lastHandledResponseKeyRef.current = responseKey;
    Notifications.clearLastNotificationResponseAsync().catch(() => {});

    if (safeRoute) {
      setPendingRoute(safeRoute);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let active = true;

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (active) {
          enqueueResponse(response);
        }
      })
      .catch(() => {});

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        enqueueResponse(response);
      },
    );

    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body } = notification.request.content;
      const parts = [title, body].filter(
        (value): value is string => typeof value === 'string' && value.trim().length > 0,
      );
      const message = parts.length > 0 ? parts.join(': ') : 'Nueva alerta recibida';
      notifyWarningRef.current(message);
    });

    return () => {
      active = false;
      responseSubscription.remove();
      receivedSubscription.remove();
    };
  }, [enqueueResponse]);

  useEffect(() => {
    const hasToken = Boolean(session?.token);
    if (hadSessionRef.current && !hasToken) {
      setPendingRoute(null);
    }
    hadSessionRef.current = hasToken;
  }, [session?.token]);

  useEffect(() => {
    if (!pendingRoute || loading || !session?.token) return;

    const firstSegment = segments[0] as string | undefined;
    const inAuthScreens = firstSegment === 'login' || firstSegment === 'register';
    const inIndex = !firstSegment || firstSegment === 'index';

    // Espera a que la navegación inicial aterrice en el flujo autenticado antes de abrir el detalle.
    if (inAuthScreens || inIndex) return;

    const target = pendingRoute;
    setPendingRoute(null);
    router.push(target);
  }, [pendingRoute, loading, session?.token, segments, router]);
}
