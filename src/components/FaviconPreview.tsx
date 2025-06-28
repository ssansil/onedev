import React from 'react';
import { Globe, Smartphone, Monitor, Tablet, Star, Plus, X, RefreshCw } from 'lucide-react';

interface FaviconPreviewProps {
  faviconUrl: string;
  title: string;
}

const FaviconPreview: React.FC<FaviconPreviewProps> = ({ faviconUrl, title }) => {
  const defaultTitle = title || 'Minha Página';
  const shortTitle = defaultTitle.length > 20 ? defaultTitle.substring(0, 20) + '...' : defaultTitle;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-white/20">
      <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <Globe className="w-5 h-5 text-blue-600" />
        Visualização do Favicon
      </h3>

      <div className="space-y-6">
        {/* Browser Tab Preview */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Aba do Navegador (Desktop)
          </h4>
          <div className="bg-gray-100 rounded-lg p-4">
            {/* Chrome-like browser tab */}
            <div className="bg-white rounded-t-lg border border-gray-300 border-b-0 p-2 max-w-xs">
              <div className="flex items-center gap-2">
                {faviconUrl ? (
                  <img 
                    src={faviconUrl} 
                    alt="Favicon" 
                    className="w-4 h-4 flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-4 h-4 bg-gray-300 rounded flex-shrink-0 flex items-center justify-center ${faviconUrl ? 'hidden' : ''}`}>
                  <Globe className="w-3 h-3 text-gray-500" />
                </div>
                <span className="text-sm text-gray-700 truncate">{shortTitle}</span>
                <X className="w-3 h-3 text-gray-400 ml-auto flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Browser Preview */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Navegador Mobile
          </h4>
          <div className="bg-gray-900 rounded-lg p-4">
            {/* Mobile browser address bar */}
            <div className="bg-gray-800 rounded-lg p-3 mb-2">
              <div className="flex items-center gap-2 bg-gray-700 rounded-full px-3 py-2">
                {faviconUrl ? (
                  <img 
                    src={faviconUrl} 
                    alt="Favicon" 
                    className="w-4 h-4 flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-4 h-4 bg-gray-500 rounded flex-shrink-0 flex items-center justify-center ${faviconUrl ? 'hidden' : ''}`}>
                  <Globe className="w-3 h-3 text-gray-400" />
                </div>
                <span className="text-sm text-gray-300 truncate flex-1">{shortTitle}</span>
                <RefreshCw className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Bookmarks Preview */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4" />
            Favoritos
          </h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded px-3 py-2 shadow-sm">
                {faviconUrl ? (
                  <img 
                    src={faviconUrl} 
                    alt="Favicon" 
                    className="w-4 h-4 flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-4 h-4 bg-gray-300 rounded flex-shrink-0 flex items-center justify-center ${faviconUrl ? 'hidden' : ''}`}>
                  <Globe className="w-3 h-3 text-gray-500" />
                </div>
                <span className="text-sm text-gray-700">{shortTitle}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                  <Plus className="w-3 h-3 text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Home Screen Icon (PWA) */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Tablet className="w-4 h-4" />
            Ícone da Tela Inicial (PWA)
          </h4>
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-4">
            <div className="grid grid-cols-4 gap-3">
              {/* App icons grid */}
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  {i === 2 ? (
                    <>
                      {faviconUrl ? (
                        <img 
                          src={faviconUrl} 
                          alt="App Icon" 
                          className="w-12 h-12 rounded-xl shadow-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling!.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center ${faviconUrl ? 'hidden' : ''}`}>
                        <Globe className="w-6 h-6 text-gray-500" />
                      </div>
                      <span className="text-xs text-white text-center leading-tight">
                        {shortTitle.length > 10 ? shortTitle.substring(0, 8) + '..' : shortTitle}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-white/20 rounded-xl" />
                      <span className="text-xs text-white/60">App</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Size Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">📏 Tamanhos Recomendados</h4>
          <div className="text-xs text-blue-700 space-y-1">
            <div>• <strong>Favicon.ico:</strong> 16x16, 32x32, 48x48 pixels</div>
            <div>• <strong>Favicon SVG:</strong> Vetorial (recomendado)</div>
            <div>• <strong>Apple Touch Icon:</strong> 180x180 pixels</div>
            <div>• <strong>PWA Icons:</strong> 192x192, 512x512 pixels</div>
          </div>
        </div>

        {!faviconUrl && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Globe className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-amber-900">Nenhum favicon definido</h4>
                <p className="text-xs text-amber-700 mt-1">
                  Adicione uma URL de favicon na aba "Imagens" para ver a visualização.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaviconPreview;