import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { TrendingUp, CreditCard, FileText, CheckCircle2 } from 'lucide-react';

interface KPICardsProps {
  grossSalary: number;
  afpDeduction: number;
  fifthCategoryTax: number;
  netSalary: number;
  loading?: boolean;
}

interface KPICardData {
  title: string;
  value: number;
  icon: React.ElementType;
  variant: 'gross' | 'deduction' | 'tax' | 'net';
  prefix?: string;
  suffix?: string;
}

const KPICards: React.FC<KPICardsProps> = ({
  grossSalary,
  afpDeduction,
  fifthCategoryTax,
  netSalary,
  loading = false,
}) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const kpiData: KPICardData[] = [
    {
      title: 'Bruto Mensual',
      value: grossSalary,
      icon: TrendingUp,
      variant: 'gross',
    },
    {
      title: 'AFP (Jubilación)',
      value: afpDeduction,
      icon: CreditCard,
      variant: 'deduction',
    },
    {
      title: '5ta Categoría',
      value: fifthCategoryTax,
      icon: FileText,
      variant: 'tax',
    },
    {
      title: 'Neto Mensual',
      value: netSalary,
      icon: CheckCircle2,
      variant: 'net',
    },
  ];

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
      default:
        return 'text-card-foreground';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      {kpiData.map((item, index) => {
        const Icon = item.icon;
        
        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Card className={`shadow-card hover:shadow-elevated transition-all duration-300 ${getCardStyles(item.variant)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${getIconColor(item.variant)}`} />
                  <div className="text-right">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {item.title}
                    </p>
                  </div>
                </div>
                
                <div className="mt-2">
                  {loading ? (
                    <div className="animate-pulse">
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </div>
                  ) : (
                    <motion.div
                      key={item.value}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                    >
                      <p className={`text-xl font-bold ${getValueColor(item.variant)}`}>
                        {item.prefix}{formatCurrency(item.value)}{item.suffix}
                      </p>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default KPICards;