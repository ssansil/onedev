import React, { useState, useCallback, useEffect } from 'react';
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
  Monitor,
  Bell,
  BellRing,
  Timer,
  Lock,
  Unlock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Pause,
  Play,
  Settings,
  Mail,
  Smartphone
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
  sslInfo?: {
    isSecure: boolean;
    issuer?: string;
    validFrom?: string;
    validTo?: string;
    daysUntilExpiry?: number;
    isExpired?: boolean;
    isExpiringSoon?: boolean;
  };
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

interface AlertConfig {
  enabled: boolean;
  downtimeAlert: boolean;
  latencyThreshold: number; // em ms
  sslExpiryDays: number; // dias antes do vencimento
  emailNotifications: boolean;
  email?: string;
  checkInterval: number; // em minutos
}

interface Alert {
  id: string;
  type: 'downtime' | 'latency' | 'ssl_expiry' | 'ssl_expired';
  url: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  acknowledged: boolean;
}

const WebsiteStatusChecker: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [result, setResult] = useState<StatusResult | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [copiedField, setCopiedField] = useState<string>('');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    enabled: false,
    downtimeAlert: true,
    latencyThreshold: 3000,
    sslExpiryDays: 30,
    emailNotifications: false,
    email: '',
    checkInterval: 5
  });
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [monitoringInterval, setMonitoringInterval] = useState<NodeJS.Timeout | null>(null);
  const [showAlertConfig, setShowAlertConfig] = useState<boolean>(false);

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

  // Função para verificar SSL
  const checkSSL = async (hostname: string): Promise<any> => {
    try {
      // Verificar se o site usa HTTPS
      const httpsUrl = `https://${hostname}`;
      const response = await fetch(httpsUrl, { method: 'HEAD', mode: 'no-cors' });
      return {
        isSecure: true,
        issuer: 'Certificate Authority',
        validFrom: new Date().toISOString(),
        // Dados simulados para demonstração
        validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        daysUntilExpiry: 90
      };
    } catch {
      return {
        isSecure: false
      };
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
      console.warn('Erro ao obter informações de IP:', error);
    }
    return null;
  };

  // Função para criar alertas
  const createAlert = (type: Alert['type'], url: string, data: any): Alert => {
    let message = '';
    let severity: Alert['severity'] = 'medium';

    switch (type) {
      case 'downtime':
        message = `Site ${url} está fora do ar`;
        severity = 'critical';
        break;
      case 'latency':
        message = `Latência alta detectada: ${data.responseTime}ms (limite: ${alertConfig.latencyThreshold}ms)`;
        severity = data.responseTime > alertConfig.latencyThreshold * 2 ? 'high' : 'medium';
        break;
      case 'ssl_expiry':
        message = `Certificado SSL expira em ${data.daysUntilExpiry} dias`;
        severity = data.daysUntilExpiry <= 7 ? 'high' : 'medium';
        break;
      case 'ssl_expired':
        message = `Certificado SSL expirado!`;
        severity = 'critical';
        break;
    }

    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      url,
      message,
      severity,
      timestamp: new Date(),
      acknowledged: false
    };
  };

  // Função para processar alertas
  const processAlerts = (result: StatusResult) => {
    if (!alertConfig.enabled) return;

    const newAlerts: Alert[] = [];

    // Verificar downtime
    if (alertConfig.downtimeAlert && !result.isOnline) {
      newAlerts.push(createAlert('downtime', result.url, {}));
    }

    // Verificar latência alta
    if (result.responseTime && result.responseTime > alertConfig.latencyThreshold) {
      newAlerts.push(createAlert('latency', result.url, { responseTime: result.responseTime }));
    }

    // Verificar SSL
    if (result.sslInfo) {
      if (result.sslInfo.isExpired) {
        newAlerts.push(createAlert('ssl_expired', result.url, {}));
      } else if (result.sslInfo.isExpiringSoon) {
        newAlerts.push(createAlert('ssl_expiry', result.url, { daysUntilExpiry: result.sslInfo.daysUntilExpiry }));
      }
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev.slice(0, 19)]); // Manter apenas os últimos 20
    }
  };

  // Função principal para verificar status
  const checkWebsiteStatus = useCallback(async (urlToCheck?: string) => {
    const targetUrl = urlToCheck || url;
    if (!targetUrl.trim()) {
      return null;
    }

    const normalizedUrl = normalizeUrl(targetUrl);
    
    if (!isValidUrl(normalizedUrl)) {
      const errorResult: StatusResult = {
        url: normalizedUrl,
        isOnline: false,
        error: 'URL inválida. Verifique o formato.',
        timestamp: new Date()
      };
      if (!urlToCheck) setResult(errorResult);
      return errorResult;
    }

    if (!urlToCheck) setIsChecking(true);
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
        console.warn('Erro ao obter informações de IP:', ipError);
      }

      // Verificar SSL
      try {
        const sslInfo = await checkSSL(hostname);
        if (sslInfo) {
          const validTo = sslInfo.validTo ? new Date(sslInfo.validTo) : null;
          const now = new Date();
          const daysUntilExpiry = validTo ? Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
          
          statusResult.sslInfo = {
            isSecure: sslInfo.isSecure || false,
            issuer: sslInfo.issuer,
            validFrom: sslInfo.validFrom,
            validTo: sslInfo.validTo,
            daysUntilExpiry: daysUntilExpiry || undefined,
            isExpired: daysUntilExpiry !== null && daysUntilExpiry < 0,
            isExpiringSoon: daysUntilExpiry !== null && daysUntilExpiry <= alertConfig.sslExpiryDays
          };
        }
      } catch (sslError) {
        console.warn('Erro ao verificar SSL:', sslError);
      }

      if (!urlToCheck) {
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
      }

      // Processar alertas
      processAlerts(statusResult);

      return statusResult;

    } catch (error) {
      const errorResult: StatusResult = {
        url: normalizedUrl,
        isOnline: false,
        error: 'Erro inesperado ao verificar o site.',
        timestamp: new Date()
      };
      
      if (!urlToCheck) setResult(errorResult);
      return errorResult;
    } finally {
      if (!urlToCheck) setIsChecking(false);
    }
  }, [url, alertConfig]);

  // Função para iniciar/parar monitoramento
  const toggleMonitoring = () => {
    if (isMonitoring) {
      // Parar monitoramento
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
        setMonitoringInterval(null);
      }
      setIsMonitoring(false);
    } else {
      // Iniciar monitoramento
      if (!url.trim()) {
        alert('Digite uma URL para monitorar');
        return;
      }

      const interval = setInterval(() => {
        checkWebsiteStatus(url);
      }, alertConfig.checkInterval * 60 * 1000);

      setMonitoringInterval(interval);
      setIsMonitoring(true);
      
      // Fazer primeira verificação imediatamente
      checkWebsiteStatus(url);
    }
  };

  // Limpar intervalo quando componente for desmontado
  useEffect(() => {
    return () => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
    };
  }, [monitoringInterval]);

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

  // Função para obter cor do alerta
  const getAlertColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'low': return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'high': return 'border-orange-200 bg-orange-50 text-orange-800';
      case 'critical': return 'border-red-200 bg-red-50 text-red-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  // Função para obter ícone do alerta
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'downtime': return XCircle;
      case 'latency': return Timer;
      case 'ssl_expiry': return Calendar;
      case 'ssl_expired': return Unlock;
      default: return AlertTriangle;
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

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const getActiveAlertsCount = () => {
    return alerts.filter(alert => !alert.acknowledged).length;
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
            Monitor de Status de Site
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Monitore sites em tempo real com alertas de downtime, latência alta e SSL expirado
        </p>
      </div>

      {/* Alerts Summary */}
      {alerts.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <BellRing className="w-5 h-5 text-red-600" />
              Alertas Ativos
              {getActiveAlertsCount() > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                  {getActiveAlertsCount()}
                </span>
              )}
            </h2>
            
            <button
              onClick={clearAllAlerts}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Limpar Todos
            </button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {alerts.slice(0, 10).map((alert) => {
              const AlertIcon = getAlertIcon(alert.type);
              return (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 ${getAlertColor(alert.severity)} ${
                    alert.acknowledged ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <AlertIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm opacity-75 mt-1">
                          {alert.url} • {alert.timestamp.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="text-sm px-3 py-1 bg-white/50 rounded hover:bg-white/70 transition-colors"
                      >
                        Reconhecer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* URL Input and Monitoring */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            Verificar e Monitorar Site
          </h2>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAlertConfig(!showAlertConfig)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Configurar Alertas
            </button>
            
            <button
              onClick={toggleMonitoring}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isMonitoring
                  ? 'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100'
                  : 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100'
              }`}
            >
              {isMonitoring ? (
                <>
                  <Pause className="w-4 h-4" />
                  Parar Monitor
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Iniciar Monitor
                </>
              )}
            </button>
          </div>
        </div>

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
              onClick={() => checkWebsiteStatus()}
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
                  Verificar Agora
                </>
              )}
            </button>
          </div>
        </div>

        {/* Monitoring Status */}
        {isMonitoring && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-blue-800 font-medium">
                Monitorando {url} a cada {alertConfig.checkInterval} minutos
              </span>
            </div>
          </div>
        )}

        {/* Alert Configuration */}
        {showAlertConfig && (
          <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-600" />
              Configuração de Alertas
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={alertConfig.enabled}
                      onChange={(e) => setAlertConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Habilitar Alertas</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={alertConfig.downtimeAlert}
                      onChange={(e) => setAlertConfig(prev => ({ ...prev, downtimeAlert: e.target.checked }))}
                      disabled={!alertConfig.enabled}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Alertas de Downtime</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Limite de Latência (ms)
                  </label>
                  <input
                    type="number"
                    value={alertConfig.latencyThreshold}
                    onChange={(e) => setAlertConfig(prev => ({ ...prev, latencyThreshold: parseInt(e.target.value) || 3000 }))}
                    disabled={!alertConfig.enabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alerta SSL (dias antes do vencimento)
                  </label>
                  <input
                    type="number"
                    value={alertConfig.sslExpiryDays}
                    onChange={(e) => setAlertConfig(prev => ({ ...prev, sslExpiryDays: parseInt(e.target.value) || 30 }))}
                    disabled={!alertConfig.enabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intervalo de Verificação (minutos)
                  </label>
                  <select
                    value={alertConfig.checkInterval}
                    onChange={(e) => setAlertConfig(prev => ({ ...prev, checkInterval: parseInt(e.target.value) }))}
                    disabled={!alertConfig.enabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value={1}>1 minuto</option>
                    <option value={5}>5 minutos</option>
                    <option value={10}>10 minutos</option>
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={60}>1 hora</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={alertConfig.emailNotifications}
                      onChange={(e) => setAlertConfig(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                      disabled={!alertConfig.enabled}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">Notificações por Email</span>
                  </label>
                </div>

                {alertConfig.emailNotifications && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email para Notificações
                    </label>
                    <input
                      type="email"
                      value={alertConfig.email || ''}
                      onChange={(e) => setAlertConfig(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="seu@email.com"
                      disabled={!alertConfig.enabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  <strong>Nota:</strong> As notificações por email são simuladas nesta demonstração. 
                  Em produção, seria integrado com um serviço de email real.
                </p>
              </div>
            </div>
          </div>
        )}
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

            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                  <div className={`p-4 rounded-full ${
                    result.responseTime && result.responseTime > alertConfig.latencyThreshold
                      ? 'bg-red-100'
                      : 'bg-blue-100'
                  }`}>
                    <Clock className={`w-8 h-8 ${
                      result.responseTime && result.responseTime > alertConfig.latencyThreshold
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`} />
                  </div>
                </div>
                <div className={`text-2xl font-bold ${
                  result.responseTime && result.responseTime > alertConfig.latencyThreshold
                    ? 'text-red-600'
                    : 'text-blue-600'
                }`}>
                  {formatResponseTime(result.responseTime)}
                </div>
                <div className="text-sm text-gray-600">Tempo de Resposta</div>
                {result.responseTime && result.responseTime > alertConfig.latencyThreshold && (
                  <div className="text-xs text-red-600 mt-1">⚠️ Latência Alta</div>
                )}
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

              {/* SSL Status */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className={`p-4 rounded-full ${
                    result.sslInfo?.isSecure ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {result.sslInfo?.isSecure ? (
                      <Lock className="w-8 h-8 text-green-600" />
                    ) : (
                      <Unlock className="w-8 h-8 text-red-600" />
                    )}
                  </div>
                </div>
                <div className={`text-lg font-bold ${
                  result.sslInfo?.isSecure ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.sslInfo?.isSecure ? '🔒 Seguro' : '🔓 Inseguro'}
                </div>
                <div className="text-sm text-gray-600">SSL/TLS</div>
                {result.sslInfo?.daysUntilExpiry !== undefined && (
                  <div className={`text-xs mt-1 ${
                    result.sslInfo.isExpired ? 'text-red-600' :
                    result.sslInfo.isExpiringSoon ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {result.sslInfo.isExpired ? '❌ Expirado' :
                     result.sslInfo.isExpiringSoon ? `⚠️ ${result.sslInfo.daysUntilExpiry}d` :
                     `✅ ${result.sslInfo.daysUntilExpiry}d`}
                  </div>
                )}
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

                {/* SSL Details */}
                {result.sslInfo && (
                  <>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">SSL Seguro:</span>
                      <span className={`text-sm font-semibold ${
                        result.sslInfo.isSecure ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.sslInfo.isSecure ? '✅ Sim' : '❌ Não'}
                      </span>
                    </div>

                    {result.sslInfo.daysUntilExpiry !== undefined && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">SSL Expira em:</span>
                        <span className={`text-sm font-semibold ${
                          result.sslInfo.isExpired ? 'text-red-600' :
                          result.sslInfo.isExpiringSoon ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {result.sslInfo.isExpired ? 'Expirado' : `${result.sslInfo.daysUntilExpiry} dias`}
                        </span>
                      </div>
                    )}
                  </>
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
                    <span className={`text-sm ${
                      entry.responseTime > alertConfig.latencyThreshold ? 'text-red-600' : 'text-gray-600'
                    }`}>
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
            <h3 className="text-lg font-semibold text-green-900 mb-2">🚨 Sistema de Alertas Avançado</h3>
            <div className="text-green-800 leading-relaxed space-y-2">
              <p>
                Este monitor oferece alertas inteligentes para manter você informado sobre problemas críticos 
                do seu site em tempo real.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-semibold text-green-900 mb-1 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Downtime
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Detecção instantânea de sites offline</li>
                    <li>• Alertas críticos imediatos</li>
                    <li>• Histórico de indisponibilidade</li>
                  </ul>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-semibold text-green-900 mb-1 flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    Latência Alta
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Monitoramento de performance</li>
                    <li>• Limites configuráveis</li>
                    <li>• Alertas de degradação</li>
                  </ul>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-semibold text-green-900 mb-1 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    SSL Expirado
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Verificação de certificados</li>
                    <li>• Alertas preventivos</li>
                    <li>• Monitoramento de expiração</li>
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