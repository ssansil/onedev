import React, { useState, useEffect } from 'react';
import { Cookie, X, Shield, Check, Settings, Info } from 'lucide-react';

interface CookieModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onCustomize: () => void;
}

const CookieModal: React.FC<CookieModalProps> = ({ isOpen, onAccept, onDecline, onCustomize }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Cookie className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              🍪 Configuração de Cookies
            </h3>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <p className="text-gray-700 leading-relaxed">
              Utilizamos cookies para melhorar sua experiência. A contagem de uso das ferramentas é 
              <strong> obrigatória</strong> e sempre ativa, mas você pode escolher sobre outros tipos de cookies.
              <strong> Todos os dados permanecem no seu navegador.</strong>
            </p>

            {/* Mandatory Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Contagem Obrigatória</h4>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    A contagem de uso das ferramentas é sempre ativa para melhorar sua experiência. 
                    Estes dados ficam apenas no seu navegador.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-green-900 mb-1">100% Local</h4>
                  <p className="text-xs text-green-700 leading-relaxed">
                    Nenhum dado é enviado para servidores. Tudo fica armazenado localmente no seu navegador.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">O que coletamos:</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Obrigatório:</strong> Contagem de uso de cada ferramenta
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Opcional:</strong> Número de sessões ativas
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Opcional:</strong> Preferências de tema e configurações
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Opcional:</strong> Última ferramenta utilizada
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={onAccept}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Check className="w-4 h-4" />
              Aceitar Todos
            </button>
            
            <button
              onClick={onCustomize}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Settings className="w-4 h-4" />
              Personalizar
            </button>
            
            <button
              onClick={onDecline}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <X className="w-4 h-4" />
              Apenas Obrigatórios
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            A contagem de uso das ferramentas permanece sempre ativa. Você pode alterar outras preferências a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookieModal;