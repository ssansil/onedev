import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Laptop, 
  Tv, 
  RotateCcw, 
  RefreshCw, 
  ExternalLink, 
  Settings, 
  Eye, 
  Ruler, 
  Maximize2, 
  Minimize2,
  Info,
  Copy,
  Check,
  Download,
  Upload,
  Save,
  Trash2
} from 'lucide-react';

interface Device {
  id: string;
  name: string;
  width: number;
  height: number;
  icon: React.ComponentType<any>;
  category: 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'tv';
  userAgent?: string;
  pixelRatio?: number;
}

interface CustomDevice {
  id: string;
  name: string;
  width: number;
  height: number;
  category: string;
}

interface TestSession {
  id: string;
  name: string;
  url: string;
  devices: string[];
  createdAt: Date;
}

const ResponsiveTester: React.FC = () => {
  const [url, setUrl] = useState('');
  const [selectedDevices, setSelectedDevices] = useState<string[]>(['iphone-14', 'ipad', 'macbook']);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [showRulers, setShowRulers] = useState(false);
  const [customDevices, setCustomDevices] = useState<CustomDevice[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [testSessions, setTestSessions] = useState<TestSession[]>([]);
  const [currentSession, setCurrentSession] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRefs = useRef<{ [key: string]: HTMLIFrameElement | null }>({});

  // Dispositivos pré-definidos
  const predefinedDevices: Device[] = [
    // Mobile
    {
      id: 'iphone-14',
      name: 'iPhone 14',
      width: 390,
      height: 844,
      icon: Smartphone,
      category: 'mobile',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      pixelRatio: 3
    },
    {
      id: 'iphone-14-pro',
      name: 'iPhone 14 Pro',
      width: 393,
      height: 852,
      icon: Smartphone,
      category: 'mobile',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      pixelRatio: 3
    },
    {
      id: 'samsung-s23',
      name: 'Samsung Galaxy S23',
      width: 360,
      height: 780,
      icon: Smartphone,
      category: 'mobile',
      userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36',
      pixelRatio: 3
    },
    {
      id: 'pixel-7',
      name: 'Google Pixel 7',
      width: 412,
      height: 915,
      icon: Smartphone,
      category: 'mobile',
      userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36',
      pixelRatio: 2.625
    },

    // Tablet
    {
      id: 'ipad',
      name: 'iPad',
      width: 768,
      height: 1024,
      icon: Tablet,
      category: 'tablet',
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      pixelRatio: 2
    },
    {
      id: 'ipad-pro',
      name: 'iPad Pro 12.9"',
      width: 1024,
      height: 1366,
      icon: Tablet,
      category: 'tablet',
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      pixelRatio: 2
    },
    {
      id: 'surface-pro',
      name: 'Surface Pro',
      width: 912,
      height: 1368,
      icon: Tablet,
      category: 'tablet',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      pixelRatio: 1.5
    },

    // Laptop
    {
      id: 'macbook',
      name: 'MacBook Air',
      width: 1280,
      height: 832,
      icon: Laptop,
      category: 'laptop',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      pixelRatio: 2
    },
    {
      id: 'macbook-pro',
      name: 'MacBook Pro 16"',
      width: 1512,
      height: 982,
      icon: Laptop,
      category: 'laptop',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      pixelRatio: 2
    },

    // Desktop
    {
      id: 'desktop-hd',
      name: 'Desktop HD',
      width: 1920,
      height: 1080,
      icon: Monitor,
      category: 'desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      pixelRatio: 1
    },
    {
      id: 'desktop-4k',
      name: 'Desktop 4K',
      width: 3840,
      height: 2160,
      icon: Monitor,
      category: 'desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      pixelRatio: 1
    },

    // TV
    {
      id: 'tv-hd',
      name: 'TV HD',
      width: 1920,
      height: 1080,
      icon: Tv,
      category: 'tv',
      userAgent: 'Mozilla/5.0 (SMART-TV; Linux; Tizen 6.0) AppleWebKit/537.36',
      pixelRatio: 1
    }
  ];

  // Combinar dispositivos pré-definidos com customizados
  const allDevices = [
    ...predefinedDevices,
    ...customDevices.map(device => ({
      ...device,
      icon: Monitor,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      pixelRatio: 1
    }))
  ];

  // Carregar dados salvos
  useEffect(() => {
    const savedCustomDevices = localStorage.getItem('responsive-tester-custom-devices');
    const savedSessions = localStorage.getItem('responsive-tester-sessions');
    
    if (savedCustomDevices) {
      try {
        setCustomDevices(JSON.parse(savedCustomDevices));
      } catch (error) {
        console.error('Error loading custom devices:', error);
      }
    }
    
    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions);
        setTestSessions(sessions.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt)
        })));
      } catch (error) {
        console.error('Error loading sessions:', error);
      }
    }
  }, []);

  // Salvar dispositivos customizados
  const saveCustomDevices = useCallback((devices: CustomDevice[]) => {
    localStorage.setItem('responsive-tester-custom-devices', JSON.stringify(devices));
    setCustomDevices(devices);
  }, []);

  // Salvar sessões
  const saveSessions = useCallback((sessions: TestSession[]) => {
    localStorage.setItem('responsive-tester-sessions', JSON.stringify(sessions));
    setTestSessions(sessions);
  }, []);

  // Adicionar dispositivo customizado
  const addCustomDevice = useCallback((device: Omit<CustomDevice, 'id'>) => {
    const newDevice: CustomDevice = {
      ...device,
      id: `custom-${Date.now()}`
    };
    const updatedDevices = [...customDevices, newDevice];
    saveCustomDevices(updatedDevices);
  }, [customDevices, saveCustomDevices]);

  // Remover dispositivo customizado
  const removeCustomDevice = useCallback((id: string) => {
    const updatedDevices = customDevices.filter(device => device.id !== id);
    saveCustomDevices(updatedDevices);
    setSelectedDevices(prev => prev.filter(deviceId => deviceId !== id));
  }, [customDevices, saveCustomDevices]);

  // Salvar sessão de teste
  const saveTestSession = useCallback((name: string) => {
    const session: TestSession = {
      id: `session-${Date.now()}`,
      name,
      url,
      devices: selectedDevices,
      createdAt: new Date()
    };
    const updatedSessions = [session, ...testSessions];
    saveSessions(updatedSessions);
    setCurrentSession(session.id);
  }, [url, selectedDevices, testSessions, saveSessions]);

  // Carregar sessão de teste
  const loadTestSession = useCallback((session: TestSession) => {
    setUrl(session.url);
    setSelectedDevices(session.devices);
    setCurrentSession(session.id);
  }, []);

  // Remover sessão de teste
  const removeTestSession = useCallback((id: string) => {
    const updatedSessions = testSessions.filter(session => session.id !== id);
    saveSessions(updatedSessions);
    if (currentSession === id) {
      setCurrentSession('');
    }
  }, [testSessions, currentSession, saveSessions]);

  // Toggle device selection
  const toggleDevice = useCallback((deviceId: string) => {
    setSelectedDevices(prev => 
      prev.includes(deviceId) 
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    );
  }, []);

  // Refresh all iframes
  const refreshAll = useCallback(() => {
    Object.values(iframeRefs.current).forEach(iframe => {
      if (iframe) {
        iframe.src = iframe.src;
      }
    });
  }, []);

  // Get device dimensions with orientation
  const getDeviceDimensions = useCallback((device: Device | CustomDevice) => {
    const { width, height } = device;
    return orientation === 'landscape' 
      ? { width: height, height: width }
      : { width, height };
  }, [orientation]);

  // Copy URL
  const copyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  }, [url]);

  // Export test results
  const exportResults = useCallback(() => {
    const results = {
      url,
      devices: selectedDevices.map(id => {
        const device = allDevices.find(d => d.id === id);
        return device ? {
          id: device.id,
          name: device.name,
          dimensions: getDeviceDimensions(device),
          category: device.category
        } : null;
      }).filter(Boolean),
      orientation,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url_blob = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url_blob;
    a.download = `responsive-test-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url_blob);
  }, [url, selectedDevices, allDevices, orientation, getDeviceDimensions]);

  // Custom Device Form Component
  const CustomDeviceForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      width: '',
      height: '',
      category: 'desktop'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.name && formData.width && formData.height) {
        addCustomDevice({
          name: formData.name,
          width: parseInt(formData.width),
          height: parseInt(formData.height),
          category: formData.category
        });
        setFormData({ name: '', width: '', height: '', category: 'desktop' });
        setShowCustomForm(false);
      }
    };

    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Adicionar Dispositivo Customizado</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Dispositivo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: iPhone Custom"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Largura (px)
              </label>
              <input
                type="number"
                value={formData.width}
                onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="390"
                min="1"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Altura (px)
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="844"
                min="1"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
              <option value="laptop">Laptop</option>
              <option value="desktop">Desktop</option>
              <option value="tv">TV</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
            >
              Adicionar
            </button>
            <button
              type="button"
              onClick={() => setShowCustomForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Session Manager Component
  const SessionManager = () => {
    const [sessionName, setSessionName] = useState('');
    const [showSaveForm, setShowSaveForm] = useState(false);

    const handleSaveSession = (e: React.FormEvent) => {
      e.preventDefault();
      if (sessionName.trim()) {
        saveTestSession(sessionName.trim());
        setSessionName('');
        setShowSaveForm(false);
      }
    };

    return (
      <div className="space-y-4">
        {/* Save Session */}
        <div>
          {!showSaveForm ? (
            <button
              onClick={() => setShowSaveForm(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
            >
              <Save className="w-4 h-4" />
              Salvar Sessão
            </button>
          ) : (
            <form onSubmit={handleSaveSession} className="flex gap-2">
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                placeholder="Nome da sessão..."
                required
              />
              <button
                type="submit"
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowSaveForm(false)}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ✕
              </button>
            </form>
          )}
        </div>

        {/* Saved Sessions */}
        {testSessions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Sessões Salvas:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {testSessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between p-2 rounded border ${
                    currentSession === session.id 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {session.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {session.devices.length} dispositivos • {session.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => loadTestSession(session)}
                      className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                      title="Carregar sessão"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeTestSession(session.id)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      title="Remover sessão"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white overflow-auto' : 'w-full max-w-none'}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Monitor className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Testador Responsivo
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Teste a responsividade de websites em múltiplos dispositivos com media queries pré-estabelecidas e customizadas
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
        <div className="space-y-6">
          {/* URL Input */}
          <div>
            <InfoCard 
              title="URL para Teste"
              description="Digite a URL do website que deseja testar. Certifique-se de que o site permite ser carregado em iframes (não possui X-Frame-Options restritivo)."
            />
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="https://exemplo.com"
              />
              <button
                onClick={copyUrl}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Orientation */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Orientação:</label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setOrientation('portrait')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    orientation === 'portrait'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Retrato
                </button>
                <button
                  onClick={() => setOrientation('landscape')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    orientation === 'landscape'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Paisagem
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setShowRulers(!showRulers)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  showRulers 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Ruler className="w-4 h-4" />
                Réguas
              </button>

              <button
                onClick={refreshAll}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                Atualizar
              </button>

              <button
                onClick={exportResults}
                disabled={!url || selectedDevices.length === 0}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Device Selection Sidebar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Dispositivos</h2>
          </div>

          <div className="space-y-6">
            {/* Session Manager */}
            <SessionManager />

            {/* Device Categories */}
            {['mobile', 'tablet', 'laptop', 'desktop', 'tv'].map(category => {
              const categoryDevices = allDevices.filter(device => device.category === category);
              if (categoryDevices.length === 0) return null;

              const categoryIcons = {
                mobile: Smartphone,
                tablet: Tablet,
                laptop: Laptop,
                desktop: Monitor,
                tv: Tv
              };

              const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];

              return (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2 capitalize">
                    <CategoryIcon className="w-4 h-4" />
                    {category === 'mobile' ? 'Mobile' : 
                     category === 'tablet' ? 'Tablet' :
                     category === 'laptop' ? 'Laptop' :
                     category === 'desktop' ? 'Desktop' : 'TV'}
                  </h3>
                  <div className="space-y-2">
                    {categoryDevices.map(device => (
                      <div key={device.id} className="flex items-center justify-between">
                        <label className="flex items-center gap-3 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={selectedDevices.includes(device.id)}
                            onChange={() => toggleDevice(device.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800">
                              {device.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {getDeviceDimensions(device).width} × {getDeviceDimensions(device).height}
                            </div>
                          </div>
                        </label>
                        {device.id.startsWith('custom-') && (
                          <button
                            onClick={() => removeCustomDevice(device.id)}
                            className="p-1 text-red-500 hover:text-red-700 transition-colors"
                            title="Remover dispositivo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Custom Device Form */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Dispositivos Customizados</h3>
                <button
                  onClick={() => setShowCustomForm(!showCustomForm)}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-xs"
                >
                  <Settings className="w-3 h-3" />
                  {showCustomForm ? 'Cancelar' : 'Adicionar'}
                </button>
              </div>
              
              {showCustomForm && <CustomDeviceForm />}
            </div>
          </div>
        </div>

        {/* Device Previews */}
        <div className="lg:col-span-3">
          {selectedDevices.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-white/20 text-center">
              <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Nenhum dispositivo selecionado
              </h3>
              <p className="text-gray-500">
                Selecione um ou mais dispositivos na barra lateral para começar o teste
              </p>
            </div>
          ) : !url ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-white/20 text-center">
              <ExternalLink className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Digite uma URL para testar
              </h3>
              <p className="text-gray-500">
                Insira a URL do website que deseja testar nos dispositivos selecionados
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {selectedDevices.map(deviceId => {
                const device = allDevices.find(d => d.id === deviceId);
                if (!device) return null;

                const dimensions = getDeviceDimensions(device);
                const scale = Math.min(1, 400 / Math.max(dimensions.width, dimensions.height));
                const DeviceIcon = device.icon;

                return (
                  <div
                    key={deviceId}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
                  >
                    {/* Device Header */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <DeviceIcon className="w-5 h-5 text-blue-600" />
                          <div>
                            <h3 className="font-semibold text-gray-800">{device.name}</h3>
                            <p className="text-sm text-gray-600">
                              {dimensions.width} × {dimensions.height}px
                              {orientation === 'landscape' && ' (Paisagem)'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const iframe = iframeRefs.current[deviceId];
                              if (iframe) iframe.src = iframe.src;
                            }}
                            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                            title="Atualizar"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => window.open(url, '_blank')}
                            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                            title="Abrir em nova aba"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Device Preview */}
                    <div className="p-6">
                      <div 
                        className="relative mx-auto border border-gray-300 rounded-lg overflow-hidden shadow-lg"
                        style={{
                          width: dimensions.width * scale,
                          height: dimensions.height * scale
                        }}
                      >
                        {showRulers && (
                          <>
                            {/* Horizontal Ruler */}
                            <div className="absolute -top-6 left-0 right-0 h-6 bg-gray-100 border-b border-gray-300 flex items-center justify-center text-xs text-gray-600">
                              {dimensions.width}px
                            </div>
                            {/* Vertical Ruler */}
                            <div className="absolute -left-6 top-0 bottom-0 w-6 bg-gray-100 border-r border-gray-300 flex items-center justify-center text-xs text-gray-600 writing-mode-vertical">
                              {dimensions.height}px
                            </div>
                          </>
                        )}
                        
                        <iframe
                          ref={(el) => {
                            if (el) iframeRefs.current[deviceId] = el;
                          }}
                          src={url}
                          className="w-full h-full border-0"
                          style={{
                            transform: `scale(${scale})`,
                            transformOrigin: 'top left',
                            width: `${100 / scale}%`,
                            height: `${100 / scale}%`
                          }}
                          title={`${device.name} Preview`}
                          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                        />
                      </div>
                      
                      <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">
                          Escala: {Math.round(scale * 100)}% • 
                          Categoria: {device.category} • 
                          Orientação: {orientation === 'portrait' ? 'Retrato' : 'Paisagem'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="mt-8 grid md:grid-cols-4 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Monitor className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-2">Múltiplos Dispositivos</h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                Teste em smartphones, tablets, laptops, desktops e TVs simultaneamente
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-purple-900 mb-2">Dispositivos Customizados</h3>
              <p className="text-xs text-purple-700 leading-relaxed">
                Adicione suas próprias resoluções e dimensões personalizadas
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <RotateCcw className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-900 mb-2">Orientação Dinâmica</h3>
              <p className="text-xs text-green-700 leading-relaxed">
                Alterne entre modo retrato e paisagem para todos os dispositivos
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Save className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-orange-900 mb-2">Sessões de Teste</h3>
              <p className="text-xs text-orange-700 leading-relaxed">
                Salve e carregue configurações de teste para reutilização
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveTester;