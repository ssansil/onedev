import React, { useState, useCallback } from 'react';
import { Copy, Check, CreditCard, Building2, RefreshCw, Shield, Info, AlertCircle } from 'lucide-react';

interface GeneratedDocument {
  number: string;
  formatted: string;
  isValid: boolean;
}

const CPFCNPJGenerator: React.FC = () => {
  const [generatedCPF, setGeneratedCPF] = useState<GeneratedDocument>({ number: '', formatted: '', isValid: false });
  const [generatedCNPJ, setGeneratedCNPJ] = useState<GeneratedDocument>({ number: '', formatted: '', isValid: false });
  const [validationCPF, setValidationCPF] = useState('');
  const [validationCNPJ, setValidationCNPJ] = useState('');
  const [cpfValidationResult, setCpfValidationResult] = useState<{ isValid: boolean; message: string } | null>(null);
  const [cnpjValidationResult, setCnpjValidationResult] = useState<{ isValid: boolean; message: string } | null>(null);
  const [copiedCPF, setCopiedCPF] = useState(false);
  const [copiedCNPJ, setCopiedCNPJ] = useState(false);

  // CPF Generation and Validation
  const generateCPF = useCallback(() => {
    // Generate first 9 digits
    const cpfArray = [];
    for (let i = 0; i < 9; i++) {
      cpfArray.push(Math.floor(Math.random() * 10));
    }

    // Calculate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += cpfArray[i] * (10 - i);
    }
    let remainder = sum % 11;
    const firstDigit = remainder < 2 ? 0 : 11 - remainder;
    cpfArray.push(firstDigit);

    // Calculate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += cpfArray[i] * (11 - i);
    }
    remainder = sum % 11;
    const secondDigit = remainder < 2 ? 0 : 11 - remainder;
    cpfArray.push(secondDigit);

    const cpfNumber = cpfArray.join('');
    const cpfFormatted = cpfNumber.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

    setGeneratedCPF({
      number: cpfNumber,
      formatted: cpfFormatted,
      isValid: validateCPF(cpfNumber)
    });
  }, []);

  const validateCPF = useCallback((cpf: string): boolean => {
    // Remove formatting
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Check if has 11 digits
    if (cleanCPF.length !== 11) return false;
    
    // Check if all digits are the same
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    // Validate check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF[i]) * (10 - i);
    }
    let remainder = sum % 11;
    const firstDigit = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(cleanCPF[9]) !== firstDigit) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF[i]) * (11 - i);
    }
    remainder = sum % 11;
    const secondDigit = remainder < 2 ? 0 : 11 - remainder;

    return parseInt(cleanCPF[10]) === secondDigit;
  }, []);

  // CNPJ Generation and Validation
  const generateCNPJ = useCallback(() => {
    // Generate first 12 digits (8 base + 4 sequential)
    const cnpjArray = [];
    for (let i = 0; i < 8; i++) {
      cnpjArray.push(Math.floor(Math.random() * 10));
    }
    // Add sequential digits (0001 is common for main office)
    cnpjArray.push(0, 0, 0, 1);

    // Calculate first check digit
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += cnpjArray[i] * weights1[i];
    }
    let remainder = sum % 11;
    const firstDigit = remainder < 2 ? 0 : 11 - remainder;
    cnpjArray.push(firstDigit);

    // Calculate second check digit
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += cnpjArray[i] * weights2[i];
    }
    remainder = sum % 11;
    const secondDigit = remainder < 2 ? 0 : 11 - remainder;
    cnpjArray.push(secondDigit);

    const cnpjNumber = cnpjArray.join('');
    const cnpjFormatted = cnpjNumber.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');

    setGeneratedCNPJ({
      number: cnpjNumber,
      formatted: cnpjFormatted,
      isValid: validateCNPJ(cnpjNumber)
    });
  }, []);

  const validateCNPJ = useCallback((cnpj: string): boolean => {
    // Remove formatting
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    
    // Check if has 14 digits
    if (cleanCNPJ.length !== 14) return false;
    
    // Check if all digits are the same
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

    // Validate first check digit
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanCNPJ[i]) * weights1[i];
    }
    let remainder = sum % 11;
    const firstDigit = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(cleanCNPJ[12]) !== firstDigit) return false;

    // Validate second check digit
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleanCNPJ[i]) * weights2[i];
    }
    remainder = sum % 11;
    const secondDigit = remainder < 2 ? 0 : 11 - remainder;

    return parseInt(cleanCNPJ[13]) === secondDigit;
  }, []);

  const handleCPFValidation = useCallback((value: string) => {
    setValidationCPF(value);
    if (value.trim()) {
      const isValid = validateCPF(value);
      setCpfValidationResult({
        isValid,
        message: isValid ? 'CPF válido' : 'CPF inválido'
      });
    } else {
      setCpfValidationResult(null);
    }
  }, [validateCPF]);

  const handleCNPJValidation = useCallback((value: string) => {
    setValidationCNPJ(value);
    if (value.trim()) {
      const isValid = validateCNPJ(value);
      setCnpjValidationResult({
        isValid,
        message: isValid ? 'CNPJ válido' : 'CNPJ inválido'
      });
    } else {
      setCnpjValidationResult(null);
    }
  }, [validateCNPJ]);

  const copyToClipboard = async (text: string, type: 'cpf' | 'cnpj') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'cpf') {
        setCopiedCPF(true);
        setTimeout(() => setCopiedCPF(false), 2000);
      } else {
        setCopiedCNPJ(true);
        setTimeout(() => setCopiedCNPJ(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const InfoCard = ({ title, description }: { title: string; description: string }) => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <div className="flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-blue-900 mb-1">{title}</h4>
          <p className="text-xs text-blue-700 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Gerador de CPF e CNPJ
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Gere CPFs e CNPJs válidos para testes e desenvolvimento, com validação em tempo real
        </p>
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-amber-900 mb-2">⚠️ Aviso Importante</h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              Os documentos gerados são válidos apenas para <strong>testes e desenvolvimento</strong>. 
              Não utilize estes números para fins fraudulentos ou ilegais. O uso inadequado é de total responsabilidade do usuário.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* CPF Generator */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-semibold text-gray-800">Gerador de CPF</h2>
          </div>

          <InfoCard 
            title="CPF (Cadastro de Pessoas Físicas)"
            description="Documento brasileiro de identificação individual composto por 11 dígitos, sendo os dois últimos dígitos verificadores calculados matematicamente."
          />

          <div className="space-y-6">
            {/* Generate CPF */}
            <div>
              <button
                onClick={generateCPF}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <RefreshCw className="w-5 h-5" />
                Gerar CPF Válido
              </button>
            </div>

            {/* Generated CPF Display */}
            {generatedCPF.number && (
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">CPF Gerado:</span>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600">Válido</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white rounded p-3">
                    <div>
                      <div className="text-lg font-mono font-bold text-gray-900">
                        {generatedCPF.formatted}
                      </div>
                      <div className="text-xs text-gray-500">
                        Sem formatação: {generatedCPF.number}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(generatedCPF.formatted, 'cpf')}
                      className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
                    >
                      {copiedCPF ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="text-xs">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="text-xs">Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CPF Validation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validar CPF
              </label>
              <input
                type="text"
                value={validationCPF}
                onChange={(e) => {
                  const formatted = formatCPF(e.target.value);
                  if (formatted.length <= 14) {
                    handleCPFValidation(formatted);
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg transition-all font-mono ${
                  cpfValidationResult 
                    ? cpfValidationResult.isValid 
                      ? 'border-green-300 focus:ring-green-500 focus:border-transparent' 
                      : 'border-red-300 focus:ring-red-500 focus:border-transparent'
                    : 'border-gray-300 focus:ring-emerald-500 focus:border-transparent'
                }`}
                placeholder="000.000.000-00"
                maxLength={14}
              />
              {cpfValidationResult && (
                <div className={`flex items-center gap-2 mt-2 text-sm ${
                  cpfValidationResult.isValid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {cpfValidationResult.isValid ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {cpfValidationResult.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CNPJ Generator */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-5 h-5 text-teal-600" />
            <h2 className="text-xl font-semibold text-gray-800">Gerador de CNPJ</h2>
          </div>

          <InfoCard 
            title="CNPJ (Cadastro Nacional da Pessoa Jurídica)"
            description="Documento brasileiro de identificação de empresas composto por 14 dígitos, sendo os dois últimos dígitos verificadores calculados matematicamente."
          />

          <div className="space-y-6">
            {/* Generate CNPJ */}
            <div>
              <button
                onClick={generateCNPJ}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <RefreshCw className="w-5 h-5" />
                Gerar CNPJ Válido
              </button>
            </div>

            {/* Generated CNPJ Display */}
            {generatedCNPJ.number && (
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">CNPJ Gerado:</span>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600">Válido</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-white rounded p-3">
                    <div>
                      <div className="text-lg font-mono font-bold text-gray-900">
                        {generatedCNPJ.formatted}
                      </div>
                      <div className="text-xs text-gray-500">
                        Sem formatação: {generatedCNPJ.number}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(generatedCNPJ.formatted, 'cnpj')}
                      className="flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-700 rounded hover:bg-teal-200 transition-colors"
                    >
                      {copiedCNPJ ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="text-xs">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="text-xs">Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CNPJ Validation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validar CNPJ
              </label>
              <input
                type="text"
                value={validationCNPJ}
                onChange={(e) => {
                  const formatted = formatCNPJ(e.target.value);
                  if (formatted.length <= 18) {
                    handleCNPJValidation(formatted);
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg transition-all font-mono ${
                  cnpjValidationResult 
                    ? cnpjValidationResult.isValid 
                      ? 'border-green-300 focus:ring-green-500 focus:border-transparent' 
                      : 'border-red-300 focus:ring-red-500 focus:border-transparent'
                    : 'border-gray-300 focus:ring-teal-500 focus:border-transparent'
                }`}
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
              {cnpjValidationResult && (
                <div className={`flex items-center gap-2 mt-2 text-sm ${
                  cnpjValidationResult.isValid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {cnpjValidationResult.isValid ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {cnpjValidationResult.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-emerald-900 mb-2">Algoritmo Oficial</h3>
              <p className="text-xs text-emerald-700 leading-relaxed">
                Utiliza o algoritmo oficial brasileiro para cálculo dos dígitos verificadores
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-2">Validação em Tempo Real</h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                Valide documentos existentes com feedback instantâneo sobre sua autenticidade
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-purple-900 mb-2">Apenas para Testes</h3>
              <p className="text-xs text-purple-700 leading-relaxed">
                Documentos gerados são válidos matematicamente, mas destinados apenas a testes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CPFCNPJGenerator;