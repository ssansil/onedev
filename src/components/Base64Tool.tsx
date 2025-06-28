import React, { useState, useCallback } from 'react';
import { Copy, Check, Code2, FileText, AlertCircle, Info, ArrowUpDown } from 'lucide-react';

const Base64Tool: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const processText = useCallback((text: string, operation: 'encode' | 'decode') => {
    if (!text.trim()) {
      setOutputText('');
      setError(null);
      return;
    }

    try {
      if (operation === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(text)));
        setOutputText(encoded);
        setError(null);
      } else {
        const decoded = decodeURIComponent(escape(atob(text)));
        setOutputText(decoded);
        setError(null);
      }
    } catch (err) {
      setError(operation === 'encode' ? 'Erro ao codificar texto' : 'Texto Base64 inválido');
      setOutputText('');
    }
  }, []);

  const handleInputChange = (value: string) => {
    setInputText(value);
    processText(value, mode);
  };

  const handleModeChange = (newMode: 'encode' | 'decode') => {
    setMode(newMode);
    processText(inputText, newMode);
  };

  const swapInputOutput = () => {
    if (outputText && !error) {
      setInputText(outputText);
      const newMode = mode === 'encode' ? 'decode' : 'encode';
      setMode(newMode);
      processText(outputText, newMode);
    }
  };

  const copyToClipboard = async () => {
    if (!outputText) return;
    
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setError(null);
  };

  const loadSample = () => {
    const sampleText = mode === 'encode' 
      ? 'Olá! Este é um exemplo de texto para codificação Base64. 🚀'
      : 'T2zDoSEgRXN0ZSDDqSB1bSBleGVtcGxvIGRlIHRleHRvIHBhcmEgY29kaWZpY2HDp8OjbyBCYXNlNjQuIPCfmoA=';
    
    setInputText(sampleText);
    processText(sampleText, mode);
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
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Codificador Base64
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Codifique e decodifique texto em Base64 com suporte completo a UTF-8 e caracteres especiais
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Operação:
            </label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleModeChange('encode')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === 'encode'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Codificar
              </button>
              <button
                onClick={() => handleModeChange('decode')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === 'decode'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Decodificar
              </button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={swapInputOutput}
              disabled={!outputText || !!error}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <ArrowUpDown className="w-4 h-4" />
              Inverter
            </button>
            
            <button
              onClick={loadSample}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FileText className="w-4 h-4" />
              Exemplo
            </button>
            
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              {mode === 'encode' ? 'Texto Original' : 'Texto Base64'}
            </h2>
          </div>

          <InfoCard 
            title={mode === 'encode' ? 'Texto para Codificar' : 'Texto Base64 para Decodificar'}
            description={mode === 'encode' 
              ? 'Digite ou cole o texto que deseja converter para Base64. Suporta caracteres especiais, emojis e acentos.'
              : 'Cole o texto codificado em Base64 que deseja decodificar de volta ao texto original.'
            }
          />

          <textarea
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full h-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none font-mono text-sm"
            placeholder={mode === 'encode' 
              ? 'Digite seu texto aqui...\n\nExemplo:\nOlá mundo! 🌍\nTexto com acentos: ção, ã, é'
              : 'Cole o texto Base64 aqui...\n\nExemplo:\nT2zDoSBtdW5kbyEg8J+MjQ=='
            }
          />
          
          <div className="mt-2 text-xs text-gray-500">
            {inputText.length} caracteres
          </div>
        </div>

        {/* Output Panel */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-800">
                {mode === 'encode' ? 'Resultado Base64' : 'Texto Decodificado'}
              </h2>
            </div>
            
            <button
              onClick={copyToClipboard}
              disabled={!outputText || !!error}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          <div className="bg-gray-900 rounded-lg p-4 h-[400px] overflow-auto">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
              {outputText || (error ? '// Corrija o erro acima' : `// ${mode === 'encode' ? 'Texto codificado' : 'Texto decodificado'} aparecerá aqui`)}
            </pre>
          </div>
          
          {outputText && !error && (
            <div className="mt-2 text-xs text-gray-500">
              {outputText.length} caracteres
            </div>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Code2 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-indigo-900 mb-2">Base64 Padrão</h3>
              <p className="text-xs text-indigo-700 leading-relaxed">
                Utiliza o alfabeto Base64 padrão (A-Z, a-z, 0-9, +, /) com padding "="
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-purple-900 mb-2">Suporte UTF-8</h3>
              <p className="text-xs text-purple-700 leading-relaxed">
                Codifica corretamente caracteres especiais, acentos e emojis
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ArrowUpDown className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-900 mb-2">Bidirecional</h3>
              <p className="text-xs text-green-700 leading-relaxed">
                Codifica e decodifica com validação automática de formato
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Base64Tool;