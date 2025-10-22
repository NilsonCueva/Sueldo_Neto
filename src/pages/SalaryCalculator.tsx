import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import InputsCard from '@/components/salary/InputsCard';
import KPICards from '@/components/salary/KPICards';
import AnnualMetrics from '@/components/salary/AnnualMetrics';
import ChartsPanel from '@/components/salary/ChartsPanel';
import BreakdownAccordion from '@/components/salary/BreakdownAccordion';
import { calculateSalary } from '@/utils/salaryCalculator';
import type { SalaryInputs, SalaryResults } from '@/utils/salaryCalculator';

const SalaryCalculator: React.FC = () => {
  const [results, setResults] = useState<SalaryResults | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = useCallback(async (inputs: SalaryInputs) => {
    setLoading(true);
    // solo para mostrar spinner suave
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const calculatedResults = calculateSalary(inputs);
      setResults(calculatedResults);
    } catch (error) {
      console.error('Error calculating salary:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    setResults(null);
  }, []);

  // Derivados para AnnualMetrics (según lo que devuelve el motor)
  const regime = (results as any)?.regime ?? 'NORMAL';
  const healthScheme = (results as any)?.healthScheme ?? 'ESSALUD';
  const healthRateLabel = healthScheme === 'EPS' ? '6.75%' : '9%';
  const riaAliquots = (results as any)?.riaAliquots ?? null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b-4 border-blue-600">
        <div
          className="
            container mx-auto px-4 py-3 sm:py-4
            grid grid-cols-[1fr_auto] items-start gap-2
            sm:flex sm:items-center sm:justify-between
          "
        >
          {/* Bloque de texto */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 text-left">
              💰 Sueldo Neto Perú
            </h1>
            {/* Subtítulo → oculto en móvil, visible en sm+ */}
            <p className="hidden sm:block text-blue-700/90 text-left mt-2 text-sm sm:text-base">
              Calculadora completa con AFP, 5ta categoría y gratificaciones
            </p>
          </motion.div>

          {/* Logo → pequeño en móvil, normal en sm+ */}
          <img
            src="/Intercorp_Retail.svg"
            alt="Intercorp Retail Logo"
            className="
              h-8 w-auto max-w-[120px] object-contain
              sm:h-10 sm:max-w-[250px] sm:ml-4
            "
            style={{ maxHeight: '40px' }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Inputs */}
          <motion.div
            className="lg:col-span-4 space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <InputsCard onCalculate={handleCalculate} onClear={handleClear} loading={loading} />
          </motion.div>

          {/* Right Column - Results */}
          <motion.div
            className="lg:col-span-8 space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <KPICards
              grossSalary={results?.grossMonthlySalary || 0}
              afpDeduction={results?.afpDeduction || 0}
              fifthCategoryTax={results?.fifthCategoryTax || 0}
              netSalary={results?.netMonthlySalary || 0}
              loading={loading}
            />

            {(results || loading) && (
              <AnnualMetrics
                annualGrossIncome={results?.annualGrossIncome || 0}
                christmasBonus={results?.christmasBonus || 0}
                julyBonus={results?.julyBonus || 0}
                healthBonus={results?.healthBonus || 0}
                totalAnnualIncome={results?.totalAnnualIncome || 0}
                netAnnualSalary={results?.netAnnualSalary || 0}
                loading={loading}
                /* === props extra para la UI condicional === */
                regime={regime}
                healthRateLabel={healthRateLabel}
                riaAliquots={riaAliquots} // null en NORMAL; objeto en RIA
                annualFoodAllowance={results?.annualFoodAllowance || 0}
              />
            )}

            {results && !loading && (
              <ChartsPanel
                grossSalary={results.grossMonthlySalary}
                afpDeduction={results.afpDeduction}
                fifthCategoryTax={results.fifthCategoryTax}
                netSalary={results.netMonthlySalary}
              />
            )}

            <BreakdownAccordion breakdown={results?.breakdown || null} loading={loading} />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          className="mt-12 py-8 border-t border-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          
        </motion.footer>
      </main>
    </div>
  );
};

export default SalaryCalculator;
