import React, { useState, useCallback, useEffect } from 'react';
import { 
  Calculator, 
  Thermometer, 
  Ruler, 
  Scale, 
  Droplets, 
  Clock, 
  HardDrive,
  ArrowRightLeft,
  Copy,
  RefreshCw,
  CheckCircle,
  Zap,
  Info,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

interface ConversionCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  units: Unit[];
}

interface Unit {
  id: string;
  name: string;
  symbol: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

interface ConversionResult {
  value: number;
  unit: Unit;
  formatted: string;
}

const UnitConverter: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('temperature');
  const [inputValue, setInputValue] = useState<string>('');
  const [fromUnit, setFromUnit] = useState<string>('');
  const [toUnit, setToUnit] = useState<string>('');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [copiedField, setCopiedField] = useState<string>('');
  const [conversionHistory, setConversionHistory] = useState<Array<{
    id: string;
    category: string;
    input: number;
    fromUnit: string;
    toUnit: string;
    result: number;
    timestamp: Date;
  }>>([]);

  // Definição das categorias e unidades
  const categories: ConversionCategory[] = [
    {
      id: 'temperature',
      name: 'Temperatura',
      icon: Thermometer,
      color: 'from-red-500 to-orange-600',
      units: [
        {
          id: 'celsius',
          name: 'Celsius',
          symbol: '°C',
          toBase: (c) => c,
          fromBase: (c) => c
        },
        {
          id: 'fahrenheit',
          name: 'Fahrenheit',
          symbol: '°F',
          toBase: (f) => (f - 32) * 5/9,
          fromBase: (c) => (c * 9/5) + 32
        },
        {
          id: 'kelvin',
          name: 'Kelvin',
          symbol: 'K',
          toBase: (k) => k - 273.15,
          fromBase: (c) => c + 273.15
        },
        {
          id: 'rankine',
          name: 'Rankine',
          symbol: '°R',
          toBase: (r) => (r - 491.67) * 5/9,
          fromBase: (c) => (c * 9/5) + 491.67
        }
      ]
    },
    {
      id: 'distance',
      name: 'Distância',
      icon: Ruler,
      color: 'from-blue-500 to-cyan-600',
      units: [
        {
          id: 'meter',
          name: 'Metro',
          symbol: 'm',
          toBase: (m) => m,
          fromBase: (m) => m
        },
        {
          id: 'kilometer',
          name: 'Quilômetro',
          symbol: 'km',
          toBase: (km) => km * 1000,
          fromBase: (m) => m / 1000
        },
        {
          id: 'centimeter',
          name: 'Centímetro',
          symbol: 'cm',
          toBase: (cm) => cm / 100,
          fromBase: (m) => m * 100
        },
        {
          id: 'millimeter',
          name: 'Milímetro',
          symbol: 'mm',
          toBase: (mm) => mm / 1000,
          fromBase: (m) => m * 1000
        },
        {
          id: 'mile',
          name: 'Milha',
          symbol: 'mi',
          toBase: (mi) => mi * 1609.344,
          fromBase: (m) => m / 1609.344
        },
        {
          id: 'yard',
          name: 'Jarda',
          symbol: 'yd',
          toBase: (yd) => yd * 0.9144,
          fromBase: (m) => m / 0.9144
        },
        {
          id: 'foot',
          name: 'Pé',
          symbol: 'ft',
          toBase: (ft) => ft * 0.3048,
          fromBase: (m) => m / 0.3048
        },
        {
          id: 'inch',
          name: 'Polegada',
          symbol: 'in',
          toBase: (inch) => inch * 0.0254,
          fromBase: (m) => m / 0.0254
        }
      ]
    },
    {
      id: 'weight',
      name: 'Peso',
      icon: Scale,
      color: 'from-green-500 to-emerald-600',
      units: [
        {
          id: 'kilogram',
          name: 'Quilograma',
          symbol: 'kg',
          toBase: (kg) => kg,
          fromBase: (kg) => kg
        },
        {
          id: 'gram',
          name: 'Grama',
          symbol: 'g',
          toBase: (g) => g / 1000,
          fromBase: (kg) => kg * 1000
        },
        {
          id: 'pound',
          name: 'Libra',
          symbol: 'lb',
          toBase: (lb) => lb * 0.453592,
          fromBase: (kg) => kg / 0.453592
        },
        {
          id: 'ounce',
          name: 'Onça',
          symbol: 'oz',
          toBase: (oz) => oz * 0.0283495,
          fromBase: (kg) => kg / 0.0283495
        },
        {
          id: 'ton',
          name: 'Tonelada',
          symbol: 't',
          toBase: (t) => t * 1000,
          fromBase: (kg) => kg / 1000
        },
        {
          id: 'stone',
          name: 'Stone',
          symbol: 'st',
          toBase: (st) => st * 6.35029,
          fromBase: (kg) => kg / 6.35029
        }
      ]
    },
    {
      id: 'volume',
      name: 'Volume',
      icon: Droplets,
      color: 'from-purple-500 to-violet-600',
      units: [
        {
          id: 'liter',
          name: 'Litro',
          symbol: 'L',
          toBase: (l) => l,
          fromBase: (l) => l
        },
        {
          id: 'milliliter',
          name: 'Mililitro',
          symbol: 'mL',
          toBase: (ml) => ml / 1000,
          fromBase: (l) => l * 1000
        },
        {
          id: 'gallon_us',
          name: 'Galão (US)',
          symbol: 'gal',
          toBase: (gal) => gal * 3.78541,
          fromBase: (l) => l / 3.78541
        },
        {
          id: 'gallon_uk',
          name: 'Galão (UK)',
          symbol: 'gal (UK)',
          toBase: (gal) => gal * 4.54609,
          fromBase: (l) => l / 4.54609
        },
        {
          id: 'quart',
          name: 'Quarto',
          symbol: 'qt',
          toBase: (qt) => qt * 0.946353,
          fromBase: (l) => l / 0.946353
        },
        {
          id: 'pint',
          name: 'Pinta',
          symbol: 'pt',
          toBase: (pt) => pt * 0.473176,
          fromBase: (l) => l / 0.473176
        },
        {
          id: 'cup',
          name: 'Xícara',
          symbol: 'cup',
          toBase: (cup) => cup * 0.236588,
          fromBase: (l) => l / 0.236588
        }
      ]
    },
    {
      id: 'time',
      name: 'Tempo',
      icon: Clock,
      color: 'from-amber-500 to-yellow-600',
      units: [
        {
          id: 'second',
          name: 'Segundo',
          symbol: 's',
          toBase: (s) => s,
          fromBase: (s) => s
        },
        {
          id: 'minute',
          name: 'Minuto',
          symbol: 'min',
          toBase: (min) => min * 60,
          fromBase: (s) => s / 60
        },
        {
          id: 'hour',
          name: 'Hora',
          symbol: 'h',
          toBase: (h) => h * 3600,
          fromBase: (s) => s / 3600
        },
        {
          id: 'day',
          name: 'Dia',
          symbol: 'd',
          toBase: (d) => d * 86400,
          fromBase: (s) => s / 86400
        },
        {
          id: 'week',
          name: 'Semana',
          symbol: 'sem',
          toBase: (w) => w * 604800,
          fromBase: (s) => s / 604800
        },
        {
          id: 'month',
          name: 'Mês',
          symbol: 'mês',
          toBase: (m) => m * 2629746,
          fromBase: (s) => s / 2629746
        },
        {
          id: 'year',
          name: 'Ano',
          symbol: 'ano',
          toBase: (y) => y * 31556952,
          fromBase: (s) => s / 31556952
        }
      ]
    },
    {
      id: 'data',
      name: 'Dados Digitais',
      icon: HardDrive,
      color: 'from-indigo-500 to-purple-600',
      units: [
        {
          id: 'byte',
          name: 'Byte',
          symbol: 'B',
          toBase: (b) => b,
          fromBase: (b) => b
        },
        {
          id: 'kilobyte',
          name: 'Kilobyte',
          symbol: 'KB',
          toBase: (kb) => kb * 1024,
          fromBase: (b) => b / 1024
        },
        {
          id: 'megabyte',
          name: 'Megabyte',
          symbol: 'MB',
          toBase: (mb) => mb * 1024 * 1024,
          fromBase: (b) => b / (1024 * 1024)
        },
        {
          id: 'gigabyte',
          name: 'Gigabyte',
          symbol: 'GB',
          toBase: (gb) => gb * 1024 * 1024 * 1024,
          fromBase: (b) => b / (1024 * 1024 * 1024)
        },
        {
          id: 'terabyte',
          name: 'Terabyte',
          symbol: 'TB',
          toBase: (tb) => tb * 1024 * 1024 * 1024 * 1024,
          fromBase: (b) => b / (1024 * 1024 * 1024 * 1024)
        },
        {
          id: 'petabyte',
          name: 'Petabyte',
          symbol: 'PB',
          toBase: (pb) => pb * Math.pow(1024, 5),
          fromBase: (b) => b / Math.pow(1024, 5)
        },
        {
          id: 'bit',
          name: 'Bit',
          symbol: 'bit',
          toBase: (bit) => bit / 8,
          fromBase: (b) => b * 8
        }
      ]
    }
  ];

  const getCurrentCategory = () => {
    return categories.find(cat => cat.id === activeCategory) || categories[0];
  };

  const getCurrentUnits = () => {
    return getCurrentCategory().units;
  };

  const getUnit = (unitId: string) => {
    return getCurrentUnits().find(unit => unit.id === unitId);
  };

  // Inicializar unidades padrão quando a categoria muda
  useEffect(() => {
    const units = getCurrentUnits();
    if (units.length >= 2) {
      setFromUnit(units[0].id);
      setToUnit(units[1].id);
    }
  }, [activeCategory]);

  // Conversão em tempo real
  useEffect(() => {
    if (inputValue && fromUnit && toUnit) {
      performConversion();
    } else {
      setResult(null);
    }
  }, [inputValue, fromUnit, toUnit, activeCategory]);

  const performConversion = useCallback(() => {
    const value = parseFloat(inputValue.replace(',', '.'));
    if (isNaN(value)) {
      setResult(null);
      return;
    }

    const fromUnitObj = getUnit(fromUnit);
    const toUnitObj = getUnit(toUnit);

    if (!fromUnitObj || !toUnitObj) {
      setResult(null);
      return;
    }

    // Converter para unidade base e depois para unidade de destino
    const baseValue = fromUnitObj.toBase(value);
    const convertedValue = toUnitObj.fromBase(baseValue);

    // Formatação inteligente do resultado
    let formatted: string;
    if (Math.abs(convertedValue) >= 1000000) {
      formatted = convertedValue.toExponential(3);
    } else if (Math.abs(convertedValue) >= 1000) {
      formatted = convertedValue.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
    } else if (Math.abs(convertedValue) >= 1) {
      formatted = convertedValue.toFixed(4).replace(/\.?0+$/, '');
    } else if (Math.abs(convertedValue) >= 0.001) {
      formatted = convertedValue.toFixed(6).replace(/\.?0+$/, '');
    } else {
      formatted = convertedValue.toExponential(3);
    }

    setResult({
      value: convertedValue,
      unit: toUnitObj,
      formatted
    });

    // Adicionar ao histórico
    const historyEntry = {
      id: Date.now().toString(),
      category: activeCategory,
      input: value,
      fromUnit,
      toUnit,
      result: convertedValue,
      timestamp: new Date()
    };

    setConversionHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Manter apenas os últimos 10
  }, [inputValue, fromUnit, toUnit, activeCategory]);

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const clearAll = () => {
    setInputValue('');
    setResult(null);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const formatHistoryEntry = (entry: typeof conversionHistory[0]) => {
    const category = categories.find(cat => cat.id === entry.category);
    const fromUnitObj = category?.units.find(u => u.id === entry.fromUnit);
    const toUnitObj = category?.units.find(u => u.id === entry.toUnit);
    
    return `${entry.input} ${fromUnitObj?.symbol} = ${entry.result.toFixed(4).replace(/\.?0+$/, '')} ${toUnitObj?.symbol}`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Conversor de Unidades
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Converta entre diferentes sistemas de medida com precisão e facilidade
        </p>
      </div>

      {/* Category Selection */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Escolha a Categoria
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className={`p-3 bg-gradient-to-r ${category.color} rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-center text-gray-800">
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Converter */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-purple-600" />
            Conversor de {getCurrentCategory().name}
          </h2>
          
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4" />
            Limpar
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-end">
          {/* From Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              De
            </label>
            <div className="space-y-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Digite o valor"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {getCurrentUnits().map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={swapUnits}
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
            >
              <ArrowRightLeft className="w-6 h-6" />
            </button>
          </div>

          {/* To Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Para
            </label>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={result?.formatted || ''}
                  readOnly
                  placeholder="Resultado aparecerá aqui"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-lg font-mono pr-12"
                />
                {result && (
                  <button
                    onClick={() => copyToClipboard(result.formatted, 'resultado')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {copiedField === 'resultado' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {getCurrentUnits().map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1">Resultado da conversão:</p>
                <p className="text-2xl font-bold text-green-900">
                  {result.formatted} {result.unit.symbol}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(`${result.formatted} ${result.unit.symbol}`, 'resultado-completo')}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-300 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                {copiedField === 'resultado-completo' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                Copiar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Conversions */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Common Conversions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Conversões Rápidas - {getCurrentCategory().name}
          </h3>
          
          <div className="space-y-3">
            {getCurrentUnits().slice(0, 4).map((unit, index) => {
              if (index === 0) return null; // Skip first unit as base
              
              const baseUnit = getCurrentUnits()[0];
              const testValue = activeCategory === 'temperature' ? 0 : 1;
              const baseValue = baseUnit.toBase(testValue);
              const convertedValue = unit.fromBase(baseValue);
              
              return (
                <div key={unit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">
                    {testValue} {baseUnit.symbol} =
                  </span>
                  <span className="font-semibold text-gray-900">
                    {convertedValue.toFixed(4).replace(/\.?0+$/, '')} {unit.symbol}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversion History */}
        {conversionHistory.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Histórico de Conversões
            </h3>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {conversionHistory.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700 font-mono">
                    {formatHistoryEntry(entry)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(formatHistoryEntry(entry), `history-${entry.id}`)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {copiedField === `history-${entry.id}` ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">🔄 Sobre o Conversor de Unidades</h3>
            <div className="text-blue-800 leading-relaxed space-y-2">
              <p>
                Este conversor suporta múltiplos sistemas de medida com alta precisão. 
                Todas as conversões são realizadas localmente no seu navegador.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Precisão
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Cálculos de alta precisão</li>
                    <li>• Formatação inteligente</li>
                    <li>• Notação científica para valores extremos</li>
                    <li>• Histórico de conversões</li>
                  </ul>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Recursos
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Conversão em tempo real</li>
                    <li>• Troca rápida de unidades</li>
                    <li>• Conversões rápidas predefinidas</li>
                    <li>• Cópia fácil dos resultados</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitConverter;