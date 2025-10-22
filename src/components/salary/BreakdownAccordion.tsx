import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Copy, FileText, CheckCircle } from 'lucide-react';
import { SalaryBreakdown, formatCurrency } from '@/utils/salaryCalculator';
import { useToast } from '@/hooks/use-toast';

interface BreakdownAccordionProps {
  breakdown: SalaryBreakdown | null;
  loading?: boolean;
}

const BreakdownAccordion: React.FC<BreakdownAccordionProps> = ({ breakdown, loading = false }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateTextBreakdown = (): string => {
    if (!breakdown) return '';
    
    let text = '🧮 DESGLOSE DETALLADO - SUELDO NETO PERÚ 2025\n';
    text += '=' .repeat(50) + '\n\n';
    
    // Cálculo mensual
    text += '📅 CÁLCULO MENSUAL:\n';
    text += '-'.repeat(20) + '\n';
    breakdown.monthlyCalculation.forEach((item) => {
      const amount = item.amount >= 0 ? formatCurrency(item.amount) : `- ${formatCurrency(Math.abs(item.amount))}`;
      text += `${item.step}. ${item.description}: ${amount}\n`;
      if (item.formula) {
        text += `   Fórmula: ${item.formula}\n`;
      }
    });
    
    text += '\n';
    
    // Cálculo anual
    text += '📆 CÁLCULO ANUAL:\n';
    text += '-'.repeat(20) + '\n';
    breakdown.annualCalculation.forEach((item) => {
      const amount = item.amount >= 0 ? formatCurrency(item.amount) : `- ${formatCurrency(Math.abs(item.amount))}`;
      text += `${item.step}. ${item.description}: ${amount}\n`;
      if (item.formula) {
        text += `   Fórmula: ${item.formula}\n`;
      }
    });
    
    text += '\n';
    
    // Desglose 5ta categoría
    if (breakdown.fifthCategoryDetails.length > 0) {
      text += '📊 DESGLOSE 5TA CATEGORÍA:\n';
      text += '-'.repeat(25) + '\n';
      breakdown.fifthCategoryDetails.forEach((item) => {
        text += `${item.step} (${item.rate}): ${item.description} = ${formatCurrency(item.amount)}\n`;
      });
    }
    
    text += '\n';
    text += `Generado: ${new Date().toLocaleString('es-PE')}\n`;
    text += 'Calculadora Sueldo Neto Perú 2025\n';
    
    return text;
  };

  const handleCopyBreakdown = async () => {
    try {
      const textBreakdown = generateTextBreakdown();
      await navigator.clipboard.writeText(textBreakdown);
      setCopied(true);
      toast({
        title: "Desglose copiado",
        description: "El desglose detallado ha sido copiado al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar el desglose. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const formatStepAmount = (amount: number): string => {
    if (amount >= 0) {
      return formatCurrency(amount);
    } else {
      return `- ${formatCurrency(Math.abs(amount))}`;
    }
  };

  const getAmountColor = (amount: number): string => {
    if (amount >= 0) {
      return 'text-green-600 dark:text-green-400';
    } else {
      return 'text-red-600 dark:text-red-400';
    }
  };

  if (loading || !breakdown) {
    return (
      <Card className="shadow-card animate-fade-in">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Desglose Detallado
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Ingresa un sueldo y calcula para ver el desglose detallado
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Desglose Detallado
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyBreakdown}
            disabled={copied}
            className="gap-2"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {/* Cálculo Mensual */}
          <AccordionItem value="monthly">
            <AccordionTrigger className="text-left hover:text-primary">
              📅 Cálculo Mensual
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 font-mono text-sm">
                {breakdown.monthlyCalculation.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-2 rounded bg-muted/30">
                    <div className="flex-1">
                      <div className="font-semibold text-card-foreground">
                        {item.step}. {item.description}
                      </div>
                      {item.formula && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.formula}
                        </div>
                      )}
                    </div>
                    <div className={`font-bold text-right ml-4 ${getAmountColor(item.amount)}`}>
                      {formatStepAmount(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Cálculo Anual */}
          <AccordionItem value="annual">
            <AccordionTrigger className="text-left hover:text-primary">
              📆 Cálculo Anual
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 font-mono text-sm">
                {breakdown.annualCalculation.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-2 rounded bg-muted/30">
                    <div className="flex-1">
                      <div className="font-semibold text-card-foreground">
                        {item.step}. {item.description}
                      </div>
                      {item.formula && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.formula}
                        </div>
                      )}
                    </div>
                    <div className={`font-bold text-right ml-4 ${getAmountColor(item.amount)}`}>
                      {formatStepAmount(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Desglose 5ta Categoría */}
          {breakdown.fifthCategoryDetails.length > 0 && (
            <AccordionItem value="fifth-category">
              <AccordionTrigger className="text-left hover:text-primary">
                📊 Desglose 5ta Categoría por Tramos
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 font-mono text-sm">
                  {breakdown.fifthCategoryDetails.map((item, index) => (
                    <div key={index} className="flex justify-between items-start p-2 rounded bg-muted/30">
                      <div className="flex-1">
                        <div className="font-semibold text-card-foreground">
                          {item.step} ({item.rate})
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.description}
                        </div>
                      </div>
                      <div className={`font-bold text-right ml-4 ${getAmountColor(item.amount)}`}>
                        {formatCurrency(item.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default BreakdownAccordion;