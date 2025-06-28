import React, { useState, useCallback, useMemo } from 'react';
import { Copy, Check, FileText, BarChart3, Hash, Type, Eye, Upload, Download, RefreshCw, Info } from 'lucide-react';

interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
  sentences: number;
  averageWordsPerLine: number;
  averageCharsPerLine: number;
  longestLine: number;
  shortestLine: number;
  emptyLines: number;
  readingTime: number;
}

const LineCharacterCounter: React.FC = () => {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState('texto-analisado');

  const stats = useMemo((): TextStats => {
    if (!text) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        lines: 0,
        paragraphs: 0,
        sentences: 0,
        averageWordsPerLine: 0,
        averageCharsPerLine: 0,
        longestLine: 0,
        shortestLine: 0,
        emptyLines: 0,
        readingTime: 0
      };
    }

    const lines = text.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    const emptyLines = lines.length - nonEmptyLines.length;
    
    // Caracteres
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    
    // Palavras
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    
    // Linhas
    const totalLines = lines.length;
    
    // Parágrafos (blocos de texto separados por linhas vazias)
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length : 0;
    
    // Sentenças (aproximação baseada em pontuação)
    const sentences = text.trim() ? (text.match(/[.!?]+/g) || []).length : 0;
    
    // Estatísticas de linha
    const lineLengths = lines.map(line => line.length);
    const longestLine = lineLengths.length > 0 ? Math.max(...lineLengths) : 0;
    const shortestLine = nonEmptyLines.length > 0 ? Math.min(...nonEmptyLines.map(line => line.length)) : 0;
    
    // Médias
    const averageWordsPerLine = totalLines > 0 ? words / totalLines : 0;
    const averageCharsPerLine = totalLines > 0 ? characters / totalLines : 0;
    
    // Tempo de leitura (baseado em 200 palavras por minuto)
    const readingTime = words / 200;

    return {
      characters,
      charactersNoSpaces,
      words,
      lines: totalLines,
      paragraphs,
      sentences,
      averageWordsPerLine,
      averageCharsPerLine,
      longestLine,
      shortestLine,
      emptyLines,
      readingTime
    };
  }, [text]);

  const handleTextChange = useCallback((value: string) => {
    setText(value);
  }, []);

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyStats = async () => {
    const statsText = `Estatísticas do Texto:

📊 Contagem Básica:
• Caracteres: ${stats.characters.toLocaleString()}
• Caracteres (sem espaços): ${stats.charactersNoSpaces.toLocaleString()}
• Palavras: ${stats.words.toLocaleString()}
• Linhas: ${stats.lines.toLocaleString()}
• Parágrafos: ${stats.paragraphs.toLocaleString()}
• Sentenças: ${stats.sentences.toLocaleString()}

📏 Análise de Linhas:
• Linha mais longa: ${stats.longestLine} caracteres
• Linha mais curta: ${stats.shortestLine} caracteres
• Linhas vazias: ${stats.emptyLines}
• Média de palavras por linha: ${stats.averageWordsPerLine.toFixed(1)}
• Média de caracteres por linha: ${stats.averageCharsPerLine.toFixed(1)}

⏱️ Tempo de Leitura:
• Aproximadamente ${Math.ceil(stats.readingTime)} minuto(s)`;

    await copyToClipboard(statsText);
  };

  const exportStats = () => {
    const statsData = {
      fileName,
      timestamp: new Date().toISOString(),
      text: {
        preview: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        length: text.length
      },
      statistics: stats
    };

    const blob = new Blob([JSON.stringify(statsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-estatisticas.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setText(content);
        setFileName(file.name.replace(/\.[^/.]+$/, ''));
      };
      reader.readAsText(file);
    }
  };

  const loadSample = () => {
    const sampleText = `Contador de Linhas e Caracteres

Este é um exemplo de texto para demonstrar as funcionalidades do contador.

O contador analisa diversos aspectos do seu texto:
- Contagem de caracteres (com e sem espaços)
- Número de palavras e linhas
- Análise de parágrafos e sentenças
- Estatísticas detalhadas de linha

Você pode usar esta ferramenta para:
1. Analisar documentos e artigos
2. Verificar limites de caracteres
3. Otimizar textos para redes sociais
4. Controlar tamanho de conteúdo

Esta ferramenta é especialmente útil para escritores, editores, desenvolvedores e profissionais de marketing digital que precisam monitorar o tamanho e estrutura de seus textos.

Experimente colar seu próprio texto aqui e veja as estatísticas em tempo real!`;

    setText(sampleText);
    setFileName('exemplo-contador');
  };

  const clearText = () => {
    setText('');
    setFileName('texto-analisado');
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 1) {
      return `${Math.ceil(minutes * 60)} segundos`;
    } else if (minutes < 60) {
      return `${Math.ceil(minutes)} minuto${Math.ceil(minutes) > 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.ceil(minutes % 60);
      return `${hours}h ${remainingMinutes}min`;
    }
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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Contador de Linhas e Caracteres
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Análise completa de texto com contagem de caracteres, palavras, linhas e estatísticas detalhadas
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          {/* File Name */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Nome:</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm w-40"
              placeholder="nome-do-arquivo"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 ml-auto">
            <input
              type="file"
              onChange={loadFile}
              accept=".txt,.md,.csv,.json"
              className="hidden"
              id="file-upload"
            />
            
            <label
              htmlFor="file-upload"
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Importar</span>
            </label>

            <button
              onClick={loadSample}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Exemplo</span>
            </button>

            <button
              onClick={clearText}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Text Input */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">Texto para Análise</h2>
          </div>

          <InfoCard 
            title="Análise em Tempo Real"
            description="Digite ou cole seu texto aqui. As estatísticas são atualizadas automaticamente conforme você digita. Suporta textos de qualquer tamanho."
          />

          <textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full h-[500px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none text-sm leading-relaxed"
            placeholder="Digite ou cole seu texto aqui para análise...

Exemplo:
- Artigos e documentos
- Posts para redes sociais
- Códigos e scripts
- Qualquer tipo de texto

As estatísticas aparecerão automaticamente no painel ao lado."
          />
          
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>Análise em tempo real ativa</span>
            <span>{stats.characters.toLocaleString()} caracteres</span>
          </div>
        </div>

        {/* Statistics Panel */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Estatísticas</h2>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={copyStats}
                className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
              
              <button
                onClick={exportStats}
                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
              >
                <Download className="w-3 h-3" />
                JSON
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Basic Count */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Contagem Básica
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.characters.toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-700">Caracteres</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.charactersNoSpaces.toLocaleString()}
                  </div>
                  <div className="text-xs text-green-700">Sem espaços</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.words.toLocaleString()}
                  </div>
                  <div className="text-xs text-purple-700">Palavras</div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.lines.toLocaleString()}
                  </div>
                  <div className="text-xs text-orange-700">Linhas</div>
                </div>
              </div>
            </div>

            {/* Structure Analysis */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Type className="w-4 h-4" />
                Estrutura do Texto
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Parágrafos:</span>
                  <span className="font-semibold text-gray-800">{stats.paragraphs}</span>
                </div>
                
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Sentenças:</span>
                  <span className="font-semibold text-gray-800">{stats.sentences}</span>
                </div>
                
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Linhas vazias:</span>
                  <span className="font-semibold text-gray-800">{stats.emptyLines}</span>
                </div>
              </div>
            </div>

            {/* Line Analysis */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Análise de Linhas
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Linha mais longa:</span>
                  <span className="font-semibold text-gray-800">{stats.longestLine} chars</span>
                </div>
                
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Linha mais curta:</span>
                  <span className="font-semibold text-gray-800">{stats.shortestLine} chars</span>
                </div>
                
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Média palavras/linha:</span>
                  <span className="font-semibold text-gray-800">{stats.averageWordsPerLine.toFixed(1)}</span>
                </div>
                
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Média chars/linha:</span>
                  <span className="font-semibold text-gray-800">{stats.averageCharsPerLine.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Reading Time */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Tempo de Leitura
              </h3>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">
                    {formatTime(stats.readingTime)}
                  </div>
                  <div className="text-xs text-indigo-700">
                    Baseado em 200 palavras/min
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {text && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Resumo Rápido</h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>📝 {stats.words} palavras em {stats.lines} linhas</div>
                  <div>📊 {stats.paragraphs} parágrafos, {stats.sentences} sentenças</div>
                  <div>⏱️ Leitura: ~{formatTime(stats.readingTime)}</div>
                  <div>📏 Linha média: {stats.averageCharsPerLine.toFixed(0)} caracteres</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="mt-8 grid md:grid-cols-4 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-900 mb-2">Análise Completa</h3>
              <p className="text-xs text-green-700 leading-relaxed">
                Estatísticas detalhadas de caracteres, palavras, linhas e estrutura
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-2">Tempo Real</h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                Atualização automática das estatísticas conforme você digita
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-purple-900 mb-2">Tempo de Leitura</h3>
              <p className="text-xs text-purple-700 leading-relaxed">
                Estimativa baseada na velocidade média de leitura
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Download className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-orange-900 mb-2">Exportação</h3>
              <p className="text-xs text-orange-700 leading-relaxed">
                Copie estatísticas ou exporte dados em formato JSON
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineCharacterCounter;