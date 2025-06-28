import React, { useState, useCallback } from 'react';
import { 
  Type, 
  Copy, 
  RefreshCw, 
  Download, 
  Settings,
  FileText,
  List,
  Hash,
  CheckCircle,
  Shuffle,
  Globe,
  BookOpen,
  Zap
} from 'lucide-react';

interface GeneratorOptions {
  type: 'words' | 'sentences' | 'paragraphs';
  count: number;
  startWithLorem: boolean;
  language: 'latin' | 'portuguese' | 'english' | 'mixed';
  format: 'plain' | 'html' | 'markdown';
}

const LoremIpsumGenerator: React.FC = () => {
  const [generatedText, setGeneratedText] = useState<string>('');
  const [options, setOptions] = useState<GeneratorOptions>({
    type: 'paragraphs',
    count: 3,
    startWithLorem: true,
    language: 'latin',
    format: 'plain'
  });
  const [copiedField, setCopiedField] = useState<string>('');

  // Texto Lorem Ipsum clássico
  const classicLorem = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
    'Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
    'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
    'Sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
    'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.',
    'Sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.'
  ];

  // Palavras em latim
  const latinWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
    'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim',
    'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi',
    'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit',
    'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt',
    'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde', 'omnis', 'iste', 'natus',
    'error', 'accusantium', 'doloremque', 'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa',
    'quae', 'ab', 'illo', 'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae',
    'dicta', 'explicabo', 'nemo', 'ipsam', 'voluptatem', 'quia', 'voluptas', 'aspernatur', 'aut',
    'odit', 'fugit', 'consequuntur', 'magni', 'dolores', 'eos', 'ratione', 'sequi', 'nesciunt',
    'neque', 'porro', 'quisquam', 'dolorem', 'numquam', 'eius', 'modi', 'tempora', 'incidunt',
    'magnam', 'quaerat', 'adipisci', 'velit', 'aliquam', 'erat', 'volutpat', 'ac', 'tincidunt',
    'vitae', 'semper', 'quis', 'lectus', 'nulla', 'facilisi', 'morbi', 'tempus', 'iaculis', 'urna'
  ];

  // Palavras em português
  const portugueseWords = [
    'texto', 'exemplo', 'demonstração', 'conteúdo', 'parágrafo', 'palavra', 'frase', 'documento',
    'artigo', 'página', 'site', 'design', 'layout', 'tipografia', 'fonte', 'estilo', 'formato',
    'estrutura', 'organização', 'informação', 'dados', 'sistema', 'aplicação', 'desenvolvimento',
    'projeto', 'criação', 'produção', 'resultado', 'processo', 'método', 'técnica', 'ferramenta',
    'recurso', 'elemento', 'componente', 'seção', 'capítulo', 'título', 'subtítulo', 'cabeçalho',
    'rodapé', 'menu', 'navegação', 'link', 'botão', 'formulário', 'campo', 'entrada', 'saída',
    'interface', 'usuário', 'cliente', 'empresa', 'negócio', 'mercado', 'produto', 'serviço',
    'qualidade', 'performance', 'velocidade', 'eficiência', 'otimização', 'melhoria', 'inovação',
    'tecnologia', 'digital', 'online', 'internet', 'web', 'mobile', 'responsivo', 'moderno'
  ];

  // Palavras em inglês
  const englishWords = [
    'text', 'sample', 'example', 'content', 'paragraph', 'word', 'sentence', 'document',
    'article', 'page', 'website', 'design', 'layout', 'typography', 'font', 'style', 'format',
    'structure', 'organization', 'information', 'data', 'system', 'application', 'development',
    'project', 'creation', 'production', 'result', 'process', 'method', 'technique', 'tool',
    'resource', 'element', 'component', 'section', 'chapter', 'title', 'subtitle', 'header',
    'footer', 'menu', 'navigation', 'link', 'button', 'form', 'field', 'input', 'output',
    'interface', 'user', 'client', 'company', 'business', 'market', 'product', 'service',
    'quality', 'performance', 'speed', 'efficiency', 'optimization', 'improvement', 'innovation',
    'technology', 'digital', 'online', 'internet', 'web', 'mobile', 'responsive', 'modern'
  ];

  const getWordList = (): string[] => {
    switch (options.language) {
      case 'latin':
        return latinWords;
      case 'portuguese':
        return portugueseWords;
      case 'english':
        return englishWords;
      case 'mixed':
        return [...latinWords, ...portugueseWords, ...englishWords];
      default:
        return latinWords;
    }
  };

  const generateWords = (count: number): string => {
    const wordList = getWordList();
    const words: string[] = [];
    
    if (options.startWithLorem && options.language === 'latin') {
      words.push('Lorem', 'ipsum');
      count -= 2;
    }
    
    for (let i = 0; i < count; i++) {
      const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
      words.push(randomWord);
    }
    
    return words.join(' ');
  };

  const generateSentences = (count: number): string => {
    const sentences: string[] = [];
    
    if (options.startWithLorem && options.language === 'latin') {
      sentences.push(classicLorem[0]);
      count -= 1;
    }
    
    for (let i = 0; i < count; i++) {
      const sentenceLength = Math.floor(Math.random() * 15) + 8; // 8-22 palavras
      const words = generateWords(sentenceLength).split(' ');
      
      // Capitalizar primeira palavra
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
      
      // Adicionar pontuação aleatória
      const punctuation = Math.random() > 0.8 ? '!' : Math.random() > 0.9 ? '?' : '.';
      
      sentences.push(words.join(' ') + punctuation);
    }
    
    return sentences.join(' ');
  };

  const generateParagraphs = (count: number): string => {
    const paragraphs: string[] = [];
    
    if (options.startWithLorem && options.language === 'latin') {
      paragraphs.push(classicLorem.slice(0, 4).join(' '));
      count -= 1;
    }
    
    for (let i = 0; i < count; i++) {
      const sentenceCount = Math.floor(Math.random() * 6) + 3; // 3-8 sentenças
      const paragraph = generateSentences(sentenceCount);
      paragraphs.push(paragraph);
    }
    
    return paragraphs.join('\n\n');
  };

  const formatText = (text: string): string => {
    switch (options.format) {
      case 'html':
        if (options.type === 'paragraphs') {
          return text.split('\n\n').map(p => `<p>${p}</p>`).join('\n');
        } else if (options.type === 'sentences') {
          return `<p>${text}</p>`;
        } else {
          return `<span>${text}</span>`;
        }
      
      case 'markdown':
        if (options.type === 'paragraphs') {
          return text.split('\n\n').join('\n\n');
        } else {
          return text;
        }
      
      default:
        return text;
    }
  };

  const generateText = useCallback(() => {
    let text = '';
    
    switch (options.type) {
      case 'words':
        text = generateWords(options.count);
        break;
      case 'sentences':
        text = generateSentences(options.count);
        break;
      case 'paragraphs':
        text = generateParagraphs(options.count);
        break;
    }
    
    const formattedText = formatText(text);
    setGeneratedText(formattedText);
  }, [options]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const downloadText = () => {
    if (!generatedText) return;
    
    const extension = options.format === 'html' ? 'html' : options.format === 'markdown' ? 'md' : 'txt';
    const mimeType = options.format === 'html' ? 'text/html' : 'text/plain';
    
    const dataBlob = new Blob([generatedText], { type: mimeType });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lorem-ipsum-${Date.now()}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getSentenceCount = (text: string): number => {
    return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
  };

  const getParagraphCount = (text: string): number => {
    return text.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0).length;
  };

  const getCharacterCount = (text: string): number => {
    return text.length;
  };

  const typeOptions = [
    { id: 'words', name: 'Palavras', icon: Type, description: 'Gerar palavras individuais' },
    { id: 'sentences', name: 'Sentenças', icon: List, description: 'Gerar sentenças completas' },
    { id: 'paragraphs', name: 'Parágrafos', icon: FileText, description: 'Gerar parágrafos completos' }
  ];

  const languageOptions = [
    { id: 'latin', name: 'Latim Clássico', flag: '🏛️' },
    { id: 'portuguese', name: 'Português', flag: '🇧🇷' },
    { id: 'english', name: 'Inglês', flag: '🇺🇸' },
    { id: 'mixed', name: 'Misto', flag: '🌍' }
  ];

  const formatOptions = [
    { id: 'plain', name: 'Texto Simples', icon: FileText },
    { id: 'html', name: 'HTML', icon: Globe },
    { id: 'markdown', name: 'Markdown', icon: Hash }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
            <Type className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Gerador Lorem Ipsum
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Gere texto de preenchimento em múltiplos idiomas e formatos para seus projetos
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
        <div className="space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Conteúdo
            </label>
            <div className="grid md:grid-cols-3 gap-4">
              {typeOptions.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setOptions(prev => ({ ...prev, type: type.id as any }))}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      options.type === type.id
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{type.name}</div>
                      <div className="text-xs opacity-75">{type.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Count and Language */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade de {options.type === 'words' ? 'Palavras' : options.type === 'sentences' ? 'Sentenças' : 'Parágrafos'}
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={options.count}
                onChange={(e) => setOptions(prev => ({ ...prev, count: parseInt(e.target.value) || 1 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma
              </label>
              <select
                value={options.language}
                onChange={(e) => setOptions(prev => ({ ...prev, language: e.target.value as any }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {languageOptions.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Format and Options */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Formato de Saída
              </label>
              <div className="grid grid-cols-3 gap-2">
                {formatOptions.map((format) => {
                  const Icon = format.icon;
                  return (
                    <button
                      key={format.id}
                      onClick={() => setOptions(prev => ({ ...prev, format: format.id as any }))}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 ${
                        options.format === format.id
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-medium">{format.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Opções
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.startWithLorem}
                    onChange={(e) => setOptions(prev => ({ ...prev, startWithLorem: e.target.checked }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    disabled={options.language !== 'latin'}
                  />
                  <span className="text-sm text-gray-700">
                    Começar com "Lorem ipsum"
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={generateText}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              Gerar Texto
            </button>

            {generatedText && (
              <>
                <button
                  onClick={() => copyToClipboard(generatedText, 'texto')}
                  className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-all duration-200"
                >
                  {copiedField === 'texto' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                  Copiar
                </button>

                <button
                  onClick={downloadText}
                  className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Generated Text */}
      {generatedText && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Texto Gerado
            </h2>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Type className="w-4 h-4" />
                {getWordCount(generatedText)} palavras
              </span>
              <span className="flex items-center gap-1">
                <List className="w-4 h-4" />
                {getSentenceCount(generatedText)} sentenças
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {getParagraphCount(generatedText)} parágrafos
              </span>
              <span className="flex items-center gap-1">
                <Hash className="w-4 h-4" />
                {getCharacterCount(generatedText)} caracteres
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border">
            {options.format === 'html' ? (
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Preview HTML:</h3>
                  <div 
                    className="bg-white p-4 rounded border prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: generatedText }}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Código HTML:</h3>
                  <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto">
                    <code>{generatedText}</code>
                  </pre>
                </div>
              </div>
            ) : options.format === 'markdown' ? (
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Texto Markdown:</h3>
                  <pre className="bg-white p-4 rounded border text-sm whitespace-pre-wrap font-mono">
                    {generatedText}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded border">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {generatedText}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistics */}
      {generatedText && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Type className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{getWordCount(generatedText)}</p>
                <p className="text-sm text-gray-600">Palavras</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <List className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{getSentenceCount(generatedText)}</p>
                <p className="text-sm text-gray-600">Sentenças</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{getParagraphCount(generatedText)}</p>
                <p className="text-sm text-gray-600">Parágrafos</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Hash className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{getCharacterCount(generatedText)}</p>
                <p className="text-sm text-gray-600">Caracteres</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <BookOpen className="w-6 h-6 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">📝 Sobre o Lorem Ipsum</h3>
            <div className="text-indigo-800 leading-relaxed space-y-2">
              <p>
                Lorem Ipsum é um texto de preenchimento padrão usado na indústria gráfica e de impressão desde os anos 1500. 
                É usado para demonstrar elementos gráficos ou visuais de um documento ou apresentação visual.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-semibold text-indigo-900 mb-1 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Vantagens
                  </div>
                  <ul className="text-sm text-indigo-700 space-y-1">
                    <li>• Foco no design, não no conteúdo</li>
                    <li>• Distribuição uniforme de letras</li>
                    <li>• Padrão da indústria</li>
                    <li>• Não distrai o leitor</li>
                  </ul>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-semibold text-indigo-900 mb-1 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Usos Comuns
                  </div>
                  <ul className="text-sm text-indigo-700 space-y-1">
                    <li>• Mockups e protótipos</li>
                    <li>• Testes de layout</li>
                    <li>• Demonstrações de design</li>
                    <li>• Preenchimento temporário</li>
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

export default LoremIpsumGenerator;