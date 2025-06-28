import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Check, FileText, Download, Eye, EyeOff, Split, Maximize2, Minimize2, Save, Upload, RefreshCw, Info } from 'lucide-react';

interface MarkdownEditorProps {}

const MarkdownEditor: React.FC<MarkdownEditorProps> = () => {
  const [markdown, setMarkdown] = useState('');
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState('document');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse markdown to HTML (basic implementation)
  const parseMarkdown = useCallback((text: string): string => {
    if (!text) return '';

    let html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-800 mb-3 mt-6">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-gray-800 mb-4 mt-8">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mb-4 mt-8">$1</h1>')
      
      // Bold and Italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold"><em class="italic">$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm"><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono text-sm">$1</code>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg shadow-md my-4" />')
      
      // Lists
      .replace(/^\* (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-1 list-decimal">$1</li>')
      
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 text-gray-700 italic">$1</blockquote>')
      
      // Horizontal rules
      .replace(/^---$/gim, '<hr class="border-t-2 border-gray-300 my-8" />')
      
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br />');

    // Wrap in paragraphs
    if (html && !html.startsWith('<')) {
      html = '<p class="mb-4">' + html + '</p>';
    }

    return html;
  }, []);

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const exportAsMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
        }
        h1, h2, h3 { color: #2d3748; }
        code { background: #f7fafc; padding: 2px 4px; border-radius: 3px; }
        pre { background: #1a202c; color: #e2e8f0; padding: 16px; border-radius: 8px; overflow-x: auto; }
        blockquote { border-left: 4px solid #3182ce; padding-left: 16px; margin: 16px 0; background: #ebf8ff; }
        a { color: #3182ce; text-decoration: none; }
        a:hover { text-decoration: underline; }
        img { max-width: 100%; height: auto; border-radius: 8px; }
    </style>
</head>
<body>
    ${parseMarkdown(markdown)}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>${fileName}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px; }
        h1, h2, h3 { color: #2d3748; page-break-after: avoid; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-wrap: break-word; }
        blockquote { border-left: 4px solid #3182ce; padding-left: 16px; margin: 16px 0; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    ${parseMarkdown(markdown)}
</body>
</html>`;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const loadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setMarkdown(content);
        setFileName(file.name.replace(/\.[^/.]+$/, ''));
      };
      reader.readAsText(file);
    }
  };

  const loadSample = () => {
    const sampleMarkdown = `# Editor de Markdown ao Vivo

Bem-vindo ao **Editor de Markdown** mais completo! Este editor oferece visualização em tempo real e múltiplas opções de exportação.

## Recursos Principais

### ✨ Funcionalidades
- **Visualização em tempo real** do markdown
- **Múltiplos modos de visualização** (dividido, edição, preview)
- **Exportação** em MD, HTML e PDF
- **Importação** de arquivos markdown
- **Interface responsiva** e moderna

### 🎯 Como Usar

1. Digite seu markdown no painel da esquerda
2. Veja o resultado em tempo real no painel da direita
3. Use os botões de modo de visualização para alternar entre os painéis
4. Exporte seu documento no formato desejado

## Sintaxe Suportada

### Texto
- **Negrito** com \`**texto**\`
- *Itálico* com \`*texto*\`
- ***Negrito e itálico*** com \`***texto***\`

### Código
Código inline: \`console.log('Hello World')\`

Bloco de código:
\`\`\`javascript
function saudacao(nome) {
    return \`Olá, \${nome}!\`;
}

console.log(saudacao('Mundo'));
\`\`\`

### Listas
- Item 1
- Item 2
- Item 3

1. Primeiro item
2. Segundo item
3. Terceiro item

### Links e Imagens
[Visite o GitHub](https://github.com)

![Imagem de exemplo](https://via.placeholder.com/400x200/3182ce/ffffff?text=Imagem+de+Exemplo)

### Citações
> Esta é uma citação em markdown.
> Pode ter múltiplas linhas.

### Linha Horizontal
---

## Dicas de Produtividade

💡 **Dica**: Use Ctrl+S para salvar rapidamente seu documento!

🚀 **Experimente**: Alterne entre os modos de visualização para uma melhor experiência de edição.

📱 **Responsivo**: Este editor funciona perfeitamente em dispositivos móveis!

---

*Criado com ❤️ para desenvolvedores e escritores*`;

    setMarkdown(sampleMarkdown);
    setFileName('exemplo-markdown');
  };

  const clearEditor = () => {
    setMarkdown('');
    setFileName('document');
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
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'w-full max-w-none'}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Editor de Markdown
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Editor de markdown ao vivo com visualização em tempo real e exportação em múltiplos formatos
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
              className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm w-32"
              placeholder="documento"
            />
          </div>

          {/* View Mode */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Visualização:</label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'edit'
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'split'
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Split className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'preview'
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 ml-auto">
            <input
              type="file"
              ref={fileInputRef}
              onChange={loadFile}
              accept=".md,.markdown,.txt"
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Importar</span>
            </button>

            <button
              onClick={loadSample}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Exemplo</span>
            </button>

            <button
              onClick={clearEditor}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Limpar</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Export Options */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700">Exportar:</span>
          
          <button
            onClick={copyMarkdown}
            className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-sm"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>

          <button
            onClick={exportAsMarkdown}
            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
          >
            <Download className="w-3 h-3" />
            MD
          </button>

          <button
            onClick={exportAsHTML}
            className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm"
          >
            <Download className="w-3 h-3" />
            HTML
          </button>

          <button
            onClick={exportAsPDF}
            className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
          >
            <Download className="w-3 h-3" />
            PDF
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className={`grid gap-8 ${
        viewMode === 'split' ? 'xl:grid-cols-2' : 'grid-cols-1'
      }`}>
        {/* Editor Panel */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-800">Editor Markdown</h2>
            </div>

            <InfoCard 
              title="Editor de Markdown"
              description="Digite seu markdown aqui. Suporta sintaxe padrão incluindo cabeçalhos, listas, links, imagens, código e muito mais."
            />

            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full h-[calc(100vh-400px)] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none font-mono text-sm"
              placeholder="# Seu título aqui

Digite seu markdown aqui...

## Exemplo de seção

- Lista item 1
- Lista item 2

**Texto em negrito** e *texto em itálico*

```javascript
console.log('Código de exemplo');
```

[Link de exemplo](https://exemplo.com)"
            />
            
            <div className="mt-2 text-xs text-gray-500">
              {markdown.length} caracteres • {markdown.split('\n').length} linhas
            </div>
          </div>
        )}

        {/* Preview Panel */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-pink-600" />
              <h2 className="text-xl font-semibold text-gray-800">Visualização</h2>
            </div>

            <div className="bg-white rounded-lg p-6 h-[calc(100vh-400px)] overflow-auto border border-gray-200">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: parseMarkdown(markdown) || '<p class="text-gray-500 italic">A visualização do seu markdown aparecerá aqui...</p>' 
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-purple-900 mb-2">Sintaxe Completa</h3>
              <p className="text-xs text-purple-700 leading-relaxed">
                Suporte completo à sintaxe Markdown incluindo cabeçalhos, listas, código, links e imagens
              </p>
            </div>
          </div>
        </div>

        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-pink-900 mb-2">Preview em Tempo Real</h3>
              <p className="text-xs text-pink-700 leading-relaxed">
                Visualize suas alterações instantaneamente com renderização em tempo real
              </p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Download className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-indigo-900 mb-2">Múltiplas Exportações</h3>
              <p className="text-xs text-indigo-700 leading-relaxed">
                Exporte em Markdown, HTML ou PDF com formatação profissional
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;