import React, { useState, useCallback, useRef } from 'react';
import { Copy, Check, Code, AlertCircle, CheckCircle, FileText, Zap, Upload, X } from 'lucide-react';

interface ValidationResult {
  isValid: boolean;
  error?: string;
  lineNumber?: number;
  columnNumber?: number;
}

interface UploadedFile {
  id: string;
  name: string;
  content: string;
  size: number;
}

const JSONFormatter: React.FC = () => {
  const [inputJson, setInputJson] = useState('');
  const [outputJson, setOutputJson] = useState('');
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true });
  const [copied, setCopied] = useState(false);
  const [indentSize, setIndentSize] = useState(2);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndFormat = useCallback((jsonString: string) => {
    if (!jsonString.trim()) {
      setOutputJson('');
      setValidation({ isValid: true });
      return;
    }

    try {
      const parsed = JSON.parse(jsonString);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setOutputJson(formatted);
      setValidation({ isValid: true });
    } catch (error) {
      setOutputJson('');
      
      if (error instanceof SyntaxError) {
        // Try to extract line and column information from the error message
        const match = error.message.match(/at position (\d+)/);
        let lineNumber, columnNumber;
        
        if (match) {
          const position = parseInt(match[1]);
          const lines = jsonString.substring(0, position).split('\n');
          lineNumber = lines.length;
          columnNumber = lines[lines.length - 1].length + 1;
        }
        
        setValidation({
          isValid: false,
          error: error.message,
          lineNumber,
          columnNumber
        });
      } else {
        setValidation({
          isValid: false,
          error: 'Erro desconhecido ao processar JSON'
        });
      }
    }
  }, [indentSize]);

  const handleInputChange = (value: string) => {
    setInputJson(value);
    validateAndFormat(value);
  };

  const copyToClipboard = async () => {
    if (!outputJson) return;
    
    try {
      await navigator.clipboard.writeText(outputJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const minifyJson = () => {
    if (!inputJson.trim()) return;
    
    try {
      const parsed = JSON.parse(inputJson);
      const minified = JSON.stringify(parsed);
      setOutputJson(minified);
      setValidation({ isValid: true });
    } catch (error) {
      // Error handling is already done in validateAndFormat
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar se é um arquivo JSON
      if (!file.name.toLowerCase().endsWith('.json')) {
        alert('Por favor, selecione apenas arquivos .json');
        return;
      }

      // Verificar tamanho do arquivo (limite de 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Arquivo muito grande. Limite máximo: 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        
        const uploadedFile: UploadedFile = {
          id: Date.now().toString(),
          name: file.name,
          content,
          size: file.size
        };
        
        setUploadedFiles(prev => [...prev, uploadedFile]);
        
        // Carregar o conteúdo no editor
        setInputJson(content);
        validateAndFormat(content);
      };
      
      reader.onerror = () => {
        alert('Erro ao ler o arquivo. Tente novamente.');
      };
      
      reader.readAsText(file);
    }
    
    // Limpar o input para permitir upload do mesmo arquivo novamente
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeUploadedFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const loadUploadedFile = (file: UploadedFile) => {
    setInputJson(file.content);
    validateAndFormat(file.content);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const loadSampleJson = () => {
    const sampleJson = {
      "name": "João Silva",
      "age": 30,
      "email": "joao@exemplo.com",
      "address": {
        "street": "Rua das Flores, 123",
        "city": "São Paulo",
        "state": "SP",
        "zipCode": "01234-567"
      },
      "hobbies": ["leitura", "programação", "música"],
      "isActive": true,
      "lastLogin": "2024-01-15T10:30:00Z",
      "preferences": {
        "theme": "dark",
        "language": "pt-BR",
        "notifications": {
          "email": true,
          "push": false,
          "sms": true
        }
      }
    };
    
    const jsonString = JSON.stringify(sampleJson, null, 2);
    setInputJson(jsonString);
    validateAndFormat(jsonString);
  };

  const clearAll = () => {
    setInputJson('');
    setOutputJson('');
    setValidation({ isValid: true });
    setUploadedFiles([]);
  };

  const getValidationIcon = () => {
    if (!inputJson.trim()) return null;
    
    return validation.isValid ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <AlertCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getValidationMessage = () => {
    if (!inputJson.trim()) return null;
    
    if (validation.isValid) {
      return (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle className="w-4 h-4" />
          JSON válido
        </div>
      );
    }
    
    return (
      <div className="text-red-600 text-sm">
        <div className="flex items-center gap-2 mb-1">
          <AlertCircle className="w-4 h-4" />
          JSON inválido
        </div>
        <div className="text-xs text-red-500">
          {validation.error}
          {validation.lineNumber && validation.columnNumber && (
            <span className="block mt-1">
              Linha {validation.lineNumber}, Coluna {validation.columnNumber}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl">
            <Code className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Formatador e Validador JSON
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Valide, formate e minifique seus dados JSON com detecção de erros em tempo real e importação de arquivos
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Indentação:
            </label>
            <select
              value={indentSize}
              onChange={(e) => {
                const newSize = parseInt(e.target.value);
                setIndentSize(newSize);
                if (inputJson.trim()) {
                  validateAndFormat(inputJson);
                }
              }}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            >
              <option value={2}>2 espaços</option>
              <option value={4}>4 espaços</option>
              <option value={8}>8 espaços</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Upload className="w-4 h-4" />
              Importar JSON
            </button>
            
            <button
              onClick={minifyJson}
              disabled={!validation.isValid || !inputJson.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Zap className="w-4 h-4" />
              Minificar
            </button>
            
            <button
              onClick={loadSampleJson}
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

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Arquivos Importados:</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-indigo-900 truncate">
                      {file.name}
                    </div>
                    <div className="text-xs text-indigo-700">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => loadUploadedFile(file)}
                      className="p-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                      title="Carregar arquivo"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeUploadedFile(file.id)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      title="Remover arquivo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-800">JSON de Entrada</h2>
            </div>
            {getValidationIcon()}
          </div>

          <div className="mb-4">
            {getValidationMessage()}
          </div>

          <textarea
            value={inputJson}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full h-[600px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none font-mono text-sm"
            placeholder='Cole seu JSON aqui ou importe um arquivo... Exemplo:
{
  "nome": "João",
  "idade": 30,
  "ativo": true
}'
          />
          
          <div className="mt-2 text-xs text-gray-500">
            {inputJson.length} caracteres
          </div>
        </div>

        {/* Output Panel */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <h2 className="text-xl font-semibold text-gray-800">JSON Formatado</h2>
            </div>
            
            <button
              onClick={copyToClipboard}
              disabled={!outputJson}
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

          <div className="bg-gray-900 rounded-lg p-4 h-[600px] overflow-auto">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
              {outputJson || (validation.isValid ? '// JSON formatado aparecerá aqui' : '// Corrija os erros no JSON de entrada')}
            </pre>
          </div>
          
          {outputJson && (
            <div className="mt-2 text-xs text-gray-500">
              {outputJson.length} caracteres • {outputJson.split('\n').length} linhas
            </div>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="mt-8 grid md:grid-cols-4 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-2">Validação em Tempo Real</h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                Detecta erros de sintaxe automaticamente e mostra a localização exata do problema
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Code className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-900 mb-2">Formatação Inteligente</h3>
              <p className="text-xs text-green-700 leading-relaxed">
                Formata automaticamente com indentação configurável para melhor legibilidade
              </p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Upload className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-indigo-900 mb-2">Importação de Arquivos</h3>
              <p className="text-xs text-indigo-700 leading-relaxed">
                Importe arquivos .json diretamente do seu computador (até 10MB)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-purple-900 mb-2">Minificação</h3>
              <p className="text-xs text-purple-700 leading-relaxed">
                Remove espaços desnecessários para reduzir o tamanho do arquivo JSON
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JSONFormatter;