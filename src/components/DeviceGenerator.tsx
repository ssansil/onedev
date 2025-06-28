import React, { useState, useCallback } from 'react';
import { 
  Monitor, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Server, 
  Wifi, 
  Globe, 
  Copy, 
  RefreshCw, 
  Download, 
  Settings,
  Shield,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Eye,
  EyeOff,
  CheckCircle
} from 'lucide-react';

interface DeviceInfo {
  deviceType: string;
  deviceName: string;
  macAddress: string;
  ipv4Address: string;
  ipv6Address: string;
  operatingSystem: string;
  osVersion: string;
  browser: string;
  browserVersion: string;
  userAgent: string;
  screenResolution: string;
  processor: string;
  memory: string;
  storage: string;
  networkInterface: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  hostname: string;
  domain: string;
  timezone: string;
  locale: string;
  uptime: string;
  lastBoot: string;
}

const DeviceGenerator: React.FC = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [deviceType, setDeviceType] = useState<string>('desktop');
  const [showSensitive, setShowSensitive] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string>('');

  const deviceTypes = [
    { id: 'desktop', name: 'Desktop', icon: Monitor },
    { id: 'laptop', name: 'Laptop', icon: Laptop },
    { id: 'smartphone', name: 'Smartphone', icon: Smartphone },
    { id: 'tablet', name: 'Tablet', icon: Tablet },
    { id: 'server', name: 'Servidor', icon: Server }
  ];

  const operatingSystems = {
    desktop: ['Windows 11', 'Windows 10', 'macOS Sonoma', 'macOS Ventura', 'Ubuntu 22.04', 'Fedora 38', 'Debian 12'],
    laptop: ['Windows 11', 'Windows 10', 'macOS Sonoma', 'macOS Ventura', 'Ubuntu 22.04', 'Pop!_OS 22.04'],
    smartphone: ['Android 14', 'Android 13', 'iOS 17', 'iOS 16', 'HarmonyOS 4.0'],
    tablet: ['iPadOS 17', 'iPadOS 16', 'Android 14', 'Android 13', 'Windows 11'],
    server: ['Ubuntu Server 22.04', 'CentOS 9', 'Red Hat Enterprise Linux 9', 'Debian 12', 'Windows Server 2022']
  };

  const browsers = {
    desktop: ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'],
    laptop: ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'],
    smartphone: ['Chrome Mobile', 'Safari Mobile', 'Samsung Internet', 'Firefox Mobile'],
    tablet: ['Safari', 'Chrome', 'Firefox', 'Edge'],
    server: ['curl', 'wget', 'Chrome Headless', 'Firefox Headless']
  };

  const manufacturers = {
    desktop: ['Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Custom Build'],
    laptop: ['Dell', 'HP', 'Lenovo', 'Apple', 'ASUS', 'Acer', 'MSI', 'Razer'],
    smartphone: ['Apple', 'Samsung', 'Google', 'Xiaomi', 'OnePlus', 'Huawei', 'Motorola'],
    tablet: ['Apple', 'Samsung', 'Microsoft', 'Lenovo', 'Amazon', 'Huawei'],
    server: ['Dell', 'HP', 'Lenovo', 'Supermicro', 'IBM', 'Cisco']
  };

  const generateMacAddress = (): string => {
    const hexChars = '0123456789ABCDEF';
    let mac = '';
    for (let i = 0; i < 6; i++) {
      if (i > 0) mac += ':';
      mac += hexChars[Math.floor(Math.random() * 16)];
      mac += hexChars[Math.floor(Math.random() * 16)];
    }
    return mac;
  };

  const generateIPv4 = (): string => {
    // Generate private IP ranges
    const ranges = [
      () => `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 254) + 1}`,
      () => `10.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 254) + 1}`,
      () => `172.${Math.floor(Math.random() * 16) + 16}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 254) + 1}`
    ];
    return ranges[Math.floor(Math.random() * ranges.length)]();
  };

  const generateIPv6 = (): string => {
    const hexChars = '0123456789abcdef';
    let ipv6 = '';
    for (let i = 0; i < 8; i++) {
      if (i > 0) ipv6 += ':';
      for (let j = 0; j < 4; j++) {
        ipv6 += hexChars[Math.floor(Math.random() * 16)];
      }
    }
    return ipv6;
  };

  const generateUserAgent = (os: string, browser: string, browserVersion: string): string => {
    const userAgents = {
      'Chrome': `Mozilla/5.0 (${os}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion} Safari/537.36`,
      'Firefox': `Mozilla/5.0 (${os}; rv:${browserVersion}) Gecko/20100101 Firefox/${browserVersion}`,
      'Safari': `Mozilla/5.0 (${os}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${browserVersion} Safari/605.1.15`,
      'Edge': `Mozilla/5.0 (${os}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion} Safari/537.36 Edg/${browserVersion}`,
      'Chrome Mobile': `Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion} Mobile Safari/537.36`,
      'Safari Mobile': `Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${browserVersion} Mobile/15E148 Safari/604.1`
    };
    return userAgents[browser as keyof typeof userAgents] || userAgents['Chrome'];
  };

  const generateSerialNumber = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let serial = '';
    for (let i = 0; i < 12; i++) {
      serial += chars[Math.floor(Math.random() * chars.length)];
    }
    return serial;
  };

  const generateHostname = (type: string): string => {
    const prefixes = {
      desktop: ['PC', 'DESKTOP', 'WORKSTATION'],
      laptop: ['LAPTOP', 'NOTEBOOK', 'MOBILE'],
      smartphone: ['PHONE', 'MOBILE', 'DEVICE'],
      tablet: ['TABLET', 'PAD', 'DEVICE'],
      server: ['SERVER', 'SRV', 'HOST']
    };
    const prefix = prefixes[type as keyof typeof prefixes][Math.floor(Math.random() * 3)];
    const suffix = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `${prefix}-${suffix}`;
  };

  const generateDevice = useCallback(() => {
    const selectedOS = operatingSystems[deviceType as keyof typeof operatingSystems];
    const selectedBrowsers = browsers[deviceType as keyof typeof browsers];
    const selectedManufacturers = manufacturers[deviceType as keyof typeof manufacturers];

    const os = selectedOS[Math.floor(Math.random() * selectedOS.length)];
    const browser = selectedBrowsers[Math.floor(Math.random() * selectedBrowsers.length)];
    const manufacturer = selectedManufacturers[Math.floor(Math.random() * selectedManufacturers.length)];

    const browserVersion = `${Math.floor(Math.random() * 50) + 80}.0.${Math.floor(Math.random() * 9999)}.${Math.floor(Math.random() * 999)}`;
    const osVersion = os.includes('Windows') ? `${os} Build ${Math.floor(Math.random() * 9999) + 19000}` : os;

    const resolutions = {
      desktop: ['1920x1080', '2560x1440', '3840x2160', '1680x1050', '2560x1080'],
      laptop: ['1920x1080', '1366x768', '2560x1600', '1440x900', '2880x1800'],
      smartphone: ['1080x2400', '828x1792', '1170x2532', '1080x2340', '720x1600'],
      tablet: ['2048x2732', '1668x2388', '2560x1600', '1920x1200', '2000x1200'],
      server: ['1024x768', '1280x1024', '1920x1080']
    };

    const processors = {
      desktop: ['Intel Core i7-13700K', 'AMD Ryzen 7 7700X', 'Intel Core i5-13600K', 'AMD Ryzen 5 7600X'],
      laptop: ['Intel Core i7-1365U', 'AMD Ryzen 7 7840U', 'Apple M2', 'Intel Core i5-1335U'],
      smartphone: ['Snapdragon 8 Gen 3', 'Apple A17 Pro', 'MediaTek Dimensity 9300', 'Exynos 2400'],
      tablet: ['Apple M2', 'Snapdragon 8cx Gen 3', 'MediaTek Kompanio 1380', 'Exynos 1380'],
      server: ['Intel Xeon Gold 6348', 'AMD EPYC 7763', 'Intel Xeon Silver 4314', 'AMD EPYC 7543']
    };

    const memories = {
      desktop: ['16GB DDR4', '32GB DDR4', '64GB DDR5', '16GB DDR5'],
      laptop: ['8GB DDR4', '16GB DDR4', '32GB DDR5', '16GB LPDDR5'],
      smartphone: ['8GB LPDDR5', '12GB LPDDR5', '16GB LPDDR5', '6GB LPDDR4X'],
      tablet: ['8GB LPDDR5', '16GB LPDDR5', '12GB LPDDR4X', '6GB LPDDR4X'],
      server: ['128GB DDR4', '256GB DDR4', '512GB DDR5', '64GB DDR4']
    };

    const storages = {
      desktop: ['1TB NVMe SSD', '2TB NVMe SSD', '512GB NVMe SSD + 2TB HDD', '4TB NVMe SSD'],
      laptop: ['512GB NVMe SSD', '1TB NVMe SSD', '256GB NVMe SSD', '2TB NVMe SSD'],
      smartphone: ['128GB UFS 4.0', '256GB UFS 4.0', '512GB UFS 4.0', '1TB UFS 4.0'],
      tablet: ['256GB', '512GB', '128GB', '1TB'],
      server: ['2TB NVMe SSD RAID 1', '4TB NVMe SSD RAID 10', '8TB SAS HDD RAID 5', '16TB NVMe SSD']
    };

    const now = new Date();
    const bootTime = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const uptime = Math.floor((now.getTime() - bootTime.getTime()) / 1000);

    const device: DeviceInfo = {
      deviceType: deviceTypes.find(d => d.id === deviceType)?.name || 'Desktop',
      deviceName: `${manufacturer} ${generateHostname(deviceType)}`,
      macAddress: generateMacAddress(),
      ipv4Address: generateIPv4(),
      ipv6Address: generateIPv6(),
      operatingSystem: os,
      osVersion: osVersion,
      browser: browser,
      browserVersion: browserVersion,
      userAgent: generateUserAgent(os, browser, browserVersion),
      screenResolution: resolutions[deviceType as keyof typeof resolutions][Math.floor(Math.random() * 5)],
      processor: processors[deviceType as keyof typeof processors][Math.floor(Math.random() * 4)],
      memory: memories[deviceType as keyof typeof memories][Math.floor(Math.random() * 4)],
      storage: storages[deviceType as keyof typeof storages][Math.floor(Math.random() * 4)],
      networkInterface: `Ethernet ${Math.floor(Math.random() * 10)}`,
      manufacturer: manufacturer,
      model: `${manufacturer}-${Math.floor(Math.random() * 9999)}`,
      serialNumber: generateSerialNumber(),
      hostname: generateHostname(deviceType),
      domain: `${generateHostname(deviceType).toLowerCase()}.local`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: 'pt-BR',
      uptime: `${Math.floor(uptime / 86400)}d ${Math.floor((uptime % 86400) / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      lastBoot: bootTime.toLocaleString('pt-BR')
    };

    setDeviceInfo(device);
  }, [deviceType]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const exportToJSON = () => {
    if (!deviceInfo) return;
    
    const dataStr = JSON.stringify(deviceInfo, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `device-info-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatUptime = (uptime: string) => {
    return uptime.replace(/d/g, ' dias').replace(/h/g, ' horas').replace(/m/g, ' minutos');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Monitor className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Gerador de Dispositivo
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Gere informações completas e realistas de dispositivos para testes e desenvolvimento
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          {/* Device Type Selection */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Dispositivo
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {deviceTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setDeviceType(type.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200 ${
                      deviceType === type.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{type.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={generateDevice}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              Gerar Dispositivo
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setShowSensitive(!showSensitive)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                  showSensitive
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                {showSensitive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showSensitive ? 'Ocultar' : 'Mostrar'} Sensíveis
              </button>

              {deviceInfo && (
                <button
                  onClick={exportToJSON}
                  className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Device Information */}
      {deviceInfo && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Informações Básicas
            </h2>

            <div className="space-y-4">
              {[
                { label: 'Tipo', value: deviceInfo.deviceType, icon: Monitor },
                { label: 'Nome do Dispositivo', value: deviceInfo.deviceName, icon: Settings },
                { label: 'Fabricante', value: deviceInfo.manufacturer, icon: Settings },
                { label: 'Modelo', value: deviceInfo.model, icon: Settings },
                { label: 'Hostname', value: deviceInfo.hostname, icon: Globe },
                { label: 'Domínio', value: deviceInfo.domain, icon: Globe },
                { label: 'Fuso Horário', value: deviceInfo.timezone, icon: Globe },
                { label: 'Localização', value: deviceInfo.locale, icon: Globe }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">{item.label}:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900 font-mono">{item.value}</span>
                        <button
                          onClick={() => copyToClipboard(item.value, item.label)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {copiedField === item.label ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Network Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Network className="w-5 h-5 text-green-600" />
              Informações de Rede
            </h2>

            <div className="space-y-4">
              {[
                { label: 'Endereço MAC', value: deviceInfo.macAddress, icon: Wifi, sensitive: true },
                { label: 'Endereço IPv4', value: deviceInfo.ipv4Address, icon: Globe, sensitive: true },
                { label: 'Endereço IPv6', value: deviceInfo.ipv6Address, icon: Globe, sensitive: true },
                { label: 'Interface de Rede', value: deviceInfo.networkInterface, icon: Network }
              ].map((item, index) => {
                const Icon = item.icon;
                const shouldHide = item.sensitive && !showSensitive;
                const displayValue = shouldHide ? '••••••••••••' : item.value;
                
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">{item.label}:</span>
                        {item.sensitive && (
                          <Shield className="w-3 h-3 text-amber-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900 font-mono">{displayValue}</span>
                        <button
                          onClick={() => copyToClipboard(item.value, item.label)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          disabled={shouldHide}
                        >
                          {copiedField === item.label ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-600" />
              Sistema Operacional
            </h2>

            <div className="space-y-4">
              {[
                { label: 'Sistema Operacional', value: deviceInfo.operatingSystem, icon: Monitor },
                { label: 'Versão do SO', value: deviceInfo.osVersion, icon: Settings },
                { label: 'Navegador', value: deviceInfo.browser, icon: Globe },
                { label: 'Versão do Navegador', value: deviceInfo.browserVersion, icon: Globe },
                { label: 'Resolução da Tela', value: deviceInfo.screenResolution, icon: Monitor },
                { label: 'Tempo Ativo', value: formatUptime(deviceInfo.uptime), icon: Settings },
                { label: 'Último Boot', value: deviceInfo.lastBoot, icon: Settings }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">{item.label}:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900 font-mono">{item.value}</span>
                        <button
                          onClick={() => copyToClipboard(item.value, item.label)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {copiedField === item.label ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hardware Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-orange-600" />
              Hardware
            </h2>

            <div className="space-y-4">
              {[
                { label: 'Processador', value: deviceInfo.processor, icon: Cpu },
                { label: 'Memória RAM', value: deviceInfo.memory, icon: MemoryStick },
                { label: 'Armazenamento', value: deviceInfo.storage, icon: HardDrive },
                { label: 'Número de Série', value: deviceInfo.serialNumber, icon: Shield, sensitive: true }
              ].map((item, index) => {
                const Icon = item.icon;
                const shouldHide = item.sensitive && !showSensitive;
                const displayValue = shouldHide ? '••••••••••••' : item.value;
                
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">{item.label}:</span>
                        {item.sensitive && (
                          <Shield className="w-3 h-3 text-amber-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900 font-mono">{displayValue}</span>
                        <button
                          onClick={() => copyToClipboard(item.value, item.label)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          disabled={shouldHide}
                        >
                          {copiedField === item.label ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* User Agent Section */}
      {deviceInfo && (
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            User Agent
          </h2>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">String completa do User Agent:</p>
                <code className="text-xs text-gray-800 bg-white p-3 rounded border block break-all">
                  {deviceInfo.userAgent}
                </code>
              </div>
              <button
                onClick={() => copyToClipboard(deviceInfo.userAgent, 'User Agent')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                {copiedField === 'User Agent' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">🔒 Privacidade Garantida</h3>
            <p className="text-green-800 leading-relaxed">
              Todas as informações são geradas localmente no seu navegador. Nenhum dado real é coletado 
              ou enviado para servidores. Use essas informações apenas para testes e desenvolvimento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceGenerator;