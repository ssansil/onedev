import React, { useState, useCallback, useEffect } from 'react';
import { 
  Calculator, 
  User, 
  Ruler, 
  Weight, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Heart, 
  Target, 
  BarChart3, 
  Calendar,
  Copy,
  Download,
  RefreshCw,
  Scale,
  Zap,
  Shield
} from 'lucide-react';

interface ImcResult {
  imc: number;
  classification: string;
  riskLevel: 'baixo' | 'normal' | 'aumentado' | 'alto' | 'muito-alto';
  idealWeightRange: {
    min: number;
    max: number;
  };
  weightDifference: number;
  recommendations: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

interface ImcHistory {
  date: string;
  weight: number;
  height: number;
  imc: number;
  classification: string;
}

const ImcCalculator: React.FC = () => {
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [result, setResult] = useState<ImcResult | null>(null);
  const [history, setHistory] = useState<ImcHistory[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string>('');

  // Carregar histórico do localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('onedev-imc-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      }
    }
  }, []);

  // Salvar histórico no localStorage
  const saveToHistory = useCallback((imcData: ImcResult, weightValue: number, heightValue: number) => {
    const newEntry: ImcHistory = {
      date: new Date().toLocaleDateString('pt-BR'),
      weight: weightValue,
      height: heightValue,
      imc: imcData.imc,
      classification: imcData.classification
    };

    const updatedHistory = [newEntry, ...history.slice(0, 9)]; // Manter apenas os últimos 10
    setHistory(updatedHistory);
    localStorage.setItem('onedev-imc-history', JSON.stringify(updatedHistory));
  }, [history]);

  const getImcClassification = (imc: number, age?: number): ImcResult => {
    let classification = '';
    let riskLevel: ImcResult['riskLevel'] = 'normal';
    let color = '';
    let bgColor = '';
    let borderColor = '';
    let recommendations: string[] = [];

    // Classificação padrão da OMS
    if (imc < 16) {
      classification = 'Magreza grave';
      riskLevel = 'alto';
      color = 'text-red-800';
      bgColor = 'bg-red-50';
      borderColor = 'border-red-200';
      recommendations = [
        'Procure orientação médica imediatamente',
        'Pode indicar desnutrição severa',
        'Acompanhamento nutricional é essencial'
      ];
    } else if (imc < 17) {
      classification = 'Magreza moderada';
      riskLevel = 'aumentado';
      color = 'text-orange-800';
      bgColor = 'bg-orange-50';
      borderColor = 'border-orange-200';
      recommendations = [
        'Consulte um médico ou nutricionista',
        'Considere aumentar a ingestão calórica',
        'Foque em alimentos nutritivos'
      ];
    } else if (imc < 18.5) {
      classification = 'Magreza leve';
      riskLevel = 'baixo';
      color = 'text-yellow-800';
      bgColor = 'bg-yellow-50';
      borderColor = 'border-yellow-200';
      recommendations = [
        'Considere ganhar peso de forma saudável',
        'Inclua mais proteínas na dieta',
        'Pratique exercícios de fortalecimento'
      ];
    } else if (imc < 25) {
      classification = 'Peso normal';
      riskLevel = 'normal';
      color = 'text-green-800';
      bgColor = 'bg-green-50';
      borderColor = 'border-green-200';
      recommendations = [
        'Mantenha seus hábitos saudáveis',
        'Continue praticando exercícios regulares',
        'Mantenha uma alimentação equilibrada'
      ];
    } else if (imc < 30) {
      classification = 'Sobrepeso';
      riskLevel = 'aumentado';
      color = 'text-orange-800';
      bgColor = 'bg-orange-50';
      borderColor = 'border-orange-200';
      recommendations = [
        'Considere perder peso gradualmente',
        'Aumente a atividade física',
        'Reduza alimentos processados'
      ];
    } else if (imc < 35) {
      classification = 'Obesidade grau I';
      riskLevel = 'alto';
      color = 'text-red-800';
      bgColor = 'bg-red-50';
      borderColor = 'border-red-200';
      recommendations = [
        'Procure orientação médica',
        'Inicie um programa de perda de peso',
        'Considere acompanhamento nutricional'
      ];
    } else if (imc < 40) {
      classification = 'Obesidade grau II';
      riskLevel = 'muito-alto';
      color = 'text-red-800';
      bgColor = 'bg-red-50';
      borderColor = 'border-red-200';
      recommendations = [
        'Procure orientação médica urgente',
        'Considere tratamento multidisciplinar',
        'Avalie riscos cardiovasculares'
      ];
    } else {
      classification = 'Obesidade grau III';
      riskLevel = 'muito-alto';
      color = 'text-red-800';
      bgColor = 'bg-red-50';
      borderColor = 'border-red-200';
      recommendations = [
        'Procure orientação médica imediatamente',
        'Considere cirurgia bariátrica',
        'Tratamento multidisciplinar é essencial'
      ];
    }

    return {
      imc,
      classification,
      riskLevel,
      idealWeightRange: { min: 0, max: 0 },
      weightDifference: 0,
      recommendations,
      color,
      bgColor,
      borderColor
    };
  };

  const calculateIdealWeight = (heightInMeters: number): { min: number; max: number } => {
    const minImc = 18.5;
    const maxImc = 24.9;
    
    return {
      min: minImc * heightInMeters * heightInMeters,
      max: maxImc * heightInMeters * heightInMeters
    };
  };

  const calculateImc = useCallback(() => {
    const weightValue = parseFloat(weight.replace(',', '.'));
    const heightValue = parseFloat(height.replace(',', '.'));

    if (!weightValue || !heightValue || weightValue <= 0 || heightValue <= 0) {
      return;
    }

    // Converter altura para metros se necessário
    const heightInMeters = heightValue > 3 ? heightValue / 100 : heightValue;
    
    if (heightInMeters < 0.5 || heightInMeters > 2.5) {
      return;
    }

    const imc = weightValue / (heightInMeters * heightInMeters);
    const ageValue = age ? parseInt(age) : undefined;
    
    let imcResult = getImcClassification(imc, ageValue);
    
    // Calcular peso ideal
    const idealRange = calculateIdealWeight(heightInMeters);
    imcResult.idealWeightRange = idealRange;
    
    // Calcular diferença de peso
    if (weightValue < idealRange.min) {
      imcResult.weightDifference = idealRange.min - weightValue;
    } else if (weightValue > idealRange.max) {
      imcResult.weightDifference = weightValue - idealRange.max;
    } else {
      imcResult.weightDifference = 0;
    }

    setResult(imcResult);
    saveToHistory(imcResult, weightValue, heightInMeters);
  }, [weight, height, age, saveToHistory]);

  const clearForm = () => {
    setWeight('');
    setHeight('');
    setAge('');
    setResult(null);
  };

  const clearHistory = () => {
    if (window.confirm('Tem certeza que deseja limpar todo o histórico?')) {
      setHistory([]);
      localStorage.removeItem('onedev-imc-history');
    }
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

  const exportResult = () => {
    if (!result) return;

    const data = {
      data: new Date().toLocaleDateString('pt-BR'),
      peso: weight,
      altura: height,
      idade: age || 'Não informado',
      sexo: gender === 'male' ? 'Masculino' : 'Feminino',
      imc: result.imc.toFixed(1),
      classificacao: result.classification,
      nivel_risco: result.riskLevel,
      peso_ideal_min: result.idealWeightRange.min.toFixed(1),
      peso_ideal_max: result.idealWeightRange.max.toFixed(1),
      diferenca_peso: result.weightDifference.toFixed(1),
      recomendacoes: result.recommendations
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `imc-resultado-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getRiskLevelInfo = (level: ImcResult['riskLevel']) => {
    switch (level) {
      case 'baixo':
        return { icon: CheckCircle, text: 'Risco Baixo', color: 'text-yellow-600' };
      case 'normal':
        return { icon: CheckCircle, text: 'Risco Normal', color: 'text-green-600' };
      case 'aumentado':
        return { icon: AlertTriangle, text: 'Risco Aumentado', color: 'text-orange-600' };
      case 'alto':
        return { icon: AlertTriangle, text: 'Risco Alto', color: 'text-red-600' };
      case 'muito-alto':
        return { icon: AlertTriangle, text: 'Risco Muito Alto', color: 'text-red-600' };
      default:
        return { icon: Info, text: 'Não avaliado', color: 'text-gray-600' };
    }
  };

  const getImcScale = () => {
    const scales = [
      { range: '< 16', label: 'Magreza grave', color: 'bg-red-600' },
      { range: '16-17', label: 'Magreza moderada', color: 'bg-red-400' },
      { range: '17-18.5', label: 'Magreza leve', color: 'bg-yellow-400' },
      { range: '18.5-25', label: 'Peso normal', color: 'bg-green-500' },
      { range: '25-30', label: 'Sobrepeso', color: 'bg-orange-400' },
      { range: '30-35', label: 'Obesidade I', color: 'bg-red-500' },
      { range: '35-40', label: 'Obesidade II', color: 'bg-red-600' },
      { range: '> 40', label: 'Obesidade III', color: 'bg-red-800' }
    ];

    return scales;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Calculadora de IMC
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Calcule seu Índice de Massa Corporal e receba orientações personalizadas sobre sua saúde
        </p>
      </div>

      {/* Calculator Form */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-green-600" />
          Dados Pessoais
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Weight className="w-4 h-4 inline mr-1" />
              Peso (kg)
            </label>
            <input
              type="text"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Ex: 70.5"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Ruler className="w-4 h-4 inline mr-1" />
              Altura (m ou cm)
            </label>
            <input
              type="text"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="Ex: 1.75 ou 175"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Idade (opcional)
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Ex: 30"
              min="1"
              max="120"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Sexo
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as 'male' | 'female')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="male">Masculino</option>
              <option value="female">Feminino</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={calculateImc}
            disabled={!weight || !height}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Calculator className="w-5 h-5" />
            Calcular IMC
          </button>

          <button
            onClick={clearForm}
            className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <RefreshCw className="w-5 h-5" />
            Limpar
          </button>

          {history.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200"
            >
              <BarChart3 className="w-5 h-5" />
              {showHistory ? 'Ocultar' : 'Ver'} Histórico
            </button>
          )}
        </div>
      </div>

      {/* IMC Scale */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-600" />
          Escala de Classificação do IMC
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {getImcScale().map((scale, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                result && result.classification === scale.label
                  ? 'ring-2 ring-blue-500 ring-opacity-50'
                  : ''
              }`}
            >
              <div className={`w-full h-3 ${scale.color} rounded mb-2`} />
              <div className="text-xs font-medium text-gray-900">{scale.range}</div>
              <div className="text-xs text-gray-600">{scale.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-8">
          {/* Main Result */}
          <div className={`${result.bgColor} ${result.borderColor} border rounded-2xl p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <Target className="w-6 h-6 text-green-600" />
                Resultado do IMC
              </h2>
              
              <button
                onClick={exportResult}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {result.imc.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Seu IMC</div>
                <button
                  onClick={() => copyToClipboard(result.imc.toFixed(1), 'IMC')}
                  className="mt-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {copiedField === 'IMC' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="text-center">
                <div className={`text-xl font-semibold ${result.color} mb-2`}>
                  {result.classification}
                </div>
                <div className="text-sm text-gray-600">Classificação</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {(() => {
                    const riskInfo = getRiskLevelInfo(result.riskLevel);
                    const Icon = riskInfo.icon;
                    return (
                      <>
                        <Icon className={`w-5 h-5 ${riskInfo.color}`} />
                        <span className={`font-semibold ${riskInfo.color}`}>
                          {riskInfo.text}
                        </span>
                      </>
                    );
                  })()}
                </div>
                <div className="text-sm text-gray-600">Nível de Risco</div>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Ideal Weight */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Peso Ideal
              </h3>

              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-700 mb-1">Faixa de peso ideal:</div>
                  <div className="text-lg font-semibold text-blue-900">
                    {result.idealWeightRange.min.toFixed(1)} kg - {result.idealWeightRange.max.toFixed(1)} kg
                  </div>
                </div>

                {result.weightDifference > 0 && (
                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="text-sm text-amber-700 mb-1">
                      {parseFloat(weight) < result.idealWeightRange.min ? 'Para atingir o peso mínimo ideal:' : 'Para atingir o peso máximo ideal:'}
                    </div>
                    <div className="text-lg font-semibold text-amber-900">
                      {parseFloat(weight) < result.idealWeightRange.min ? '+' : '-'}{result.weightDifference.toFixed(1)} kg
                    </div>
                  </div>
                )}

                {result.weightDifference === 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-800 font-medium">
                        Você está na faixa de peso ideal!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                Recomendações
              </h3>

              <div className="space-y-3">
                {result.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Activity className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{recommendation}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700">
                    <strong>Importante:</strong> Estas são orientações gerais. Sempre consulte um profissional 
                    de saúde para avaliação e orientações personalizadas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {showHistory && history.length > 0 && (
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Histórico de Cálculos
            </h2>
            
            <button
              onClick={clearHistory}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Limpar Histórico
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Data</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Peso (kg)</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Altura (m)</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">IMC</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Classificação</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{entry.date}</td>
                    <td className="py-3 px-4">{entry.weight.toFixed(1)}</td>
                    <td className="py-3 px-4">{entry.height.toFixed(2)}</td>
                    <td className="py-3 px-4 font-semibold">{entry.imc.toFixed(1)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.classification.includes('normal') ? 'bg-green-100 text-green-800' :
                        entry.classification.includes('Sobrepeso') ? 'bg-orange-100 text-orange-800' :
                        entry.classification.includes('Obesidade') ? 'bg-red-100 text-red-800' :
                        entry.classification.includes('Magreza') ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.classification}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">📊 Sobre o IMC</h3>
            <div className="text-green-800 leading-relaxed space-y-2">
              <p>
                O Índice de Massa Corporal (IMC) é uma medida internacional usada para calcular se uma pessoa 
                está no peso ideal. É calculado dividindo o peso (em kg) pela altura (em metros) ao quadrado.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-semibold text-green-900 mb-1 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Vantagens
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Cálculo rápido e simples</li>
                    <li>• Padrão internacional reconhecido</li>
                    <li>• Útil para triagem populacional</li>
                    <li>• Histórico para acompanhamento</li>
                  </ul>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-semibold text-green-900 mb-1 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Limitações
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Não considera massa muscular</li>
                    <li>• Pode variar por etnia e idade</li>
                    <li>• Não avalia distribuição de gordura</li>
                    <li>• Consulte sempre um profissional</li>
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

export default ImcCalculator;