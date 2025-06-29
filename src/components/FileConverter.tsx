import React, { useState, useCallback, useRef } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Music, 
  Video, 
  Archive, 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  X,
  Eye,
  Copy,
  Zap,
  Info,
  Settings,
  Monitor,
  Smartphone,
  FileImage,
  FileAudio,
  FileVideo,
  File,
  Scissors,
  Palette,
  Maximize,
  Volume2
} from 'lucide-react';

interface ConversionCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  description: string;
  formats: string[];
  maxSize: number; // em MB
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  file: File;
  category: string;
}

interface ConversionResult {
  id: string;
  originalFile: UploadedFile;
  convertedUrl: string;
  convertedName: string;
  convertedSize: number;
  format: string;
  quality?: number;
  timestamp: Date;
}

interface ConversionOptions {
  quality: number;
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
  format: string;
  compression: number;
}

const FileConverter: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('image');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [conversions, setConversions] = useState<ConversionResult[]>([]);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [conversionOptions, setConversionOptions] = useState<ConversionOptions>({
    quality: 80,
    width: undefined,
    height: undefined,
    maintainAspectRatio: true,
    format: 'jpeg',
    compression: 80
  });
  const [copiedField, setCopiedField] = useState<string>('');
  const [showPreview, setShowPreview] = useState<Record<string, boolean>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Definição das categorias de conversão
  const categories: ConversionCategory[] = [
    {
      id: 'image',
      name: 'Imagens',
      icon: ImageIcon,
      color: 'from-blue-500 to-cyan-600',
      description: 'Converta entre formatos de imagem',
      formats: ['jpeg', 'jpg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'svg'],
      maxSize: 10
    },
    {
      id: 'document',
      name: 'Documentos',
      icon: FileText,
      color: 'from-green-500 to-emerald-600',
      description: 'Converta documentos e textos',
      formats: ['pdf', 'txt', 'rtf', 'html', 'md', 'csv', 'json', 'xml'],
      maxSize: 5
    },
    {
      id: 'audio',
      name: 'Áudio',
      icon: Music,
      color: 'from-purple-500 to-violet-600',
      description: 'Converta arquivos de áudio',
      formats: ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'],
      maxSize: 50
    },
    {
      id: 'video',
      name: 'Vídeo',
      icon: Video,
      color: 'from-red-500 to-pink-600',
      description: 'Converta vídeos (limitado)',
      formats: ['mp4', 'webm', 'avi', 'mov', 'mkv'],
      maxSize: 100
    },
    {
      id: 'archive',
      name: 'Arquivos',
      icon: Archive,
      color: 'from-amber-500 to-orange-600',
      description: 'Comprima e descomprima arquivos',
      formats: ['zip', 'rar', '7z', 'tar', 'gz'],
      maxSize: 20
    }
  ];

  const getCurrentCategory = () => {
    return categories.find(cat => cat.id === activeCategory) || categories[0];
  };

  const getFileCategory = (file: File): string => {
    const type = file.type.toLowerCase();
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension)) {
      return 'image';
    }
    if (type.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'].includes(extension)) {
      return 'audio';
    }
    if (type.startsWith('video/') || ['mp4', 'webm', 'avi', 'mov', 'mkv'].includes(extension)) {
      return 'video';
    }
    if (type.includes('pdf') || type.includes('text') || ['pdf', 'txt', 'rtf', 'html', 'md', 'csv', 'json', 'xml'].includes(extension)) {
      return 'document';
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return 'archive';
    }
    return 'document'; // fallback
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const currentCategory = getCurrentCategory();

    files.forEach(file => {
      const category = getFileCategory(file);
      const categoryConfig = categories.find(cat => cat.id === category);
      
      if (!categoryConfig) {
        alert(`Tipo de arquivo não suportado: ${file.name}`);
        return;
      }

      if (file.size > categoryConfig.maxSize * 1024 * 1024) {
        alert(`Arquivo muito grande: ${file.name}. Máximo permitido: ${categoryConfig.maxSize}MB`);
        return;
      }

      const uploadedFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        file,
        category
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (file) {
      URL.revokeObjectURL(file.url);
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      setConversions(prev => prev.filter(c => c.originalFile.id !== fileId));
    }
  };

  // Função de conversão de imagens
  const convertImage = async (file: UploadedFile, targetFormat: string): Promise<ConversionResult> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular dimensões
        let { width, height } = img;
        
        if (conversionOptions.width || conversionOptions.height) {
          if (conversionOptions.maintainAspectRatio) {
            const aspectRatio = width / height;
            if (conversionOptions.width && conversionOptions.height) {
              // Use a menor escala para manter proporção
              const scaleX = conversionOptions.width / width;
              const scaleY = conversionOptions.height / height;
              const scale = Math.min(scaleX, scaleY);
              width = width * scale;
              height = height * scale;
            } else if (conversionOptions.width) {
              height = conversionOptions.width / aspectRatio;
              width = conversionOptions.width;
            } else if (conversionOptions.height) {
              width = conversionOptions.height * aspectRatio;
              height = conversionOptions.height;
            }
          } else {
            width = conversionOptions.width || width;
            height = conversionOptions.height || height;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Converter para o formato desejado
        const quality = conversionOptions.quality / 100;
        const mimeType = targetFormat === 'jpg' ? 'image/jpeg' : `image/${targetFormat}`;
        
        canvas.toBlob((blob) => {
          if (blob) {
            const convertedUrl = URL.createObjectURL(blob);
            const convertedName = file.name.replace(/\.[^/.]+$/, `.${targetFormat}`);
            
            resolve({
              id: Date.now().toString(),
              originalFile: file,
              convertedUrl,
              convertedName,
              convertedSize: blob.size,
              format: targetFormat,
              quality: conversionOptions.quality,
              timestamp: new Date()
            });
          } else {
            reject(new Error('Falha na conversão'));
          }
        }, mimeType, quality);
      };

      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = file.url;
    });
  };

  // Função de conversão de documentos (simulada)
  const convertDocument = async (file: UploadedFile, targetFormat: string): Promise<ConversionResult> => {
    return new Promise((resolve) => {
      // Simulação de conversão de documento
      setTimeout(() => {
        const convertedName = file.name.replace(/\.[^/.]+$/, `.${targetFormat}`);
        
        resolve({
          id: Date.now().toString(),
          originalFile: file,
          convertedUrl: file.url, // Em uma implementação real, seria o arquivo convertido
          convertedName,
          convertedSize: file.size,
          format: targetFormat,
          timestamp: new Date()
        });
      }, 1000);
    });
  };

  const convertFile = async (file: UploadedFile) => {
    setIsConverting(true);
    
    try {
      let result: ConversionResult;
      
      switch (file.category) {
        case 'image':
          result = await convertImage(file, conversionOptions.format);
          break;
        case 'document':
          result = await convertDocument(file, conversionOptions.format);
          break;
        default:
          throw new Error('Conversão não suportada para este tipo de arquivo');
      }

      setConversions(prev => [...prev, result]);
    } catch (error) {
      console.error('Erro na conversão:', error);
      alert('Erro na conversão do arquivo');
    } finally {
      setIsConverting(false);
    }
  };

  const downloadFile = (conversion: ConversionResult) => {
    const link = document.createElement('a');
    link.href = conversion.convertedUrl;
    link.download = conversion.convertedName;
    link.click();
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

  const togglePreview = (fileId: string) => {
    setShowPreview(prev => ({
      ...prev,
      [fileId]: !prev[fileId]
    }));
  };

  const getFileIcon = (category: string) => {
    switch (category) {
      case 'image': return FileImage;
      case 'audio': return FileAudio;
      case 'video': return FileVideo;
      default: return File;
    }
  };

  const renderFilePreview = (file: UploadedFile) => {
    if (!showPreview[file.id]) return null;

    switch (file.category) {
      case 'image':
        return (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <img 
              src={file.url} 
              alt={file.name}
              className="max-w-full max-h-48 object-contain mx-auto rounded"
            />
          </div>
        );
      case 'audio':
        return (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <audio controls className="w-full">
              <source src={file.url} type={file.type} />
              Seu navegador não suporta o elemento de áudio.
            </audio>
          </div>
        );
      case 'video':
        return (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <video controls className="max-w-full max-h-48 mx-auto rounded">
              <source src={file.url} type={file.type} />
              Seu navegador não suporta o elemento de vídeo.
            </video>
          </div>
        );
      default:
        return (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg text-center">
            <File className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Preview não disponível</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
            <RefreshCw className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Conversor de Arquivos Universal
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Converta entre diferentes formatos de arquivo com facilidade e qualidade profissional
        </p>
      </div>

      {/* Category Selection */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-600" />
          Escolha o Tipo de Arquivo
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'border-purple-500 bg-purple-50 shadow-lg transform scale-105'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className={`p-3 bg-gradient-to-r ${category.color} rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-800">{category.name}</span>
                  <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                  <p className="text-xs text-gray-400 mt-1">Máx: {category.maxSize}MB</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600" />
          Upload de Arquivos
        </h2>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept={getCurrentCategory().formats.map(f => `.${f}`).join(',')}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 bg-gradient-to-r ${getCurrentCategory().color} rounded-full`}>
              <Upload className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Arraste arquivos aqui ou clique para selecionar
              </h3>
              <p className="text-gray-600 mb-4">
                Formatos suportados: {getCurrentCategory().formats.join(', ').toUpperCase()}
              </p>
              <p className="text-sm text-gray-500">
                Tamanho máximo: {getCurrentCategory().maxSize}MB por arquivo
              </p>
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`px-6 py-3 bg-gradient-to-r ${getCurrentCategory().color} text-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
            >
              Selecionar Arquivos
            </button>
          </div>
        </div>
      </div>

      {/* Conversion Options */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-green-600" />
            Opções de Conversão
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formato de Saída
              </label>
              <select
                value={conversionOptions.format}
                onChange={(e) => setConversionOptions(prev => ({ ...prev, format: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {getCurrentCategory().formats.map(format => (
                  <option key={format} value={format}>
                    {format.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Quality */}
            {activeCategory === 'image' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualidade ({conversionOptions.quality}%)
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={conversionOptions.quality}
                  onChange={(e) => setConversionOptions(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
            )}

            {/* Width */}
            {activeCategory === 'image' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Largura (px)
                </label>
                <input
                  type="number"
                  value={conversionOptions.width || ''}
                  onChange={(e) => setConversionOptions(prev => ({ 
                    ...prev, 
                    width: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="Auto"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            )}

            {/* Height */}
            {activeCategory === 'image' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Altura (px)
                </label>
                <input
                  type="number"
                  value={conversionOptions.height || ''}
                  onChange={(e) => setConversionOptions(prev => ({ 
                    ...prev, 
                    height: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="Auto"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            )}
          </div>

          {/* Maintain Aspect Ratio */}
          {activeCategory === 'image' && (
            <div className="mt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={conversionOptions.maintainAspectRatio}
                  onChange={(e) => setConversionOptions(prev => ({ 
                    ...prev, 
                    maintainAspectRatio: e.target.checked 
                  }))}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Manter proporção da imagem</span>
              </label>
            </div>
          )}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-600" />
            Arquivos Carregados ({uploadedFiles.length})
          </h2>

          <div className="space-y-4">
            {uploadedFiles.map((file) => {
              const FileIcon = getFileIcon(file.category);
              const categoryConfig = categories.find(cat => cat.id === file.category);
              
              return (
                <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-gradient-to-r ${categoryConfig?.color} rounded-lg`}>
                        <FileIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{file.name}</h3>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)} • {file.category}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePreview(file.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => convertFile(file)}
                        disabled={isConverting}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 disabled:opacity-50"
                      >
                        {isConverting ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4" />
                        )}
                        Converter
                      </button>
                      
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {renderFilePreview(file)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conversion Results */}
      {conversions.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Arquivos Convertidos ({conversions.length})
          </h2>

          <div className="space-y-4">
            {conversions.map((conversion) => (
              <div key={conversion.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="font-medium text-gray-900">{conversion.convertedName}</h3>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(conversion.convertedSize)} • 
                        {conversion.format.toUpperCase()}
                        {conversion.quality && ` • ${conversion.quality}% qualidade`}
                      </p>
                      <p className="text-xs text-gray-500">
                        Convertido em {conversion.timestamp.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(conversion.convertedName, `name-${conversion.id}`)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {copiedField === `name-${conversion.id}` ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => downloadFile(conversion)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-purple-900 mb-2">🔄 Sobre o Conversor Universal</h3>
            <div className="text-purple-800 leading-relaxed space-y-2">
              <p>
                Este conversor suporta múltiplos formatos de arquivo e processa tudo localmente no seu navegador, 
                garantindo total privacidade e segurança dos seus dados.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-semibold text-purple-900 mb-1 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Recursos
                  </div>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Conversão 100% local e privada</li>
                    <li>• Múltiplos formatos suportados</li>
                    <li>• Controle de qualidade e dimensões</li>
                    <li>• Preview de arquivos</li>
                  </ul>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-semibold text-purple-900 mb-1 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Limitações
                  </div>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Tamanhos máximos por categoria</li>
                    <li>• Alguns formatos têm suporte limitado</li>
                    <li>• Processamento depende do dispositivo</li>
                    <li>• Vídeos têm conversão básica</li>
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

export default FileConverter;