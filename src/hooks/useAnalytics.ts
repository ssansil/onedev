import { useState, useEffect, useCallback } from 'react';

export interface ToolUsage {
  id: string;
  name: string;
  uses: number;
  lastUsed: Date | null;
}

export interface SessionData {
  sessionId: string;
  startTime: Date;
  totalSessions: number;
  currentSession: number;
}

export interface AnalyticsData {
  toolUsage: ToolUsage[];
  sessionData: SessionData;
  totalUsage: number;
}

const STORAGE_KEYS = {
  TOOL_USAGE: 'onedev-tool-usage',
  SESSION_DATA: 'onedev-session-data',
  COOKIE_CONSENT: 'onedev-cookie-consent',
  COOKIE_SETTINGS: 'onedev-cookie-settings'
};

const DEFAULT_TOOLS: ToolUsage[] = [
  { id: 'seo', name: 'Gerador de SEO', uses: 0, lastUsed: null },
  { id: 'json', name: 'Formatador JSON', uses: 0, lastUsed: null },
  { id: 'cpf-cnpj', name: 'Gerador CPF/CNPJ', uses: 0, lastUsed: null },
  { id: 'credit-card', name: 'Gerador de Cartão', uses: 0, lastUsed: null },
  { id: 'line-counter', name: 'Contador de Linhas', uses: 0, lastUsed: null },
  { id: 'qr-code', name: 'Gerador de QR Code', uses: 0, lastUsed: null },
  { id: 'responsive-tester', name: 'Testador Responsivo', uses: 0, lastUsed: null },
  { id: 'uuid-hash-token', name: 'UUID, Hash & Token', uses: 0, lastUsed: null },
  { id: 'jwt-validator', name: 'Validador JWT', uses: 0, lastUsed: null },
  { id: 'base64', name: 'Base64 Encode/Decode', uses: 0, lastUsed: null },
  { id: 'url', name: 'URL Encode/Decode', uses: 0, lastUsed: null },
  { id: 'markdown', name: 'Editor de Markdown', uses: 0, lastUsed: null },
  { id: 'lorem-ipsum', name: 'Gerador Lorem Ipsum', uses: 0, lastUsed: null },
  { id: 'device-generator', name: 'Gerador de Dispositivo', uses: 0, lastUsed: null },
  { id: 'person-generator', name: 'Gerador de Pessoa', uses: 0, lastUsed: null },
  { id: 'company-generator', name: 'Gerador de Empresa', uses: 0, lastUsed: null },
  { id: 'cep-generator', name: 'Gerador de CEP', uses: 0, lastUsed: null },
  { id: 'fake-rest-api', name: 'Gerador REST API Fake', uses: 0, lastUsed: null },
];

export const useAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    toolUsage: DEFAULT_TOOLS,
    sessionData: {
      sessionId: '',
      startTime: new Date(),
      totalSessions: 0,
      currentSession: 0
    },
    totalUsage: 0
  });

  const [cookieConsent, setCookieConsent] = useState<boolean | null>(null);
  const [cookieSettings, setCookieSettings] = useState({
    essential: true,
    analytics: true,
    preferences: true,
    functional: true
  });

  // Initialize analytics data
  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEYS.COOKIE_CONSENT);
    const settings = localStorage.getItem(STORAGE_KEYS.COOKIE_SETTINGS);
    
    if (consent) {
      setCookieConsent(JSON.parse(consent));
    }
    
    if (settings) {
      setCookieSettings(JSON.parse(settings));
    }

    // Load existing data if consent is given
    if (consent === 'true') {
      loadAnalyticsData();
    }
  }, []);

  const loadAnalyticsData = useCallback(() => {
    try {
      // Load tool usage
      const savedUsage = localStorage.getItem(STORAGE_KEYS.TOOL_USAGE);
      let toolUsage = DEFAULT_TOOLS;
      
      if (savedUsage) {
        const parsed = JSON.parse(savedUsage);
        toolUsage = parsed.map((item: any) => ({
          ...item,
          lastUsed: item.lastUsed ? new Date(item.lastUsed) : null
        }));
      }

      // Load or create session data
      const savedSession = localStorage.getItem(STORAGE_KEYS.SESSION_DATA);
      let sessionData;
      
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        sessionData = {
          ...parsed,
          startTime: new Date(parsed.startTime),
          currentSession: parsed.currentSession + 1
        };
      } else {
        sessionData = {
          sessionId: generateSessionId(),
          startTime: new Date(),
          totalSessions: 1,
          currentSession: 1
        };
      }

      // Update session data
      sessionData.totalSessions = sessionData.currentSession;
      localStorage.setItem(STORAGE_KEYS.SESSION_DATA, JSON.stringify(sessionData));

      const totalUsage = toolUsage.reduce((sum, tool) => sum + tool.uses, 0);

      setAnalyticsData({
        toolUsage,
        sessionData,
        totalUsage
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  }, []);

  const generateSessionId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const trackToolUsage = useCallback((toolId: string) => {
    if (!cookieConsent || !cookieSettings.analytics) return;

    setAnalyticsData(prev => {
      const updatedUsage = prev.toolUsage.map(tool => 
        tool.id === toolId 
          ? { ...tool, uses: tool.uses + 1, lastUsed: new Date() }
          : tool
      );

      const totalUsage = updatedUsage.reduce((sum, tool) => sum + tool.uses, 0);

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEYS.TOOL_USAGE, JSON.stringify(updatedUsage));
      } catch (error) {
        console.error('Error saving tool usage:', error);
      }

      return {
        ...prev,
        toolUsage: updatedUsage,
        totalUsage
      };
    });
  }, [cookieConsent, cookieSettings.analytics]);

  const acceptCookies = useCallback((settings = cookieSettings) => {
    setCookieConsent(true);
    setCookieSettings(settings);
    
    localStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT, 'true');
    localStorage.setItem(STORAGE_KEYS.COOKIE_SETTINGS, JSON.stringify(settings));
    
    if (settings.analytics) {
      loadAnalyticsData();
    }
  }, [cookieSettings, loadAnalyticsData]);

  const declineCookies = useCallback(() => {
    setCookieConsent(false);
    setCookieSettings({
      essential: true,
      analytics: false,
      preferences: false,
      functional: false
    });
    
    localStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT, 'false');
    localStorage.setItem(STORAGE_KEYS.COOKIE_SETTINGS, JSON.stringify({
      essential: true,
      analytics: false,
      preferences: false,
      functional: false
    }));

    // Clear analytics data
    localStorage.removeItem(STORAGE_KEYS.TOOL_USAGE);
    localStorage.removeItem(STORAGE_KEYS.SESSION_DATA);
  }, []);

  const updateCookieSettings = useCallback((newSettings: typeof cookieSettings) => {
    setCookieSettings(newSettings);
    localStorage.setItem(STORAGE_KEYS.COOKIE_SETTINGS, JSON.stringify(newSettings));
    
    if (!newSettings.analytics) {
      // Clear analytics data if analytics is disabled
      localStorage.removeItem(STORAGE_KEYS.TOOL_USAGE);
      localStorage.removeItem(STORAGE_KEYS.SESSION_DATA);
      setAnalyticsData(prev => ({
        ...prev,
        toolUsage: DEFAULT_TOOLS,
        totalUsage: 0
      }));
    } else if (cookieConsent) {
      loadAnalyticsData();
    }
  }, [cookieConsent, loadAnalyticsData]);

  const clearAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOOL_USAGE);
    localStorage.removeItem(STORAGE_KEYS.SESSION_DATA);
    localStorage.removeItem(STORAGE_KEYS.COOKIE_CONSENT);
    localStorage.removeItem(STORAGE_KEYS.COOKIE_SETTINGS);
    
    setCookieConsent(null);
    setCookieSettings({
      essential: true,
      analytics: true,
      preferences: true,
      functional: true
    });
    
    setAnalyticsData({
      toolUsage: DEFAULT_TOOLS,
      sessionData: {
        sessionId: '',
        startTime: new Date(),
        totalSessions: 0,
        currentSession: 0
      },
      totalUsage: 0
    });
  }, []);

  return {
    analyticsData,
    cookieConsent,
    cookieSettings,
    trackToolUsage,
    acceptCookies,
    declineCookies,
    updateCookieSettings,
    clearAllData,
    loadAnalyticsData
  };
};