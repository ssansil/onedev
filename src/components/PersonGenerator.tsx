import React, { useState, useCallback } from 'react';
import { 
  User, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  CreditCard, 
  Copy, 
  RefreshCw, 
  Download, 
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  Briefcase,
  GraduationCap,
  Heart,
  Home,
  Car,
  Banknote
} from 'lucide-react';

interface PersonInfo {
  // Dados Pessoais
  firstName: string;
  lastName: string;
  fullName: string;
  gender: string;
  birthDate: string;
  age: number;
  cpf: string;
  rg: string;
  
  // Contato
  email: string;
  phone: string;
  cellphone: string;
  
  // Endereço
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  fullAddress: string;
  
  // Profissional
  profession: string;
  company: string;
  salary: string;
  education: string;
  
  // Documentos
  passport: string;
  driverLicense: string;
  voterTitle: string;
  workCard: string;
  
  // Financeiro
  bankAccount: string;
  agency: string;
  bank: string;
  pix: string;
  
  // Outros
  bloodType: string;
  zodiacSign: string;
  motherName: string;
  fatherName: string;
  maritalStatus: string;
  nationality: string;
}

const PersonGenerator: React.FC = () => {
  const [personInfo, setPersonInfo] = useState<PersonInfo | null>(null);
  const [gender, setGender] = useState<string>('random');
  const [showSensitive, setShowSensitive] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string>('');

  const genderOptions = [
    { id: 'random', name: 'Aleatório', icon: Users },
    { id: 'male', name: 'Masculino', icon: User },
    { id: 'female', name: 'Feminino', icon: User }
  ];

  const maleNames = [
    'João', 'José', 'Antônio', 'Francisco', 'Carlos', 'Paulo', 'Pedro', 'Lucas', 'Luiz', 'Marcos',
    'Luis', 'Gabriel', 'Rafael', 'Daniel', 'Marcelo', 'Bruno', 'Eduardo', 'Felipe', 'Raimundo', 'Rodrigo',
    'Manoel', 'Nelson', 'Roberto', 'Fabio', 'Leonardo', 'Gustavo', 'Guilherme', 'Leandro', 'Fernando', 'Sergio',
    'Mateus', 'André', 'Diego', 'Thiago', 'Ricardo', 'Alexandre', 'Vinicius', 'Márcio', 'Júlio', 'César'
  ];

  const femaleNames = [
    'Maria', 'Ana', 'Francisca', 'Antônia', 'Adriana', 'Juliana', 'Márcia', 'Fernanda', 'Patricia', 'Aline',
    'Sandra', 'Camila', 'Amanda', 'Bruna', 'Jessica', 'Leticia', 'Julia', 'Luciana', 'Vanessa', 'Mariana',
    'Gabriela', 'Valeria', 'Cristina', 'Daniela', 'Tatiane', 'Claudia', 'Luana', 'Rafaela', 'Carla', 'Beatriz',
    'Larissa', 'Priscila', 'Simone', 'Caroline', 'Renata', 'Natalia', 'Sabrina', 'Michele', 'Andreia', 'Bianca'
  ];

  const lastNames = [
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
    'Ribeiro', 'Carvalho', 'Ramos', 'Almeida', 'Dias', 'Moreira', 'Nascimento', 'Araújo', 'Costa', 'Jesus',
    'Campos', 'Andrade', 'Barbosa', 'Cardoso', 'Reis', 'Rocha', 'Pinto', 'Medeiros', 'Machado', 'Lopes',
    'Freitas', 'Fernandes', 'Castro', 'Correia', 'Martins', 'Mendes', 'Teixeira', 'Morais', 'Monteiro', 'Nunes'
  ];

  const professions = [
    'Desenvolvedor de Software', 'Analista de Sistemas', 'Engenheiro Civil', 'Médico', 'Enfermeiro',
    'Professor', 'Advogado', 'Contador', 'Administrador', 'Vendedor', 'Gerente', 'Técnico em Informática',
    'Designer Gráfico', 'Arquiteto', 'Psicólogo', 'Fisioterapeuta', 'Dentista', 'Farmacêutico',
    'Jornalista', 'Publicitário', 'Chef de Cozinha', 'Mecânico', 'Eletricista', 'Pedreiro',
    'Motorista', 'Recepcionista', 'Secretário', 'Auxiliar Administrativo', 'Consultor', 'Analista Financeiro'
  ];

  const companies = [
    'Tech Solutions Ltda', 'Inovação Digital', 'Consultoria Empresarial', 'Grupo Tecnologia',
    'Sistemas Integrados', 'Desenvolvimento Web', 'Soluções Corporativas', 'Empresa de TI',
    'Consultoria Estratégica', 'Negócios Digitais', 'Automação Industrial', 'Serviços Profissionais',
    'Gestão Empresarial', 'Tecnologia Avançada', 'Inovação e Desenvolvimento'
  ];

  const education = [
    'Ensino Fundamental', 'Ensino Médio', 'Técnico em Informática', 'Técnico em Administração',
    'Superior em Administração', 'Superior em Engenharia', 'Superior em Direito', 'Superior em Medicina',
    'Superior em Sistemas de Informação', 'Superior em Ciências Contábeis', 'Pós-graduação',
    'MBA em Gestão', 'Mestrado', 'Doutorado'
  ];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  const zodiacSigns = [
    'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
    'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'
  ];

  const maritalStatus = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'];

  const states = [
    { code: 'SP', name: 'São Paulo', cities: ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Sorocaba'] },
    { code: 'RJ', name: 'Rio de Janeiro', cities: ['Rio de Janeiro', 'Niterói', 'Nova Iguaçu', 'Duque de Caxias', 'Campos'] },
    { code: 'MG', name: 'Minas Gerais', cities: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim'] },
    { code: 'RS', name: 'Rio Grande do Sul', cities: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria'] },
    { code: 'PR', name: 'Paraná', cities: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel'] },
    { code: 'SC', name: 'Santa Catarina', cities: ['Florianópolis', 'Joinville', 'Blumenau', 'Chapecó', 'Itajaí'] },
    { code: 'BA', name: 'Bahia', cities: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro'] },
    { code: 'GO', name: 'Goiás', cities: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia'] }
  ];

  const banks = [
    'Banco do Brasil', 'Caixa Econômica Federal', 'Bradesco', 'Itaú', 'Santander',
    'Nubank', 'Inter', 'C6 Bank', 'Original', 'Safra', 'Sicoob', 'Sicredi'
  ];

  const neighborhoods = [
    'Centro', 'Vila Nova', 'Jardim das Flores', 'Bairro Alto', 'Vila São José',
    'Parque Industrial', 'Cidade Nova', 'Jardim América', 'Vila Esperança', 'Bela Vista',
    'Copacabana', 'Ipanema', 'Leblon', 'Botafogo', 'Flamengo', 'Tijuca', 'Barra da Tijuca'
  ];

  const streets = [
    'Rua das Flores', 'Avenida Brasil', 'Rua São João', 'Avenida Paulista', 'Rua da Paz',
    'Avenida Central', 'Rua do Comércio', 'Rua 15 de Novembro', 'Avenida Getúlio Vargas',
    'Rua Sete de Setembro', 'Avenida Presidente Vargas', 'Rua Dom Pedro II', 'Rua da República',
    'Avenida Independência', 'Rua Marechal Deodoro', 'Rua Barão do Rio Branco'
  ];

  // Função para gerar CPF válido
  const generateCPF = (): string => {
    const randomDigits = () => Math.floor(Math.random() * 9);
    
    let cpf = '';
    for (let i = 0; i < 9; i++) {
      cpf += randomDigits();
    }
    
    // Calcular primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf[i]) * (10 - i);
    }
    let firstDigit = 11 - (sum % 11);
    if (firstDigit >= 10) firstDigit = 0;
    
    // Calcular segundo dígito verificador
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

  const generateRG = (): string => {
    let rg = '';
    for (let i = 0; i < 8; i++) {
      rg += Math.floor(Math.random() * 9);
    }
    return rg.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3-X');
  };

  const generatePhone = (): string => {
    const ddd = Math.floor(Math.random() * 89) + 11; // DDDs de 11 a 99
    const number = Math.floor(Math.random() * 90000000) + 10000000;
    return `(${ddd}) ${number.toString().replace(/(\d{4})(\d{4})/, '$1-$2')}`;
  };

  const generateCellphone = (): string => {
    const ddd = Math.floor(Math.random() * 89) + 11;
    const number = Math.floor(Math.random() * 900000000) + 900000000; // Celular sempre começa com 9
    return `(${ddd}) ${number.toString().replace(/(\d{5})(\d{4})/, '$1-$2')}`;
  };

  const generateZipCode = (): string => {
    const code = Math.floor(Math.random() * 90000000) + 10000000;
    return code.toString().replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const generateEmail = (firstName: string, lastName: string): string => {
    const domains = ['gmail.com', 'hotmail.com', 'yahoo.com.br', 'outlook.com', 'uol.com.br'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const variations = [
      `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
      `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
      `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
      `${firstName.toLowerCase()}${Math.floor(Math.random() * 999)}`
    ];
    const email = variations[Math.floor(Math.random() * variations.length)];
    return `${email}@${domain}`;
  };

  const generateBankAccount = (): string => {
    const account = Math.floor(Math.random() * 900000) + 100000;
    const digit = Math.floor(Math.random() * 9);
    return `${account}-${digit}`;
  };

  const generateAgency = (): string => {
    return Math.floor(Math.random() * 9000) + 1000;
  };

  const generateDocument = (length: number): string => {
    let doc = '';
    for (let i = 0; i < length; i++) {
      doc += Math.floor(Math.random() * 9);
    }
    return doc;
  };

  const generateBirthDate = (): { date: string; age: number } => {
    const minAge = 18;
    const maxAge = 80;
    const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
    
    const today = new Date();
    const birthYear = today.getFullYear() - age;
    const birthMonth = Math.floor(Math.random() * 12);
    const birthDay = Math.floor(Math.random() * 28) + 1; // Evita problemas com fevereiro
    
    const birthDate = new Date(birthYear, birthMonth, birthDay);
    
    return {
      date: birthDate.toLocaleDateString('pt-BR'),
      age: age
    };
  };

  const getZodiacSign = (birthDate: string): string => {
    const [day, month] = birthDate.split('/').map(Number);
    
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Áries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Touro';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gêmeos';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Câncer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leão';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgem';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Escorpião';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagitário';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricórnio';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquário';
    return 'Peixes';
  };

  const generateSalary = (): string => {
    const salaries = [
      'R$ 1.412,00', 'R$ 1.800,00', 'R$ 2.500,00', 'R$ 3.200,00', 'R$ 4.500,00',
      'R$ 6.000,00', 'R$ 8.500,00', 'R$ 12.000,00', 'R$ 15.000,00', 'R$ 20.000,00'
    ];
    return salaries[Math.floor(Math.random() * salaries.length)];
  };

  const generatePerson = useCallback(() => {
    const selectedGender = gender === 'random' ? (Math.random() > 0.5 ? 'male' : 'female') : gender;
    const isMale = selectedGender === 'male';
    
    const firstName = isMale 
      ? maleNames[Math.floor(Math.random() * maleNames.length)]
      : femaleNames[Math.floor(Math.random() * femaleNames.length)];
    
    const lastName = `${lastNames[Math.floor(Math.random() * lastNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    const fullName = `${firstName} ${lastName}`;
    
    const { date: birthDate, age } = generateBirthDate();
    const selectedState = states[Math.floor(Math.random() * states.length)];
    const city = selectedState.cities[Math.floor(Math.random() * selectedState.cities.length)];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const number = Math.floor(Math.random() * 9999) + 1;
    const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
    const zipCode = generateZipCode();
    
    // Gerar nomes dos pais
    const motherFirstName = femaleNames[Math.floor(Math.random() * femaleNames.length)];
    const motherLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const motherName = `${motherFirstName} ${motherLastName}`;
    
    const fatherFirstName = maleNames[Math.floor(Math.random() * maleNames.length)];
    const fatherLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fatherName = `${fatherFirstName} ${fatherLastName}`;

    const person: PersonInfo = {
      // Dados Pessoais
      firstName,
      lastName,
      fullName,
      gender: isMale ? 'Masculino' : 'Feminino',
      birthDate,
      age,
      cpf: generateCPF(),
      rg: generateRG(),
      
      // Contato
      email: generateEmail(firstName, lastName.split(' ')[0]),
      phone: generatePhone(),
      cellphone: generateCellphone(),
      
      // Endereço
      street,
      number: number.toString(),
      complement: Math.random() > 0.7 ? `Apto ${Math.floor(Math.random() * 200) + 1}` : '',
      neighborhood,
      city,
      state: selectedState.name,
      zipCode,
      fullAddress: `${street}, ${number}${Math.random() > 0.7 ? `, Apto ${Math.floor(Math.random() * 200) + 1}` : ''} - ${neighborhood}, ${city} - ${selectedState.code}, ${zipCode}`,
      
      // Profissional
      profession: professions[Math.floor(Math.random() * professions.length)],
      company: companies[Math.floor(Math.random() * companies.length)],
      salary: generateSalary(),
      education: education[Math.floor(Math.random() * education.length)],
      
      // Documentos
      passport: `BR${generateDocument(7)}`,
      driverLicense: generateDocument(11),
      voterTitle: generateDocument(12),
      workCard: generateDocument(8),
      
      // Financeiro
      bankAccount: generateBankAccount(),
      agency: generateAgency().toString(),
      bank: banks[Math.floor(Math.random() * banks.length)],
      pix: Math.random() > 0.5 ? generateCellphone() : generateEmail(firstName, lastName.split(' ')[0]),
      
      // Outros
      bloodType: bloodTypes[Math.floor(Math.random() * bloodTypes.length)],
      zodiacSign: getZodiacSign(birthDate),
      motherName,
      fatherName,
      maritalStatus: maritalStatus[Math.floor(Math.random() * maritalStatus.length)],
      nationality: 'Brasileira'
    };

    setPersonInfo(person);
  }, [gender]);

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
    if (!personInfo) return;
    
    const dataStr = JSON.stringify(personInfo, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pessoa-${Date.now()}.json`;
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
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Gerador de Pessoa
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Gere informações completas e realistas de pessoas brasileiras para testes e desenvolvimento
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          {/* Gender Selection */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Gênero
            </label>
            <div className="grid grid-cols-3 gap-3">
              {genderOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setGender(option.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200 ${
                      gender === option.id
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-sm font-medium">{option.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={generatePerson}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              Gerar Pessoa
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

              {personInfo && (
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

      {/* Person Information */}
      {personInfo && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              Dados Pessoais
            </h2>

            <div className="space-y-4">
              {renderField('Nome Completo', personInfo.fullName, User)}
              {renderField('Primeiro Nome', personInfo.firstName, User)}
              {renderField('Sobrenome', personInfo.lastName, User)}
              {renderField('Gênero', personInfo.gender, Users)}
              {renderField('Data de Nascimento', personInfo.birthDate, Calendar)}
              {renderField('Idade', `${personInfo.age} anos`, Calendar)}
              {renderField('CPF', personInfo.cpf, CreditCard, true)}
              {renderField('RG', personInfo.rg, CreditCard, true)}
              {renderField('Nacionalidade', personInfo.nationality, MapPin)}
              {renderField('Estado Civil', personInfo.maritalStatus, Heart)}
              {renderField('Tipo Sanguíneo', personInfo.bloodType, Heart)}
              {renderField('Signo', personInfo.zodiacSign, Calendar)}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-600" />
              Contato
            </h2>

            <div className="space-y-4">
              {renderField('E-mail', personInfo.email, Mail)}
              {renderField('Telefone', personInfo.phone, Phone)}
              {renderField('Celular', personInfo.cellphone, Phone)}
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Home className="w-5 h-5 text-blue-600" />
              Endereço
            </h2>

            <div className="space-y-4">
              {renderField('Logradouro', personInfo.street, MapPin)}
              {renderField('Número', personInfo.number, Home)}
              {personInfo.complement && renderField('Complemento', personInfo.complement, Home)}
              {renderField('Bairro', personInfo.neighborhood, MapPin)}
              {renderField('Cidade', personInfo.city, MapPin)}
              {renderField('Estado', personInfo.state, MapPin)}
              {renderField('CEP', personInfo.zipCode, MapPin)}
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-orange-600" />
              Profissional
            </h2>

            <div className="space-y-4">
              {renderField('Profissão', personInfo.profession, Briefcase)}
              {renderField('Empresa', personInfo.company, Briefcase)}
              {renderField('Salário', personInfo.salary, Banknote)}
              {renderField('Escolaridade', personInfo.education, GraduationCap)}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-red-600" />
              Documentos
            </h2>

            <div className="space-y-4">
              {renderField('Passaporte', personInfo.passport, CreditCard, true)}
              {renderField('CNH', personInfo.driverLicense, Car, true)}
              {renderField('Título de Eleitor', personInfo.voterTitle, CreditCard, true)}
              {renderField('Carteira de Trabalho', personInfo.workCard, CreditCard, true)}
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-green-600" />
              Dados Bancários
            </h2>

            <div className="space-y-4">
              {renderField('Banco', personInfo.bank, Banknote)}
              {renderField('Agência', personInfo.agency, Banknote, true)}
              {renderField('Conta', personInfo.bankAccount, Banknote, true)}
              {renderField('PIX', personInfo.pix, Banknote, true)}
            </div>
          </div>
        </div>
      )}

      {/* Family Information */}
      {personInfo && (
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-600" />
            Filiação
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {renderField('Nome da Mãe', personInfo.motherName, User)}
            </div>
            <div className="space-y-4">
              {renderField('Nome do Pai', personInfo.fatherName, User)}
            </div>
          </div>
        </div>
      )}

      {/* Full Address */}
      {personInfo && (
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Endereço Completo
          </h2>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">Endereço formatado:</p>
                <code className="text-sm text-gray-800 bg-white p-3 rounded border block">
                  {personInfo.fullAddress}
                </code>
              </div>
              <button
                onClick={() => copyToClipboard(personInfo.fullAddress, 'Endereço Completo')}
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
              Todas as informações são geradas aleatoriamente e não correspondem a pessoas reais. 
              Os dados são criados localmente no seu navegador e nunca são enviados para servidores. 
              Use essas informações apenas para testes, desenvolvimento e fins educacionais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonGenerator;