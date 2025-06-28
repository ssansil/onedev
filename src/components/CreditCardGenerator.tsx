import React, { useState, useCallback } from 'react';
import { Copy, Check, CreditCard, Shield, RefreshCw, AlertCircle, Info, Eye, EyeOff, User } from 'lucide-react';

interface CreditCardData {
  number: string;
  formatted: string;
  brand: string;
  cvv: string;
  expiryDate: string;
  holderName: string;
  isValid: boolean;
}

interface CardBrand {
  name: string;
  pattern: RegExp;
  length: number[];
  cvvLength: number;
  prefix: string[];
  color: string;
  bgColor: string;
}

const CreditCardGenerator: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState<string>('visa');
  const [generatedCard, setGeneratedCard] = useState<CreditCardData | null>(null);
  const [validationNumber, setValidationNumber] = useState('');
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; brand: string; message: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCVV, setShowCVV] = useState(false);

  const cardBrands: Record<string, CardBrand> = {
    visa: {
      name: 'Visa',
      pattern: /^4[0-9]{12}(?:[0-9]{3})?$/,
      length: [13, 16, 19],
      cvvLength: 3,
      prefix: ['4'],
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-200'
    },
    mastercard: {
      name: 'Mastercard',
      pattern: /^5[1-5][0-9]{14}$/,
      length: [16],
      cvvLength: 3,
      prefix: ['51', '52', '53', '54', '55'],
      color: 'text-red-600',
      bgColor: 'bg-red-50 border-red-200'
    },
    amex: {
      name: 'American Express',
      pattern: /^3[47][0-9]{13}$/,
      length: [15],
      cvvLength: 4,
      prefix: ['34', '37'],
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200'
    },
    discover: {
      name: 'Discover',
      pattern: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
      length: [16],
      cvvLength: 3,
      prefix: ['6011', '65'],
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 border-orange-200'
    },
    jcb: {
      name: 'JCB',
      pattern: /^(?:2131|1800|35\d{3})\d{11}$/,
      length: [16],
      cvvLength: 3,
      prefix: ['35'],
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-200'
    },
    diners: {
      name: 'Diners Club',
      pattern: /^3[0689][0-9]{12}$/,
      length: [14],
      cvvLength: 3,
      prefix: ['30', '36', '38'],
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 border-indigo-200'
    }
  };

  // Listas de nomes para geração aleatória
  const firstNames = [
    'Ana', 'Carlos', 'Maria', 'João', 'Fernanda', 'Pedro', 'Juliana', 'Rafael', 'Camila', 'Lucas',
    'Beatriz', 'Gabriel', 'Larissa', 'Thiago', 'Amanda', 'Bruno', 'Natália', 'Diego', 'Priscila', 'André',
    'Isabela', 'Rodrigo', 'Vanessa', 'Felipe', 'Patrícia', 'Gustavo', 'Renata', 'Marcelo', 'Cristina', 'Daniel',
    'Adriana', 'Ricardo', 'Mônica', 'Leandro', 'Simone', 'Fábio', 'Carla', 'Vinicius', 'Tatiana', 'Henrique',
    'Luciana', 'Márcio', 'Sandra', 'Alexandre', 'Débora', 'Roberto', 'Eliane', 'Sérgio', 'Cláudia', 'Antônio'
  ];

  const lastNames = [
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
    'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa',
    'Rocha', 'Dias', 'Monteiro', 'Cardoso', 'Reis', 'Araújo', 'Nascimento', 'Freitas', 'Nunes', 'Moreira',
    'Correia', 'Teixeira', 'Mendes', 'Pinto', 'Cunha', 'Melo', 'Campos', 'Ramos', 'Farias', 'Castro',
    'Andrade', 'Miranda', 'Moura', 'Cavalcanti', 'Machado', 'Nogueira', 'Brito', 'Duarte', 'Azevedo', 'Barros'
  ];

  // Gerar nome aleatório
  const generateRandomName = useCallback((): string => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${firstName} ${lastName}`;
  }, []);

  // Algoritmo de Luhn para validação
  const luhnCheck = useCallback((number: string): boolean => {
    const digits = number.replace(/\D/g, '').split('').map(Number);
    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }, []);

  // Gerar dígito de verificação usando Luhn
  const generateLuhnDigit = useCallback((partialNumber: string): string => {
    const digits = partialNumber.split('').map(Number);
    let sum = 0;
    let isEven = true;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit.toString();
  }, []);

  // Detectar bandeira do cartão
  const detectCardBrand = useCallback((number: string): string => {
    const cleanNumber = number.replace(/\D/g, '');
    
    for (const [key, brand] of Object.entries(cardBrands)) {
      if (brand.pattern.test(cleanNumber)) {
        return key;
      }
    }

    // Verificação por prefixo se o padrão completo não funcionar
    for (const [key, brand] of Object.entries(cardBrands)) {
      for (const prefix of brand.prefix) {
        if (cleanNumber.startsWith(prefix)) {
          return key;
        }
      }
    }

    return 'unknown';
  }, [cardBrands]);

  // Gerar número de cartão
  const generateCardNumber = useCallback(() => {
    const brand = cardBrands[selectedBrand];
    const targetLength = brand.length[0];
    const prefix = brand.prefix[Math.floor(Math.random() * brand.prefix.length)];
    
    // Gerar dígitos aleatórios (menos o último dígito de verificação)
    let number = prefix;
    const remainingLength = targetLength - prefix.length - 1;
    
    for (let i = 0; i < remainingLength; i++) {
      number += Math.floor(Math.random() * 10).toString();
    }
    
    // Adicionar dígito de verificação Luhn
    const checkDigit = generateLuhnDigit(number);
    number += checkDigit;
    
    return number;
  }, [selectedBrand, cardBrands, generateLuhnDigit]);

  // Gerar CVV
  const generateCVV = useCallback(() => {
    const brand = cardBrands[selectedBrand];
    let cvv = '';
    for (let i = 0; i < brand.cvvLength; i++) {
      cvv += Math.floor(Math.random() * 10).toString();
    }
    return cvv;
  }, [selectedBrand, cardBrands]);

  // Gerar data de expiração
  const generateExpiryDate = useCallback(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    // Gerar data entre 1-5 anos no futuro
    const yearsToAdd = Math.floor(Math.random() * 5) + 1;
    const futureYear = currentYear + yearsToAdd;
    const month = Math.floor(Math.random() * 12) + 1;
    
    // Se for o mesmo ano, garantir que o mês seja futuro
    const finalMonth = futureYear === currentYear && month <= currentMonth 
      ? currentMonth + 1 
      : month;
    
    return `${finalMonth.toString().padStart(2, '0')}/${futureYear.toString().slice(-2)}`;
  }, []);

  // Formatar número do cartão
  const formatCardNumber = useCallback((number: string): string => {
    const brand = detectCardBrand(number);
    const cleanNumber = number.replace(/\D/g, '');
    
    if (brand === 'amex') {
      // American Express: 4-6-5
      return cleanNumber.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
    } else if (brand === 'diners') {
      // Diners Club: 4-6-4
      return cleanNumber.replace(/(\d{4})(\d{6})(\d{4})/, '$1 $2 $3');
    } else {
      // Outros: 4-4-4-4
      return cleanNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
  }, [detectCardBrand]);

  // Gerar cartão completo
  const generateCard = useCallback(() => {
    const number = generateCardNumber();
    const cvv = generateCVV();
    const expiryDate = generateExpiryDate();
    const holderName = generateRandomName();
    const formatted = formatCardNumber(number);
    const isValid = luhnCheck(number);

    setGeneratedCard({
      number,
      formatted,
      brand: selectedBrand,
      cvv,
      expiryDate,
      holderName,
      isValid
    });
  }, [selectedBrand, generateCardNumber, generateCVV, generateExpiryDate, generateRandomName, formatCardNumber, luhnCheck]);

  // Validar cartão
  const validateCard = useCallback((number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    
    if (!cleanNumber) {
      setValidationResult(null);
      return;
    }

    const isValid = luhnCheck(cleanNumber);
    const brand = detectCardBrand(cleanNumber);
    const brandName = brand !== 'unknown' ? cardBrands[brand]?.name || 'Desconhecida' : 'Desconhecida';
    
    let message = '';
    if (isValid && brand !== 'unknown') {
      message = `Cartão ${brandName} válido`;
    } else if (isValid && brand === 'unknown') {
      message = 'Número válido (bandeira não reconhecida)';
    } else {
      message = 'Número de cartão inválido';
    }

    setValidationResult({
      isValid: isValid && brand !== 'unknown',
      brand: brandName,
      message
    });
  }, [luhnCheck, detectCardBrand, cardBrands]);

  const handleValidationChange = (value: string) => {
    // Permitir apenas números e espaços
    const formatted = value.replace(/[^\d\s]/g, '');
    setValidationNumber(formatted);
    validateCard(formatted);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyFullCardData = async () => {
    if (!generatedCard) return;
    
    const fullData = `Nome: ${generatedCard.holderName}
Número: ${generatedCard.number}
Expiração: ${generatedCard.expiryDate}
CVV: ${generatedCard.cvv}
Bandeira: ${cardBrands[generatedCard.brand].name}`;

    try {
      await navigator.clipboard.writeText(fullData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
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
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Gerador de Cartão de Crédito
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Gere cartões de crédito válidos para testes com algoritmo de Luhn, nomes aleatórios e validação por bandeira
        </p>
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-amber-900 mb-2">⚠️ Aviso Importante</h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              Os cartões gerados são válidos apenas para <strong>testes e desenvolvimento</strong>. 
              Não possuem fundos reais e não devem ser usados para transações reais. O uso inadequado é de total responsabilidade do usuário.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Generator */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Gerador de Cartão</h2>
          </div>

          <InfoCard 
            title="Gerador de Cartões de Teste"
            description="Gera números de cartão válidos usando o algoritmo de Luhn. Inclui nome do portador, CVV e data de expiração para testes completos."
          />

          <div className="space-y-6">
            {/* Brand Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Selecionar Bandeira:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(cardBrands).map(([key, brand]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedBrand(key)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedBrand === key
                        ? `${brand.bgColor} border-current ${brand.color}`
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{brand.name}</div>
                    <div className="text-xs opacity-75">
                      {brand.length.join('/')} dígitos
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateCard}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              Gerar Cartão {cardBrands[selectedBrand].name}
            </button>

            {/* Generated Card Display */}
            {generatedCard && (
              <div className={`${cardBrands[generatedCard.brand].bgColor} border rounded-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Cartão Gerado:</span>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600">Válido</span>
                  </div>
                </div>
                
                {/* Card Visual */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white mb-4">
                  <div className="flex justify-between items-start mb-8">
                    <div className="text-lg font-bold">
                      {cardBrands[generatedCard.brand].name}
                    </div>
                    <CreditCard className="w-8 h-8 opacity-80" />
                  </div>
                  
                  <div className="font-mono text-xl tracking-wider mb-6">
                    {generatedCard.formatted}
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-xs opacity-70 mb-1">PORTADOR</div>
                      <div className="font-semibold text-sm uppercase tracking-wide">
                        {generatedCard.holderName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs opacity-70 mb-1">VÁLIDO ATÉ</div>
                      <div className="font-mono text-sm">{generatedCard.expiryDate}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-600 flex justify-between items-center">
                    <div>
                      <div className="text-xs opacity-70 mb-1">CVV</div>
                      <div className="font-mono text-sm">
                        {showCVV ? generatedCard.cvv : '•'.repeat(generatedCard.cvv.length)}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowCVV(!showCVV)}
                      className="p-1 text-gray-300 hover:text-white transition-colors"
                    >
                      {showCVV ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Card Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white rounded p-3">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Nome do Portador:</div>
                      <div className="text-sm text-gray-600">{generatedCard.holderName}</div>
                    </div>
                    <User className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="flex items-center justify-between bg-white rounded p-3">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Número:</div>
                      <div className="font-mono text-sm text-gray-600">{generatedCard.number}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(generatedCard.number)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span className="text-xs">{copied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded p-3">
                      <div className="text-sm font-medium text-gray-700">Expiração:</div>
                      <div className="font-mono text-sm text-gray-600">{generatedCard.expiryDate}</div>
                    </div>
                    <div className="bg-white rounded p-3">
                      <div className="text-sm font-medium text-gray-700">CVV:</div>
                      <div className="font-mono text-sm text-gray-600">
                        {showCVV ? generatedCard.cvv : '•'.repeat(generatedCard.cvv.length)}
                      </div>
                    </div>
                  </div>

                  {/* Copy All Data Button */}
                  <button
                    onClick={copyFullCardData}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar Todos os Dados
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Validator */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">Validador de Cartão</h2>
          </div>

          <InfoCard 
            title="Validação com Algoritmo de Luhn"
            description="Valida números de cartão usando o algoritmo de Luhn e detecta automaticamente a bandeira. Não verifica se o cartão existe realmente."
          />

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do Cartão
              </label>
              <input
                type="text"
                value={validationNumber}
                onChange={(e) => handleValidationChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg transition-all font-mono ${
                  validationResult 
                    ? validationResult.isValid 
                      ? 'border-green-300 focus:ring-green-500 focus:border-transparent' 
                      : 'border-red-300 focus:ring-red-500 focus:border-transparent'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                }`}
                placeholder="Digite o número do cartão..."
                maxLength={25}
              />
              
              {validationResult && (
                <div className={`flex items-center gap-2 mt-2 text-sm ${
                  validationResult.isValid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {validationResult.isValid ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span>{validationResult.message}</span>
                </div>
              )}
            </div>

            {/* Validation Result */}
            {validationResult && validationResult.isValid && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">✅ Cartão Válido</h3>
                <div className="space-y-2 text-sm text-green-800">
                  <div><strong>Bandeira:</strong> {validationResult.brand}</div>
                  <div><strong>Número Formatado:</strong> {formatCardNumber(validationNumber)}</div>
                  <div><strong>Algoritmo:</strong> Luhn válido</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="mt-8 grid md:grid-cols-4 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-2">Algoritmo de Luhn</h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                Utiliza o algoritmo oficial de validação de cartões de crédito
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-purple-900 mb-2">Múltiplas Bandeiras</h3>
              <p className="text-xs text-purple-700 leading-relaxed">
                Suporte para Visa, Mastercard, Amex, Discover, JCB e Diners
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-900 mb-2">Nomes Aleatórios</h3>
              <p className="text-xs text-green-700 leading-relaxed">
                Gera nomes brasileiros realistas para testes completos
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-amber-900 mb-2">Apenas para Testes</h3>
              <p className="text-xs text-amber-700 leading-relaxed">
                Cartões válidos matematicamente, mas sem fundos reais
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardGenerator;