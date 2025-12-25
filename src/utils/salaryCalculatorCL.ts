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
  const UTM_VALUE = data.utm[String(inputs.year)];
  if (!UTM_VALUE) {
    throw new Error(`No hay valor UTM para el año ${inputs.year}`);
  }

  // ================= DESCUENTOS TRABAJADOR =================
  const afp_m = SB * data.socialSecurity.employee.afp;
  const health_m = SB * data.socialSecurity.employee.health;

  // 👉 SIN pedir tipo de contrato: asumimos INDEFINIDO
  const unemployment_m =
    SB *
    data.socialSecurity.employee.unemploymentInsurance
      .indefiniteContract;

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
  const employerUnemployment_m =
    SB *
    data.socialSecurity.employer.unemploymentInsurance
      .indefiniteContract;

  const sis_m = SB * data.socialSecurity.employer.sis;

  const totalEmployerCost_m =
    SB + employerUnemployment_m + sis_m;

  const totalAnnualCost = totalEmployerCost_m * 12;

  // ================= DESGLOSE =================
  const breakdown: SalaryBreakdown = {
    monthlyCalculation: [
      { step: '1', description: 'Sueldo bruto', amount: round2(SB) },
      {
        step: '2',
        description: 'AFP trabajador',
        amount: -round2(afp_m),
      },
      {
        step: '3',
        description: 'Salud (7%)',
        amount: -round2(health_m),
      },
      {
        step: '4',
        description: 'Seguro cesantía',
        amount: -round2(unemployment_m),
      },
      {
        step: '5',
        description: 'Impuesto 2ª Categoría',
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
    // Compatibilidad general
    regime: 'NORMAL',
    healthScheme: 'ESSALUD',
    riaAliquots: null,

    // Inputs
    basicSalary: round2(SB),
    foodAllowance: 0,
    familyAllowance: 0,

    // ================= KPIs MENSUALES =================
    grossMonthlySalary: round2(SB),

    // 👉 CLAVE: KPIs separados
    afpDeduction: round2(afp_m),
    fifthCategoryTax: round2(monthlyIncomeTax),

    // 👉 Campos extra usados por KPICards (Chile)
    healthDeduction: round2(health_m),
    unemploymentDeduction: round2(unemployment_m),

    netMonthlySalary: round2(netMonthly),
    netMonthlySalaryYear2: round2(netMonthly),

    // ================= ANUALES =================
    annualGrossIncome: round2(SB * 12),
    christmasBonus: 0,
    julyBonus: 0,
    healthBonus: 0,

    grossAnnual12: round2(SB * 12),
    grossAnnual13: round2(SB * 12), // Chile no tiene 13°
    iessAnnual12: round2(totalEmployeeContributions * 12),

    totalAnnualIncome: round2(netAnnual),
    annualFoodAllowance: 0,

    annualAfpDeduction: round2(totalEmployeeContributions * 12),
    annualFifthCategoryTax: round2(monthlyIncomeTax * 12),
    netAnnualSalary: round2(netAnnual),

    totalAnnualCost: round2(totalAnnualCost),

    breakdown,
  };
}
