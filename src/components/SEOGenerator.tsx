import React, { useState, useCallback, useRef } from 'react';
import { Copy, Check, Globe, Search, Share2, AlertCircle, Info, Upload, X, Eye, Facebook, Twitter, Image as ImageIcon, Palette, Crop, Scissors } from 'lucide-react';
import ImageCropModal from './ImageCropModal';
import FaviconPreview from './FaviconPreview';

interface SEOData {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  author: string;
  language: string;
  robots: string;
  viewport: string;
  themeColor: string;
  faviconUrl: string;
  faviconSvgUrl: string;
  appleTouchIcon: string;
  logoUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterCard: string;
}

interface ValidationState {
  title: { isValid: boolean; message: string; count: number };
  description: { isValid: boolean; message: string; count: number };
}

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: 'favicon' | 'image';
  originalUrl?: string;
}

interface CropModalState {
  isOpen: boolean;
  imageSrc: string;
  aspectRatio: number;
  title: string;
  description: string;
  targetField: keyof SEOData;
}

const SEOGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'social' | 'preview'>('basic');
  const [seoData, setSeoData] = useState<SEOData>({
    title: '',
    description: '',
    keywords: '',
    canonicalUrl: '',
    author: '',
    language: 'pt-BR',
    robots: 'index, follow',
    viewport: 'width=device-width, initial-scale=1.0',
    themeColor: '#ffffff',
    faviconUrl: '',
    faviconSvgUrl: '',
    appleTouchIcon: '',
    logoUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    ogUrl: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    twitterCard: 'summary_large_image'
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [copied, setCopied] = useState(false);
  const [cropModal, setCropModal] = useState<CropModalState>({
    isOpen: false,
    imageSrc: '',
    aspectRatio: 1.91,
    title: '',
    description: '',
    targetField: 'ogImage'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const validateField = useCallback((field: 'title' | 'description', value: string): ValidationState[typeof field] => {
    const count = value.length;
    
    if (field === 'title') {
      if (count === 0) {
        return { isValid: true, message: '', count };
      }
      if (count < 30) {
        return { isValid: false, message: 'Muito curto - recomendado 30-60 caracteres', count };
      }
      if (count > 60) {
        return { isValid: false, message: 'Muito longo - pode ser cortado nos resultados', count };
      }
      return { isValid: true, message: 'Tamanho ideal', count };
    }
    
    if (field === 'description') {
      if (count === 0) {
        return { isValid: true, message: '', count };
      }
      if (count < 120) {
        return { isValid: false, message: 'Muito curta - recomendado 120-160 caracteres', count };
      }
      if (count > 160) {
        return { isValid: false, message: 'Muito longa - pode ser cortada nos resultados', count };
      }
      return { isValid: true, message: 'Tamanho ideal', count };
    }
    
    return { isValid: true, message: '', count };
  }, []);

  const [validation, setValidation] = useState<ValidationState>({
    title: { isValid: true, message: '', count: 0 },
    description: { isValid: true, message: '', count: 0 }
  });

  const updateField = useCallback((field: keyof SEOData, value: string) => {
    setSeoData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'title' || field === 'description') {
      const fieldValidation = validateField(field, value);
      setValidation(prev => ({
        ...prev,
        [field]: fieldValidation
      }));
    }
  }, [validateField]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'favicon' | 'image') => {
    const file = event.target.files?.[0];
    if (file) {
      // Create temporary URL for preview
      const url = URL.createObjectURL(file);
      const uploadedFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        url,
        type,
        originalUrl: url
      };
      
      setUploadedFiles(prev => [...prev, uploadedFile]);
      
      // Auto-assign to appropriate field based on type
      if (type === 'favicon') {
        if (file.name.endsWith('.ico')) {
          updateField('faviconUrl', url);
        } else if (file.name.endsWith('.svg')) {
          updateField('faviconSvgUrl', url);
        } else {
          updateField('appleTouchIcon', url);
        }
      } else {
        updateField('logoUrl', url);
      }
    }
  };

  const openCropModal = (imageSrc: string, targetField: keyof SEOData, aspectRatio: number, title: string, description: string) => {
    setCropModal({
      isOpen: true,
      imageSrc,
      aspectRatio,
      title,
      description,
      targetField
    });
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    updateField(cropModal.targetField, croppedImageUrl);
    
    // Update uploaded files with cropped version
    setUploadedFiles(prev => prev.map(file => {
      if (file.url === cropModal.imageSrc) {
        return { ...file, url: croppedImageUrl };
      }
      return file;
    }));
  };

  const removeUploadedFile = (id: string) => {
    const file = uploadedFiles.find(f => f.id === id);
    if (file) {
      URL.revokeObjectURL(file.url);
      if (file.originalUrl && file.originalUrl !== file.url) {
        URL.revokeObjectURL(file.originalUrl);
      }
      setUploadedFiles(prev => prev.filter(f => f.id !== id));
      
      // Remove from SEO data if it matches
      Object.entries(seoData).forEach(([key, value]) => {
        if (value === file.url) {
          updateField(key as keyof SEOData, '');
        }
      });
    }
  };

  const generateHTML = useCallback(() => {
    const lines = [];
    
    // Basic meta tags
    lines.push('<!-- Basic Meta Tags -->');
    lines.push('<meta charset="UTF-8">');
    
    if (seoData.viewport) {
      lines.push(`<meta name="viewport" content="${seoData.viewport}">`);
    }
    
    if (seoData.themeColor) {
      lines.push(`<meta name="theme-color" content="${seoData.themeColor}">`);
    }
    
    if (seoData.title) {
      lines.push(`<title>${seoData.title}</title>`);
    }
    
    if (seoData.description) {
      lines.push(`<meta name="description" content="${seoData.description}">`);
    }
    
    if (seoData.keywords) {
      lines.push(`<meta name="keywords" content="${seoData.keywords}">`);
    }
    
    if (seoData.author) {
      lines.push(`<meta name="author" content="${seoData.author}">`);
    }
    
    if (seoData.language) {
      lines.push(`<meta name="language" content="${seoData.language}">`);
    }
    
    if (seoData.robots) {
      lines.push(`<meta name="robots" content="${seoData.robots}">`);
    }
    
    // Favicon and Icons
    if (seoData.faviconUrl || seoData.faviconSvgUrl || seoData.appleTouchIcon) {
      lines.push('');
      lines.push('<!-- Favicon and Icons -->');
      
      if (seoData.faviconUrl) {
        lines.push(`<link rel="icon" type="image/x-icon" href="${seoData.faviconUrl}">`);
      }
      
      if (seoData.faviconSvgUrl) {
        lines.push(`<link rel="icon" type="image/svg+xml" href="${seoData.faviconSvgUrl}">`);
      }
      
      if (seoData.appleTouchIcon) {
        lines.push(`<link rel="apple-touch-icon" href="${seoData.appleTouchIcon}">`);
      }
    }
    
    if (seoData.canonicalUrl) {
      lines.push('');
      lines.push('<!-- Canonical URL -->');
      lines.push(`<link rel="canonical" href="${seoData.canonicalUrl}">`);
    }
    
    // Open Graph
    const ogTitle = seoData.ogTitle || seoData.title;
    const ogDescription = seoData.ogDescription || seoData.description;
    const ogUrl = seoData.ogUrl || seoData.canonicalUrl;
    const ogImage = seoData.ogImage || seoData.logoUrl;
    
    if (ogTitle || ogDescription || ogImage || ogUrl) {
      lines.push('');
      lines.push('<!-- Open Graph Meta Tags -->');
      lines.push('<meta property="og:type" content="website">');
      
      if (ogTitle) {
        lines.push(`<meta property="og:title" content="${ogTitle}">`);
      }
      
      if (ogDescription) {
        lines.push(`<meta property="og:description" content="${ogDescription}">`);
      }
      
      if (ogImage) {
        lines.push(`<meta property="og:image" content="${ogImage}">`);
      }
      
      if (ogUrl) {
        lines.push(`<meta property="og:url" content="${ogUrl}">`);
      }
    }
    
    // Twitter Card
    const twitterTitle = seoData.twitterTitle || seoData.ogTitle || seoData.title;
    const twitterDescription = seoData.twitterDescription || seoData.ogDescription || seoData.description;
    const twitterImage = seoData.twitterImage || seoData.ogImage || seoData.logoUrl;
    
    if (twitterTitle || twitterDescription || twitterImage) {
      lines.push('');
      lines.push('<!-- Twitter Card Meta Tags -->');
      lines.push(`<meta name="twitter:card" content="${seoData.twitterCard}">`);
      
      if (twitterTitle) {
        lines.push(`<meta name="twitter:title" content="${twitterTitle}">`);
      }
      
      if (twitterDescription) {
        lines.push(`<meta name="twitter:description" content="${twitterDescription}">`);
      }
      
      if (twitterImage) {
        lines.push(`<meta name="twitter:image" content="${twitterImage}">`);
      }
    }
    
    return lines.join('\n');
  }, [seoData]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateHTML());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getValidationColor = (field: 'title' | 'description') => {
    const fieldValidation = validation[field];
    if (!fieldValidation.message) return 'text-gray-500';
    return fieldValidation.isValid ? 'text-green-600' : 'text-amber-600';
  };

  const getInputBorderColor = (field: 'title' | 'description') => {
    const fieldValidation = validation[field];
    if (!fieldValidation.message) return 'border-gray-300 focus:ring-blue-500 focus:border-transparent';
    return fieldValidation.isValid 
      ? 'border-green-300 focus:ring-green-500 focus:border-transparent' 
      : 'border-amber-300 focus:ring-amber-500 focus:border-transparent';
  };

  const InfoCard = ({ title, description }: { title: string; description: string }) => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
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
    { id: 'basic', name: 'Básico', icon: Globe },
    { id: 'images', name: 'Imagens', icon: ImageIcon },
    { id: 'social', name: 'Redes Sociais', icon: Share2 },
    { id: 'preview', name: 'Visualizar', icon: Eye }
  ];

  const renderBasicTab = () => (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <InfoCard 
          title="Título da Página"
          description="O título que aparece na aba do navegador e nos resultados de busca. Deve ser único, descritivo e conter palavras-chave importantes. Ideal entre 30-60 caracteres."
        />
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título da Página
        </label>
        <input
          type="text"
          value={seoData.title}
          onChange={(e) => updateField('title', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg transition-all ${getInputBorderColor('title')}`}
          placeholder="Ex: Minha Página Incrível - Solução Completa"
        />
        <div className="flex items-center justify-between mt-1">
          <div className={`text-xs flex items-center gap-1 ${getValidationColor('title')}`}>
            {validation.title.message && (
              <>
                <AlertCircle className="w-3 h-3" />
                {validation.title.message}
              </>
            )}
          </div>
          <span className={`text-xs ${getValidationColor('title')}`}>
            {validation.title.count}/60
          </span>
        </div>
      </div>

      {/* Description */}
      <div>
        <InfoCard 
          title="Meta Description"
          description="Resumo da página que aparece nos resultados de busca. Deve ser atrativo e informativo para incentivar cliques. Ideal entre 120-160 caracteres."
        />
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição (Meta Description)
        </label>
        <textarea
          value={seoData.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={3}
          className={`w-full px-4 py-3 border rounded-lg transition-all resize-none ${getInputBorderColor('description')}`}
          placeholder="Descrição concisa e atrativa que aparecerá nos resultados de busca..."
        />
        <div className="flex items-center justify-between mt-1">
          <div className={`text-xs flex items-center gap-1 ${getValidationColor('description')}`}>
            {validation.description.message && (
              <>
                <AlertCircle className="w-3 h-3" />
                {validation.description.message}
              </>
            )}
          </div>
          <span className={`text-xs ${getValidationColor('description')}`}>
            {validation.description.count}/160
          </span>
        </div>
      </div>

      {/* Keywords */}
      <div>
        <InfoCard 
          title="Palavras-chave"
          description="Termos relevantes separados por vírgula que descrevem o conteúdo da página. Ajudam os buscadores a entender o tema principal."
        />
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Palavras-chave
        </label>
        <input
          type="text"
          value={seoData.keywords}
          onChange={(e) => updateField('keywords', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="seo, otimização, marketing digital, website"
        />
      </div>

      {/* Canonical URL */}
      <div>
        <InfoCard 
          title="URL Canônica"
          description="A URL principal da página. Evita conteúdo duplicado e informa aos buscadores qual é a versão oficial da página."
        />
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL Canônica
        </label>
        <input
          type="url"
          value={seoData.canonicalUrl}
          onChange={(e) => updateField('canonicalUrl', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="https://meusite.com/pagina-principal"
        />
      </div>

      {/* Author */}
      <div>
        <InfoCard 
          title="Autor"
          description="Nome do autor ou empresa responsável pelo conteúdo. Ajuda a estabelecer autoridade e credibilidade."
        />
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Autor
        </label>
        <input
          type="text"
          value={seoData.author}
          onChange={(e) => updateField('author', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="João Silva ou Minha Empresa"
        />
      </div>

      {/* Language */}
      <div>
        <InfoCard 
          title="Idioma"
          description="Idioma principal do conteúdo da página. Ajuda os buscadores a exibir o site para o público correto."
        />
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Idioma
        </label>
        <select
          value={seoData.language}
          onChange={(e) => updateField('language', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="pt-BR">Português (Brasil)</option>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </select>
      </div>

      {/* Robots */}
      <div>
        <InfoCard 
          title="Robots"
          description="Instrui os robôs dos buscadores sobre como indexar a página. 'Index, Follow' permite indexação e seguir links."
        />
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Robots
        </label>
        <select
          value={seoData.robots}
          onChange={(e) => updateField('robots', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="index, follow">Index, Follow</option>
          <option value="noindex, nofollow">NoIndex, NoFollow</option>
          <option value="index, nofollow">Index, NoFollow</option>
          <option value="noindex, follow">NoIndex, Follow</option>
        </select>
      </div>

      {/* Viewport */}
      <div>
        <InfoCard 
          title="Viewport"
          description="Controla como a página é exibida em dispositivos móveis. O valor padrão garante responsividade adequada."
        />
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Viewport
        </label>
        <input
          type="text"
          value={seoData.viewport}
          onChange={(e) => updateField('viewport', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="width=device-width, initial-scale=1.0"
        />
      </div>

      {/* Theme Color */}
      <div>
        <InfoCard 
          title="Cor do Tema"
          description="Define a cor da barra de status em dispositivos móveis e PWAs. Melhora a experiência visual do usuário."
        />
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cor do Tema
        </label>
        <div className="flex gap-3">
          <input
            type="color"
            value={seoData.themeColor}
            onChange={(e) => updateField('themeColor', e.target.value)}
            className="w-16 h-12 border border-gray-300 rounded-lg cursor-pointer"
          />
          <input
            type="text"
            value={seoData.themeColor}
            onChange={(e) => updateField('themeColor', e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="#ffffff"
          />
        </div>
      </div>
    </div>
  );

  const renderImagesTab = () => (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600" />
          Upload e Ajuste de Imagens
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favicon/Ícones
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e, 'favicon')}
              accept=".ico,.png,.svg,.jpg,.jpeg"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 transition-colors"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700">Selecionar Favicon</span>
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Suporta .ico, .png, .svg (até 2MB)
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagens para Redes Sociais
            </label>
            <input
              type="file"
              ref={imageInputRef}
              onChange={(e) => handleFileUpload(e, 'image')}
              accept=".png,.jpg,.jpeg,.webp"
              className="hidden"
            />
            <button
              onClick={() => imageInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 transition-colors"
            >
              <ImageIcon className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-700">Selecionar Imagem</span>
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Suporta .png, .jpg, .webp (até 5MB)
            </p>
          </div>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Arquivos Enviados:</h4>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border shadow-sm">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {file.type === 'favicon' ? (
                      <Palette className="w-6 h-6 text-gray-600" />
                    ) : (
                      <img 
                        src={file.url} 
                        alt={file.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling!.classList.remove('hidden');
                        }}
                      />
                    )}
                    <ImageIcon className="w-6 h-6 text-gray-600 hidden" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {file.type === 'favicon' ? 'Favicon/Ícone' : 'Imagem para redes sociais'}
                    </p>
                  </div>
                  
                  {file.type === 'image' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openCropModal(
                          file.originalUrl || file.url, 
                          'ogImage', 
                          1.91, 
                          'Ajustar para Facebook',
                          'Corte a imagem no formato ideal para Facebook (1200x630px)'
                        )}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors"
                      >
                        <Crop className="w-3 h-3" />
                        Facebook
                      </button>
                      <button
                        onClick={() => openCropModal(
                          file.originalUrl || file.url, 
                          'twitterImage', 
                          1.91, 
                          'Ajustar para Twitter',
                          'Corte a imagem no formato ideal para Twitter (1200x630px)'
                        )}
                        className="flex items-center gap-1 px-3 py-1 bg-cyan-50 text-cyan-700 rounded text-xs hover:bg-cyan-100 transition-colors"
                      >
                        <Scissors className="w-3 h-3" />
                        Twitter
                      </button>
                    </div>
                  )}
                  
                  <button
                    onClick={() => removeUploadedFile(file.id)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Favicon ICO */}
      <div>
        <InfoCard 
          title="Favicon (.ico)"
          description="Ícone pequeno que aparece na aba do navegador e favoritos. Formato .ico é compatível com navegadores mais antigos."
        />
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Favicon (.ico)
        </label>
        <input
          type="url"
          value={seoData.faviconUrl}
          onChange={(e) => updateField('faviconUrl', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="https://meusite.com/favicon.ico"
        />
      </div>

      {/* Favicon SVG */}
      <div>
        <InfoCard 
          title="Favicon SVG"
          description="Versão vetorial do favicon que se adapta melhor a diferentes tamanhos e temas (claro/escuro)."
        />
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Favicon SVG
        </label>
        <input
          type="url"
          value={seoData.faviconSvgUrl}
          onChange={(e) => updateField('faviconSvgUrl', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="https://meusite.com/favicon.svg"
        />
      </div>

      {/* Apple Touch Icon */}
      <div>
        <InfoCard 
          title="Apple Touch Icon"
          description="Ícone usado quando o site é adicionado à tela inicial em dispositivos iOS. Recomendado 180x180px."
        />
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Apple Touch Icon
        </label>
        <input
          type="url"
          value={seoData.appleTouchIcon}
          onChange={(e) => updateField('appleTouchIcon', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="https://meusite.com/apple-touch-icon.png"
        />
      </div>

      {/* Logo */}
      <div>
        <InfoCard 
          title="Logo/Imagem Principal"
          description="Imagem principal da marca que pode ser usada como fallback para redes sociais. Recomendado 1200x630px."
        />
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Logo/Imagem Principal
        </label>
        <input
          type="url"
          value={seoData.logoUrl}
          onChange={(e) => updateField('logoUrl', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="https://meusite.com/logo.png"
        />
      </div>
    </div>
  );

  const renderSocialTab = () => (
    <div className="space-y-8">
      {/* Open Graph */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2 flex items-center gap-2">
          <Facebook className="w-5 h-5 text-blue-600" />
          Open Graph (Facebook)
        </h3>
        
        {/* OG Title */}
        <div>
          <InfoCard 
            title="Título Open Graph"
            description="Título específico para compartilhamento no Facebook e outras redes. Se vazio, usará o título principal da página."
          />
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título OG (opcional)
          </label>
          <input
            type="text"
            value={seoData.ogTitle}
            onChange={(e) => updateField('ogTitle', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Título otimizado para redes sociais"
          />
        </div>

        {/* OG Description */}
        <div>
          <InfoCard 
            title="Descrição Open Graph"
            description="Descrição específica para compartilhamento. Se vazia, usará a meta description principal."
          />
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição OG (opcional)
          </label>
          <textarea
            value={seoData.ogDescription}
            onChange={(e) => updateField('ogDescription', e.target.value)}
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            placeholder="Descrição atrativa para compartilhamento"
          />
        </div>

        {/* OG Image */}
        <div>
          <InfoCard 
            title="Imagem Open Graph"
            description="Imagem que aparece quando o link é compartilhado. Se vazia, usará o logo. Ideal 1200x630px."
          />
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagem OG (opcional)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={seoData.ogImage}
              onChange={(e) => updateField('ogImage', e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="https://meusite.com/imagem-compartilhamento.jpg"
            />
            {seoData.ogImage && (
              <button
                onClick={() => openCropModal(
                  seoData.ogImage, 
                  'ogImage', 
                  1.91, 
                  'Ajustar Imagem Facebook',
                  'Corte a imagem no formato ideal para Facebook (1200x630px)'
                )}
                className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Crop className="w-4 h-4" />
                Ajustar
              </button>
            )}
          </div>
        </div>

        {/* OG URL */}
        <div>
          <InfoCard 
            title="URL Open Graph"
            description="URL específica para Open Graph. Se vazia, usará a URL canônica."
          />
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL OG (opcional)
          </label>
          <input
            type="url"
            value={seoData.ogUrl}
            onChange={(e) => updateField('ogUrl', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="https://meusite.com"
          />
        </div>
      </div>

      {/* Twitter Card */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-700 border-b border-gray-200 pb-2 flex items-center gap-2">
          <Twitter className="w-5 h-5 text-blue-400" />
          Twitter Card
        </h3>
        
        {/* Twitter Card Type */}
        <div>
          <InfoCard 
            title="Tipo de Card"
            description="Formato do card no Twitter. 'Summary Large Image' mostra imagem grande, 'Summary' mostra imagem pequena."
          />
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Card
          </label>
          <select
            value={seoData.twitterCard}
            onChange={(e) => updateField('twitterCard', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="summary_large_image">Summary Large Image</option>
            <option value="summary">Summary</option>
          </select>
        </div>

        {/* Twitter Title */}
        <div>
          <InfoCard 
            title="Título Twitter"
            description="Título específico para Twitter. Se vazio, usará o título Open Graph ou o título principal."
          />
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título Twitter (opcional)
          </label>
          <input
            type="text"
            value={seoData.twitterTitle}
            onChange={(e) => updateField('twitterTitle', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Título otimizado para Twitter"
          />
        </div>

        {/* Twitter Description */}
        <div>
          <InfoCard 
            title="Descrição Twitter"
            description="Descrição específica para Twitter. Se vazia, usará a descrição Open Graph ou a meta description."
          />
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição Twitter (opcional)
          </label>
          <textarea
            value={seoData.twitterDescription}
            onChange={(e) => updateField('twitterDescription', e.target.value)}
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            placeholder="Descrição atrativa para Twitter"
          />
        </div>

        {/* Twitter Image */}
        <div>
          <InfoCard 
            title="Imagem Twitter"
            description="Imagem específica para Twitter. Se vazia, usará a imagem Open Graph ou o logo."
          />
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagem Twitter (opcional)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={seoData.twitterImage}
              onChange={(e) => updateField('twitterImage', e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="https://meusite.com/imagem-twitter.jpg"
            />
            {seoData.twitterImage && (
              <button
                onClick={() => openCropModal(
                  seoData.twitterImage, 
                  'twitterImage', 
                  1.91, 
                  'Ajustar Imagem Twitter',
                  'Corte a imagem no formato ideal para Twitter (1200x630px)'
                )}
                className="flex items-center gap-2 px-4 py-3 bg-cyan-50 border border-cyan-200 text-cyan-700 rounded-lg hover:bg-cyan-100 transition-colors"
              >
                <Crop className="w-4 h-4" />
                Ajustar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreviewTab = () => {
    const ogTitle = seoData.ogTitle || seoData.title;
    const ogDescription = seoData.ogDescription || seoData.description;
    const ogImage = seoData.ogImage || seoData.logoUrl;
    const ogUrl = seoData.ogUrl || seoData.canonicalUrl;

    const twitterTitle = seoData.twitterTitle || ogTitle;
    const twitterDescription = seoData.twitterDescription || ogDescription;
    const twitterImage = seoData.twitterImage || ogImage;

    return (
      <div className="space-y-8">
        {/* Favicon Preview */}
        <FaviconPreview 
          faviconUrl={seoData.faviconUrl || seoData.faviconSvgUrl || seoData.appleTouchIcon}
          title={seoData.title}
        />

        {/* Google Search Preview */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-white/20">
          <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-green-600" />
            Visualização Google
          </h3>
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="max-w-lg">
              <div className="text-xs text-gray-500 mb-1">
                {seoData.canonicalUrl || 'https://exemplo.com'}
              </div>
              <h3 className="text-lg text-blue-600 hover:underline cursor-pointer mb-1">
                {seoData.title || 'Título da página aparecerá aqui'}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {seoData.description || 'A descrição da página aparecerá aqui nos resultados de busca do Google...'}
              </p>
            </div>
          </div>
        </div>

        {/* Facebook Preview */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-white/20">
          <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
            <Facebook className="w-5 h-5 text-blue-600" />
            Visualização Facebook
          </h3>
          <div className="bg-white border rounded-lg overflow-hidden shadow-sm max-w-lg">
            {ogImage && (
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                <img 
                  src={ogImage} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.classList.remove('hidden');
                  }}
                />
                <div className="hidden flex items-center justify-center w-full h-full bg-gray-200">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              </div>
            )}
            <div className="p-4 border-l-4 border-blue-500">
              <div className="text-xs text-gray-500 uppercase mb-1">
                {ogUrl ? new URL(ogUrl).hostname : 'exemplo.com'}
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">
                {ogTitle || 'Título do Open Graph aparecerá aqui'}
              </h4>
              <p className="text-sm text-gray-600">
                {ogDescription || 'Descrição do Open Graph aparecerá aqui...'}
              </p>
            </div>
          </div>
        </div>

        {/* Twitter Preview */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-white/20">
          <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
            <Twitter className="w-5 h-5 text-blue-400" />
            Visualização Twitter
          </h3>
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm max-w-lg">
            {twitterImage && seoData.twitterCard === 'summary_large_image' && (
              <div className="aspect-video bg-gray-200 flex items-center justify-center">
                <img 
                  src={twitterImage} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.classList.remove('hidden');
                  }}
                />
                <div className="hidden flex items-center justify-center w-full h-full bg-gray-200">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start gap-3">
                {twitterImage && seoData.twitterCard === 'summary' && (
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                    <img 
                      src={twitterImage} 
                      alt="Preview" 
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">
                    {ogUrl ? new URL(ogUrl).hostname : 'exemplo.com'}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {twitterTitle || 'Título do Twitter Card aparecerá aqui'}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {twitterDescription || 'Descrição do Twitter Card aparecerá aqui...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HTML Code Preview */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-white/20">
          <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-600" />
            Código HTML Gerado
          </h3>
          <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-auto">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
              {generateHTML() || '<!-- Preencha os campos para ver o HTML gerado -->'}
            </pre>
          </div>
          <div className="mt-2 flex justify-end">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar HTML
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-none">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Search className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Gerador de SEO Avançado
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Crie tags SEO otimizadas com upload de imagens, ajuste com react-easy-crop e visualização completa
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
          <div className="max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
            {activeTab === 'basic' && renderBasicTab()}
            {activeTab === 'images' && renderImagesTab()}
            {activeTab === 'social' && renderSocialTab()}
            {activeTab === 'preview' && renderPreviewTab()}
          </div>
        </div>
      </div>

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={cropModal.isOpen}
        onClose={() => setCropModal(prev => ({ ...prev, isOpen: false }))}
        imageSrc={cropModal.imageSrc}
        onCropComplete={handleCropComplete}
        aspectRatio={cropModal.aspectRatio}
        title={cropModal.title}
        description={cropModal.description}
      />
    </div>
  );
};

export default SEOGenerator;