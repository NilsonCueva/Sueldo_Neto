import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { TrendingUp, CreditCard, FileText, CheckCircle2, Utensils } from 'lucide-react';

interface KPICardsProps {
  grossSalary: number;
  afpDeduction: number;
  fifthCategoryTax: number;
  netSalary: number;
  foodAllowance?: number;
  loading?: boolean;
}

interface KPICardData {
  title: string;
  value: number;
  icon: React.ElementType;
  variant: 'gross' | 'deduction' | 'tax' | 'net' | 'food';
  prefix?: string;
  suffix?: string;
}

const KPICards: React.FC<KPICardsProps> = ({
  grossSalary,
  afpDeduction,
  fifthCategoryTax,
  netSalary,
  foodAllowance = 0,
  loading = false,
}) => {
  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const kpiData: KPICardData[] = [
    { title: 'Bruto Mensual', value: grossSalary, icon: TrendingUp, variant: 'gross' },
    { title: 'AFP (Jubilación)', value: afpDeduction, icon: CreditCard, variant: 'deduction' },
    { title: '5ta Categoría', value: fifthCategoryTax, icon: FileText, variant: 'tax' },
    { title: 'Neto Mensual', value: netSalary, icon: CheckCircle2, variant: 'net' },
  ];

  // Inserta Bono de Alimentos antes de Neto, solo si existe
  if (foodAllowance > 0) {
    kpiData.splice(3, 0, {
      title: 'Bono de Alimentos',
      value: foodAllowance,
      icon: Utensils,
      variant: 'food',
    });
  }

  const getCardStyles = (variant: KPICardData['variant']) => {
    switch (variant) {
      case 'gross':
        return 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 dark:from-blue-900/20 dark:to-blue-800/20';
      case 'deduction':
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 dark:from-orange-900/20 dark:to-orange-800/20';
      case 'tax':
        return 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 dark:from-purple-900/20 dark:to-purple-800/20';
      case 'net':
        return 'bg-gradient-to-r from-green-50 to-emerald-100 border-green-200 dark:from-green-900/20 dark:to-emerald-800/20';
      case 'food':
        return 'bg-gradient-to-r from-yellow-50 to-amber-100 border-yellow-200 dark:from-yellow-900/20 dark:to-amber-800/20';
      default:
        return '';
    }
  };

  const getIconColor = (variant: KPICardData['variant']) => {
    switch (variant) {
      case 'gross':
        return 'text-blue-600 dark:text-blue-400';
      case 'deduction':
        return 'text-orange-600 dark:text-orange-400';
      case 'tax':
        return 'text-purple-600 dark:text-purple-400';
      case 'net':
        return 'text-green-600 dark:text-green-400';
      case 'food':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-primary';
    }
  };

  const getValueColor = (variant: KPICardData['variant']) => {
    switch (variant) {
      case 'gross':
        return 'text-blue-700 dark:text-blue-300';
      case 'deduction':
        return 'text-orange-700 dark:text-orange-300';
      case 'tax':
        return 'text-purple-700 dark:text-purple-300';
      case 'net':
        return 'text-green-700 dark:text-green-300';
      case 'food':
        return 'text-yellow-700 dark:text-yellow-300';
      default:
        return 'text-card-foreground';
    }
  };

  // 5 columnas si hay bono de alimentos, 4 si no
  const gridCols = foodAllowance > 0 ? 'lg:grid-cols-5' : 'lg:grid-cols-4';

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols} gap-3 items-stretch animate-fade-in`}>
      {kpiData.map((item, index) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="h-full"
          >
            <Card
              className={`h-full shadow-card hover:shadow-elevated transition-all duration-300 ${getCardStyles(
                item.variant
              )}`}
            >
              <CardContent className="h-full p-3 flex flex-col justify-center items-center text-center">
                <Icon className={`w-[18px] h-[18px] mb-1 ${getIconColor(item.variant)}`} />

                <p className="text-[11px] leading-tight font-medium text-muted-foreground uppercase tracking-wide mb-1 text-center">
                  {item.title}
                </p>

                {loading ? (
                  <div className="animate-pulse mt-1 h-5 bg-muted rounded w-20" />
                ) : (
                  <motion.p
                    key={item.value}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                    className={`text-[18px] sm:text-[19px] font-bold ${getValueColor(item.variant)}`}
                  >
                    {item.prefix}
                    {formatCurrency(item.value)}
                    {item.suffix}
                  </motion.p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default KPICards;
