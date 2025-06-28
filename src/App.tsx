import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import SEOGenerator from './components/SEOGenerator';
import JSONFormatter from './components/JSONFormatter';
import CPFCNPJGenerator from './components/CPFCNPJGenerator';
import CreditCardGenerator from './components/CreditCardGenerator';
import LineCharacterCounter from './components/LineCharacterCounter';
import QRCodeGenerator from './components/QRCodeGenerator';
import ResponsiveTester from './components/ResponsiveTester';
import UUIDHashTokenGenerator from './components/UUIDHashTokenGenerator';
import JWTValidator from './components/JWTValidator';
import Base64Tool from './components/Base64Tool';
import URLTool from './components/URLTool';
import MarkdownEditor from './components/MarkdownEditor';
//import LoremIpsumGenerator from './components/LoremIpsumGenerator';
import PrivacyPolicy from './components/PrivacyPolicy';
import CookiePolicy from './components/CookiePolicy';
import LGPDInfo from './components/LGPDInfo';
import About from './components/About';
import Changelog from './components/Changelog';
import CookieModal from './components/CookieModal';
import CookieSettingsModal, { CookieSettings } from './components/CookieSettings';
import { useAnalytics } from './hooks/useAnalytics';

function App() {
  const [currentTool, setCurrentTool] = useState('dashboard');
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  
  const {
    cookieConsent,
    cookieSettings,
    trackToolUsage,
    acceptCookies,
    declineCookies,
    updateCookieSettings
  } = useAnalytics();

  useEffect(() => {
    const handleToolChange = (event: CustomEvent) => {
      const toolId = event.detail;
      setCurrentTool(toolId);
      
      // Track tool usage if analytics is enabled
      if (cookieConsent && cookieSettings.analytics) {
        trackToolUsage(toolId);
      }
    };

    window.addEventListener('toolChange', handleToolChange as EventListener);
    
    return () => {
      window.removeEventListener('toolChange', handleToolChange as EventListener);
    };
  }, [cookieConsent, cookieSettings.analytics, trackToolUsage]);

  // Show cookie modal if consent hasn't been given
  useEffect(() => {
    if (cookieConsent === null) {
      setShowCookieModal(true);
    }
  }, [cookieConsent]);

  const handleAcceptCookies = () => {
    acceptCookies();
    setShowCookieModal(false);
  };

  const handleDeclineCookies = () => {
    declineCookies();
    setShowCookieModal(false);
  };

  const handleCustomizeCookies = () => {
    setShowCookieModal(false);
    setShowCookieSettings(true);
  };

  const handleSaveCookieSettings = (settings: CookieSettings) => {
    updateCookieSettings(settings);
    acceptCookies(settings);
  };

  const renderCurrentTool = () => {
    switch (currentTool) {
      case 'dashboard':
        return <Dashboard />;
      case 'seo':
        return <SEOGenerator />;
      case 'json':
        return <JSONFormatter />;
      case 'cpf-cnpj':
        return <CPFCNPJGenerator />;
      case 'credit-card':
        return <CreditCardGenerator />;
      case 'line-counter':
        return <LineCharacterCounter />;
      case 'qr-code':
        return <QRCodeGenerator />;
      case 'responsive-tester':
        return <ResponsiveTester />;
      case 'uuid-hash-token':
        return <UUIDHashTokenGenerator />;
      case 'jwt-validator':
        return <JWTValidator />;
      case 'base64':
        return <Base64Tool />;
      case 'url':
        return <URLTool />;
      case 'markdown':
        return <MarkdownEditor />;
      case 'privacy':
        return <PrivacyPolicy />;
      case 'cookies':
        return <CookiePolicy />;
      case 'lgpd':
        return <LGPDInfo />;
      case 'about':
        return <About />;
      case 'changelog':
        return <Changelog />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Layout currentTool={currentTool}>
        {renderCurrentTool()}
      </Layout>

      {/* Cookie Modal */}
      <CookieModal
        isOpen={showCookieModal}
        onAccept={handleAcceptCookies}
        onDecline={handleDeclineCookies}
        onCustomize={handleCustomizeCookies}
      />

      {/* Cookie Settings Modal */}
      <CookieSettingsModal
        isOpen={showCookieSettings}
        onClose={() => setShowCookieSettings(false)}
        onSave={handleSaveCookieSettings}
        currentSettings={cookieSettings}
      />
    </>
  );
}

export default App;