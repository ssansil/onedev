import React, { useState, useCallback } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Users, 
  DollarSign, 
  Copy, 
  RefreshCw, 
  Download, 
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  Briefcase,
  Calendar,
  Hash,
  FileText,
  TrendingUp,
  Award,
  Factory,
  Store,
  Laptop,
  Truck,
  Heart,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';

interface CompanyInfo {
  // Dados Básicos
  companyName: string;
  tradeName: string;
  cnpj: string;
  stateRegistration: string;
  municipalRegistration: string;
  
  // Classificação
  companySize: string;
  legalNature: string;
  businessActivity: string;
  cnaeCode: string;
  sector: string;
  
  // Contato
  email: string;
  phone: string;
  website: string;
  
  // Endereço
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  fullAddress: string;
  
  // Financeiro
  authorizedCapital: string;
  revenue: string;
  employees: number;
  foundingDate: string;
  
  // Representantes
  ceo: string;
  ceoDocument: string;
  legalRepresentative: string;
  accountant: string;
  
  // Outros
  socialObject: string;
  situation: string;
  lastUpdate: string;
  specialSituation: string;
  
  // Dados Bancários
  bank: string;
  agency: string;
  account: string;
  
  // Certificações
  certifications: string[];
  licenses: string[];
}

const CompanyGenerator: React.FC = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [companyType, setCompanyType] = useState<string>('random');
  const [showSensitive, setShowSensitive] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string>('');

  const companyTypes = [
    { id: 'random', name: 'Aleatório', icon: Building2, description: 'Qualquer tipo de empresa' },
    { id: 'tech', name: 'Tecnologia', icon: Laptop, description: 'Empresas de TI e software' },
    { id: 'retail', name: 'Varejo', icon: Store, description: 'Lojas e comércio' },
    { id: 'industry', name: 'Indústria', icon: Factory, description: 'Fábricas e manufatura' },
    { id: 'services', name: 'Serviços', icon: Briefcase, description: 'Prestação de serviços' },
    { id: 'logistics', name: 'Logística', icon: Truck, description: 'Transporte e distribuição' },
    { id: 'health', name: 'Saúde', icon: Heart, description: 'Clínicas e hospitais' }
  ];

  const companyNames = {
    tech: [
      'TechSolutions', 'InnovaTech', 'DigitalWorks', 'CodeMasters', 'SoftwarePro',
      'DataSystems', 'CloudTech', 'WebSolutions', 'AppDev', 'TechnoLogic',
      'CyberSoft', 'InfoTech', 'DigitalCore', 'SmartSystems', 'TechVision'
    ],
    retail: [
      'MegaStore', 'SuperShop', 'ComercialMax', 'LojaTotal', 'VarejoPlus',
      'ShoppingCenter', 'MercadoFácil', 'CompraSegura', 'LojaOnline', 'VendaMais',
      'ComércioDigital', 'RetailPro', 'MegaVendas', 'LojaExpress', 'VarejoModerno'
    ],
    industry: [
      'IndústriaForte', 'FábricaMax', 'ProduçãoPro', 'ManufaturaBrasil', 'IndústriaTech',
      'FábricaModerna', 'ProduçãoTotal', 'IndústriaPlus', 'ManufaturaAvançada', 'FábricaDigital',
      'ProduçãoInteligente', 'IndústriaInovadora', 'FábricaSustentável', 'ManufaturaEficiente', 'IndústriaVerde'
    ],
    services: [
      'ServiçosPro', 'ConsultoriaMax', 'AtendimentoTotal', 'ServiçosPlus', 'SoluçõesRápidas',
      'ConsultoriaEspecializada', 'ServiçosDigitais', 'AtendimentoPremium', 'SoluçõesInteligentes', 'ServiçosModernos',
      'ConsultoriaAvançada', 'AtendimentoExcelente', 'ServiçosInovadores', 'SoluçõesEficientes', 'ConsultoriaEstrategica'
    ],
    logistics: [
      'LogísticaRápida', 'TransporteSeguro', 'EntregaExpress', 'LogísticaTotal', 'TransportePro',
      'DistribuiçãoMax', 'LogísticaModerna', 'TransporteEficiente', 'EntregaRápida', 'LogísticaPlus',
      'TransporteDigital', 'DistribuiçãoPro', 'LogísticaInteligente', 'TransporteVerde', 'EntregaSustentável'
    ],
    health: [
      'SaúdePlus', 'ClínicaModerna', 'MedCenter', 'SaúdeTotal', 'ClínicaAvançada',
      'HospitalDigital', 'SaúdeInteligente', 'ClínicaEspecializada', 'MedTech', 'SaúdeInovadora',
      'ClínicaPremium', 'HospitalModerno', 'SaúdeDigital', 'ClínicaIntegrada', 'MedSolutions'
    ]
  };

  const suffixes = ['Ltda', 'S.A.', 'EIRELI', 'ME', 'EPP', 'Sociedade Simples'];

  const legalNatures = [
    'Sociedade Empresária Limitada',
    'Sociedade Anônima',
    'Empresa Individual de Responsabilidade Limitada',
    'Microempresa',
    'Empresa de Pequeno Porte',
    'Sociedade Simples',
    'Empresário Individual'
  ];

  const businessActivities = {
    tech: [
      'Desenvolvimento de software',
      'Consultoria em tecnologia da informação',
      'Desenvolvimento de aplicações web',
      'Serviços de hospedagem na internet',
      'Desenvolvimento de jogos eletrônicos',
      'Consultoria em sistemas de informação',
      'Desenvolvimento de aplicativos móveis',
      'Serviços de computação em nuvem'
    ],
    retail: [
      'Comércio varejista de produtos diversos',
      'Comércio eletrônico',
      'Comércio varejista de roupas e acessórios',
      'Comércio varejista de produtos alimentícios',
      'Comércio varejista de móveis e decoração',
      'Comércio varejista de produtos farmacêuticos',
      'Comércio varejista de equipamentos eletrônicos',
      'Comércio varejista de livros e materiais'
    ],
    industry: [
      'Fabricação de produtos alimentícios',
      'Fabricação de produtos químicos',
      'Fabricação de máquinas e equipamentos',
      'Fabricação de produtos de metal',
      'Fabricação de produtos têxteis',
      'Fabricação de móveis',
      'Fabricação de produtos de plástico',
      'Fabricação de produtos eletrônicos'
    ],
    services: [
      'Consultoria empresarial',
      'Serviços de contabilidade',
      'Serviços jurídicos',
      'Serviços de marketing e publicidade',
      'Serviços de limpeza e conservação',
      'Serviços de segurança privada',
      'Serviços de recursos humanos',
      'Serviços de arquitetura e engenharia'
    ],
    logistics: [
      'Transporte rodoviário de cargas',
      'Armazenamento e depósito',
      'Serviços de entrega expressa',
      'Transporte de passageiros',
      'Serviços de logística integrada',
      'Distribuição de mercadorias',
      'Serviços de mudanças',
      'Transporte internacional'
    ],
    health: [
      'Atividades de atendimento hospitalar',
      'Atividades de clínicas médicas',
      'Atividades odontológicas',
      'Atividades de fisioterapia',
      'Laboratórios de análises clínicas',
      'Farmácias e drogarias',
      'Atividades veterinárias',
      'Serviços de diagnóstico por imagem'
    ]
  };

  const cnaeCodes = {
    tech: ['6201-5/00', '6202-3/00', '6203-1/00', '6204-0/00', '6209-1/00'],
    retail: ['4711-3/02', '4712-1/00', '4713-0/02', '4721-1/02', '4722-9/01'],
    industry: ['1011-2/01', '2011-8/00', '2511-0/00', '2512-8/00', '2513-6/00'],
    services: ['7020-4/00', '6920-6/01', '6911-7/01', '7311-4/00', '8121-4/00'],
    logistics: ['4930-2/02', '5211-7/01', '5320-2/02', '4922-1/01', '5250-8/05'],
    health: ['8610-1/01', '8630-5/02', '8640-2/01', '8650-0/01', '8660-7/00']
  };

  const sectors = {
    tech: 'Tecnologia da Informação',
    retail: 'Comércio Varejista',
    industry: 'Indústria de Transformação',
    services: 'Serviços Especializados',
    logistics: 'Transporte e Logística',
    health: 'Saúde e Bem-estar'
  };

  const companySizes = ['Microempresa', 'Pequena Empresa', 'Média Empresa', 'Grande Empresa'];

  const states = [
    { code: 'SP', name: 'São Paulo', cities: ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Sorocaba'] },
    { code: 'RJ', name: 'Rio de Janeiro', cities: ['Rio de Janeiro', 'Niterói', 'Nova Iguaçu', 'Duque de Caxias', 'Campos'] },
    { code: 'MG', name: 'Minas Gerais', cities: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim'] },
    { code: 'RS', name: 'Rio Grande do Sul', cities: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria'] },
    { code: 'PR', name: 'Paraná', cities: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel'] },
    { code: 'SC', name: 'Santa Catarina', cities: ['Florianópolis', 'Joinville', 'Blumenau', 'Chapecó', 'Itajaí'] }
  ];

  const banks = [
    'Banco do Brasil', 'Caixa Econômica Federal', 'Bradesco', 'Itaú', 'Santander',
    'Nubank', 'Inter', 'C6 Bank', 'Original', 'Safra'
  ];

  const certifications = {
    tech: ['ISO 27001', 'ISO 9001', 'CMMI', 'Agile Certification', 'AWS Partner'],
    retail: ['ISO 9001', 'Certificação ABNT', 'Selo de Qualidade', 'Certificação Ambiental'],
    industry: ['ISO 9001', 'ISO 14001', 'OHSAS 18001', 'ISO 45001', 'Certificação INMETRO'],
    services: ['ISO 9001', 'ISO 14001', 'Certificação Profissional', 'Selo de Excelência'],
    logistics: ['ISO 9001', 'ISO 14001', 'Certificação ANTT', 'OEA - Operador Econômico Autorizado'],
    health: ['Certificação ANVISA', 'ISO 9001', 'Acreditação Hospitalar', 'Certificação CRM']
  };

  const licenses = {
    tech: ['Licença de Funcionamento', 'Alvará Municipal', 'Certificado Digital'],
    retail: ['Alvará de Funcionamento', 'Licença Sanitária', 'Licença Ambiental'],
    industry: ['Licença Ambiental', 'Licença de Operação', 'Alvará de Funcionamento', 'Certificado de Conformidade'],
    services: ['Alvará de Funcionamento', 'Licença Profissional', 'Certificado de Regularidade'],
    logistics: ['Licença ANTT', 'Alvará de Funcionamento', 'Licença Ambiental'],
    health: ['Licença Sanitária', 'Alvará de Funcionamento', 'Licença ANVISA', 'Certificado de Responsabilidade Técnica']
  };

  const generateCNPJ = (): string => {
    const randomDigits = () => Math.floor(Math.random() * 9);
    
    let cnpj = '';
    for (let i = 0; i < 12; i++) {
      cnpj += randomDigits();
    }
    
    // Calcular primeiro dígito verificador
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj[i]) * weights1[i];
    }
    let firstDigit = sum % 11;
    firstDigit = firstDigit < 2 ? 0 : 11 - firstDigit;
    
    // Calcular segundo dígito verificador
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj[i]) * weights2[i];
    }
    sum += firstDigit * weights2[12];
    let secondDigit = sum % 11;
    secondDigit = secondDigit < 2 ? 0 : 11 - secondDigit;
    
    cnpj += firstDigit.toString() + secondDigit.toString();
    
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const generateStateRegistration = (): string => {
    const digits = Math.floor(Math.random() * 900000000) + 100000000;
    return digits.toString().replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
  };

  const generateMunicipalRegistration = (): string => {
    return Math.floor(Math.random() * 9000000) + 1000000;
  };

  const generatePhone = (): string => {
    const ddd = Math.floor(Math.random() * 89) + 11;
    const number = Math.floor(Math.random() * 90000000) + 10000000;
    return `(${ddd}) ${number.toString().replace(/(\d{4})(\d{4})/, '$1-$2')}`;
  };

  const generateZipCode = (): string => {
    const code = Math.floor(Math.random() * 90000000) + 10000000;
    return code.toString().replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const generateEmail = (companyName: string): string => {
    const domains = ['com.br', 'com', 'net.br', 'org.br'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const cleanName = companyName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 15);
    return `contato@${cleanName}.${domain}`;
  };

  const generateWebsite = (companyName: string): string => {
    const cleanName = companyName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 15);
    return `https://www.${cleanName}.com.br`;
  };

  const generateFoundingDate = (): string => {
    const currentYear = new Date().getFullYear();
    const year = Math.floor(Math.random() * (currentYear - 1990)) + 1990;
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    
    return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
  };

  const generateRevenue = (size: string): string => {
    const revenues = {
      'Microempresa': ['R$ 81.000,00', 'R$ 150.000,00', 'R$ 240.000,00', 'R$ 360.000,00'],
      'Pequena Empresa': ['R$ 500.000,00', 'R$ 1.200.000,00', 'R$ 2.400.000,00', 'R$ 4.800.000,00'],
      'Média Empresa': ['R$ 8.000.000,00', 'R$ 15.000.000,00', 'R$ 25.000.000,00', 'R$ 50.000.000,00'],
      'Grande Empresa': ['R$ 100.000.000,00', 'R$ 250.000.000,00', 'R$ 500.000.000,00', 'R$ 1.000.000.000,00']
    };
    
    const options = revenues[size as keyof typeof revenues] || revenues['Pequena Empresa'];
    return options[Math.floor(Math.random() * options.length)];
  };

  const generateEmployees = (size: string): number => {
    const ranges = {
      'Microempresa': [1, 9],
      'Pequena Empresa': [10, 49],
      'Média Empresa': [50, 249],
      'Grande Empresa': [250, 1000]
    };
    
    const [min, max] = ranges[size as keyof typeof ranges] || [10, 49];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const generateCapital = (size: string): string => {
    const capitals = {
      'Microempresa': ['R$ 10.000,00', 'R$ 25.000,00', 'R$ 50.000,00'],
      'Pequena Empresa': ['R$ 100.000,00', 'R$ 250.000,00', 'R$ 500.000,00'],
      'Média Empresa': ['R$ 1.000.000,00', 'R$ 2.500.000,00', 'R$ 5.000.000,00'],
      'Grande Empresa': ['R$ 10.000.000,00', 'R$ 25.000.000,00', 'R$ 50.000.000,00']
    };
    
    const options = capitals[size as keyof typeof capitals] || capitals['Pequena Empresa'];
    return options[Math.floor(Math.random() * options.length)];
  };

  const generatePersonName = (): string => {
    const firstNames = [
      'João', 'Maria', 'José', 'Ana', 'Carlos', 'Francisca', 'Paulo', 'Antônia',
      'Pedro', 'Adriana', 'Lucas', 'Juliana', 'Marcos', 'Márcia', 'Luis', 'Fernanda'
    ];
    
    const lastNames = [
      'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
      'Pereira', 'Lima', 'Gomes', 'Ribeiro', 'Carvalho', 'Ramos', 'Almeida'
    ];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName1 = lastNames[Math.floor(Math.random() * lastNames.length)];
    const lastName2 = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName1} ${lastName2}`;
  };

  const generateCPF = (): string => {
    const randomDigits = () => Math.floor(Math.random() * 9);
    
    let cpf = '';
    for (let i = 0; i < 9; i++) {
      cpf += randomDigits();
    }
    
    // Calcular dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf[i]) * (10 - i);
    }
    let firstDigit = 11 - (sum % 11);
    if (firstDigit >= 10) firstDigit = 0;
    
    sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf[i]) * (11 - i);
    }
    sum += firstDigit * 2;
    let secondDigit = 11 - (sum % 11);
    if (secondDigit >= 10) secondDigit = 0;
    
    cpf += firstDigit.toString() + secondDigit.toString();
    
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const generateBankAccount = (): string => {
    const account = Math.floor(Math.random() * 900000) + 100000;
    const digit = Math.floor(Math.random() * 9);
    return `${account}-${digit}`;
  };

  const generateAgency = (): string => {
    return Math.floor(Math.random() * 9000) + 1000;
  };

  const generateCompany = useCallback(() => {
    const selectedType = companyType === 'random' 
      ? Object.keys(companyNames)[Math.floor(Math.random() * Object.keys(companyNames).length)]
      : companyType;
    
    const typeKey = selectedType as keyof typeof companyNames;
    const names = companyNames[typeKey] || companyNames.tech;
    const baseName = names[Math.floor(Math.random() * names.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const companyName = `${baseName} ${suffix}`;
    
    const tradeName = baseName;
    const size = companySizes[Math.floor(Math.random() * companySizes.length)];
    const selectedState = states[Math.floor(Math.random() * states.length)];
    const city = selectedState.cities[Math.floor(Math.random() * selectedState.cities.length)];
    
    const streets = [
      'Rua Comercial', 'Avenida Empresarial', 'Rua dos Negócios', 'Avenida Industrial',
      'Rua do Comércio', 'Avenida Central', 'Rua Corporativa', 'Avenida Executiva'
    ];
    
    const neighborhoods = [
      'Centro Empresarial', 'Distrito Industrial', 'Centro Comercial', 'Zona Empresarial',
      'Parque Industrial', 'Centro', 'Vila Empresarial', 'Setor Comercial'
    ];
    
    const street = streets[Math.floor(Math.random() * streets.length)];
    const number = Math.floor(Math.random() * 9999) + 1;
    const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
    const zipCode = generateZipCode();
    
    const activities = businessActivities[typeKey] || businessActivities.tech;
    const codes = cnaeCodes[typeKey] || cnaeCodes.tech;
    const companyCerts = certifications[typeKey] || certifications.tech;
    const companyLicenses = licenses[typeKey] || licenses.tech;
    
    const company: CompanyInfo = {
      // Dados Básicos
      companyName,
      tradeName,
      cnpj: generateCNPJ(),
      stateRegistration: generateStateRegistration(),
      municipalRegistration: generateMunicipalRegistration().toString(),
      
      // Classificação
      companySize: size,
      legalNature: legalNatures[Math.floor(Math.random() * legalNatures.length)],
      businessActivity: activities[Math.floor(Math.random() * activities.length)],
      cnaeCode: codes[Math.floor(Math.random() * codes.length)],
      sector: sectors[typeKey] || 'Serviços Gerais',
      
      // Contato
      email: generateEmail(baseName),
      phone: generatePhone(),
      website: generateWebsite(baseName),
      
      // Endereço
      street,
      number: number.toString(),
      complement: Math.random() > 0.7 ? `Sala ${Math.floor(Math.random() * 200) + 1}` : '',
      neighborhood,
      city,
      state: selectedState.name,
      zipCode,
      fullAddress: `${street}, ${number}${Math.random() > 0.7 ? `, Sala ${Math.floor(Math.random() * 200) + 1}` : ''} - ${neighborhood}, ${city} - ${selectedState.code}, ${zipCode}`,
      
      // Financeiro
      authorizedCapital: generateCapital(size),
      revenue: generateRevenue(size),
      employees: generateEmployees(size),
      foundingDate: generateFoundingDate(),
      
      // Representantes
      ceo: generatePersonName(),
      ceoDocument: generateCPF(),
      legalRepresentative: generatePersonName(),
      accountant: generatePersonName(),
      
      // Outros
      socialObject: `${activities[Math.floor(Math.random() * activities.length)]} e atividades correlatas.`,
      situation: Math.random() > 0.1 ? 'Ativa' : 'Suspensa',
      lastUpdate: new Date().toLocaleDateString('pt-BR'),
      specialSituation: Math.random() > 0.9 ? 'Em recuperação judicial' : 'Nenhuma',
      
      // Dados Bancários
      bank: banks[Math.floor(Math.random() * banks.length)],
      agency: generateAgency().toString(),
      account: generateBankAccount(),
      
      // Certificações
      certifications: companyCerts.slice(0, Math.floor(Math.random() * 3) + 1),
      licenses: companyLicenses.slice(0, Math.floor(Math.random() * 3) + 1)
    };

    setCompanyInfo(company);
  }, [companyType]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const exportToJSON = () => {
    if (!companyInfo) return;
    
    const dataStr = JSON.stringify(companyInfo, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `empresa-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderField = (label: string, value: string, icon: React.ElementType, sensitive = false) => {
    const Icon = icon;
    const shouldHide = sensitive && !showSensitive;
    const displayValue = shouldHide ? '••••••••••••' : value;
    
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">{label}:</span>
            {sensitive && (
              <Shield className="w-3 h-3 text-amber-500" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-900 font-mono">{displayValue}</span>
            <button
              onClick={() => copyToClipboard(value, label)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={shouldHide}
            >
              {copiedField === label ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Gerador de Empresas
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Gere informações completas e realistas de empresas brasileiras para testes e desenvolvimento
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          {/* Company Type Selection */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Empresa
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {companyTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setCompanyType(type.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 ${
                      companyType === type.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium text-center">{type.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={generateCompany}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              Gerar Empresa
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setShowSensitive(!showSensitive)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                  showSensitive
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                {showSensitive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showSensitive ? 'Ocultar' : 'Mostrar'} Sensíveis
              </button>

              {companyInfo && (
                <button
                  onClick={exportToJSON}
                  className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Company Information */}
      {companyInfo && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Dados da Empresa
            </h2>

            <div className="space-y-4">
              {renderField('Razão Social', companyInfo.companyName, Building2)}
              {renderField('Nome Fantasia', companyInfo.tradeName, Store)}
              {renderField('CNPJ', companyInfo.cnpj, Hash, true)}
              {renderField('Inscrição Estadual', companyInfo.stateRegistration, FileText, true)}
              {renderField('Inscrição Municipal', companyInfo.municipalRegistration, FileText, true)}
              {renderField('Natureza Jurídica', companyInfo.legalNature, FileText)}
              {renderField('Porte da Empresa', companyInfo.companySize, TrendingUp)}
              {renderField('Situação', companyInfo.situation, CheckCircle)}
              {renderField('Data de Fundação', companyInfo.foundingDate, Calendar)}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-600" />
              Contato
            </h2>

            <div className="space-y-4">
              {renderField('E-mail', companyInfo.email, Mail)}
              {renderField('Telefone', companyInfo.phone, Phone)}
              {renderField('Website', companyInfo.website, Globe)}
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              Endereço
            </h2>

            <div className="space-y-4">
              {renderField('Logradouro', companyInfo.street, MapPin)}
              {renderField('Número', companyInfo.number, Building2)}
              {companyInfo.complement && renderField('Complemento', companyInfo.complement, Building2)}
              {renderField('Bairro', companyInfo.neighborhood, MapPin)}
              {renderField('Cidade', companyInfo.city, MapPin)}
              {renderField('Estado', companyInfo.state, MapPin)}
              {renderField('CEP', companyInfo.zipCode, MapPin)}
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-600" />
              Atividade Empresarial
            </h2>

            <div className="space-y-4">
              {renderField('Setor', companyInfo.sector, Target)}
              {renderField('Atividade Principal', companyInfo.businessActivity, Briefcase)}
              {renderField('Código CNAE', companyInfo.cnaeCode, Hash)}
              {renderField('Objeto Social', companyInfo.socialObject, FileText)}
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Dados Financeiros
            </h2>

            <div className="space-y-4">
              {renderField('Capital Autorizado', companyInfo.authorizedCapital, DollarSign)}
              {renderField('Faturamento Anual', companyInfo.revenue, BarChart3)}
              {renderField('Número de Funcionários', companyInfo.employees.toString(), Users)}
            </div>
          </div>

          {/* Banking Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Dados Bancários
            </h2>

            <div className="space-y-4">
              {renderField('Banco', companyInfo.bank, Building2)}
              {renderField('Agência', companyInfo.agency, Hash, true)}
              {renderField('Conta Corrente', companyInfo.account, Hash, true)}
            </div>
          </div>
        </div>
      )}

      {/* Representatives */}
      {companyInfo && (
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Representantes
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Diretor Executivo</h3>
              {renderField('Nome', companyInfo.ceo, Users)}
              {renderField('CPF', companyInfo.ceoDocument, Hash, true)}
            </div>
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Outros</h3>
              {renderField('Representante Legal', companyInfo.legalRepresentative, Users)}
              {renderField('Contador Responsável', companyInfo.accountant, Users)}
            </div>
          </div>
        </div>
      )}

      {/* Certifications and Licenses */}
      {companyInfo && (
        <div className="mt-8 grid md:grid-cols-2 gap-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Certificações
            </h2>
            
            <div className="space-y-3">
              {companyInfo.certifications.map((cert, index) => (
                <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-900">{cert}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Licenças
            </h2>
            
            <div className="space-y-3">
              {companyInfo.licenses.map((license, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">{license}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full Address */}
      {companyInfo && (
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-600" />
            Endereço Completo
          </h2>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">Endereço formatado:</p>
                <code className="text-sm text-gray-800 bg-white p-3 rounded border block">
                  {companyInfo.fullAddress}
                </code>
              </div>
              <button
                onClick={() => copyToClipboard(companyInfo.fullAddress, 'Endereço Completo')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                {copiedField === 'Endereço Completo' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">🔒 Privacidade e Ética</h3>
            <p className="text-green-800 leading-relaxed">
              Todas as informações são geradas aleatoriamente e não correspondem a empresas reais. 
              Os dados são criados localmente no seu navegador e nunca são enviados para servidores. 
              Use essas informações apenas para testes, desenvolvimento e fins educacionais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyGenerator;