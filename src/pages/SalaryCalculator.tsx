// src/pages/SalaryCalculator.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import InputsCard from '@/components/salary/InputsCard';
import KPICards from '@/components/salary/KPICards';
import AnnualMetrics from '@/components/salary/AnnualMetrics';
import ChartsPanel from '@/components/salary/ChartsPanel';
import BreakdownAccordion from '@/components/salary/BreakdownAccordion';
import BonusMetrics from '@/components/salary/BonusMetrics';
import {
  calculateSalary,
  computeBonusGross,
  computeBonusNetFifthOnlyFromResults,
} from '@/utils/salaryCalculator';
import type { SalaryInputs, SalaryResults } from '@/utils/salaryCalculator';
import logo from '/Intercorp_Retail.svg';

const SalaryCalculator: React.FC = () => {
  const [results, setResults] = useState<SalaryResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastInputs, setLastInputs] = useState<SalaryInputs | null>(null);
  const [bonusMultiples, setBonusMultiples] = useState<number>(0);

  // ================================
  // CALCULAR SUELDO PRINCIPAL
  // ================================
  const handleCalculate = useCallback(async (inputs: SalaryInputs) => {
    setResults(null); // limpia resultados anteriores
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 500)); // simulación de retardo
      setLastInputs(inputs);
      const calculatedResults = calculateSalary(inputs);
      setResults(calculatedResults);
    } catch (error) {
      console.error('Error calculating salary:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ================================
  // LIMPIAR
  // ================================
  const handleClear = useCallback(() => {
    setResults(null);
    setLastInputs(null);
    setBonusMultiples(0);
  }, []);

  // ================================
  // DATOS DERIVADOS PARA LA UI
  // ================================
  const regime = results?.regime ?? 'NORMAL';
  const healthScheme = results?.healthScheme ?? 'ESSALUD';
  const healthRateLabel = healthScheme === 'EPS' ? '6.75%' : '9%';
  const riaAliquots = results?.riaAliquots ?? null;

  const loadingUI = loading;

  // ================================
  // BONOS
  // ================================
  const bonusGross = useMemo(() => {
    if (!results) return 0;
    return computeBonusGross(
      results.basicSalary,
      results.foodAllowance,
      Number.isFinite(bonusMultiples) ? bonusMultiples : 0
    );
  }, [results, bonusMultiples]);

  const bonusNet = useMemo(() => {
    if (!results || !lastInputs || bonusGross <= 0) return 0;
    return computeBonusNetFifthOnlyFromResults(
      lastInputs,
      results,
      bonusGross
    ).bonusNet;
  }, [results, lastInputs, bonusGross]);

  // ================================
  // RENDER
  // ================================
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b-4 border-blue-600">
        <div
          className="
            container mx-auto
            px-3 sm:px-4 lg:px-6 2xl:px-8
            py-3 sm:py-4
            grid grid-cols-[1fr_auto] items-start gap-2
            sm:flex sm:items-center sm:justify-between
          "
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <h1 className="text-2xl sm:text-3xl tv:text-[2.25rem] font-bold text-blue-700 text-left">
              💰 Sueldo Neto Perú
            </h1>
            <p className="hidden sm:block text-blue-700/90 text-left mt-2 text-sm sm:text-base tv:text-xl">
              Calculadora completa con AFP, 5ta categoría, gratificaciones y bonos
            </p>
          </motion.div>

          <img
            src={logo}
            alt="Intercorp Retail Logo"
            className="
              h-8 w-auto max-w-[120px] object-contain
              sm:h-10 sm:max-w-[250px] sm:ml-4
              tv:h-12
            "
            style={{ maxHeight: '48px' }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main
        className="
          container mx-auto
          max-w-screen-4xl tv:max-w-[2560px]
          px-3 sm:px-4 lg:px-6 2xl:px-8
          py-6 sm:py-8
        "
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-7">
          {/* Left Column - Inputs */}
          <motion.div
            className="lg:col-span-4 space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <InputsCard
              onCalculate={handleCalculate}
              onClear={handleClear}
              loading={loadingUI}
              onBonusMultiplesChange={setBonusMultiples}
            />
          </motion.div>

          {/* Right Column - Results */}
          <motion.div
            className="lg:col-span-8 space-y-6 xl:space-y-7"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Solo muestra los resultados cuando !loading y hay datos */}
            {!loading && results && (
              <>
                {/* KPI Mensuales */}
                <KPICards
                  grossSalary={results.grossMonthlySalary}
                  afpDeduction={results.afpDeduction}
                  fifthCategoryTax={results.fifthCategoryTax}
                  netSalary={results.netMonthlySalary}
                  foodAllowance={results.foodAllowance}
                  loading={loadingUI}
                />

                {/* Métricas de Bonos */}
                {((bonusGross || 0) > 0 || (bonusNet || 0) > 0) && (
                  <BonusMetrics
                    bonusGross={bonusGross}
                    bonusNet={bonusNet}
                    defaultExpanded={false}
                  />
                )}

                {/* Métricas Anuales */}
                <AnnualMetrics
                  annualGrossIncome={results.annualGrossIncome}
                  christmasBonus={results.christmasBonus}
                  julyBonus={results.julyBonus}
                  healthBonus={results.healthBonus}
                  totalAnnualIncome={results.totalAnnualIncome}
                  netAnnualSalary={results.netAnnualSalary}
                  loading={loadingUI}
                  regime={regime}
                  healthRateLabel={healthRateLabel}
                  riaAliquots={riaAliquots}
                  bonusGross={bonusGross}
                  annualFoodAllowance={results.annualFoodAllowance}
                />

                {/* Gráficos */}
                <ChartsPanel
                  grossSalary={results.grossMonthlySalary}
                  afpDeduction={results.afpDeduction}
                  fifthCategoryTax={results.fifthCategoryTax}
                  netSalary={results.netMonthlySalary}
                />

                {/* Desglose */}
                <BreakdownAccordion
                  breakdown={results.breakdown || null}
                  loading={loadingUI}
                />
              </>
            )}
          </motion.div>
        </div>

        <motion.footer
          className="mt-12 py-8 border-t border-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          {/* opcional */}
        </motion.footer>
      </main>
    </div>
  );
};

export default SalaryCalculator;
