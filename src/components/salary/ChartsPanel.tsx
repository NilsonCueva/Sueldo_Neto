import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

interface ChartsPanelProps {
  grossSalary: number;
  afpDeduction: number;
  fifthCategoryTax: number;
  netSalary: number;
}

const ChartsPanel: React.FC<ChartsPanelProps> = ({
  grossSalary,
  afpDeduction,
  fifthCategoryTax,
  netSalary,
}) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Datos para gráfico de composición (donut)
  const compositionData = [
    {
      name: 'Sueldo Neto',
      value: netSalary,
      color: '#4014b8ff', // teal-500
    },
    {
      name: 'AFP',
      value: afpDeduction,
      color: '#d134e6ff', // orange-500
    },
    {
      name: '5ta Categoría',
      value: fifthCategoryTax,
      color: '#8b5cf6', // violet-500
    },
  ];

  // Datos para gráfico comparativo
  const comparisonData = [
    {
      name: 'Mensual',
      Bruto: grossSalary,
      Neto: netSalary,
    },
  ];

  // Custom tooltip para el donut chart
  const CustomTooltipPie = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-card-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.value)} ({((data.value / grossSalary) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip para el bar chart
  const CustomTooltipBar = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-card-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // No mostrar label si es muy pequeño

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="600"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      {/* Gráfico de Composición del Sueldo */}
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-primary" />
            Composición del Sueldo Mensual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={compositionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1000}
                >
                  {compositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltipPie />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color, fontWeight: 500 }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico Comparativo Bruto vs Neto */}
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Comparativa Mensual: Bruto vs Neto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `S/ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltipBar />} />
                <Legend />
                <Bar 
                  dataKey="Bruto" 
                  fill="#1e0efaff" 
                  name="Bruto"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="Neto" 
                  fill="#22a0f5ff" 
                  name="Neto"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1200}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartsPanel;