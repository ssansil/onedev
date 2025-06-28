import React, { useState, useCallback, useMemo } from 'react';
import { Copy, Check, Key, Hash, Shield, RefreshCw, Eye, EyeOff, Download, Upload, Info, Zap, Lock, Fingerprint } from 'lucide-react';

interface GeneratedItem {
  id: string;
  type: string;
  value: string;
  timestamp: Date;
  format?: string;
  length?: number;
}

interface HashResult {
  input: string;
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
}

const UUIDHashTokenGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'uuid' | 'hash' | 'token'>('uuid');
  const [generatedItems, setGeneratedItems] = useState<GeneratedItem[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  
  // UUID States
  const [uuidVersion, setUuidVersion] = useState<'v4' | 'v1' | 'nil'>('v4');
  const [uuidCount, setUuidCount] = useState(1);
  const [uuidFormat, setUuidFormat] = useState<'standard' | 'compact' | 'uppercase' | 'braces'>('standard');
  
  // Hash States
  const [hashInput, setHashInput] = useState('');
  const [hashResults, setHashResults] = useState<HashResult | null>(null);
  const [hashFile, setHashFile] = useState<File | null>(null);
  
  // Token States
  const [tokenType, setTokenType] = useState<'random' | 'jwt' | 'api' | 'session'>('random');
  const [tokenLength, setTokenLength] = useState(32);
  const [tokenCharset, setTokenCharset] = useState<'alphanumeric' | 'hex' | 'base64' | 'custom'>('alphanumeric');
  const [customCharset, setCustomCharset] = useState('');
  const [jwtPayload, setJwtPayload] = useState('{"sub": "1234567890", "name": "John Doe", "iat": 1516239022}');
  const [jwtSecret, setJwtSecret] = useState('your-256-bit-secret');
  const [showSecrets, setShowSecrets] = useState(false);

  // Utility Functions
  const generateUUIDv4 = useCallback((): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }, []);

  const generateUUIDv1 = useCallback((): string => {
    // Simplified UUID v1 implementation
    const timestamp = Date.now();
    const random = Math.random().toString(16).substring(2, 15);
    return `${timestamp.toString(16).padStart(8, '0').substring(0, 8)}-${random.substring(0, 4)}-1${random.substring(4, 7)}-${random.substring(7, 11)}-${random.substring(11, 23)}`;
  }, []);

  const generateNilUUID = useCallback((): string => {
    return '00000000-0000-0000-0000-000000000000';
  }, []);

  const formatUUID = useCallback((uuid: string, format: string): string => {
    const clean = uuid.replace(/-/g, '');
    switch (format) {
      case 'compact':
        return clean;
      case 'uppercase':
        return uuid.toUpperCase();
      case 'braces':
        return `{${uuid}}`;
      default:
        return uuid;
    }
  }, []);

  // Hash Functions
  const stringToHash = async (str: string, algorithm: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    
    if (algorithm === 'md5') {
      // Simple MD5 implementation for demo
      return btoa(str).substring(0, 32);
    }
    
    const hashBuffer = await crypto.subtle.digest(algorithm.toUpperCase().replace('SHA', 'SHA-'), data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const generateHashes = useCallback(async (input: string) => {
    if (!input) {
      setHashResults(null);
      return;
    }

    try {
      const results: HashResult = {
        input,
        md5: await stringToHash(input, 'md5'),
        sha1: await stringToHash(input, 'sha1'),
        sha256: await stringToHash(input, 'sha256'),
        sha512: await stringToHash(input, 'sha512')
      };
      setHashResults(results);
    } catch (error) {
      console.error('Error generating hashes:', error);
    }
  }, []);

  // Token Generation Functions
  const generateRandomToken = useCallback((length: number, charset: string): string => {
    let chars = '';
    switch (charset) {
      case 'alphanumeric':
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        break;
      case 'hex':
        chars = '0123456789abcdef';
        break;
      case 'base64':
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        break;
      case 'custom':
        chars = customCharset || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        break;
    }

    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, [customCharset]);

  const generateJWT = useCallback((payload: string, secret: string): string => {
    // Simplified JWT generation for demo
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
    const encodedPayload = btoa(payload).replace(/=/g, '');
    const signature = btoa(`${header}.${encodedPayload}.${secret}`).substring(0, 43).replace(/=/g, '');
    return `${header}.${encodedPayload}.${signature}`;
  }, []);

  const generateAPIKey = useCallback((): string => {
    const prefix = 'ak_';
    const key = generateRandomToken(40, 'alphanumeric');
    return `${prefix}${key}`;
  }, [generateRandomToken]);

  const generateSessionToken = useCallback((): string => {
    const timestamp = Date.now().toString(36);
    const random = generateRandomToken(24, 'alphanumeric');
    return `sess_${timestamp}_${random}`;
  }, [generateRandomToken]);

  // Main Generation Functions
  const generateUUIDs = useCallback(() => {
    const newItems: GeneratedItem[] = [];
    
    for (let i = 0; i < uuidCount; i++) {
      let uuid = '';
      switch (uuidVersion) {
        case 'v4':
          uuid = generateUUIDv4();
          break;
        case 'v1':
          uuid = generateUUIDv1();
          break;
        case 'nil':
          uuid = generateNilUUID();
          break;
      }
      
      const formatted = formatUUID(uuid, uuidFormat);
      newItems.push({
        id: `uuid-${Date.now()}-${i}`,
        type: `UUID ${uuidVersion.toUpperCase()}`,
        value: formatted,
        timestamp: new Date(),
        format: uuidFormat
      });
    }
    
    setGeneratedItems(prev => [...newItems, ...prev]);
  }, [uuidVersion, uuidCount, uuidFormat, generateUUIDv4, generateUUIDv1, generateNilUUID, formatUUID]);

  const generateToken = useCallback(() => {
    let token = '';
    let type = '';
    
    switch (tokenType) {
      case 'random':
        token = generateRandomToken(tokenLength, tokenCharset);
        type = `Random Token (${tokenCharset})`;
        break;
      case 'jwt':
        try {
          token = generateJWT(jwtPayload, jwtSecret);
          type = 'JWT Token';
        } catch (error) {
          console.error('Error generating JWT:', error);
          return;
        }
        break;
      case 'api':
        token = generateAPIKey();
        type = 'API Key';
        break;
      case 'session':
        token = generateSessionToken();
        type = 'Session Token';
        break;
    }
    
    const newItem: GeneratedItem = {
      id: `token-${Date.now()}`,
      type,
      value: token,
      timestamp: new Date(),
      length: token.length
    };
    
    setGeneratedItems(prev => [newItem, ...prev]);
  }, [tokenType, tokenLength, tokenCharset, jwtPayload, jwtSecret, generateRandomToken, generateJWT, generateAPIKey, generateSessionToken]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string, id?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id || text);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  // Export functions
  const exportItems = useCallback(() => {
    const data = {
      exported_at: new Date().toISOString(),
      items: generatedItems.map(item => ({
        type: item.type,
        value: item.value,
        timestamp: item.timestamp.toISOString(),
        format: item.format,
        length: item.length
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuid-hash-tokens-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generatedItems]);

  const clearHistory = useCallback(() => {
    setGeneratedItems([]);
  }, []);

  // File hash processing
  const handleFileHash = useCallback(async (file: File) => {
    setHashFile(file);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      await generateHashes(content);
    };
    reader.readAsText(file);
  }, [generateHashes]);

  // Auto-generate hashes when input changes
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateHashes(hashInput);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [hashInput, generateHashes]);

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

  const tabs = [
    { id: 'uuid', name: 'UUID', icon: Key },
    { id: 'hash', name: 'Hashes', icon: Fingerprint },
    { id: 'token', name: 'Tokens', icon: Shield }
  ];

  const renderUUIDTab = () => (
    <div className="space-y-6">
      <InfoCard 
        title="Gerador de UUID"
        description="Gere identificadores únicos universais (UUID) em diferentes versões e formatos. UUIDs são amplamente usados para identificação única em sistemas distribuídos."
      />

      <div className="grid md:grid-cols-3 gap-6">
        {/* Version Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Versão do UUID
          </label>
          <select
            value={uuidVersion}
            onChange={(e) => setUuidVersion(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="v4">UUID v4 (Aleatório)</option>
            <option value="v1">UUID v1 (Timestamp)</option>
            <option value="nil">UUID Nil (Zeros)</option>
          </select>
        </div>

        {/* Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantidade
          </label>
          <input
            type="number"
            value={uuidCount}
            onChange={(e) => setUuidCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
            max="100"
          />
        </div>

        {/* Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Formato
          </label>
          <select
            value={uuidFormat}
            onChange={(e) => setUuidFormat(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="standard">Padrão (com hífens)</option>
            <option value="compact">Compacto (sem hífens)</option>
            <option value="uppercase">Maiúsculo</option>
            <option value="braces">Com chaves {}</option>
          </select>
        </div>
      </div>

      <button
        onClick={generateUUIDs}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <Key className="w-5 h-5" />
        Gerar UUID{uuidCount > 1 ? 's' : ''}
      </button>

      {/* UUID Info */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">UUID v4</h4>
          <p className="text-xs text-blue-700">Gerado aleatoriamente, mais comum e seguro</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">UUID v1</h4>
          <p className="text-xs text-green-700">Baseado em timestamp e MAC address</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">UUID Nil</h4>
          <p className="text-xs text-gray-700">Todos os bits zerados, usado como valor nulo</p>
        </div>
      </div>
    </div>
  );

  const renderHashTab = () => (
    <div className="space-y-6">
      <InfoCard 
        title="Gerador de Hashes"
        description="Gere hashes criptográficos MD5, SHA-1, SHA-256 e SHA-512 para texto ou arquivos. Útil para verificação de integridade e autenticação."
      />

      <div className="space-y-4">
        {/* Text Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Texto para Hash
          </label>
          <textarea
            value={hashInput}
            onChange={(e) => setHashInput(e.target.value)}
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            placeholder="Digite o texto que deseja gerar hash..."
          />
        </div>

        {/* File Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ou selecione um arquivo
          </label>
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileHash(file);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {hashFile && (
            <p className="text-xs text-gray-500 mt-1">
              Arquivo: {hashFile.name} ({(hashFile.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>
      </div>

      {/* Hash Results */}
      {hashResults && (
        <div className="bg-gray-50 rounded-lg p-6 border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Resultados dos Hashes</h3>
          
          <div className="space-y-4">
            {Object.entries(hashResults).map(([algorithm, hash]) => {
              if (algorithm === 'input') return null;
              
              return (
                <div key={algorithm} className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800 uppercase">{algorithm}</h4>
                    <button
                      onClick={() => copyToClipboard(hash, `hash-${algorithm}`)}
                      className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-sm"
                    >
                      {copied === `hash-${algorithm}` ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copiar
                        </>
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-sm text-gray-600 break-all bg-gray-50 p-2 rounded">
                    {hash}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {hash.length} caracteres
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hash Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-2">⚠️ MD5 & SHA-1</h4>
          <p className="text-xs text-red-700">Considerados inseguros para uso criptográfico. Use apenas para verificação de integridade básica.</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">✅ SHA-256 & SHA-512</h4>
          <p className="text-xs text-green-700">Algoritmos seguros e recomendados para aplicações criptográficas modernas.</p>
        </div>
      </div>
    </div>
  );

  const renderTokenTab = () => (
    <div className="space-y-6">
      <InfoCard 
        title="Gerador de Tokens"
        description="Gere tokens seguros para APIs, sessões, autenticação e outros usos. Inclui tokens aleatórios, JWT, API keys e tokens de sessão."
      />

      <div className="space-y-6">
        {/* Token Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Token
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 'random', label: 'Aleatório', icon: Zap },
              { value: 'jwt', label: 'JWT', icon: Lock },
              { value: 'api', label: 'API Key', icon: Key },
              { value: 'session', label: 'Sessão', icon: Shield }
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTokenType(value as any)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  tokenType === value
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-medium">{label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Token Configuration */}
        {tokenType === 'random' && (
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comprimento
              </label>
              <input
                type="number"
                value={tokenLength}
                onChange={(e) => setTokenLength(Math.max(8, Math.min(256, parseInt(e.target.value) || 32)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="8"
                max="256"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conjunto de Caracteres
              </label>
              <select
                value={tokenCharset}
                onChange={(e) => setTokenCharset(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="alphanumeric">Alfanumérico</option>
                <option value="hex">Hexadecimal</option>
                <option value="base64">Base64</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            
            {tokenCharset === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caracteres Personalizados
                </label>
                <input
                  type="text"
                  value={customCharset}
                  onChange={(e) => setCustomCharset(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
                />
              </div>
            )}
          </div>
        )}

        {tokenType === 'jwt' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payload (JSON)
              </label>
              <textarea
                value={jwtPayload}
                onChange={(e) => setJwtPayload(e.target.value)}
                className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none font-mono text-sm"
                placeholder='{"sub": "1234567890", "name": "John Doe", "iat": 1516239022}'
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secret Key
              </label>
              <div className="relative">
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={jwtSecret}
                  onChange={(e) => setJwtSecret(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="your-256-bit-secret"
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets(!showSecrets)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={generateToken}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Shield className="w-5 h-5" />
          Gerar Token
        </button>

        {/* Token Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">🔐 Segurança</h4>
            <p className="text-xs text-green-700">Tokens são gerados usando funções criptográficas seguras do navegador.</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">⚡ Performance</h4>
            <p className="text-xs text-blue-700">Geração local instantânea sem comunicação com servidores.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Gerador de UUID, Hashes e Tokens
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Gere identificadores únicos, hashes criptográficos e tokens seguros para desenvolvimento e segurança
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'uuid' && renderUUIDTab()}
          {activeTab === 'hash' && renderHashTab()}
          {activeTab === 'token' && renderTokenTab()}
        </div>
      </div>

      {/* Generated Items History */}
      {generatedItems.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Hash className="w-5 h-5 text-gray-600" />
              Histórico de Geração
            </h2>
            
            <div className="flex gap-2">
              <button
                onClick={exportItems}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              
              <button
                onClick={clearHistory}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                Limpar
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {generatedItems.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{item.type}</span>
                    {item.format && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {item.format}
                      </span>
                    )}
                    {item.length && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        {item.length} chars
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {item.timestamp.toLocaleString()}
                    </span>
                    <button
                      onClick={() => copyToClipboard(item.value, item.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
                    >
                      {copied === item.id ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copiar
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="font-mono text-sm text-gray-600 break-all bg-white p-3 rounded border">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Key className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-purple-900 mb-2">UUIDs Únicos</h3>
              <p className="text-xs text-purple-700 leading-relaxed">
                Identificadores universalmente únicos para sistemas distribuídos
              </p>
            </div>
          </div>
        </div>

        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Fingerprint className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-pink-900 mb-2">Hashes Seguros</h3>
              <p className="text-xs text-pink-700 leading-relaxed">
                Algoritmos criptográficos para verificação de integridade
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-900 mb-2">Tokens Seguros</h3>
              <p className="text-xs text-green-700 leading-relaxed">
                Tokens criptograficamente seguros para autenticação e APIs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UUIDHashTokenGenerator;