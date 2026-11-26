import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { useAccessibility } from '../../../accessibility/context';
import Badge from '../../../components/Badge';
import Card from '../../../components/Card';
import IconBadge from '../../../components/IconBadge';
import type { AdminMetrics } from '../../../services/admin';
import { type } from '../../../theme/tokens';

interface MetricTileProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  detail: string;
}

function MetricTile({ icon, label, value, detail }: MetricTileProps) {
  const { palette } = useAccessibility();

  return (
    <Card
      className="min-w-[140px] flex-1 gap-2"
      accessibilityLabel={`${label}: ${value}. ${detail}`}
    >
      <View className="flex-row items-center justify-between gap-2">
        <IconBadge icon={icon} />
        <Text className={`text-2xl font-mono-bold ${palette.title}`}>{value}</Text>
      </View>
      <View className="gap-0.5">
        <Text className={`${type.label} ${palette.title}`}>{label}</Text>
        <Text className={`${type.caption} ${palette.sub}`}>{detail}</Text>
      </View>
    </Card>
  );
}

export default function AdminMetricsSection({ metrics }: { metrics: AdminMetrics }) {
  const { palette } = useAccessibility();

  return (
    <View className="gap-4">
      <Text accessibilityRole="header" className={`${type.heading} ${palette.title}`}>
        Resumen de la plataforma
      </Text>

      <View className="flex-row flex-wrap gap-3">
        <MetricTile
          icon="people"
          label="Usuarios"
          value={metrics.users.total}
          detail={`${metrics.users.active} activos · ${metrics.users.inactive} inactivos`}
        />
        <MetricTile
          icon="leaf"
          label="Fincas"
          value={metrics.farms.total}
          detail="Terrenos registrados"
        />
      </View>

      <View className="flex-row flex-wrap gap-3">
        <MetricTile
          icon="nutrition"
          label="Cultivos"
          value={metrics.crops.total}
          detail="Lotes en seguimiento"
        />
        <MetricTile
          icon="bug"
          label="Plagas"
          value={metrics.pests.total}
          detail={
            metrics.pests.highSeverity > 0
              ? `${metrics.pests.highSeverity} de severidad alta`
              : 'Sin alertas críticas'
          }
        />
      </View>

      <Card className="gap-3">
        <View className="flex-row items-center justify-between gap-2">
          <Text className={`${type.label} ${palette.title}`}>
            Inclusión y distribución de roles
          </Text>
          {metrics.pests.highSeverity > 0 ? (
            <Badge
              value="alta"
              label={`${metrics.pests.highSeverity} ${metrics.pests.highSeverity === 1 ? 'alerta alta' : 'alertas altas'}`}
            />
          ) : null}
        </View>

        <Text className={`${type.caption} ${palette.sub}`}>
          Usuarios con adaptación por discapacidad:{' '}
          <Text className={`${type.data} ${palette.title}`}>
            {metrics.users.withDisability}
          </Text>
        </Text>

        <View className={`h-px ${palette.divider}`} />

        <View className="flex-row flex-wrap items-center gap-2">
          <Badge
            value="productor"
            label={`Productores: ${metrics.users.byRole.productor ?? 0}`}
          />
          <Badge
            value="colaborador"
            label={`Colaboradores: ${metrics.users.byRole.colaborador ?? 0}`}
          />
          <Badge
            value="admin"
            label={`Admins: ${metrics.users.byRole.admin ?? 0}`}
          />
        </View>
      </Card>
    </View>
  );
}
