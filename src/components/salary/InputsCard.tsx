import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, RefreshCw } from 'lucide-react';

// === IMPORTA TU JSON (ruta relativa desde este archivo) ===
import rawParams from '../../utils/Data.json';

// ===== Tipos que usamos del JSON =====
type BracketUIT = { fromUIT: number; toUIT: number | null; rate: number };
type TaxParams = {
  UIT: number;
  FAMILY_ALLOWANCE: number;

  HEALTH_BONUS?: { ESSALUD?: number; EPS?: number };
  HEALTH_BONUS_RATE?: number;

  AFP_BASE_RATE: number;
  AFP_EXTRA_RATE: number;
  AFP_EXTRA_CAP: number;
  FIFTH_CATEGORY_BRACKETS_UIT: BracketUIT[];
  DEDUCTION_UIT: number;

  // campos RIA (opcionales aquí, solo para lectura contextual)
  BUILD_FROM_COMPONENTS?: boolean;
  INCLUDE_HEALTH_BONUS_EQUIV?: boolean;
};
type YearParams = Record<string, Partial<TaxParams>>;
type AllParamsJson = { NORMAL: YearParams; RIA?: YearParams };

// ==== Tipos del motor (IMPORTA del util para que tenga 'regime') ====
import type { SalaryInputs, Regime } from '@/utils/salaryCalculator';

// ==== Props de este componente ====
interface InputsCardProps {
  onCalculate: (data: SalaryInputs) => void;
  onClear: () => void;
  loading?: boolean;
}

type HealthScheme = 'ESSALUD' | 'EPS';

// ==== Helpers de lectura (mismo criterio que tu salaryCalculator) ====
const ALL_PARAMS = rawParams as AllParamsJson;

function getYearsFromJson(): string[] {
  const byRegime = ALL_PARAMS?.NORMAL || {};
  return Object.keys(byRegime).sort((a, b) => Number(a) - Number(b));
}

function getLastYearWithData(): string | null {
  const byRegime = ALL_PARAMS?.NORMAL || {};
  const years = Object.entries(byRegime)
    .filter(([, v]) => v && Object.keys(v).length > 0)
    .map(([k]) => k)
    .sort((a, b) => Number(a) - Number(b));
  return years.length ? years[years.length - 1] : null;
}

function hasDataForYear(year: string): boolean {
  const byRegime = ALL_PARAMS?.NORMAL || {};
  const y = byRegime[year];
  return !!(y && Object.keys(y).length > 0);
}

function getParamsForYearWithFallback(year: string): { params: TaxParams; effectiveYear: string } {
  const byRegime = ALL_PARAMS?.NORMAL || {};
  const exact = byRegime[year];
  if (exact && Object.keys(exact).length > 0) {
    return { params: exact as TaxParams, effectiveYear: year };
  }
  const last = getLastYearWithData();
  if (!last) {
    throw new Error('No hay parámetros cargados en Data.json para el régimen NORMAL.');
  }
  return { params: byRegime[last] as TaxParams, effectiveYear: last };
}

// ==== Utilidades locales ====
const toNumber = (v: string) => {
  const n = Number(String(v).replace(/,/g, '.'));
  return Number.isFinite(n) ? n : 0;
};
const YEARS = [2023, 2024, 2025] as const;

const InputsCard: React.FC<InputsCardProps> = ({ onCalculate, onClear, loading = false }) => {
  // === Años desde el JSON ===
  const yearsFromJson = useMemo(() => getYearsFromJson(), []);
  const defaultYear = useMemo(() => {
    return getLastYearWithData() ?? (yearsFromJson.length ? yearsFromJson[yearsFromJson.length - 1] : '2025');
  }, [yearsFromJson]);

  // === Estados de los inputs ===
  const [regime, setRegime] = useState<Regime>('NORMAL');
  const [basicSalary, setBasicSalary] = useState<string>('');
  const [foodAllowance, setFoodAllowance] = useState<string>('');
  const [hasFamilyAllowance, setHasFamilyAllowance] = useState<boolean>(false);
  const [year, setYear] = useState<string>(defaultYear);
  const [healthScheme, setHealthScheme] = useState<HealthScheme>('ESSALUD');

  // === Estado derivado del año: params efectivos y año efectivo (por fallback) ===
  const [{ params: yearParams, effectiveYear }, setYearParams] = useState<{ params: TaxParams; effectiveYear: string }>(() =>
    getParamsForYearWithFallback(defaultYear)
  );

  // Recalcular params cuando cambie "year"
  useEffect(() => {
    try {
      setYearParams(getParamsForYearWithFallback(year));
    } catch (e) {
      console.error(e);
    }
  }, [year]);

  // Asignación familiar tomada del año efectivo
  const familyAllowanceLabel = useMemo(() => {
    const amount = yearParams?.FAMILY_ALLOWANCE ?? 0;
    return `Asignación Familiar (S/ ${amount.toFixed(2)})`;
  }, [yearParams]);

  // Porcentaje visible del bono salud según año efectivo + selección
  const healthRatePercent = useMemo(() => {
    const rate =
      yearParams?.HEALTH_BONUS?.[healthScheme] ??
      yearParams?.HEALTH_BONUS_RATE ??
      0.09; // fallback
    return `${Math.round(rate * 10000) / 100}%`;
  }, [yearParams, healthScheme]);

  const handleNumberInput = (value: string, setter: (val: string) => void) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    setter(numericValue);
  };

  const formatCurrency = (value: string): string => {
    if (!value) return '';
    const number = parseFloat(value);
    if (isNaN(number)) return value;
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(number);
  };

  const isValidInput = parseFloat(basicSalary) > 0;
  const showFallbackNote = year !== effectiveYear && hasDataForYear(effectiveYear);
  const isRIA = regime === 'RIA';

  const handleCalculate = () => {
    const inputs: SalaryInputs = {
      basicSalary: toNumber(basicSalary),
      foodAllowance: toNumber(foodAllowance),
      hasFamilyAllowance,
      year: parseInt(year, 10), // el motor aplicará fallback si no hay datos
      healthScheme,
      regime, // <--- clave: enviar el régimen
    };
    onCalculate(inputs);
  };

  const handleClear = () => {
    setRegime('NORMAL');
    setBasicSalary('');
    setFoodAllowance('0');
    setHasFamilyAllowance(false);
    setYear(defaultYear);
    setHealthScheme('ESSALUD');
    onClear();
  };

  return (
    <Card className="w-full shadow-card animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-card-foreground flex items-center gap-2">
          <Calculator className="w-6 h-6 text-primary" />
          Datos Salariales
        </CardTitle>
        {showFallbackNote && (
          <p className="text-xs text-muted-foreground">
            Usando parámetros de <span className="font-medium">{effectiveYear}</span> (sin datos para {year}).
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Régimen + Año */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Régimen */}
          <div className="space-y-2">
            <label htmlFor="regime" className="text-sm font-medium text-card-foreground">
              Régimen
            </label>
            <Select value={regime} onValueChange={(v) => setRegime(v as Regime)}>
              <SelectTrigger id="regime">
                <SelectValue placeholder="Seleccionar régimen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NORMAL">Regular</SelectItem>
                <SelectItem value="RIA">RIA</SelectItem>
              </SelectContent>
            </Select>
            
          </div>

          {/* Año */}
          <div className="space-y-2">
            <label htmlFor="year" className="text-sm font-medium text-card-foreground">
              Año de Cálculo
            </label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger id="year">
                <SelectValue placeholder="Seleccionar año" />
              </SelectTrigger>
              <SelectContent>
                {yearsFromJson.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                    {!hasDataForYear(y) ? ' (sin datos)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Régimen de salud */}
        <div className="space-y-2">
          <label htmlFor="health-scheme" className="text-sm font-medium text-card-foreground">
            Régimen de Salud <span className="text-muted-foreground">({healthRatePercent})</span>
          </label>
          <Select value={healthScheme} onValueChange={(v) => setHealthScheme(v as HealthScheme)}>
            <SelectTrigger id="health-scheme">
              <SelectValue placeholder="Seleccionar régimen de salud" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ESSALUD">EsSalud (9%)</SelectItem>
              <SelectItem value="EPS">EPS (6.75%)</SelectItem>
            </SelectContent>
          </Select>
          
        </div>

        {/* Sueldo + Vales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sueldo básico */}
          <div className="space-y-2">
            <label htmlFor="basic-salary" className="text-sm font-medium text-card-foreground">
              Sueldo Básico (S/)
            </label>
            <Input
              id="basic-salary"
              type="text"
              placeholder="Ej: 3000"
              value={basicSalary}
              onChange={(e) => handleNumberInput(e.target.value, setBasicSalary)}
              className="text-base font-mono bg-input"
              autoComplete="off"
            />
            {basicSalary && <p className="text-xs text-muted-foreground">{formatCurrency(basicSalary)}</p>}
          </div>

          {/* Vales */}
          <div className="space-y-2">
            <label htmlFor="food-allowance" className="text-sm font-medium text-card-foreground">
              Vales de Alimentación (S/)
            </label>
            <Input
              id="food-allowance"
              type="text"
              placeholder="Ej: 300"
              value={foodAllowance}
              onChange={(e) => handleNumberInput(e.target.value, setFoodAllowance)}
              className="text-base font-mono bg-input"
              autoComplete="off"
            />
            {foodAllowance && <p className="text-xs text-muted-foreground">{formatCurrency(foodAllowance)}</p>}
          </div>
        </div>

        {/* Asignación familiar */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="family-allowance"
            checked={hasFamilyAllowance}
            onCheckedChange={(checked) => setHasFamilyAllowance(!!checked)}
          />
          <label htmlFor="family-allowance" className="text-sm font-medium text-card-foreground cursor-pointer">
            {familyAllowanceLabel}
          </label>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="calculator"
            size="lg"
            onClick={handleCalculate}
            disabled={!(toNumber(basicSalary) > 0) || loading}
            className="flex-1 text-white"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
            Calcular Sueldo Neto
          </Button>

          <Button
            variant="clear"
            size="lg"
            onClick={handleClear}
            className="flex-1 sm:flex-none text-white"
          >
            Limpiar
          </Button>
        </div>

        
      </CardContent>
    </Card>
  );
};

export default InputsCard;
