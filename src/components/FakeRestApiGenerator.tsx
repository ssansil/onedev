import React, { useState, useCallback } from 'react';
import { 
  Server, 
  Database, 
  Code, 
  Copy, 
  RefreshCw, 
  Download, 
  Settings,
  Globe,
  CheckCircle,
  Play,
  Eye,
  EyeOff,
  Zap,
  FileText,
  Users,
  ShoppingCart,
  Calendar,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Hash,
  Type,
  Image,
  Link,
  Star,
  Tag,
  Clock,
  Shield
} from 'lucide-react';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  response: any;
  statusCode: number;
  headers: Record<string, string>;
}

interface ApiSchema {
  name: string;
  baseUrl: string;
  endpoints: ApiEndpoint[];
  documentation: string;
}

const FakeRestApiGenerator: React.FC = () => {
  const [apiSchema, setApiSchema] = useState<ApiSchema | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('ecommerce');
  const [customization, setCustomization] = useState({
    recordCount: 10,
    includeAuth: true,
    includePagination: true,
    includeFiltering: true,
    responseFormat: 'json',
    locale: 'pt-BR'
  });
  const [copiedField, setCopiedField] = useState<string>('');
  const [showResponse, setShowResponse] = useState<Record<string, boolean>>({});

  const templates = [
    {
      id: 'ecommerce',
      name: 'E-commerce',
      icon: ShoppingCart,
      description: 'API para loja virtual com produtos, usuários e pedidos',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'blog',
      name: 'Blog/CMS',
      icon: FileText,
      description: 'API para blog com posts, comentários e categorias',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'social',
      name: 'Rede Social',
      icon: Users,
      description: 'API para rede social com usuários, posts e interações',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'crm',
      name: 'CRM/Vendas',
      icon: Database,
      description: 'API para CRM com clientes, leads e oportunidades',
      color: 'from-orange-500 to-red-600'
    },
    {
      id: 'finance',
      name: 'Financeiro',
      icon: CreditCard,
      description: 'API financeira com transações, contas e relatórios',
      color: 'from-teal-500 to-cyan-600'
    },
    {
      id: 'events',
      name: 'Eventos',
      icon: Calendar,
      description: 'API para gerenciamento de eventos e participantes',
      color: 'from-amber-500 to-yellow-600'
    }
  ];

  // Geradores de dados fake
  const generateFakeData = {
    user: () => ({
      id: Math.floor(Math.random() * 1000) + 1,
      name: ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Ferreira'][Math.floor(Math.random() * 5)],
      email: `user${Math.floor(Math.random() * 1000)}@example.com`,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
      phone: `(11) 9${Math.floor(Math.random() * 90000000) + 10000000}`,
      address: {
        street: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        country: 'Brasil'
      },
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: Math.random() > 0.2
    }),

    product: () => ({
      id: Math.floor(Math.random() * 1000) + 1,
      name: ['Smartphone Pro', 'Notebook Gamer', 'Fone Bluetooth', 'Smartwatch', 'Tablet'][Math.floor(Math.random() * 5)],
      description: 'Produto de alta qualidade com excelente custo-benefício.',
      price: parseFloat((Math.random() * 2000 + 50).toFixed(2)),
      category: ['Eletrônicos', 'Informática', 'Acessórios', 'Casa', 'Esporte'][Math.floor(Math.random() * 5)],
      brand: ['TechBrand', 'ProMax', 'UltraGear', 'SmartTech'][Math.floor(Math.random() * 4)],
      stock: Math.floor(Math.random() * 100),
      images: [
        'https://picsum.photos/400/400?random=1',
        'https://picsum.photos/400/400?random=2'
      ],
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
      reviews: Math.floor(Math.random() * 500),
      tags: ['novo', 'promoção', 'destaque'].slice(0, Math.floor(Math.random() * 3) + 1),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true
    }),

    order: () => ({
      id: Math.floor(Math.random() * 10000) + 1,
      userId: Math.floor(Math.random() * 100) + 1,
      status: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'][Math.floor(Math.random() * 5)],
      total: parseFloat((Math.random() * 1000 + 50).toFixed(2)),
      items: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => ({
        productId: Math.floor(Math.random() * 100) + 1,
        quantity: Math.floor(Math.random() * 5) + 1,
        price: parseFloat((Math.random() * 200 + 20).toFixed(2))
      })),
      shippingAddress: {
        street: 'Rua das Entregas, 456',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zipCode: '20000-000'
      },
      paymentMethod: ['credit_card', 'debit_card', 'pix', 'boleto'][Math.floor(Math.random() * 4)],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }),

    post: () => ({
      id: Math.floor(Math.random() * 1000) + 1,
      title: ['Como criar uma API REST', 'Melhores práticas de desenvolvimento', 'Guia completo de React'][Math.floor(Math.random() * 3)],
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      excerpt: 'Resumo do artigo com as principais informações...',
      authorId: Math.floor(Math.random() * 10) + 1,
      categoryId: Math.floor(Math.random() * 5) + 1,
      tags: ['tecnologia', 'programação', 'tutorial'],
      featuredImage: 'https://picsum.photos/800/400?random=3',
      status: ['draft', 'published', 'archived'][Math.floor(Math.random() * 3)],
      views: Math.floor(Math.random() * 10000),
      likes: Math.floor(Math.random() * 500),
      comments: Math.floor(Math.random() * 50),
      publishedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }),

    comment: () => ({
      id: Math.floor(Math.random() * 1000) + 1,
      postId: Math.floor(Math.random() * 100) + 1,
      authorId: Math.floor(Math.random() * 100) + 1,
      content: 'Excelente artigo! Muito útil para quem está começando.',
      parentId: Math.random() > 0.7 ? Math.floor(Math.random() * 50) + 1 : null,
      likes: Math.floor(Math.random() * 20),
      isApproved: Math.random() > 0.1,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }),

    transaction: () => ({
      id: Math.floor(Math.random() * 10000) + 1,
      accountId: Math.floor(Math.random() * 100) + 1,
      type: ['income', 'expense', 'transfer'][Math.floor(Math.random() * 3)],
      amount: parseFloat((Math.random() * 5000 - 2500).toFixed(2)),
      description: ['Salário', 'Compra no supermercado', 'Transferência', 'Pagamento de conta'][Math.floor(Math.random() * 4)],
      category: ['alimentação', 'transporte', 'saúde', 'educação', 'lazer'][Math.floor(Math.random() * 5)],
      date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)],
      reference: `TXN${Math.floor(Math.random() * 1000000)}`
    }),

    event: () => ({
      id: Math.floor(Math.random() * 1000) + 1,
      title: ['Conferência de Tecnologia', 'Workshop de React', 'Meetup de JavaScript'][Math.floor(Math.random() * 3)],
      description: 'Evento incrível com palestrantes renomados da área.',
      startDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000 + 86400000).toISOString(),
      location: {
        name: 'Centro de Convenções',
        address: 'Av. Paulista, 1000',
        city: 'São Paulo',
        state: 'SP'
      },
      organizerId: Math.floor(Math.random() * 10) + 1,
      capacity: Math.floor(Math.random() * 500) + 50,
      registrations: Math.floor(Math.random() * 300),
      price: parseFloat((Math.random() * 200).toFixed(2)),
      category: ['tecnologia', 'negócios', 'educação'][Math.floor(Math.random() * 3)],
      status: ['upcoming', 'ongoing', 'completed', 'cancelled'][Math.floor(Math.random() * 4)],
      tags: ['networking', 'aprendizado', 'inovação']
    })
  };

  const generateApiSchema = useCallback(() => {
    const baseUrl = 'https://api.exemplo.com/v1';
    let endpoints: ApiEndpoint[] = [];
    let name = '';
    let documentation = '';

    switch (selectedTemplate) {
      case 'ecommerce':
        name = 'E-commerce API';
        documentation = 'API completa para e-commerce com produtos, usuários, pedidos e autenticação.';
        endpoints = [
          // Produtos
          {
            method: 'GET',
            path: '/products',
            description: 'Listar todos os produtos',
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            response: {
              data: Array.from({ length: customization.recordCount }, () => generateFakeData.product()),
              pagination: customization.includePagination ? {
                page: 1,
                limit: customization.recordCount,
                total: 150,
                totalPages: Math.ceil(150 / customization.recordCount)
              } : undefined
            }
          },
          {
            method: 'GET',
            path: '/products/{id}',
            description: 'Obter produto por ID',
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            response: generateFakeData.product()
          },
          {
            method: 'POST',
            path: '/products',
            description: 'Criar novo produto',
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            response: generateFakeData.product()
          },
          // Usuários
          {
            method: 'GET',
            path: '/users',
            description: 'Listar usuários',
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            response: {
              data: Array.from({ length: Math.min(customization.recordCount, 5) }, () => generateFakeData.user()),
              pagination: customization.includePagination ? {
                page: 1,
                limit: 5,
                total: 50,
                totalPages: 10
              } : undefined
            }
          },
          {
            method: 'POST',
            path: '/users',
            description: 'Criar novo usuário',
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            response: generateFakeData.user()
          },
          // Pedidos
          {
            method: 'GET',
            path: '/orders',
            description: 'Listar pedidos',
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            response: {
              data: Array.from({ length: Math.min(customization.recordCount, 8) }, () => generateFakeData.order()),
              pagination: customization.includePagination ? {
                page: 1,
                limit: 8,
                total: 200,
                totalPages: 25
              } : undefined
            }
          },
          {
            method: 'POST',
            path: '/orders',
            description: 'Criar novo pedido',
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            response: generateFakeData.order()
          }
        ];
        break;

      case 'blog':
        name = 'Blog/CMS API';
        documentation = 'API para sistema de blog com posts, comentários e categorias.';
        endpoints = [
          {
            method: 'GET',
            path: '/posts',
            description: 'Listar posts',
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            response: {
              data: Array.from({ length: customization.recordCount }, () => generateFakeData.post()),
              pagination: customization.includePagination ? {
                page: 1,
                limit: customization.recordCount,
                total: 100,
                totalPages: Math.ceil(100 / customization.recordCount)
              } : undefined
            }
          },
          {
            method: 'GET',
            path: '/posts/{id}',
            description: 'Obter post por ID',
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            response: generateFakeData.post()
          },
          {
            method: 'POST',
            path: '/posts',
            description: 'Criar novo post',
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            response: generateFakeData.post()
          },
          {
            method: 'GET',
            path: '/comments',
            description: 'Listar comentários',
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            response: {
              data: Array.from({ length: Math.min(customization.recordCount, 15) }, () => generateFakeData.comment())
            }
          }
        ];
        break;

      case 'social':
        name = 'Social Network API';
        documentation = 'API para rede social com usuários, posts e interações.';
        endpoints = [
          {
            method: 'GET',
            path: '/users',
            description: 'Listar usuários',
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            response: {
              data: Array.from({ length: customization.recordCount }, () => generateFakeData.user())
            }
          },
          {
            method: 'GET',
            path: '/posts',
            description: 'Feed de posts',
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            response: {
              data: Array.from({ length: customization.recordCount }, () => generateFakeData.post())
            }
          }
        ];
        break;

      case 'finance':
        name = 'Finance API';
        documentation = 'API financeira com transações, contas e relatórios.';
        endpoints = [
          {
            method: 'GET',
            path: '/transactions',
            description: 'Listar transações',
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            response: {
              data: Array.from({ length: customization.recordCount }, () => generateFakeData.transaction()),
              pagination: customization.includePagination ? {
                page: 1,
                limit: customization.recordCount,
                total: 500,
                totalPages: Math.ceil(500 / customization.recordCount)
              } : undefined
            }
          },
          {
            method: 'POST',
            path: '/transactions',
            description: 'Criar nova transação',
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            response: generateFakeData.transaction()
          }
        ];
        break;

      case 'events':
        name = 'Events API';
        documentation = 'API para gerenciamento de eventos e participantes.';
        endpoints = [
          {
            method: 'GET',
            path: '/events',
            description: 'Listar eventos',
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            response: {
              data: Array.from({ length: customization.recordCount }, () => generateFakeData.event())
            }
          },
          {
            method: 'POST',
            path: '/events',
            description: 'Criar novo evento',
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            response: generateFakeData.event()
          }
        ];
        break;

      default:
        name = 'Custom API';
        documentation = 'API personalizada gerada automaticamente.';
        endpoints = [
          {
            method: 'GET',
            path: '/items',
            description: 'Listar itens',
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            response: {
              data: Array.from({ length: customization.recordCount }, () => ({
                id: Math.floor(Math.random() * 1000) + 1,
                name: `Item ${Math.floor(Math.random() * 100)}`,
                createdAt: new Date().toISOString()
              }))
            }
          }
        ];
    }

    // Adicionar endpoints de autenticação se habilitado
    if (customization.includeAuth) {
      endpoints.unshift(
        {
          method: 'POST',
          path: '/auth/login',
          description: 'Fazer login',
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          response: {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            user: generateFakeData.user(),
            expiresIn: 3600
          }
        },
        {
          method: 'POST',
          path: '/auth/register',
          description: 'Registrar usuário',
          statusCode: 201,
          headers: { 'Content-Type': 'application/json' },
          response: {
            message: 'Usuário criado com sucesso',
            user: generateFakeData.user()
          }
        },
        {
          method: 'POST',
          path: '/auth/logout',
          description: 'Fazer logout',
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          response: {
            message: 'Logout realizado com sucesso'
          }
        }
      );
    }

    setApiSchema({
      name,
      baseUrl,
      endpoints,
      documentation
    });
  }, [selectedTemplate, customization]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const exportApiSchema = () => {
    if (!apiSchema) return;
    
    const dataStr = JSON.stringify(apiSchema, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `api-schema-${selectedTemplate}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPostmanCollection = () => {
    if (!apiSchema) return;

    const collection = {
      info: {
        name: apiSchema.name,
        description: apiSchema.documentation,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: apiSchema.endpoints.map(endpoint => ({
        name: endpoint.description,
        request: {
          method: endpoint.method,
          header: Object.entries(endpoint.headers).map(([key, value]) => ({
            key,
            value,
            type: 'text'
          })),
          url: {
            raw: `${apiSchema.baseUrl}${endpoint.path}`,
            host: [apiSchema.baseUrl.replace('https://', '').replace('http://', '')],
            path: endpoint.path.split('/').filter(Boolean)
          }
        },
        response: [{
          name: 'Success Response',
          originalRequest: {
            method: endpoint.method,
            header: [],
            url: {
              raw: `${apiSchema.baseUrl}${endpoint.path}`,
              host: [apiSchema.baseUrl.replace('https://', '').replace('http://', '')],
              path: endpoint.path.split('/').filter(Boolean)
            }
          },
          status: endpoint.statusCode.toString(),
          code: endpoint.statusCode,
          header: Object.entries(endpoint.headers).map(([key, value]) => ({
            key,
            value
          })),
          body: JSON.stringify(endpoint.response, null, 2)
        }]
      }))
    };

    const dataStr = JSON.stringify(collection, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `postman-collection-${selectedTemplate}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleResponseVisibility = (index: number) => {
    setShowResponse(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800 border-green-200';
      case 'POST': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PUT': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
      case 'PATCH': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Server className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Gerador de REST API Fake
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Crie APIs REST completas com dados realistas para prototipagem e testes
        </p>
      </div>

      {/* Template Selection */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          Escolha um Template
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`p-3 bg-gradient-to-r ${template.color} rounded-lg flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Customization Options */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-600" />
          Personalização
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Registros
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={customization.recordCount}
              onChange={(e) => setCustomization(prev => ({ 
                ...prev, 
                recordCount: parseInt(e.target.value) || 10 
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formato de Resposta
            </label>
            <select
              value={customization.responseFormat}
              onChange={(e) => setCustomization(prev => ({ 
                ...prev, 
                responseFormat: e.target.value 
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="json">JSON</option>
              <option value="xml">XML</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Localização
            </label>
            <select
              value={customization.locale}
              onChange={(e) => setCustomization(prev => ({ 
                ...prev, 
                locale: e.target.value 
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pt-BR">🇧🇷 Português (Brasil)</option>
              <option value="en-US">🇺🇸 English (US)</option>
              <option value="es-ES">🇪🇸 Español</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Recursos Adicionais</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={customization.includeAuth}
                onChange={(e) => setCustomization(prev => ({ 
                  ...prev, 
                  includeAuth: e.target.checked 
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Autenticação</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={customization.includePagination}
                onChange={(e) => setCustomization(prev => ({ 
                  ...prev, 
                  includePagination: e.target.checked 
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Paginação</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={customization.includeFiltering}
                onChange={(e) => setCustomization(prev => ({ 
                  ...prev, 
                  includeFiltering: e.target.checked 
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Filtros</span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={generateApiSchema}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <RefreshCw className="w-5 h-5" />
            Gerar API
          </button>

          {apiSchema && (
            <>
              <button
                onClick={exportApiSchema}
                className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-all duration-200"
              >
                <Download className="w-5 h-5" />
                Exportar JSON
              </button>

              <button
                onClick={exportPostmanCollection}
                className="flex items-center gap-2 px-4 py-3 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg hover:bg-orange-100 transition-all duration-200"
              >
                <Download className="w-5 h-5" />
                Postman Collection
              </button>
            </>
          )}
        </div>
      </div>

      {/* API Documentation */}
      {apiSchema && (
        <div className="space-y-8">
          {/* API Overview */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <Globe className="w-6 h-6 text-blue-600" />
                {apiSchema.name}
              </h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {apiSchema.endpoints.length} endpoints
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Base URL</h3>
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                  <code className="text-sm text-gray-800 flex-1">{apiSchema.baseUrl}</code>
                  <button
                    onClick={() => copyToClipboard(apiSchema.baseUrl, 'baseUrl')}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {copiedField === 'baseUrl' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Descrição</h3>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  {apiSchema.documentation}
                </p>
              </div>
            </div>
          </div>

          {/* Endpoints */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-600" />
              Endpoints
            </h2>

            <div className="space-y-4">
              {apiSchema.endpoints.map((endpoint, index) => (
                <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                        <code className="text-sm font-mono text-gray-800">
                          {apiSchema.baseUrl}{endpoint.path}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(`${apiSchema.baseUrl}${endpoint.path}`, `endpoint-${index}`)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {copiedField === `endpoint-${index}` ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => toggleResponseVisibility(index)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showResponse[index] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{endpoint.description}</p>
                  </div>

                  {showResponse[index] && (
                    <div className="p-4 bg-gray-900">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-300">Response ({endpoint.statusCode})</h4>
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(endpoint.response, null, 2), `response-${index}`)}
                          className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          {copiedField === `response-${index}` ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <pre className="text-sm text-green-400 overflow-x-auto">
                        <code>{JSON.stringify(endpoint.response, null, 2)}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Usage Examples */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Exemplos de Uso
            </h2>

            <div className="space-y-6">
              {/* JavaScript/Fetch */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  JavaScript (Fetch API)
                </h3>
                <div className="bg-gray-900 rounded-lg p-4">
                  <pre className="text-sm text-green-400 overflow-x-auto">
                    <code>{`// Buscar dados
fetch('${apiSchema.baseUrl}${apiSchema.endpoints[0]?.path}')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));

// Criar novo item (POST)
fetch('${apiSchema.baseUrl}${apiSchema.endpoints.find(e => e.method === 'POST')?.path}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    // seus dados aqui
  })
})
.then(response => response.json())
.then(data => console.log(data));`}</code>
                  </pre>
                </div>
              </div>

              {/* cURL */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  cURL
                </h3>
                <div className="bg-gray-900 rounded-lg p-4">
                  <pre className="text-sm text-green-400 overflow-x-auto">
                    <code>{`# GET request
curl -X GET "${apiSchema.baseUrl}${apiSchema.endpoints[0]?.path}" \\
  -H "Content-Type: application/json"

# POST request
curl -X POST "${apiSchema.baseUrl}${apiSchema.endpoints.find(e => e.method === 'POST')?.path}" \\
  -H "Content-Type: application/json" \\
  -d '{"key": "value"}'`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Info */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">🚀 Recursos da API Fake</h3>
            <div className="text-blue-800 leading-relaxed space-y-2">
              <p>
                Esta ferramenta gera APIs REST completas com dados realistas para prototipagem e testes. 
                Perfeita para desenvolvimento frontend sem depender de backend.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Características
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Dados realistas e variados</li>
                    <li>• Múltiplos templates prontos</li>
                    <li>• Exportação para Postman</li>
                    <li>• Documentação automática</li>
                  </ul>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Casos de Uso
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Prototipagem rápida</li>
                    <li>• Testes de frontend</li>
                    <li>• Demonstrações para clientes</li>
                    <li>• Desenvolvimento offline</li>
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

export default FakeRestApiGenerator;