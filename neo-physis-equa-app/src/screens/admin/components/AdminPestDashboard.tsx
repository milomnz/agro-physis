import { Text, View } from 'react-native';

import { useAccessibility } from '../../../accessibility/context';
import Badge from '../../../components/Badge';
import Card from '../../../components/Card';
import type { AdminMetrics, PestSeverity } from '../../../services/admin';
import { colors, gradients, type } from '../../../theme/tokens';

const SEVERITY_ORDER: { key: PestSeverity; label: string }[] = [
  { key: 'alta', label: 'Severidad alta' },
  { key: 'media', label: 'Severidad media' },
  { key: 'baja', label: 'Severidad baja' },
];

function formatShortDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return '—';
  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const year = parsed.getFullYear();
  return `${day}/${month}/${year}`;
}

function ProgressBar({
  ratio,
  tone = 'leaf',
}: {
  ratio: number;
  tone?: 'leaf' | 'alta' | 'media' | 'baja';
}) {
  const { highContrast } = useAccessibility();
  const clamped = Math.max(0, Math.min(1, ratio));
  const widthPct = clamped > 0 ? Math.max(6, Math.round(clamped * 100)) : 0;

  const trackClass = highContrast ? 'bg-tinta border border-crema/40' : 'bg-azul/15';

  const fillStyle =
    tone === 'alta'
      ? { backgroundColor: highContrast ? colors.crema : colors.tinta }
      : tone === 'media'
        ? { backgroundColor: colors.lima }
        : tone === 'baja'
          ? { backgroundColor: colors.verde }
          : highContrast
            ? { backgroundColor: colors.lima }
            : { backgroundColor: colors.verde, backgroundImage: gradients.leaf };

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={`h-3 w-full overflow-hidden rounded-chip ${trackClass}`}
    >
      {widthPct > 0 ? (
        <View
          className="h-full rounded-chip"
          style={[{ width: `${widthPct}%` }, fillStyle]}
        />
      ) : null}
    </View>
  );
}

export default function AdminPestDashboard({ metrics }: { metrics: AdminMetrics }) {
  const { palette } = useAccessibility();
  const totalPests = metrics.pests.total;
  const maxPestCount = Math.max(1, ...metrics.pests.topPests.map((p) => p.count));
  const maxCropCount = Math.max(1, ...metrics.crops.topSpecies.map((c) => c.count));

  return (
    <View className="gap-4">
      <Text accessibilityRole="header" className={`${type.heading} ${palette.title}`}>
        Dashboard fitosanitario
      </Text>

      {/* 1. Distribución por severidad */}
      <Card className="gap-3">
        <View className="gap-0.5">
          <Text accessibilityRole="header" className={`${type.subheading} ${palette.title}`}>
            Plagas por severidad
          </Text>
          <Text className={`${type.caption} ${palette.sub}`}>
            Proporción de reportes según nivel de riesgo en campo
          </Text>
        </View>

        <View className="gap-3">
          {SEVERITY_ORDER.map(({ key, label }) => {
            const count = metrics.pests.bySeverity?.[key] ?? 0;
            const pct = totalPests > 0 ? Math.round((count / totalPests) * 100) : 0;

            return (
              <View
                key={key}
                accessibilityLabel={`${label}: ${count} reportes, ${pct} por ciento`}
                className="gap-1.5"
              >
                <View className="flex-row items-center justify-between gap-2">
                  <Badge value={key} label={label} />
                  <Text className={`${type.data} ${palette.title}`}>
                    {count} ({pct}%)
                  </Text>
                </View>
                <ProgressBar ratio={totalPests > 0 ? count / totalPests : 0} tone={key} />
              </View>
            );
          })}
        </View>
      </Card>

      {/* 2. Top 5 Plagas principales */}
      <Card className="gap-4">
        <View className="gap-0.5">
          <Text accessibilityRole="header" className={`${type.subheading} ${palette.title}`}>
            Plagas principales (Top 5)
          </Text>
          <Text className={`${type.caption} ${palette.sub}`}>
            Plagas más frecuentes registradas en toda la plataforma
          </Text>
        </View>

        {metrics.pests.topPests.length === 0 ? (
          <Text className={`${type.caption} ${palette.sub}`}>
            Aún no hay plagas registradas en la plataforma.
          </Text>
        ) : (
          <View className="gap-4">
            {metrics.pests.topPests.map((pest, index) => {
              const pct = totalPests > 0 ? Math.round((pest.count / totalPests) * 100) : 0;
              return (
                <View
                  key={`${pest.commonName}-${index}`}
                  accessibilityLabel={`Puesto ${index + 1}: ${pest.commonName}. ${pest.count} reportes, ${pct} por ciento, severidad predominante ${pest.dominantSeverity}`}
                  className="gap-1.5"
                >
                  <View className="flex-row items-start justify-between gap-2">
                    <View className="flex-1 gap-0.5">
                      <Text className={`${type.label} ${palette.title}`}>
                        #{index + 1} {pest.commonName}
                      </Text>
                      {pest.scientificName ? (
                        <Text className={`${type.caption} italic ${palette.faint}`}>
                          {pest.scientificName}
                        </Text>
                      ) : null}
                    </View>
                    <Badge value={pest.dominantSeverity} />
                  </View>

                  <ProgressBar ratio={pest.count / maxPestCount} tone="leaf" />

                  <View className="flex-row items-center justify-between gap-2">
                    <Text className={`${type.data} ${palette.sub}`}>
                      {pest.count} {pest.count === 1 ? 'reporte' : 'reportes'} ({pct}%)
                    </Text>
                    {pest.highSeverityCount > 0 ? (
                      <Text className={`${type.data} ${palette.title}`}>
                        {pest.highSeverityCount} alta
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Card>

      {/* 3. Últimas alertas fitosanitarias */}
      <Card className="gap-3">
        <View className="gap-0.5">
          <Text accessibilityRole="header" className={`${type.subheading} ${palette.title}`}>
            Reportes recientes
          </Text>
          <Text className={`${type.caption} ${palette.sub}`}>
            Últimas plagas detectadas en fincas y cultivos
          </Text>
        </View>

        {metrics.pests.recentAlerts.length === 0 ? (
          <Text className={`${type.caption} ${palette.sub}`}>
            Sin reportes recientes de plagas.
          </Text>
        ) : (
          <View className="gap-3">
            {metrics.pests.recentAlerts.map((alert, idx) => (
              <View key={alert.id} className="gap-2">
                {idx > 0 ? <View className={`h-px ${palette.divider}`} /> : null}
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1 gap-0.5">
                    <Text className={`${type.label} ${palette.title}`}>
                      {alert.commonName}
                    </Text>
                    <Text className={`${type.caption} ${palette.sub}`}>
                      {alert.cropSpecies} · {alert.farmName}
                    </Text>
                    <Text className={`${type.data} ${palette.faint}`}>
                      Productor: {alert.ownerName} · {formatShortDate(alert.createdAt)}
                    </Text>
                  </View>
                  <Badge value={alert.severity} />
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* 4. Cultivos más registrados */}
      <Card className="gap-3">
        <View className="gap-0.5">
          <Text accessibilityRole="header" className={`${type.subheading} ${palette.title}`}>
            Cultivos principales
          </Text>
          <Text className={`${type.caption} ${palette.sub}`}>
            Especies con mayor presencia en las fincas registradas
          </Text>
        </View>

        {metrics.crops.topSpecies.length === 0 ? (
          <Text className={`${type.caption} ${palette.sub}`}>
            Aún no hay cultivos registrados.
          </Text>
        ) : (
          <View className="gap-3">
            {metrics.crops.topSpecies.map((crop, index) => (
              <View
                key={`${crop.species}-${index}`}
                accessibilityLabel={`${crop.species}: ${crop.count} cultivos`}
                className="gap-1.5"
              >
                <View className="flex-row items-center justify-between gap-2">
                  <Text className={`${type.label} ${palette.title}`}>
                    #{index + 1} {crop.species}
                  </Text>
                  <Text className={`${type.data} ${palette.sub}`}>
                    {crop.count} {crop.count === 1 ? 'lote' : 'lotes'}
                  </Text>
                </View>
                <ProgressBar ratio={crop.count / maxCropCount} tone="leaf" />
              </View>
            ))}
          </View>
        )}
      </Card>
    </View>
  );
}
