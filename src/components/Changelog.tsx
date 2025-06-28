import React, { useState } from 'react';
import { GitBranch, Calendar, Plus, Zap, Bug, Shield, Star, ChevronDown, ChevronRight, ExternalLink, Tag, Users, Code } from 'lucide-react';

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  title: string;
  description: string;
  changes: {
    added?: string[];
    improved?: string[];
    fixed?: string[];
    security?: string[];
    deprecated?: string[];
    removed?: string[];
  };
  breaking?: string[];
  contributors?: string[];
  links?: {
    name: string;
    url: string;
  }[];
}

const Changelog: React.FC = () => {
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set(['1.3.0']));

  const toggleVersion = (version: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(version)) {
      newExpanded.delete(version);
    } else {
      newExpanded.add(version);
    }
    setExpandedVersions(newExpanded);
  };

  const expandAll = () => {
    setExpandedVersions(new Set(changelogData.map(entry => entry.version)));
  };

  const collapseAll = () => {
    setExpandedVersions(new Set());
  };

  const changelogData: ChangelogEntry[] = [
    {
      version: '1.3.0',
      date: '2025-01-15',
      type: 'minor',
      title: 'Gerador de QR Code Avançado',
      description: 'Adição do gerador de QR Code com múltiplos tipos, frames personalizados e logos.',
      changes: {
        added: [
          'Gerador de QR Code com 10 tipos diferentes (URL, Texto, WiFi, vCard, SMS, Email, Telefone, Localização, Evento, PIX)',
          'Sistema de frames personalizados para QR Codes',
          'Suporte a logos em QR Codes',
          'Templates visuais para diferentes casos de uso',
          'Validação automática de formatos por tipo',
          'Preview em tempo real do QR Code gerado',
          'Exportação em múltiplos formatos (PNG, SVG, PDF)',
          'Configurações avançadas de qualidade e correção de erro'
        ],
        improved: [
          'Interface reorganizada com abas específicas (Gerador, Personalização, Exportar)',
          'Melhor organização dos tipos de QR Code',
          'Validação em tempo real dos dados inseridos'
        ]
      },
      contributors: ['Agencione Team'],
      links: [
        { name: 'Documentação QR Code', url: '#qr-code-docs' }
      ]
    },
    {
      version: '1.2.0',
      date: '2025-01-14',
      type: 'minor',
      title: 'Ferramentas de Análise de Texto',
      description: 'Adição de ferramentas para análise detalhada de texto e geração de cartões de crédito.',
      changes: {
        added: [
          'Contador de Linhas e Caracteres com análise completa',
          'Gerador de Cartão de Crédito com algoritmo de Luhn',
          'Estatísticas detalhadas de texto (palavras, parágrafos, sentenças)',
          'Análise de tempo de leitura',
          'Validação de cartões de crédito por bandeira',
          'Suporte a múltiplas bandeiras (Visa, Mastercard, Amex, etc.)',
          'Geração de nomes brasileiros aleatórios',
          'Exportação de estatísticas em JSON'
        ],
        improved: [
          'Interface mais intuitiva para análise de texto',
          'Melhor organização das ferramentas no menu lateral',
          'Validação em tempo real para cartões de crédito'
        ]
      },
      contributors: ['Agencione Team']
    },
    {
      version: '1.1.0',
      date: '2025-01-13',
      type: 'minor',
      title: 'Melhorias no JSON Formatter',
      description: 'Adição de importação de arquivos e melhorias na experiência do usuário.',
      changes: {
        added: [
          'Importação de arquivos JSON (.json)',
          'Gerenciamento de múltiplos arquivos importados',
          'Validação de tamanho de arquivo (limite 10MB)',
          'Preview de arquivos importados',
          'Formatação automática de tamanho de arquivo'
        ],
        improved: [
          'Interface do JSON Formatter mais intuitiva',
          'Melhor feedback visual para erros',
          'Organização aprimorada dos controles'
        ],
        fixed: [
          'Correção na validação de arquivos JSON',
          'Melhoria na detecção de erros de sintaxe'
        ]
      },
      contributors: ['Agencione Team']
    },
    {
      version: '1.0.0',
      date: '2025-01-10',
      type: 'major',
      title: 'Lançamento Inicial do OneDev',
      description: 'Primeira versão estável com ferramentas essenciais para desenvolvedores.',
      changes: {
        added: [
          'Dashboard com analytics local e privacidade total',
          'Gerador de SEO com upload de imagens e preview de redes sociais',
          'Formatador e Validador JSON com detecção de erros',
          'Gerador de CPF/CNPJ com algoritmo oficial brasileiro',
          'Codificador Base64 com suporte UTF-8 completo',
          'Codificador de URL com padrão RFC 3986',
          'Editor de Markdown com preview em tempo real',
          'Sistema completo de cookies e LGPD',
          'Política de Privacidade detalhada',
          'Conformidade total com LGPD',
          'Arquitetura 100% client-side',
          'Interface responsiva com Tailwind CSS',
          'Tema moderno com gradientes e micro-interações'
        ]
      },
      breaking: [
        'Primeira versão - sem compatibilidade com versões anteriores'
      ],
      contributors: ['Agencione Team'],
      links: [
        { name: 'Documentação Inicial', url: '#docs' },
        { name: 'Guia de Uso', url: '#guide' }
      ]
    }
  ];

  const getVersionBadgeColor = (type: string) => {
    switch (type) {
      case 'major':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'minor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'patch':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'added':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'improved':
        return <Zap className="w-4 h-4 text-blue-600" />;
      case 'fixed':
        return <Bug className="w-4 h-4 text-orange-600" />;
      case 'security':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'deprecated':
        return <Star className="w-4 h-4 text-yellow-600" />;
      case 'removed':
        return <Star className="w-4 h-4 text-red-600" />;
      default:
        return <Plus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getChangeTypeLabel = (type: string) => {
    switch (type) {
      case 'added':
        return 'Adicionado';
      case 'improved':
        return 'Melhorado';
      case 'fixed':
        return 'Corrigido';
      case 'security':
        return 'Segurança';
      case 'deprecated':
        return 'Descontinuado';
      case 'removed':
        return 'Removido';
      default:
        return 'Alteração';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
            <GitBranch className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Changelog
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Histórico completo de versões, melhorias e correções do OneDev
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">
                {changelogData.length} versões registradas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">
                Última atualização: {formatDate(changelogData[0].date)}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
            >
              <ChevronDown className="w-4 h-4" />
              Expandir Todas
            </button>
            
            <button
              onClick={collapseAll}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
            >
              <ChevronRight className="w-4 h-4" />
              Recolher Todas
            </button>
          </div>
        </div>
      </div>

      {/* Changelog Entries */}
      <div className="space-y-6">
        {changelogData.map((entry, index) => {
          const isExpanded = expandedVersions.has(entry.version);
          const isLatest = index === 0;
          
          return (
            <div
              key={entry.version}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden transition-all duration-300 ${
                isLatest ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
              }`}
            >
              {/* Version Header */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => toggleVersion(entry.version)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      )}
                      <h2 className="text-2xl font-bold text-gray-900">
                        v{entry.version}
                        {isLatest && (
                          <span className="ml-2 px-2 py-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs rounded-full">
                            ATUAL
                          </span>
                        )}
                      </h2>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getVersionBadgeColor(entry.type)}`}>
                      {entry.type.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(entry.date)}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {entry.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {entry.description}
                  </p>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50/30">
                  <div className="p-6 space-y-6">
                    {/* Breaking Changes */}
                    {entry.breaking && entry.breaking.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          ⚠️ Mudanças Importantes (Breaking Changes)
                        </h4>
                        <ul className="space-y-1">
                          {entry.breaking.map((item, idx) => (
                            <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                              <span className="w-1 h-1 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Changes */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {Object.entries(entry.changes).map(([changeType, items]) => {
                        if (!items || items.length === 0) return null;
                        
                        return (
                          <div key={changeType} className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              {getChangeIcon(changeType)}
                              {getChangeTypeLabel(changeType)}
                            </h4>
                            <ul className="space-y-2">
                              {items.map((item, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>

                    {/* Contributors & Links */}
                    <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-200">
                      {entry.contributors && entry.contributors.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Contribuidores: {entry.contributors.join(', ')}
                          </span>
                        </div>
                      )}
                      
                      {entry.links && entry.links.length > 0 && (
                        <div className="flex items-center gap-3">
                          {entry.links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {link.name}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-12 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Code className="w-6 h-6 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-purple-900 mb-2">
              📋 Sobre o Changelog
            </h3>
            <div className="text-purple-800 leading-relaxed space-y-2">
              <p>
                Este changelog segue o padrão <strong>Semantic Versioning (SemVer)</strong> e 
                as convenções do <strong>Keep a Changelog</strong>.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-semibold text-purple-900 mb-1">🔴 MAJOR (X.0.0)</div>
                  <div className="text-sm text-purple-700">
                    Mudanças incompatíveis que quebram a API
                  </div>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-semibold text-purple-900 mb-1">🔵 MINOR (0.X.0)</div>
                  <div className="text-sm text-purple-700">
                    Novas funcionalidades compatíveis
                  </div>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-semibold text-purple-900 mb-1">🟢 PATCH (0.0.X)</div>
                  <div className="text-sm text-purple-700">
                    Correções de bugs compatíveis
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Changelog;