import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Coins, Percent } from 'lucide-react';
import { formatCurrency } from '@/utils/salaryCalculator';
import type { Regime } from '@/utils/salaryCalculator';

interface RiaAliquots {
  baseSF: number;
  gratiAliquot: number;
  bonoAliquot: number;
  ctsAliquot: number;
  healthRateLabel?: string;
}

interface AnnualMetricsProps {
  annualGrossIncome: number;
  christmasBonus: number;
  julyBonus: number;
  healthBonus: number;
  totalAnnualIncome: number;
  netAnnualSalary: number;
  loading?: boolean;

  regime?: Regime;
  healthRateLabel?: string;
  riaAliquots?: RiaAliquots | null;

  annualFoodAllowance?: number;

  // opcionales
  bonusGross?: number;
  bonusNet?: number;
}

const AnnualMetrics: React.FC<AnnualMetricsProps> = ({
  annualGrossIncome,
  christmasBonus,
  julyBonus,
  healthBonus,
  totalAnnualIncome,
  netAnnualSalary,
  loading = false,
  regime = 'NORMAL',
  healthRateLabel = '9%',
  riaAliquots = null,
  annualFoodAllowance = 0,
  bonusGross = 0,
  bonusNet,
}) => {
  const isRIA = regime === 'RIA';

  // ¿hay vales?
  const hasVales = !!annualFoodAllowance && annualFoodAllowance > 0;

  // ¿hay bono bruto?
  const hasBonusGross = typeof bonusGross === 'number' && bonusGross > 0;

  // total mostrado en la card de "Total Ingresos..." (incluye bono bruto si existe)
  const totalWithBonus = totalAnnualIncome + (hasBonusGross ? bonusGross : 0);

  // Etiqueta “Total…” como ReactNode para controlar el salto de línea en pantallas chicas
  const totalLabelNode = hasBonusGross ? (
    <>
      Total Ingresos Anuales ( Bonos +
      <br className="block sm:hidden" />
      <span className="hidden sm:inline"> </span>
      <span className="text-[10px] tv:text-xs">
        2 Gratificaciones + Bono Essalud + 12 Sueldos)
      </span>
    </>
  ) : (
    <>
      Total Ingresos Anuales
      <br className="block sm:hidden" />
      <span className="hidden sm:inline"> </span>
      <span className="text-[10px] tv:text-xs">
        (2 Gratificaciones + Bono Essalud + 12 Sueldos)
      </span>
    </>
  );

  // ====== Cards base (normal) ======
  const baseMetrics = [
    {
      label: 'Ingresos Anuales (12 sueldos)',
      value: annualGrossIncome,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    ...(hasVales
      ? [
          {
            label: 'Vales de Alimentos (12 meses)',
            value: annualFoodAllowance,
            icon: Coins,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          },
        ]
      : []),
    {
      label: 'Gratificación Julio-Diciembre',
      value: christmasBonus + julyBonus,
      icon: Percent,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: `Bono Essalud (${healthRateLabel})`,
      value: healthBonus,
      icon: Percent,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    },
    {
      labelNode: totalLabelNode, // 👈 usamos nodo en vez de string
      label: 'TOTAL_DYNAMIC', // key auxiliar para map
      value: totalWithBonus,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  // ====== Componente de tarjeta ======
  const MetricCard: React.FC<{
    label?: string; // opcional cuando usamos labelNode
    labelNode?: React.ReactNode;
    value: number;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    color: string;
    bgColor: string;
    delay?: number;
  }> = ({ label, labelNode, value, icon: Icon, color, bgColor, delay = 0 }) => {
    const isTotal = label === 'TOTAL_DYNAMIC' || !!labelNode;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.45 }}
        className={`h-[96px] p-3 rounded-lg border ${bgColor} hover:scale-[1.02] transition-all duration-200`}
      >
        <div className="grid grid-cols-[auto,1fr] items-center gap-3 h-full">
          <Icon className={`w-6 h-6 ${color}`} />
          <div className="flex flex-col items-center justify-center text-center px-1">
            <p
              className={`${
                isTotal
                  ? 'text-[11px] tv:text-xs leading-tight'
                  : 'text-sm tv:text-[15px] font-semibold leading-snug'
              } text-muted-foreground uppercase tracking-wide`}
            >
              {labelNode ?? label}
            </p>

            {loading ? (
              <div className="animate-pulse mt-1 w-24 h-4 bg-muted rounded" />
            ) : (
              <motion.p
                key={value}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25, type: 'spring', stiffness: 220 }}
                className={`${
                  isTotal ? 'text-base tv:text-lg' : 'text-xl tv:text-2xl'
                } font-bold ${color} mt-1`}
              >
                {formatCurrency(value || 0)}
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  // ====== Render ======
  return (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-xl tv:text-2xl font-semibold text-card-foreground flex items-center gap-2 min-w-0">
            <Coins className="w-6 h-6 tv:w-7 tv:h-7 text-primary shrink-0" />
            <span className="truncate">Métricas Anuales</span>
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* NORMAL: cards de desglose anual */}
        {!isRIA && (
          (() => {
            const hasBonusNet = typeof bonusNet === 'number' && bonusNet > 0;

            const metrics = [
              ...baseMetrics,
              ...(hasBonusNet
                ? [
                    {
                      label: 'Bono Neto',
                      value: bonusNet as number,
                      icon: Coins,
                      color: 'text-green-700',
                      bgColor: 'bg-green-50 dark:bg-green-900/20',
                    },
                  ]
                : []),
            ];

            const colsClass = hasVales
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2';

            return (
              <div className={`grid ${colsClass} gap-4`}>
                {metrics.map((m: any, i: number) => (
                  <MetricCard
                    key={m.label ?? `node-${i}`}
                    {...m}
                    icon={m.icon}
                    delay={i * 0.08}
                  />
                ))}
              </div>
            );
          })()
        )}

        {/* RIA (si aplica): solo alícuotas explicativas */}
        {isRIA && riaAliquots && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-2 p-4 rounded-lg border bg-muted/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Percent className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold">
                Alícuotas RIA (mensualizadas)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded bg-white/60 dark:bg-white/5 border">
                <p className="text-muted-foreground text-xs">
                  Alícuota Gratificación (baseSF / 6)
                </p>
                <p className="font-bold">
                  {formatCurrency(riaAliquots.gratiAliquot)}
                </p>
              </div>

              <div className="p-3 rounded bg-white/60 dark:bg-white/5 border">
                <p className="text-muted-foreground text-xs">
                  Alícuota Bono Extraord.{' '}
                  {riaAliquots.healthRateLabel
                    ? `(${riaAliquots.healthRateLabel})`
                    : ''}
                </p>
                <p className="font-bold">
                  {formatCurrency(riaAliquots.bonoAliquot)}
                </p>
              </div>

              <div className="p-3 rounded bg-white/60 dark:bg-white/5 border">
                <p className="text-muted-foreground text-xs">
                  Alícuota CTS mensual
                </p>
                <p className="font-bold">
                  {formatCurrency(riaAliquots.ctsAliquot)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 💰 Sueldo Neto Anual Total (abajo) — AHORA PARA AMBOS RÉGIMENES */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="mt-4 p-6 rounded-lg bg-gradient-to-r from-primary/10 to-success/10 border-2 border-primary/20 hover:shadow-glow transition-all duration-300"
        >
          <div className="text-center">
            <p className="text-sm tv:text-[15px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {isRIA
                ? '💰 Sueldo Neto Anual Total (Cuota RIA)'
                : '💰 Sueldo Neto Anual Total'}
            </p>
            {loading ? (
              <div className="animate-pulse flex justify-center">
                <div className="h-8 bg-muted rounded w-48" />
              </div>
            ) : (
              <motion.p
                key={netAnnualSalary}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.4,
                  type: 'spring',
                  stiffness: 150,
                }}
                className="text-3xl tv:text-4xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent"
              >
                {formatCurrency(netAnnualSalary)}
              </motion.p>
            )}
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default AnnualMetrics;
