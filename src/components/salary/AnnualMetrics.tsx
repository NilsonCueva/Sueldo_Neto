import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  Calendar,
  TrendingUp,
  Coins,
  Percent,
  PiggyBank,
} from 'lucide-react';
import { formatCurrency } from '@/utils/salaryCalculator';
import type { Regime } from '@/utils/salaryCalculator';

/* ===================== Tipos ===================== */

type Country = 'PE' | 'EC' | 'CL';

interface RiaAliquots {
  baseSF: number;
  gratiAliquot: number;
  bonoAliquot: number;
  ctsAliquot: number;
  healthRateLabel?: string;
}

interface AnnualMetricsProps {
  country: Country;
  loading?: boolean;

  /* ===== Perú ===== */
  annualGrossIncome?: number;
  christmasBonus?: number;
  julyBonus?: number;
  healthBonus?: number;
  totalAnnualIncome?: number;
  annualFoodAllowance?: number;

  /* ===== RIA ===== */
  regime?: Regime;
  riaAliquots?: RiaAliquots | null;

  /* ===== Bonos ===== */
  bonusGross?: number;
  bonusNet?: number;

  /* ===== Ecuador ===== */
  grossAnnual12?: number;
  iessAnnual12?: number;
  grossAnnual13?: number;
  decimoFourthAnnual?: number;
  reserveFundAnnual?: number;
  totalAnnualCost?: number;

  /* ===== Chile ===== */
  afpDeduction?: number;
  healthDeduction?: number;
  unemploymentDeduction?: number;
  fifthCategoryTax?: number;

  /* ===== Común ===== */
  netAnnualSalary: number;
}

/* ===================== Metric ===================== */

const Metric = ({
  label,
  value,
  icon: Icon,
  color,
  bg,
  country,
}: any) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <Card className={`${bg} border`}>
      <CardContent className="p-4 text-center">
        <Icon className={`mx-auto mb-2 h-5 w-5 ${color}`} />
        <p className="text-xs uppercase opacity-70">{label}</p>
        <p className={`text-xl font-bold ${color}`}>
          {formatCurrency(value, country)}
        </p>
      </CardContent>
    </Card>
  </motion.div>
);

/* ===================== Component ===================== */

const AnnualMetrics: React.FC<AnnualMetricsProps> = ({
  country,
  loading = false,

  /* Perú */
  annualGrossIncome = 0,
  christmasBonus = 0,
  julyBonus = 0,
  healthBonus = 0,
  totalAnnualIncome = 0,
  annualFoodAllowance = 0,

  /* RIA */
  regime = 'NORMAL',
  riaAliquots = null,

  /* Bonos */
  bonusGross = 0,
  bonusNet = 0,

  /* Ecuador */
  grossAnnual12 = 0,
  iessAnnual12 = 0,
  grossAnnual13 = 0,
  decimoFourthAnnual = 0,
  reserveFundAnnual = 0,
  totalAnnualCost = 0,

  /* Chile */
  afpDeduction = 0,
  healthDeduction = 0,
  unemploymentDeduction = 0,
  fifthCategoryTax = 0,

  /* Común */
  netAnnualSalary,
}) => {
  if (loading) return null;

  const isPeru = country === 'PE';
  const isRIA = regime === 'RIA';

  return (
    <Card className="shadow-card animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-6 w-6 text-primary" />
          Métricas Anuales
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* ================= 🇵🇪 PERÚ – NORMAL ================= */}
        {isPeru && regime === 'NORMAL' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Metric label="Ingresos (12 sueldos)" value={annualGrossIncome} icon={Calendar} color="text-blue-700" bg="bg-blue-50" country={country} />
            <Metric label="Gratificaciones" value={christmasBonus + julyBonus} icon={Percent} color="text-green-700" bg="bg-green-50" country={country} />
            <Metric label="Bono Essalud" value={healthBonus} icon={Percent} color="text-pink-700" bg="bg-pink-50" country={country} />
            {annualFoodAllowance > 0 && (
              <Metric label="Vales (anual)" value={annualFoodAllowance} icon={Coins} color="text-yellow-700" bg="bg-yellow-50" country={country} />
            )}
            <Metric label="Total ingresos" value={totalAnnualIncome} icon={TrendingUp} color="text-purple-700" bg="bg-purple-50" country={country} />
            {bonusGross > 0 && (
              <Metric label="Bono bruto" value={bonusGross} icon={Coins} color="text-indigo-700" bg="bg-indigo-50" country={country} />
            )}
            {bonusNet > 0 && (
              <Metric label="Bono neto" value={bonusNet} icon={PiggyBank} color="text-emerald-700" bg="bg-emerald-50" country={country} />
            )}
          </div>
        )}

        {/* ================= 🇵🇪 PERÚ – RIA (SOLO ALÍCUOTAS) ================= */}
        {isPeru && isRIA && riaAliquots && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg border bg-muted/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <Percent className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold">
                Alícuotas RIA (mensualizadas)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded bg-white/60 border">
                <p className="text-xs text-muted-foreground">Alícuota Gratificación</p>
                <p className="font-bold">
                  {formatCurrency(riaAliquots.gratiAliquot, country)}
                </p>
              </div>

              <div className="p-3 rounded bg-white/60 border">
                <p className="text-xs text-muted-foreground">Alícuota Bono Extraord.</p>
                <p className="font-bold">
                  {formatCurrency(riaAliquots.bonoAliquot, country)}
                </p>
              </div>

              <div className="p-3 rounded bg-white/60 border">
                <p className="text-xs text-muted-foreground">Alícuota CTS mensual</p>
                <p className="font-bold">
                  {formatCurrency(riaAliquots.ctsAliquot, country)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= 🇪🇨 ECUADOR ================= */}
        {country === 'EC' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Metric label="Sueldo anual (12)" value={grossAnnual12} icon={Calendar} color="text-blue-700" bg="bg-blue-50" country={country} />
            <Metric label="IESS anual" value={iessAnnual12} icon={Percent} color="text-orange-700" bg="bg-orange-50" country={country} />
            <Metric label="Sueldo anual (13)" value={grossAnnual13} icon={TrendingUp} color="text-indigo-700" bg="bg-indigo-50" country={country} />
            <Metric label="Décimo cuarto" value={decimoFourthAnnual} icon={Percent} color="text-amber-700" bg="bg-amber-50" country={country} />
            <Metric label="Fondo de reserva" value={reserveFundAnnual} icon={Coins} color="text-emerald-700" bg="bg-emerald-50" country={country} />
            <Metric label="Costo empresa" value={totalAnnualCost} icon={TrendingUp} color="text-purple-700" bg="bg-purple-50" country={country} />
          </div>
        )}

        {/* ================= 🇨🇱 CHILE ================= */}
        {country === 'CL' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Metric label="Bruto anual (12)" value={annualGrossIncome} icon={Calendar} color="text-blue-700" bg="bg-blue-50" country={country} />
            <Metric label="AFP anual" value={afpDeduction * 12} icon={Percent} color="text-orange-700" bg="bg-orange-50" country={country} />
            <Metric label="Salud anual (7%)" value={healthDeduction * 12} icon={Percent} color="text-pink-700" bg="bg-pink-50" country={country} />
            <Metric label="Seguro cesantía anual" value={unemploymentDeduction * 12} icon={Percent} color="text-purple-700" bg="bg-purple-50" country={country} />
            <Metric label="Impuesto 2ª categoría anual" value={fifthCategoryTax * 12} icon={TrendingUp} color="text-indigo-700" bg="bg-indigo-50" country={country} />
          </div>
        )}

        {/* ================= NETO FINAL ================= */}
        <div className="mt-6 p-6 rounded-lg bg-gradient-to-r from-primary/10 to-success/10 border text-center">
          <p className="text-sm uppercase text-muted-foreground mb-2">
            💰 Neto Anual Total
          </p>
          <p className="text-3xl font-bold text-primary">
            {formatCurrency(netAnnualSalary, country)}
          </p>
        </div>

      </CardContent>
    </Card>
  );
};

export default AnnualMetrics;
