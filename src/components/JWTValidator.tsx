import React, { useState, useCallback, useMemo } from 'react';
import { Copy, Check, Shield, AlertCircle, Eye, EyeOff, Key, Clock, User, Lock, Info, Upload, Download, RefreshCw, Zap } from 'lucide-react';

interface JWTHeader {
  alg?: string;
  typ?: string;
  kid?: string;
  [key: string]: any;
}

interface JWTPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: any;
}

interface DecodedJWT {
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;
  isValid: boolean;
  isExpired: boolean;
  timeToExpiry?: number;
  errors: string[];
}

interface JWTValidationResult {
  isValidFormat: boolean;
  isValidSignature: boolean;
  isExpired: boolean;
  errors: string[];
  warnings: string[];
}

const JWTValidator: React.FC = () => {
  const [jwtToken, setJwtToken] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [decodedJWT, setDecodedJWT] = useState<DecodedJWT | null>(null);
  const [validationResult, setValidationResult] = useState<JWTValidationResult | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'decode' | 'validate' | 'generate'>('decode');
  
  // Generator states
  const [generatorHeader, setGeneratorHeader] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}');
  const [generatorPayload, setGeneratorPayload] = useState('{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022,\n  "exp": 1735689600\n}');
  const [generatorSecret, setGeneratorSecret] = useState('your-256-bit-secret');
  const [generatedJWT, setGeneratedJWT] = useState('');

  // Base64 URL decode
  const base64UrlDecode = useCallback((str: string): string => {
    // Add padding if needed
    let padded = str;
    while (padded.length % 4) {
      padded += '=';
    }
    
    // Replace URL-safe characters
    const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
    
    try {
      return atob(base64);
    } catch (error) {
      throw new Error('Invalid base64 encoding');
    }
  }, []);

  // Base64 URL encode
  const base64UrlEncode = useCallback((str: string): string => {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }, []);

  // Simple HMAC SHA-256 implementation for validation
  const hmacSha256 = useCallback(async (message: string, secret: string): Promise<string> => {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(message);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }, []);

  // Decode JWT
  const decodeJWT = useCallback(async (token: string): Promise<DecodedJWT> => {
    const errors: string[] = [];
    
    try {
      const parts = token.split('.');
      
      if (parts.length !== 3) {
        throw new Error('JWT deve ter exatamente 3 partes separadas por pontos');
      }

      // Decode header
      let header: JWTHeader = {};
      try {
        const headerJson = base64UrlDecode(parts[0]);
        header = JSON.parse(headerJson);
      } catch (error) {
        errors.push('Header inválido: não é um JSON válido');
      }

      // Decode payload
      let payload: JWTPayload = {};
      try {
        const payloadJson = base64UrlDecode(parts[1]);
        payload = JSON.parse(payloadJson);
      } catch (error) {
        errors.push('Payload inválido: não é um JSON válido');
      }

      const signature = parts[2];

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp ? payload.exp < now : false;
      const timeToExpiry = payload.exp ? payload.exp - now : undefined;

      return {
        header,
        payload,
        signature,
        isValid: errors.length === 0,
        isExpired,
        timeToExpiry,
        errors
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Erro desconhecido ao decodificar JWT');
      
      return {
        header: {},
        payload: {},
        signature: '',
        isValid: false,
        isExpired: false,
        errors
      };
    }
  }, [base64UrlDecode]);

  // Validate JWT signature
  const validateJWTSignature = useCallback(async (token: string, secret: string): Promise<JWTValidationResult> => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      const parts = token.split('.');
      
      if (parts.length !== 3) {
        errors.push('Formato inválido: JWT deve ter 3 partes');
        return {
          isValidFormat: false,
          isValidSignature: false,
          isExpired: false,
          errors,
          warnings
        };
      }

      // Decode and validate header
      const decoded = await decodeJWT(token);
      
      if (!decoded.isValid) {
        errors.push(...decoded.errors);
      }

      // Check algorithm
      if (decoded.header.alg !== 'HS256') {
        warnings.push(`Algoritmo ${decoded.header.alg} não suportado para validação. Apenas HS256 é suportado.`);
      }

      // Validate signature if secret is provided and algorithm is supported
      let isValidSignature = false;
      if (secret && decoded.header.alg === 'HS256') {
        try {
          const message = `${parts[0]}.${parts[1]}`;
          const expectedHash = await hmacSha256(message, secret);
          const expectedSignature = base64UrlEncode(
            String.fromCharCode(...Array.from(new Uint8Array(
              expectedHash.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
            )))
          );
          
          isValidSignature = expectedSignature === parts[2];
          
          if (!isValidSignature) {
            errors.push('Assinatura inválida: não corresponde ao secret fornecido');
          }
        } catch (error) {
          errors.push('Erro ao validar assinatura');
        }
      } else if (!secret) {
        warnings.push('Secret não fornecido - assinatura não validada');
      }

      // Check expiration
      if (decoded.payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        if (decoded.payload.exp < now) {
          errors.push('Token expirado');
        } else if (decoded.payload.exp - now < 300) { // 5 minutes
          warnings.push('Token expira em menos de 5 minutos');
        }
      } else {
        warnings.push('Token não possui data de expiração (exp)');
      }

      // Check not before
      if (decoded.payload.nbf) {
        const now = Math.floor(Date.now() / 1000);
        if (decoded.payload.nbf > now) {
          errors.push('Token ainda não é válido (nbf)');
        }
      }

      // Check issued at
      if (decoded.payload.iat) {
        const now = Math.floor(Date.now() / 1000);
        if (decoded.payload.iat > now) {
          warnings.push('Token foi emitido no futuro (iat)');
        }
      }

      return {
        isValidFormat: decoded.isValid,
        isValidSignature: secret ? isValidSignature : true,
        isExpired: decoded.isExpired,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Erro desconhecido na validação');
      
      return {
        isValidFormat: false,
        isValidSignature: false,
        isExpired: false,
        errors,
        warnings
      };
    }
  }, [decodeJWT, hmacSha256, base64UrlEncode]);

  // Generate JWT
  const generateJWT = useCallback(async () => {
    try {
      // Validate JSON inputs
      let header: JWTHeader;
      let payload: JWTPayload;
      
      try {
        header = JSON.parse(generatorHeader);
      } catch (error) {
        throw new Error('Header JSON inválido');
      }
      
      try {
        payload = JSON.parse(generatorPayload);
      } catch (error) {
        throw new Error('Payload JSON inválido');
      }

      // Ensure algorithm is set
      if (!header.alg) {
        header.alg = 'HS256';
      }
      
      if (!header.typ) {
        header.typ = 'JWT';
      }

      // Encode header and payload
      const encodedHeader = base64UrlEncode(JSON.stringify(header));
      const encodedPayload = base64UrlEncode(JSON.stringify(payload));
      
      // Create signature
      const message = `${encodedHeader}.${encodedPayload}`;
      const hash = await hmacSha256(message, generatorSecret);
      const signature = base64UrlEncode(
        String.fromCharCode(...Array.from(new Uint8Array(
          hash.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
        )))
      );
      
      const jwt = `${encodedHeader}.${encodedPayload}.${signature}`;
      setGeneratedJWT(jwt);
      
      // Auto-decode the generated JWT
      setJwtToken(jwt);
      setSecretKey(generatorSecret);
      
    } catch (error) {
      console.error('Error generating JWT:', error);
      alert(error instanceof Error ? error.message : 'Erro ao gerar JWT');
    }
  }, [generatorHeader, generatorPayload, generatorSecret, base64UrlEncode, hmacSha256]);

  // Process JWT when token changes
  React.useEffect(() => {
    if (jwtToken.trim()) {
      const processJWT = async () => {
        const decoded = await decodeJWT(jwtToken);
        setDecodedJWT(decoded);
        
        if (secretKey) {
          const validation = await validateJWTSignature(jwtToken, secretKey);
          setValidationResult(validation);
        } else {
          setValidationResult(null);
        }
      };
      
      processJWT();
    } else {
      setDecodedJWT(null);
      setValidationResult(null);
    }
  }, [jwtToken, secretKey, decodeJWT, validateJWTSignature]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  // Format timestamp
  const formatTimestamp = useCallback((timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString('pt-BR');
  }, []);

  // Format time duration
  const formatDuration = useCallback((seconds: number): string => {
    if (seconds < 0) return 'Expirado';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  }, []);

  // Load sample JWT
  const loadSampleJWT = useCallback(() => {
    const sampleJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzU2ODk2MDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const sampleSecret = 'your-256-bit-secret';
    
    setJwtToken(sampleJWT);
    setSecretKey(sampleSecret);
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    setJwtToken('');
    setSecretKey('');
    setDecodedJWT(null);
    setValidationResult(null);
    setGeneratedJWT('');
  }, []);

  // Export decoded data
  const exportData = useCallback(() => {
    if (!decodedJWT) return;
    
    const data = {
      jwt: jwtToken,
      decoded: {
        header: decodedJWT.header,
        payload: decodedJWT.payload,
        signature: decodedJWT.signature
      },
      validation: validationResult,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jwt-decoded-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [jwtToken, decodedJWT, validationResult]);

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
    { id: 'decode', name: 'Decodificar', icon: Eye },
    { id: 'validate', name: 'Validar', icon: Shield },
    { id: 'generate', name: 'Gerar', icon: Zap }
  ];

  const renderDecodeTab = () => (
    <div className="space-y-6">
      <InfoCard 
        title="Decodificador de JWT"
        description="Cole um token JWT para decodificar e visualizar seu header, payload e assinatura. A decodificação é feita localmente no seu navegador."
      />

      {/* JWT Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Token JWT
        </label>
        <textarea
          value={jwtToken}
          onChange={(e) => setJwtToken(e.target.value)}
          className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none font-mono text-sm"
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        />
        <div className="mt-2 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {jwtToken.length} caracteres
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadSampleJWT}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Carregar Exemplo
            </button>
            <button
              onClick={() => setJwtToken('')}
              className="text-xs text-gray-600 hover:text-gray-800 underline"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Decoded Results */}
      {decodedJWT && (
        <div className="space-y-6">
          {/* Errors */}
          {decodedJWT.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Erros de Decodificação
              </h3>
              <ul className="space-y-1">
                {decodedJWT.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                    <span className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Header */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
                <Key className="w-5 h-5" />
                Header
              </h3>
              <button
                onClick={() => copyToClipboard(JSON.stringify(decodedJWT.header, null, 2), 'header')}
                className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-sm"
              >
                {copied === 'header' ? (
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
            <pre className="bg-white p-4 rounded border font-mono text-sm overflow-x-auto">
              {JSON.stringify(decodedJWT.header, null, 2)}
            </pre>
            
            {/* Header Info */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              {decodedJWT.header.alg && (
                <div className="bg-white p-2 rounded border">
                  <div className="text-xs text-gray-500">Algoritmo</div>
                  <div className="font-medium text-purple-800">{decodedJWT.header.alg}</div>
                </div>
              )}
              {decodedJWT.header.typ && (
                <div className="bg-white p-2 rounded border">
                  <div className="text-xs text-gray-500">Tipo</div>
                  <div className="font-medium text-purple-800">{decodedJWT.header.typ}</div>
                </div>
              )}
            </div>
          </div>

          {/* Payload */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-green-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Payload
              </h3>
              <button
                onClick={() => copyToClipboard(JSON.stringify(decodedJWT.payload, null, 2), 'payload')}
                className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm"
              >
                {copied === 'payload' ? (
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
            <pre className="bg-white p-4 rounded border font-mono text-sm overflow-x-auto">
              {JSON.stringify(decodedJWT.payload, null, 2)}
            </pre>
            
            {/* Payload Info */}
            <div className="mt-3 space-y-2">
              {decodedJWT.payload.iss && (
                <div className="bg-white p-2 rounded border">
                  <div className="text-xs text-gray-500">Emissor (iss)</div>
                  <div className="font-medium text-green-800">{decodedJWT.payload.iss}</div>
                </div>
              )}
              {decodedJWT.payload.sub && (
                <div className="bg-white p-2 rounded border">
                  <div className="text-xs text-gray-500">Assunto (sub)</div>
                  <div className="font-medium text-green-800">{decodedJWT.payload.sub}</div>
                </div>
              )}
              {decodedJWT.payload.aud && (
                <div className="bg-white p-2 rounded border">
                  <div className="text-xs text-gray-500">Audiência (aud)</div>
                  <div className="font-medium text-green-800">
                    {Array.isArray(decodedJWT.payload.aud) 
                      ? decodedJWT.payload.aud.join(', ') 
                      : decodedJWT.payload.aud
                    }
                  </div>
                </div>
              )}
              
              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {decodedJWT.payload.iat && (
                  <div className="bg-white p-2 rounded border">
                    <div className="text-xs text-gray-500">Emitido em (iat)</div>
                    <div className="font-medium text-green-800 text-xs">
                      {formatTimestamp(decodedJWT.payload.iat)}
                    </div>
                  </div>
                )}
                {decodedJWT.payload.exp && (
                  <div className={`p-2 rounded border ${
                    decodedJWT.isExpired ? 'bg-red-100 border-red-200' : 'bg-white'
                  }`}>
                    <div className="text-xs text-gray-500">Expira em (exp)</div>
                    <div className={`font-medium text-xs ${
                      decodedJWT.isExpired ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {formatTimestamp(decodedJWT.payload.exp)}
                    </div>
                    {decodedJWT.timeToExpiry !== undefined && (
                      <div className={`text-xs ${
                        decodedJWT.isExpired ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {decodedJWT.isExpired ? 'Expirado' : `Expira em ${formatDuration(decodedJWT.timeToExpiry)}`}
                      </div>
                    )}
                  </div>
                )}
                {decodedJWT.payload.nbf && (
                  <div className="bg-white p-2 rounded border">
                    <div className="text-xs text-gray-500">Válido a partir de (nbf)</div>
                    <div className="font-medium text-green-800 text-xs">
                      {formatTimestamp(decodedJWT.payload.nbf)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-orange-900 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Assinatura
              </h3>
              <button
                onClick={() => copyToClipboard(decodedJWT.signature, 'signature')}
                className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors text-sm"
              >
                {copied === 'signature' ? (
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
            <div className="bg-white p-4 rounded border font-mono text-sm break-all">
              {decodedJWT.signature}
            </div>
            <div className="mt-2 text-xs text-orange-700">
              {decodedJWT.signature.length} caracteres • Base64 URL encoded
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderValidateTab = () => (
    <div className="space-y-6">
      <InfoCard 
        title="Validador de JWT"
        description="Valide a assinatura e integridade de um token JWT usando uma chave secreta. Suporta algoritmo HS256."
      />

      {/* JWT Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Token JWT
        </label>
        <textarea
          value={jwtToken}
          onChange={(e) => setJwtToken(e.target.value)}
          className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none font-mono text-sm"
          placeholder="Cole o token JWT aqui..."
        />
      </div>

      {/* Secret Key */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chave Secreta
        </label>
        <div className="relative">
          <input
            type={showSecret ? 'text' : 'password'}
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Digite a chave secreta para validação..."
          />
          <button
            type="button"
            onClick={() => setShowSecret(!showSecret)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Validation Results */}
      {validationResult && (
        <div className="space-y-4">
          {/* Overall Status */}
          <div className={`p-4 rounded-lg border ${
            validationResult.errors.length === 0 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {validationResult.errors.length === 0 ? (
                <>
                  <Shield className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">✅ Token Válido</h3>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-900">❌ Token Inválido</h3>
                </>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className={`p-2 rounded ${
                validationResult.isValidFormat ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <div className="text-xs text-gray-600">Formato</div>
                <div className={`font-medium ${
                  validationResult.isValidFormat ? 'text-green-800' : 'text-red-800'
                }`}>
                  {validationResult.isValidFormat ? 'Válido' : 'Inválido'}
                </div>
              </div>
              
              <div className={`p-2 rounded ${
                validationResult.isValidSignature ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <div className="text-xs text-gray-600">Assinatura</div>
                <div className={`font-medium ${
                  validationResult.isValidSignature ? 'text-green-800' : 'text-red-800'
                }`}>
                  {validationResult.isValidSignature ? 'Válida' : 'Inválida'}
                </div>
              </div>
              
              <div className={`p-2 rounded ${
                !validationResult.isExpired ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <div className="text-xs text-gray-600">Expiração</div>
                <div className={`font-medium ${
                  !validationResult.isExpired ? 'text-green-800' : 'text-red-800'
                }`}>
                  {!validationResult.isExpired ? 'Válido' : 'Expirado'}
                </div>
              </div>
            </div>
          </div>

          {/* Errors */}
          {validationResult.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-red-900 mb-2">Erros:</h4>
              <ul className="space-y-1">
                {validationResult.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {validationResult.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-yellow-900 mb-2">Avisos:</h4>
              <ul className="space-y-1">
                {validationResult.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-yellow-700 flex items-start gap-2">
                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Validation Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ Sobre a Validação</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Apenas algoritmo HS256 é suportado para validação de assinatura</li>
          <li>• A validação verifica formato, assinatura, expiração e claims temporais</li>
          <li>• Todos os dados são processados localmente no seu navegador</li>
          <li>• A chave secreta não é enviada para nenhum servidor</li>
        </ul>
      </div>
    </div>
  );

  const renderGenerateTab = () => (
    <div className="space-y-6">
      <InfoCard 
        title="Gerador de JWT"
        description="Crie tokens JWT personalizados definindo header, payload e chave secreta. O token é gerado localmente usando algoritmo HS256."
      />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Header */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Header (JSON)
          </label>
          <textarea
            value={generatorHeader}
            onChange={(e) => setGeneratorHeader(e.target.value)}
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none font-mono text-sm"
            placeholder='{"alg": "HS256", "typ": "JWT"}'
          />
        </div>

        {/* Payload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payload (JSON)
          </label>
          <textarea
            value={generatorPayload}
            onChange={(e) => setGeneratorPayload(e.target.value)}
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none font-mono text-sm"
            placeholder='{"sub": "1234567890", "name": "John Doe", "iat": 1516239022}'
          />
        </div>
      </div>

      {/* Secret */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chave Secreta
        </label>
        <div className="relative">
          <input
            type={showSecret ? 'text' : 'password'}
            value={generatorSecret}
            onChange={(e) => setGeneratorSecret(e.target.value)}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="Digite a chave secreta..."
          />
          <button
            type="button"
            onClick={() => setShowSecret(!showSecret)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateJWT}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <Zap className="w-5 h-5" />
        Gerar JWT
      </button>

      {/* Generated JWT */}
      {generatedJWT && (
        <div className="bg-gray-50 rounded-lg p-4 border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">JWT Gerado</h3>
            <button
              onClick={() => copyToClipboard(generatedJWT, 'generated')}
              className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-sm"
            >
              {copied === 'generated' ? (
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
          <div className="bg-white p-4 rounded border font-mono text-sm break-all">
            {generatedJWT}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {generatedJWT.length} caracteres
          </div>
        </div>
      )}

      {/* Quick Templates */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-purple-900 mb-3">Templates Rápidos</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => {
              setGeneratorPayload(JSON.stringify({
                sub: "user123",
                name: "João Silva",
                email: "joao@exemplo.com",
                role: "admin",
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600 // 1 hora
              }, null, 2));
            }}
            className="p-3 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-left"
          >
            <div className="font-medium text-purple-900 text-sm">Template de Usuário</div>
            <div className="text-xs text-purple-700">Payload com dados de usuário e expiração</div>
          </button>
          
          <button
            onClick={() => {
              setGeneratorPayload(JSON.stringify({
                iss: "https://exemplo.com",
                sub: "api-client",
                aud: "https://api.exemplo.com",
                scope: "read write",
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 86400 // 24 horas
              }, null, 2));
            }}
            className="p-3 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-left"
          >
            <div className="font-medium text-purple-900 text-sm">Template de API</div>
            <div className="text-xs text-purple-700">Payload para autenticação de API</div>
          </button>
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
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Validador e Decodificador JWT
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Decodifique, valide e gere tokens JWT com verificação de assinatura e análise completa de claims
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Processamento 100% local
            </span>
          </div>
          
          <div className="flex gap-2 ml-auto">
            <button
              onClick={loadSampleJWT}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Upload className="w-4 h-4" />
              Exemplo
            </button>
            
            {decodedJWT && (
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            )}
            
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RefreshCw className="w-4 h-4" />
              Limpar
            </button>
          </div>
        </div>
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
                      ? 'border-blue-500 text-blue-600'
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
          {activeTab === 'decode' && renderDecodeTab()}
          {activeTab === 'validate' && renderValidateTab()}
          {activeTab === 'generate' && renderGenerateTab()}
        </div>
      </div>

      {/* Info Cards */}
      <div className="mt-8 grid md:grid-cols-4 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-2">Decodificação Segura</h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                Decodifica JWT localmente sem enviar dados para servidores
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-purple-900 mb-2">Validação HS256</h3>
              <p className="text-xs text-purple-700 leading-relaxed">
                Verifica assinatura usando algoritmo HMAC SHA-256
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-900 mb-2">Análise Temporal</h3>
              <p className="text-xs text-green-700 leading-relaxed">
                Verifica expiração, validade e claims temporais
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-orange-900 mb-2">Geração Rápida</h3>
              <p className="text-xs text-orange-700 leading-relaxed">
                Crie tokens JWT personalizados com templates prontos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JWTValidator;