import { Text, View } from 'react-native';

import { useAccessibility } from '../../../accessibility/context';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import Chip from '../../../components/Chip';
import IconBadge from '../../../components/IconBadge';
import {
  USER_ROLE_LABELS,
  type AdminUserSummary,
  type UserRole,
} from '../../../services/admin';
import { type } from '../../../theme/tokens';

const ROLE_CHOICES: { value: UserRole; label: string }[] = [
  { value: 'productor', label: 'Productor' },
  { value: 'colaborador', label: 'Colaborador' },
  { value: 'admin', label: 'Administrador' },
];

function formatShortDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return '—';
  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const year = parsed.getFullYear();
  return `${day}/${month}/${year}`;
}

interface AdminUserCardProps {
  user: AdminUserSummary;
  isSelf: boolean;
  expanded: boolean;
  draftRole: UserRole;
  updating: boolean;
  onToggleExpand: () => void;
  onSelectRole: (role: UserRole) => void;
  onSaveRole: () => void;
  onRequestToggleStatus: () => void;
}

export default function AdminUserCard({
  user,
  isSelf,
  expanded,
  draftRole,
  updating,
  onToggleExpand,
  onSelectRole,
  onSaveRole,
  onRequestToggleStatus,
}: AdminUserCardProps) {
  const { palette } = useAccessibility();
  const initial = user.name.trim().charAt(0).toUpperCase() || '?';
  const roleChanged = draftRole !== user.role;
  const hasDisability = Boolean(
    user.disabilityType && user.disabilityType !== 'ninguna',
  );

  return (
    <Card className="gap-4">
      <View className="flex-row items-center gap-3">
        <IconBadge text={initial} />
        <View className="flex-1 gap-0.5">
          <Text className={`${type.subheading} ${palette.title}`}>
            {user.name}
            {isSelf ? ' (Tú)' : ''}
          </Text>
          <Text className={`${type.caption} ${palette.sub}`}>{user.email}</Text>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2">
        <Badge value={user.role} label={USER_ROLE_LABELS[user.role]} />
        <Badge
          value={user.isActive ? 'activo' : 'inactivo'}
          label={user.isActive ? 'Cuenta activa' : 'Cuenta inactiva'}
        />
        {hasDisability && user.disabilityType ? (
          <Badge
            value={user.disabilityType}
            label={`Perfil: ${user.disabilityType}`}
          />
        ) : null}
      </View>

      <Text className={`${type.data} ${palette.faint}`}>
        {user.farmsCount} {user.farmsCount === 1 ? 'finca registrada' : 'fincas registradas'} · Alta:{' '}
        {formatShortDate(user.createdAt)}
      </Text>

      {isSelf ? (
        <Text className={`${type.caption} ${palette.sub}`}>
          Sesión actual: tu cuenta está protegida contra autodesactivación y cambio de rol propio.
        </Text>
      ) : (
        <>
          <Button
            text={expanded ? 'Cerrar ajustes' : 'Gestionar permisos'}
            icon={expanded ? 'chevron-up' : 'options-outline'}
            secondary
            disabled={updating}
            onPress={onToggleExpand}
            accessibilityLabel={
              expanded
                ? `Cerrar ajustes de ${user.name}`
                : `Gestionar permisos de ${user.name}`
            }
            accessibilityHint="Despliega los controles para cambiar el rol o activar y desactivar la cuenta"
          />

          {expanded ? (
            <View className="gap-4 pt-1">
              <View className={`h-px ${palette.divider}`} />

              <View className="gap-2" accessibilityRole="radiogroup">
                <Text className={`${type.label} ${palette.title}`}>
                  Asignar rol a {user.name}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {ROLE_CHOICES.map((choice) => (
                    <Chip
                      key={choice.value}
                      radio
                      label={choice.label}
                      selected={draftRole === choice.value}
                      onPress={() => onSelectRole(choice.value)}
                      accessibilityLabel={`Rol ${choice.label} para ${user.name}`}
                    />
                  ))}
                </View>
              </View>

              {roleChanged ? (
                <Button
                  text={updating ? 'Guardando rol…' : `Guardar rol (${USER_ROLE_LABELS[draftRole]})`}
                  icon="save-outline"
                  onPress={onSaveRole}
                  disabled={updating}
                  accessibilityHint={`Confirma el cambio de rol de ${user.name} a ${USER_ROLE_LABELS[draftRole]}`}
                />
              ) : null}

              <Button
                text={
                  updating
                    ? 'Actualizando cuenta…'
                    : user.isActive
                      ? 'Desactivar cuenta'
                      : 'Reactivar cuenta'
                }
                icon={user.isActive ? 'ban-outline' : 'checkmark-circle-outline'}
                danger={user.isActive}
                secondary={!user.isActive}
                disabled={updating}
                onPress={onRequestToggleStatus}
                accessibilityLabel={
                  user.isActive
                    ? `Desactivar cuenta de ${user.name}`
                    : `Reactivar cuenta de ${user.name}`
                }
                accessibilityHint={
                  user.isActive
                    ? 'Impide que el usuario inicie sesión o use la aplicación hasta ser reactivado'
                    : 'Restaura el acceso del usuario a la plataforma'
                }
              />
            </View>
          ) : null}
        </>
      )}
    </Card>
  );
}
