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

import { calculateSalaryECU } from '@/utils/salaryCalculatorECU';
import { calculateSalaryCL } from '@/utils/salaryCalculatorCL'; // 👈 NUEVO

import type { SalaryInputs, SalaryResults } from '@/utils/salaryCalculator';

import logo from '/Intercorp_Retail.svg';

/* ===================== Tipos ===================== */

type Country = 'PE' | 'EC' | 'CL';

/* ===================== Component ===================== */

const SalaryCalculator: React.FC = () => {
  const [results, setResults] = useState<SalaryResults | null>(null);
  const [loading, setLoading] = useState(false);

  // Perú
  const [lastInputs, setLastInputs] = useState<SalaryInputs | null>(null);
  const [bonusMultiples, setBonusMultiples] = useState<number>(0);

  // País
  const [selectedCountry, setSelectedCountry] = useState<Country>('PE');

  /* ===================== Calculate ===================== */

  const handleCalculate = useCallback(
    async (inputs: any) => {
      setResults(null);
      setLoading(true);

      try {
        await new Promise((r) => setTimeout(r, 400));

        let calculatedResults: SalaryResults;

        // ===== ECUADOR =====
        if (selectedCountry === 'EC') {
          calculatedResults = calculateSalaryECU({
            basicSalary: inputs.grossMonthly ?? inputs.basicSalary,
            year: inputs.year,
          });

          setLastInputs(null);
          setBonusMultiples(0);
        }

        // ===== CHILE =====
        else if (selectedCountry === 'CL') {
      calculatedResults = calculateSalaryCL({
        basicSalary: inputs.basicSalary,
        year: inputs.year,
          });

          setLastInputs(null);
          setBonusMultiples(0);
        }

        // ===== PERÚ =====
        else {
          const peInputs = inputs as SalaryInputs;
          setLastInputs(peInputs);
          calculatedResults = calculateSalary(peInputs);
        }

        setResults(calculatedResults);
      } catch (e) {
        console.error('[SalaryCalculator]', e);
      } finally {
        setLoading(false);
      }
    },
    [selectedCountry]
  );

  const handleClear = useCallback(() => {
    setResults(null);
    setLastInputs(null);
    setBonusMultiples(0);
  }, []);

  /* ===================== Derived ===================== */

  const regime = results?.regime ?? 'NORMAL';
  const healthScheme = results?.healthScheme ?? 'ESSALUD';
  const healthRateLabel = healthScheme === 'EPS' ? '6.75%' : '9%';
  const riaAliquots = results?.riaAliquots ?? null;

  /* ===================== Bonos (solo Perú) ===================== */

  const bonusGross = useMemo(() => {
    if (!results || selectedCountry !== 'PE') return 0;
    return computeBonusGross(
      results.basicSalary,
      results.foodAllowance,
      bonusMultiples
    );
  }, [results, bonusMultiples, selectedCountry]);

  const bonusNet = useMemo(() => {
    if (!results || !lastInputs || selectedCountry !== 'PE') return 0;
    return computeBonusNetFifthOnlyFromResults(
      lastInputs,
      results,
      bonusGross
    ).bonusNet;
  }, [results, lastInputs, bonusGross, selectedCountry]);

  /* ===================== Render ===================== */

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-white border-b-4 border-blue-600">
        <div className="container mx-auto px-4 py-2 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">
              💰 Sueldo Neto{' '}
              {selectedCountry === 'EC'
                ? 'Ecuador'
                : selectedCountry === 'CL'
                ? 'Chile'
                : 'Perú'}
            </h1>
            <p className="text-blue-700/80 text-sm sm:text-base hidden sm:block">
              Calculadora salarial completa y comparable
            </p>
          </div>
          <img src={logo} className="h-8 sm:h-10" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <InputsCard
            onCalculate={handleCalculate}
            onClear={handleClear}
            loading={loading}
            onBonusMultiplesChange={setBonusMultiples}
            onCountryChange={(c: Country) => setSelectedCountry(c)}
          />
        </div>

        <div className="lg:col-span-8 space-y-6">
          {!loading && results && (
            <>
              <KPICards
                country={selectedCountry}
                grossSalary={results.grossMonthlySalary}
                netSalary={results.netMonthlySalary}
                netSalaryYear2={results.netMonthlySalaryYear2}
                foodAllowance={results.foodAllowance}
                loading={loading}
                afpDeduction={results.afpDeduction}
                fifthCategoryTax={results.fifthCategoryTax}
                iessDeduction={
                  selectedCountry === 'EC'
                    ? results.iessAnnual12 / 12
                    : undefined
                }
                incomeTax={
                  selectedCountry === 'EC'
                    ? results.fifthCategoryTax
                    : undefined
                }
                decimoThird={
                  selectedCountry === 'EC'
                    ? results.christmasBonus / 12
                    : undefined
                }
                decimoFourth={
                  selectedCountry === 'EC'
                    ? results.julyBonus / 12
                    : undefined
                }
                reserveFund={
                  selectedCountry === 'EC'
                    ? results.netMonthlySalaryYear2 -
                      results.netMonthlySalary
                    : undefined
                }
                healthDeduction={
  selectedCountry === 'CL'
    ? results.healthDeduction
    : undefined
}

unemploymentDeduction={
  selectedCountry === 'CL'
    ? results.unemploymentDeduction
    : undefined
}
              />

              {/* ===== Bonos solo Perú ===== */}
              {selectedCountry === 'PE' &&
                (bonusGross > 0 || bonusNet > 0) && (
                  <BonusMetrics
                    bonusGross={bonusGross}
                    bonusNet={bonusNet}
                  />
                )}

              <AnnualMetrics
  country={selectedCountry}

  /* ===== régimen (para RIA) ===== */
  regime={regime}
  riaAliquots={riaAliquots}

  /* ===== comunes ===== */
  netAnnualSalary={results.netAnnualSalary}
  loading={loading}

  /* ===== Perú ===== */
  annualGrossIncome={results.annualGrossIncome}
  christmasBonus={results.christmasBonus}
  julyBonus={results.julyBonus}
  healthBonus={results.healthBonus}
  totalAnnualIncome={results.totalAnnualIncome}
  annualFoodAllowance={results.annualFoodAllowance}
  bonusGross={selectedCountry === 'PE' ? bonusGross : 0}
  bonusNet={selectedCountry === 'PE' ? bonusNet : undefined}

  /* ===== Ecuador ===== */
  grossAnnual12={results.grossAnnual12}
  grossAnnual13={results.grossAnnual13}
  iessAnnual12={results.iessAnnual12}
  totalAnnualCost={results.totalAnnualCost}
  decimoFourthAnnual={results.julyBonus}
  reserveFundAnnual={
    selectedCountry === 'EC'
      ? results.netMonthlySalaryYear2 * 12 -
        results.netMonthlySalary * 12
      : 0
  }

  /* ===== 🔴 CHILE (ESTO FALTABA) ===== */
  afpDeduction={
    selectedCountry === 'CL'
      ? results.afpDeduction
      : undefined
  }
  healthDeduction={
    selectedCountry === 'CL'
      ? results.healthDeduction
      : undefined
  }
  unemploymentDeduction={
    selectedCountry === 'CL'
      ? results.unemploymentDeduction
      : undefined
  }
  fifthCategoryTax={
    selectedCountry === 'CL'
      ? results.fifthCategoryTax
      : undefined
  }
/>


              <ChartsPanel
                grossSalary={results.grossMonthlySalary}
                afpDeduction={results.afpDeduction}
                fifthCategoryTax={results.fifthCategoryTax}
                netSalary={results.netMonthlySalary}
              />

              <BreakdownAccordion
                breakdown={results.breakdown}
                loading={loading}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default SalaryCalculator;
