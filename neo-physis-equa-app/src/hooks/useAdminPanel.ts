import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';

import { useActionFeedback } from '../feedback/context';
import {
  getAdminMetrics,
  getAdminUsers,
  updateAdminUser,
  USER_ROLE_LABELS,
  type AdminMetrics,
  type AdminUserSummary,
  type UserRole,
} from '../services/admin';
import { isUnauthorizedError } from '../services/api';
import { useDebouncedValue } from './useDebouncedValue';
import { useRequireSession } from './useRequireSession';
import { useSession } from './useSession';

export function useAdminPanel() {
  const router = useRouter();
  const sessionReady = useRequireSession();
  const { session, loading: sessionLoading } = useSession();
  const { notifySuccess } = useActionFeedback();

  const isAdmin = session?.role === 'admin';

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [draftRoles, setDraftRoles] = useState<Record<string, UserRole>>({});
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [pendingDeactivateUser, setPendingDeactivateUser] =
    useState<AdminUserSummary | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const debouncedSearch = useDebouncedValue(search, 250);

  useEffect(() => {
    if (!sessionLoading && sessionReady && session?.token && !isAdmin) {
      router.replace('/home');
    }
  }, [sessionLoading, sessionReady, session?.token, isAdmin, router]);

  const loadData = useCallback(async () => {
    const [nextMetrics, nextUsers] = await Promise.all([
      getAdminMetrics(),
      getAdminUsers(),
    ]);
    setMetrics(nextMetrics);
    setUsers(nextUsers);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!sessionReady || !isAdmin) return;

      let cancelled = false;

      (async () => {
        try {
          const [nextMetrics, nextUsers] = await Promise.all([
            getAdminMetrics(),
            getAdminUsers(),
          ]);
          if (cancelled) return;
          setMetrics(nextMetrics);
          setUsers(nextUsers);
          setError('');
        } catch (err: unknown) {
          if (cancelled || isUnauthorizedError(err)) return;
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo cargar el panel de administración',
          );
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();

      return () => {
        cancelled = true;
        setSuccess('');
      };
    }, [sessionReady, isAdmin]),
  );

  const refresh = useCallback(async () => {
    if (!isAdmin) return;
    setRefreshing(true);
    setError('');
    try {
      await loadData();
    } catch (err: unknown) {
      if (isUnauthorizedError(err)) return;
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar la información del panel',
      );
    } finally {
      setRefreshing(false);
    }
  }, [isAdmin, loadData]);

  const toggleExpandUser = useCallback((user: AdminUserSummary) => {
    setExpandedUserId((prev) => {
      const next = prev === user.id ? null : user.id;
      if (next) {
        setDraftRoles((drafts) => ({
          ...drafts,
          [user.id]: drafts[user.id] ?? user.role,
        }));
      }
      return next;
    });
  }, []);

  const selectDraftRole = useCallback((userId: string, role: UserRole) => {
    setDraftRoles((prev) => ({ ...prev, [userId]: role }));
  }, []);

  const saveRole = useCallback(
    async (user: AdminUserSummary) => {
      const targetRole = draftRoles[user.id] ?? user.role;
      if (targetRole === user.role) return;

      setUpdatingUserId(user.id);
      setError('');
      setSuccess('');
      try {
        const updated = await updateAdminUser(user.id, { role: targetRole });
        setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        const nextMetrics = await getAdminMetrics();
        setMetrics(nextMetrics);
        const msg = `Rol de ${updated.name} actualizado a ${USER_ROLE_LABELS[updated.role]}.`;
        setSuccess(msg);
        notifySuccess(msg);
      } catch (err: unknown) {
        if (isUnauthorizedError(err)) return;
        setError(
          err instanceof Error ? err.message : 'No se pudo actualizar el rol del usuario',
        );
      } finally {
        setUpdatingUserId(null);
      }
    },
    [draftRoles, notifySuccess],
  );

  const applyActiveStatus = useCallback(
    async (user: AdminUserSummary, nextActive: boolean) => {
      setUpdatingUserId(user.id);
      setError('');
      setSuccess('');
      try {
        const updated = await updateAdminUser(user.id, { isActive: nextActive });
        setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        const nextMetrics = await getAdminMetrics();
        setMetrics(nextMetrics);
        const msg = nextActive
          ? `Cuenta de ${updated.name} reactivada correctamente.`
          : `Cuenta de ${updated.name} desactivada.`;
        setSuccess(msg);
        notifySuccess(msg);
        setPendingDeactivateUser(null);
      } catch (err: unknown) {
        if (isUnauthorizedError(err)) return;
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo actualizar el estado de la cuenta',
        );
        setPendingDeactivateUser(null);
      } finally {
        setUpdatingUserId(null);
      }
    },
    [notifySuccess],
  );

  const requestToggleStatus = useCallback(
    (user: AdminUserSummary) => {
      if (user.isActive) {
        setPendingDeactivateUser(user);
        return;
      }
      void applyActiveStatus(user, true);
    },
    [applyActiveStatus],
  );

  const confirmDeactivate = useCallback(() => {
    if (!pendingDeactivateUser) return;
    void applyActiveStatus(pendingDeactivateUser, false);
  }, [pendingDeactivateUser, applyActiveStatus]);

  const cancelDeactivate = useCallback(() => {
    if (updatingUserId) return;
    setPendingDeactivateUser(null);
  }, [updatingUserId]);

  const filteredUsers = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (statusFilter === 'active' && !u.isActive) return false;
      if (statusFilter === 'inactive' && u.isActive) return false;
      if (q) {
        return (
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, debouncedSearch, roleFilter, statusFilter]);

  return {
    session,
    sessionLoading,
    sessionReady,
    isAdmin,
    metrics,
    users,
    filteredUsers,
    loading,
    refreshing,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    expandedUserId,
    draftRoles,
    updatingUserId,
    pendingDeactivateUser,
    error,
    success,
    refresh,
    toggleExpandUser,
    selectDraftRole,
    saveRole,
    requestToggleStatus,
    confirmDeactivate,
    cancelDeactivate,
    dismissError: () => setError(''),
    dismissSuccess: () => setSuccess(''),
  };
}
