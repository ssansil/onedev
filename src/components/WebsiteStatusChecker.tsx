import React, { useState, useCallback } from 'react';
import { 
  Globe, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Server, 
  Wifi, 
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink,
  Info,
  Zap,
  Shield,
  Activity,
  Eye,
  Search,
  Hash,
  Monitor
} from 'lucide-react';

interface StatusResult {
  url: string;
  isOnline: boolean;
  statusCode?: number;
  statusText?: string;
  responseTime?: number;
  ipAddress?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
    isp?: string;
  };
  headers?: Record<string, string>;
  error?: string;
  timestamp: Date;
}

interface StatusHistory {
  id: string;
  url: string;
  isOnline: boolean;
  responseTime?: number;
  timestamp: Date;
}

const WebsiteStatusChecker: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [result, setResult] = useState<StatusResult | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [copiedField, setCopiedField] = useState<string>('');

  // Função para normalizar URL
  const normalizeUrl = (inputUrl: string): string => {
    let normalizedUrl = inputUrl.trim();
    
    // Adicionar protocolo se não existir
    if (!normalizedUrl.match(/^https?:\/\//)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    return normalizedUrl;
  };

  // Função para validar URL
  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  // Função para obter informações de IP e localização
  const getIpInfo = async (hostname: string): Promise<any> => {
    try {
      // Usar API pública para obter informações de IP
      const response = await fetch(`https://ipapi.co/${hostname}/json/`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Erro ao obter informações de IP:', error);
    }
    return null;
  };

  // Função principal para verificar status
  const checkWebsiteStatus = useCallback(async () => {
    if (!url.trim()) {
      return;
    }

    const normalizedUrl = normalizeUrl(url);
    
    if (!isValidUrl(normalizedUrl)) {
      setResult({
        url: normalizedUrl,
        isOnline: false,
        error: 'URL inválida. Verifique o formato.',
        timestamp: new Date()
      });
      return;
    }

    setIsChecking(true);
    const startTime = Date.now();

    try {
      // Extrair hostname para buscar informações de IP
      const urlObj = new URL(normalizedUrl);
      const hostname = urlObj.hostname;

      // Verificar status usando diferentes métodos
      let statusResult: StatusResult = {
        url: normalizedUrl,
        isOnline: false,
        timestamp: new Date()
      };

      try {
        // Método 1: Tentar fetch direto (pode falhar por CORS)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(normalizedUrl, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        statusResult = {
          ...statusResult,
          isOnline: true,
          responseTime,
          statusCode: response.status || 200,
          statusText: response.statusText || 'OK'
        };

      } catch (fetchError) {
        // Método 2: Usar API de proxy público para verificar status
        try {
          const proxyResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(normalizedUrl)}`);
          const proxyData = await proxyResponse.json();
          
          const responseTime = Date.now() - startTime;
          
          if (proxyData.status && proxyData.status.http_code) {
            statusResult = {
              ...statusResult,
              isOnline: proxyData.status.http_code < 400,
              responseTime,
              statusCode: proxyData.status.http_code,
              statusText: getStatusText(proxyData.status.http_code)
            };
          } else {
            // Método 3: Verificar se conseguimos carregar o conteúdo
            statusResult = {
              ...statusResult,
              isOnline: !!proxyData.contents,
              responseTime,
              statusCode: proxyData.contents ? 200 : 404,
              statusText: proxyData.contents ? 'OK' : 'Not Found'
            };
          }
        } catch (proxyError) {
          // Método 4: Usar serviço de ping alternativo
          try {
            const pingResponse = await fetch(`https://api.hackertarget.com/httpheaders/?q=${hostname}`);
            const pingData = await pingResponse.text();
            
            const responseTime = Date.now() - startTime;
            const isOnline = !pingData.includes('error') && !pingData.includes('failed');
            
            statusResult = {
              ...statusResult,
              isOnline,
              responseTime,
              statusCode: isOnline ? 200 : 503,
              statusText: isOnline ? 'OK' : 'Service Unavailable'
            };
          } catch (pingError) {
            statusResult = {
              ...statusResult,
              isOnline: false,
              responseTime: Date.now() - startTime,
              error: 'Não foi possível verificar o status do site. Pode estar offline ou bloqueando verificações externas.'
            };
          }
        }
      }

      // Obter informações de IP e localização
      try {
        const ipInfo = await getIpInfo(hostname);
        if (ipInfo && !ipInfo.error) {
          statusResult.ipAddress = ipInfo.ip;
          statusResult.location = {
            country: ipInfo.country_name,
            region: ipInfo.region,
            city: ipInfo.city,
            timezone: ipInfo.timezone,
            isp: ipInfo.org
          };
        }
      } catch (ipError) {
        console.error('Erro ao obter informações de IP:', ipError);
      }

      setResult(statusResult);

      // Adicionar ao histórico
      const historyEntry: StatusHistory = {
        id: Date.now().toString(),
        url: normalizedUrl,
        isOnline: statusResult.isOnline,
        responseTime: statusResult.responseTime,
        timestamp: new Date()
      };

      setHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Manter apenas os últimos 10

    } catch (error) {
      setResult({
        url: normalizedUrl,
        isOnline: false,
        error: 'Erro inesperado ao verificar o site.',
        timestamp: new Date()
      });
    } finally {
      setIsChecking(false);
    }
  }, [url]);

  // Função para obter texto do status HTTP
  const getStatusText = (code: number): string => {
    const statusTexts: Record<number, string> = {
      200: 'OK',
      201: 'Created',
      204: 'No Content',
      301: 'Moved Permanently',
      302: 'Found',
      304: 'Not Modified',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      405: 'Method Not Allowed',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout'
    };
    return statusTexts[code] || 'Unknown';
  };

  // Função para obter cor do status
  const getStatusColor = (code?: number): string => {
    if (!code) return 'text-gray-600';
    if (code >= 200 && code < 300) return 'text-green-600';
    if (code >= 300 && code < 400) return 'text-yellow-600';
    if (code >= 400 && code < 500) return 'text-orange-600';
    if (code >= 500) return 'text-red-600';
    return 'text-gray-600';
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

  const formatResponseTime = (time?: number): string => {
    if (!time) return 'N/A';
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isChecking) {
      checkWebsiteStatus();
    }
  };

  const openWebsite = () => {
    if (result?.url) {
      window.open(result.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Verificador de Status de Site
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Verifique se um site está online, obtenha tempo de resposta e informações do servidor
        </p>
      </div>

      {/* URL Input */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" />
          Verificar Site
        </h2>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL do Site
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="exemplo.com ou https://exemplo.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
              disabled={isChecking}
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={checkWebsiteStatus}
              disabled={isChecking || !url.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5" />
                  Verificar Status
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-8">
          {/* Main Status */}
          <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 ${
            result.isOnline ? 'ring-2 ring-green-500 ring-opacity-20' : 'ring-2 ring-red-500 ring-opacity-20'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-blue-600" />
                Status do Site
              </h2>
              
              {result.url && (
                <button
                  onClick={openWebsite}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visitar Site
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Status */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  {result.isOnline ? (
                    <div className="p-4 bg-green-100 rounded-full">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  ) : (
                    <div className="p-4 bg-red-100 rounded-full">
                      <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                  )}
                </div>
                <div className={`text-2xl font-bold ${result.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {result.isOnline ? '✅ Online' : '❌ Offline'}
                </div>
                <div className="text-sm text-gray-600">Status</div>
              </div>

              {/* Response Time */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-4 bg-blue-100 rounded-full">
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatResponseTime(result.responseTime)}
                </div>
                <div className="text-sm text-gray-600">Tempo de Resposta</div>
              </div>

              {/* HTTP Status */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-4 bg-purple-100 rounded-full">
                    <Hash className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <div className={`text-2xl font-bold ${getStatusColor(result.statusCode)}`}>
                  {result.statusCode || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">
                  {result.statusText || 'Status HTTP'}
                </div>
              </div>

              {/* IP Address */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-4 bg-orange-100 rounded-full">
                    <Server className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
                <div className="text-lg font-bold text-orange-600 font-mono">
                  {result.ipAddress || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Endereço IP</div>
              </div>
            </div>

            {/* Error Message */}
            {result.error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-900">Erro na Verificação</h4>
                    <p className="text-sm text-red-700 mt-1">{result.error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Information */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Server Location */}
            {result.location && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  Localização do Servidor
                </h3>

                <div className="space-y-4">
                  {result.location.country && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">País:</span>
                      <span className="text-sm text-gray-900">{result.location.country}</span>
                    </div>
                  )}
                  
                  {result.location.region && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Região:</span>
                      <span className="text-sm text-gray-900">{result.location.region}</span>
                    </div>
                  )}
                  
                  {result.location.city && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Cidade:</span>
                      <span className="text-sm text-gray-900">{result.location.city}</span>
                    </div>
                  )}
                  
                  {result.location.timezone && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Fuso Horário:</span>
                      <span className="text-sm text-gray-900">{result.location.timezone}</span>
                    </div>
                  )}
                  
                  {result.location.isp && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Provedor:</span>
                      <span className="text-sm text-gray-900">{result.location.isp}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Technical Details */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Wifi className="w-5 h-5 text-blue-600" />
                Detalhes Técnicos
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">URL Verificada:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900 font-mono break-all">
                      {result.url.length > 30 ? `${result.url.substring(0, 30)}...` : result.url}
                    </span>
                    <button
                      onClick={() => copyToClipboard(result.url, 'url')}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {copiedField === 'url' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {result.ipAddress && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Endereço IP:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900 font-mono">{result.ipAddress}</span>
                      <button
                        onClick={() => copyToClipboard(result.ipAddress!, 'ip')}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {copiedField === 'ip' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Verificado em:</span>
                  <span className="text-sm text-gray-900">
                    {result.timestamp.toLocaleString('pt-BR')}
                  </span>
                </div>

                {result.responseTime && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Latência:</span>
                    <span className={`text-sm font-semibold ${
                      result.responseTime < 500 ? 'text-green-600' :
                      result.responseTime < 1000 ? 'text-yellow-600' :
                      result.responseTime < 3000 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {formatResponseTime(result.responseTime)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Histórico de Verificações
          </h3>

          <div className="space-y-3">
            {history.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {entry.isOnline ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {entry.url.length > 50 ? `${entry.url.substring(0, 50)}...` : entry.url}
                    </p>
                    <p className="text-xs text-gray-500">
                      {entry.timestamp.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-semibold ${entry.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                    {entry.isOnline ? 'Online' : 'Offline'}
                  </span>
                  {entry.responseTime && (
                    <span className="text-sm text-gray-600">
                      {formatResponseTime(entry.responseTime)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">🌐 Sobre o Verificador de Status</h3>
            <div className="text-green-800 leading-relaxed space-y-2">
              <p>
                Esta ferramenta verifica se um site está online e fornece informações detalhadas sobre 
                o servidor, incluindo tempo de resposta, localização e status HTTP.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-semibold text-green-900 mb-1 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Funcionalidades
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Verificação de status em tempo real</li>
                    <li>• Medição de tempo de resposta</li>
                    <li>• Informações de localização do servidor</li>
                    <li>• Histórico de verificações</li>
                  </ul>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-semibold text-green-900 mb-1 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Limitações
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Alguns sites podem bloquear verificações</li>
                    <li>• CORS pode limitar verificações diretas</li>
                    <li>• Resultados podem variar por localização</li>
                    <li>• APIs públicas têm limites de uso</li>
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

export default WebsiteStatusChecker;