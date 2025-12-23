// =======================
// CHILE – Salary Engine
// =======================

import type { SalaryResults, SalaryBreakdown } from './salaryCalculator';
import data from './DataCL.json';

// ================= Utilidades =================
const round2 = (v: number) => Math.round(v * 100) / 100;

// ================= Tipos =================
export interface SalaryInputsCL {
  basicSalary: number; // Sueldo bruto mensual
  year: number;
  contractType: 'INDEFINITE' | 'FIXED';
}

// ================= SEGUNDA CATEGORÍA =================
function calculateSecondCategoryTax(taxableBaseUTM: number) {
  let taxUTM = 0;
  const details: SalaryBreakdown['fifthCategoryDetails'] = [];

  for (const b of data.incomeTax.brackets) {
    const to = b.to ?? Infinity;

    if (taxableBaseUTM >= b.from && taxableBaseUTM <= to) {
      taxUTM = b.fixed + (taxableBaseUTM - b.from) * b.rate;

      details.push({
        step: `Tramo ${Math.round(b.rate * 100)}%`,
        description: `${b.from} – ${b.to ?? '∞'} UTM`,
        amount: round2(taxUTM),
        rate: `${Math.round(b.rate * 100)}%`,
      });
      break;
    }
  }

  return {
    taxUTM: round2(taxUTM),
    details,
  };
}

// ================= CÁLCULO PRINCIPAL =================
export function calculateSalaryCL(
  inputs: SalaryInputsCL
): SalaryResults {
  const SB = inputs.basicSalary;

  // ================= UTM =================
  const UTM_VALUE = data.utm[inputs.year];

  // ================= DESCUENTOS TRABAJADOR =================
  const afp_m = SB * data.socialSecurity.employee.afp;
  const health_m = SB * data.socialSecurity.employee.health;

  const unemploymentRate =
    inputs.contractType === 'INDEFINITE'
      ? data.socialSecurity.employee.unemploymentInsurance.indefiniteContract
      : data.socialSecurity.employee.unemploymentInsurance.fixedTermContract;

  const unemployment_m = SB * unemploymentRate;

  const totalEmployeeContributions =
    afp_m + health_m + unemployment_m;

  // ================= BASE IMPONIBLE =================
  const taxableBaseCLP = SB - totalEmployeeContributions;
  const taxableBaseUTM = taxableBaseCLP / UTM_VALUE;

  // ================= IMPUESTO SEGUNDA CATEGORÍA =================
  const {
    taxUTM,
    details: incomeTaxDetails,
  } = calculateSecondCategoryTax(taxableBaseUTM);

  const monthlyIncomeTax = taxUTM * UTM_VALUE;

  // ================= NETO TRABAJADOR =================
  const netMonthly =
    SB -
    totalEmployeeContributions -
    monthlyIncomeTax;

  const netAnnual = netMonthly * 12;

  // ================= COSTO EMPRESA =================
  const employerUnemploymentRate =
    inputs.contractType === 'INDEFINITE'
      ? data.socialSecurity.employer.unemploymentInsurance.indefiniteContract
      : data.socialSecurity.employer.unemploymentInsurance.fixedTermContract;

  const employerUnemployment_m =
    SB * employerUnemploymentRate;

  const sis_m = SB * data.socialSecurity.employer.sis;

  const totalEmployerCost_m =
    SB + employerUnemployment_m + sis_m;

  const totalAnnualCost = totalEmployerCost_m * 12;

  // ================= DESGLOSE =================
  const breakdown: SalaryBreakdown = {
    monthlyCalculation: [
      { step: '1', description: 'Sueldo bruto', amount: SB },
      { step: '2', description: 'AFP trabajador', amount: -round2(afp_m) },
      { step: '3', description: 'Salud (7%)', amount: -round2(health_m) },
      {
        step: '4',
        description: 'Seguro cesantía trabajador',
        amount: -round2(unemployment_m),
      },
      {
        step: '5',
        description: 'Impuesto Segunda Categoría',
        amount: -round2(monthlyIncomeTax),
      },
      {
        step: '6',
        description: 'Sueldo líquido',
        amount: round2(netMonthly),
      },
    ],
    annualCalculation: [
      {
        step: '1',
        description: 'Costo anual empresa',
        amount: round2(totalAnnualCost),
      },
      {
        step: '2',
        description: 'Neto anual trabajador',
        amount: round2(netAnnual),
      },
    ],
    fifthCategoryDetails: incomeTaxDetails,
  };

  // ================= RETURN =================
  return {
    regime: 'NORMAL',
    healthScheme: 'ESSALUD', // compatibilidad con tipos actuales
    riaAliquots: null,

    // Inputs
    basicSalary: SB,
    foodAllowance: 0,
    familyAllowance: 0,

    // Mensual
    grossMonthlySalary: round2(SB),
    afpDeduction: round2(totalEmployeeContributions),
    fifthCategoryTax: round2(monthlyIncomeTax),
    netMonthlySalary: round2(netMonthly),
    netMonthlySalaryYear2: round2(netMonthly),

    // ===== COSTO EMPRESA =====
    grossAnnual13: round2(SB * 12),
    totalAnnualCost: round2(totalAnnualCost),

    // Anual trabajador
    annualGrossIncome: round2(SB * 12),
    christmasBonus: 0,
    julyBonus: 0,
    healthBonus: 0,
    grossAnnual12: round2(SB * 12),
    iessAnnual12: round2(totalEmployeeContributions * 12),
    totalAnnualIncome: round2(netAnnual),
    annualFoodAllowance: 0,

    annualAfpDeduction: round2(totalEmployeeContributions * 12),
    annualFifthCategoryTax: round2(monthlyIncomeTax * 12),
    netAnnualSalary: round2(netAnnual),

    breakdown,
  };
}
