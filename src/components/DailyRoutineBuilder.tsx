import React, { useState, useCallback } from 'react';
import { 
  Clock, 
  Target, 
  Calendar, 
  Coffee, 
  Sun, 
  Moon, 
  Copy, 
  Download, 
  RefreshCw,
  CheckCircle,
  Play,
  Pause,
  Book,
  Dumbbell,
  Brain,
  Heart,
  Briefcase,
  Users,
  Utensils,
  Bed,
  Smartphone,
  Music,
  TreePine,
  Zap,
  Focus,
  Timer,
  Plus,
  Minus,
  Eye,
  Settings,
  Save,
  Share2
} from 'lucide-react';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  activity: string;
  category: string;
  description: string;
  duration: number; // em minutos
  color: string;
  icon: React.ElementType;
}

interface RoutineConfig {
  objective: string;
  startTime: string;
  endTime: string;
  morningTime: number; // minutos disponíveis
  afternoonTime: number;
  eveningTime: number;
  breakDuration: number;
  workIntensity: 'low' | 'medium' | 'high';
  includeWeekends: boolean;
}

interface ActivityTemplate {
  name: string;
  category: string;
  duration: number;
  description: string;
  icon: React.ElementType;
  color: string;
  objectives: string[];
  timeOfDay: ('morning' | 'afternoon' | 'evening')[];
  priority: number;
}

const DailyRoutineBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'config' | 'routine' | 'preview'>('config');
  const [config, setConfig] = useState<RoutineConfig>({
    objective: '',
    startTime: '06:00',
    endTime: '22:00',
    morningTime: 180, // 3 horas
    afternoonTime: 240, // 4 horas
    eveningTime: 120, // 2 horas
    breakDuration: 15,
    workIntensity: 'medium',
    includeWeekends: false
  });
  
  const [generatedRoutine, setGeneratedRoutine] = useState<TimeSlot[]>([]);
  const [copiedField, setCopiedField] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const objectives = [
    { id: 'focus', name: 'Foco e Concentração', icon: Focus, color: 'from-blue-500 to-indigo-600' },
    { id: 'health', name: 'Saúde e Bem-estar', icon: Heart, color: 'from-red-500 to-pink-600' },
    { id: 'study', name: 'Estudos e Aprendizado', icon: Book, color: 'from-green-500 to-emerald-600' },
    { id: 'productivity', name: 'Produtividade', icon: Zap, color: 'from-yellow-500 to-orange-600' },
    { id: 'balance', name: 'Equilíbrio Vida-Trabalho', icon: Users, color: 'from-purple-500 to-violet-600' },
    { id: 'fitness', name: 'Condicionamento Físico', icon: Dumbbell, color: 'from-orange-500 to-red-600' },
    { id: 'creativity', name: 'Criatividade', icon: Brain, color: 'from-pink-500 to-rose-600' },
    { id: 'mindfulness', name: 'Mindfulness e Meditação', icon: TreePine, color: 'from-teal-500 to-cyan-600' }
  ];

  const activityTemplates: ActivityTemplate[] = [
    // Manhã
    { name: 'Despertar e Hidratação', category: 'Saúde', duration: 15, description: 'Acordar, beber água, alongamento leve', icon: Sun, color: 'bg-yellow-100 text-yellow-800', objectives: ['health', 'balance'], timeOfDay: ['morning'], priority: 10 },
    { name: 'Exercício Matinal', category: 'Fitness', duration: 45, description: 'Atividade física para energizar o dia', icon: Dumbbell, color: 'bg-orange-100 text-orange-800', objectives: ['health', 'fitness', 'balance'], timeOfDay: ['morning'], priority: 9 },
    { name: 'Meditação', category: 'Mindfulness', duration: 20, description: 'Prática de mindfulness e respiração', icon: TreePine, color: 'bg-teal-100 text-teal-800', objectives: ['mindfulness', 'focus', 'balance'], timeOfDay: ['morning', 'evening'], priority: 8 },
    { name: 'Café da Manhã', category: 'Alimentação', duration: 30, description: 'Refeição nutritiva e planejamento do dia', icon: Coffee, color: 'bg-amber-100 text-amber-800', objectives: ['health', 'balance'], timeOfDay: ['morning'], priority: 10 },
    { name: 'Planejamento do Dia', category: 'Produtividade', duration: 15, description: 'Revisar agenda e definir prioridades', icon: Calendar, color: 'bg-blue-100 text-blue-800', objectives: ['productivity', 'focus'], timeOfDay: ['morning'], priority: 9 },
    
    // Trabalho/Estudo
    { name: 'Trabalho Focado', category: 'Trabalho', duration: 90, description: 'Período de trabalho intenso sem distrações', icon: Briefcase, color: 'bg-indigo-100 text-indigo-800', objectives: ['focus', 'productivity'], timeOfDay: ['morning', 'afternoon'], priority: 10 },
    { name: 'Sessão de Estudos', category: 'Educação', duration: 60, description: 'Aprendizado ativo e prática', icon: Book, color: 'bg-green-100 text-green-800', objectives: ['study', 'focus'], timeOfDay: ['morning', 'afternoon', 'evening'], priority: 9 },
    { name: 'Projeto Criativo', category: 'Criatividade', duration: 75, description: 'Trabalho em projetos pessoais ou criativos', icon: Brain, color: 'bg-pink-100 text-pink-800', objectives: ['creativity', 'balance'], timeOfDay: ['afternoon', 'evening'], priority: 7 },
    { name: 'Reuniões e Comunicação', category: 'Trabalho', duration: 45, description: 'Reuniões, emails e comunicação', icon: Users, color: 'bg-purple-100 text-purple-800', objectives: ['productivity'], timeOfDay: ['morning', 'afternoon'], priority: 6 },
    
    // Pausas e Descanso
    { name: 'Pausa Ativa', category: 'Descanso', duration: 15, description: 'Alongamento, caminhada ou respiração', icon: Play, color: 'bg-cyan-100 text-cyan-800', objectives: ['health', 'focus', 'balance'], timeOfDay: ['morning', 'afternoon'], priority: 8 },
    { name: 'Almoço', category: 'Alimentação', duration: 60, description: 'Refeição principal e descanso', icon: Utensils, color: 'bg-emerald-100 text-emerald-800', objectives: ['health', 'balance'], timeOfDay: ['afternoon'], priority: 10 },
    { name: 'Lanche Saudável', category: 'Alimentação', duration: 15, description: 'Lanche nutritivo e hidratação', icon: Coffee, color: 'bg-yellow-100 text-yellow-800', objectives: ['health'], timeOfDay: ['afternoon', 'evening'], priority: 6 },
    
    // Noite
    { name: 'Jantar', category: 'Alimentação', duration: 45, description: 'Refeição leve e momento familiar', icon: Utensils, color: 'bg-orange-100 text-orange-800', objectives: ['health', 'balance'], timeOfDay: ['evening'], priority: 10 },
    { name: 'Tempo em Família', category: 'Social', duration: 60, description: 'Convivência e conexão familiar', icon: Users, color: 'bg-rose-100 text-rose-800', objectives: ['balance'], timeOfDay: ['evening'], priority: 8 },
    { name: 'Leitura', category: 'Educação', duration: 30, description: 'Leitura relaxante ou educativa', icon: Book, color: 'bg-indigo-100 text-indigo-800', objectives: ['study', 'balance'], timeOfDay: ['evening'], priority: 7 },
    { name: 'Entretenimento', category: 'Lazer', duration: 45, description: 'TV, música ou hobbies relaxantes', icon: Music, color: 'bg-violet-100 text-violet-800', objectives: ['balance'], timeOfDay: ['evening'], priority: 5 },
    { name: 'Preparação para Dormir', category: 'Saúde', duration: 30, description: 'Rotina noturna e relaxamento', icon: Moon, color: 'bg-slate-100 text-slate-800', objectives: ['health', 'balance'], timeOfDay: ['evening'], priority: 9 },
    { name: 'Reflexão do Dia', category: 'Mindfulness', duration: 15, description: 'Gratidão e planejamento do próximo dia', icon: Heart, color: 'bg-pink-100 text-pink-800', objectives: ['mindfulness', 'balance'], timeOfDay: ['evening'], priority: 7 }
  ];

  const generateRoutine = useCallback(() => {
    if (!config.objective) return;

    const startHour = parseInt(config.startTime.split(':')[0]);
    const startMinute = parseInt(config.startTime.split(':')[1]);
    const endHour = parseInt(config.endTime.split(':')[0]);
    const endMinute = parseInt(config.endTime.split(':')[1]);

    const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    
    // Filtrar atividades baseadas no objetivo
    const relevantActivities = activityTemplates.filter(activity => 
      activity.objectives.includes(config.objective)
    ).sort((a, b) => b.priority - a.priority);

    const routine: TimeSlot[] = [];
    let currentTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    // Função para converter minutos em string de hora
    const minutesToTime = (minutes: number): string => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    // Função para adicionar atividade
    const addActivity = (activity: ActivityTemplate, duration?: number) => {
      const activityDuration = duration || activity.duration;
      const startTime = minutesToTime(currentTime);
      const endTime = minutesToTime(currentTime + activityDuration);
      
      routine.push({
        id: `${activity.name}-${currentTime}`,
        startTime,
        endTime,
        activity: activity.name,
        category: activity.category,
        description: activity.description,
        duration: activityDuration,
        color: activity.color,
        icon: activity.icon
      });
      
      currentTime += activityDuration;
    };

    // Estrutura básica da rotina
    const morningEnd = currentTime + config.morningTime;
    const afternoonStart = morningEnd;
    const afternoonEnd = afternoonStart + config.afternoonTime;
    const eveningStart = afternoonEnd;

    // MANHÃ
    // Sempre começar com despertar
    const wakeUpActivity = relevantActivities.find(a => a.name === 'Despertar e Hidratação');
    if (wakeUpActivity) addActivity(wakeUpActivity);

    // Adicionar atividades matinais baseadas no objetivo
    const morningActivities = relevantActivities.filter(a => 
      a.timeOfDay.includes('morning') && a.name !== 'Despertar e Hidratação'
    );

    let morningTimeLeft = morningEnd - currentTime;
    for (const activity of morningActivities) {
      if (morningTimeLeft >= activity.duration) {
        addActivity(activity);
        morningTimeLeft -= activity.duration;
        
        // Adicionar pausa se necessário
        if (morningTimeLeft >= config.breakDuration && activity.category !== 'Descanso') {
          const breakActivity = activityTemplates.find(a => a.name === 'Pausa Ativa');
          if (breakActivity && morningTimeLeft >= breakActivity.duration) {
            addActivity(breakActivity);
            morningTimeLeft -= breakActivity.duration;
          }
        }
      }
    }

    // TARDE
    currentTime = afternoonStart;
    
    // Sempre incluir almoço
    const lunchActivity = relevantActivities.find(a => a.name === 'Almoço') || 
                         activityTemplates.find(a => a.name === 'Almoço');
    if (lunchActivity) addActivity(lunchActivity);

    const afternoonActivities = relevantActivities.filter(a => 
      a.timeOfDay.includes('afternoon') && a.name !== 'Almoço'
    );

    let afternoonTimeLeft = afternoonEnd - currentTime;
    for (const activity of afternoonActivities) {
      if (afternoonTimeLeft >= activity.duration) {
        addActivity(activity);
        afternoonTimeLeft -= activity.duration;
        
        // Adicionar pausa se necessário
        if (afternoonTimeLeft >= config.breakDuration && activity.category !== 'Descanso') {
          const breakActivity = activityTemplates.find(a => a.name === 'Pausa Ativa');
          if (breakActivity && afternoonTimeLeft >= breakActivity.duration) {
            addActivity(breakActivity);
            afternoonTimeLeft -= breakActivity.duration;
          }
        }
      }
    }

    // NOITE
    currentTime = eveningStart;
    
    const eveningActivities = relevantActivities.filter(a => 
      a.timeOfDay.includes('evening')
    );

    let eveningTimeLeft = endTime - currentTime;
    for (const activity of eveningActivities) {
      if (eveningTimeLeft >= activity.duration) {
        addActivity(activity);
        eveningTimeLeft -= activity.duration;
      }
    }

    // Sempre terminar com preparação para dormir
    const sleepPrepActivity = activityTemplates.find(a => a.name === 'Preparação para Dormir');
    if (sleepPrepActivity && eveningTimeLeft >= sleepPrepActivity.duration) {
      addActivity(sleepPrepActivity);
    }

    setGeneratedRoutine(routine);
  }, [config]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const exportRoutineText = () => {
    if (generatedRoutine.length === 0) return '';

    const objective = objectives.find(obj => obj.id === config.objective);
    let text = `🎯 ROTINA DIÁRIA - ${objective?.name.toUpperCase()}\n`;
    text += `📅 Período: ${config.startTime} às ${config.endTime}\n\n`;

    generatedRoutine.forEach((slot, index) => {
      text += `${slot.startTime} - ${slot.endTime} | ${slot.activity}\n`;
      text += `   📝 ${slot.description}\n`;
      text += `   ⏱️ ${slot.duration} minutos\n\n`;
    });

    text += `\n✨ Gerado pelo OneDev - Ferramentas para Desenvolvedores`;
    return text;
  };

  const downloadRoutineAsPDF = () => {
    // Simular download de PDF (em uma implementação real, usaria uma biblioteca como jsPDF)
    const text = exportRoutineText();
    const dataBlob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rotina-diaria-${config.objective}-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getTotalDuration = () => {
    return generatedRoutine.reduce((total, slot) => total + slot.duration, 0);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}min` : ''}`;
    }
    return `${mins}min`;
  };

  const tabs = [
    { id: 'config', name: 'Configuração', icon: Settings },
    { id: 'routine', name: 'Rotina Gerada', icon: Calendar },
    { id: 'preview', name: 'Visualização', icon: Eye }
  ];

  const renderConfigTab = () => (
    <div className="space-y-8">
      {/* Objetivo Principal */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Objetivo Principal
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {objectives.map((objective) => {
            const Icon = objective.icon;
            return (
              <button
                key={objective.id}
                onClick={() => setConfig(prev => ({ ...prev, objective: objective.id }))}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                  config.objective === objective.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className={`p-3 bg-gradient-to-r ${objective.color} rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-center text-gray-800">
                  {objective.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Horários */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-green-600" />
          Horários do Dia
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Início do Dia
            </label>
            <input
              type="time"
              value={config.startTime}
              onChange={(e) => setConfig(prev => ({ ...prev, startTime: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fim do Dia
            </label>
            <input
              type="time"
              value={config.endTime}
              onChange={(e) => setConfig(prev => ({ ...prev, endTime: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tempo Disponível por Período */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Timer className="w-5 h-5 text-purple-600" />
          Tempo Disponível por Período
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sun className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-900">Manhã</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfig(prev => ({ 
                  ...prev, 
                  morningTime: Math.max(60, prev.morningTime - 30) 
                }))}
                className="p-1 bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="flex-1 text-center font-semibold">
                {formatDuration(config.morningTime)}
              </span>
              <button
                onClick={() => setConfig(prev => ({ 
                  ...prev, 
                  morningTime: Math.min(480, prev.morningTime + 30) 
                }))}
                className="p-1 bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sun className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-900">Tarde</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfig(prev => ({ 
                  ...prev, 
                  afternoonTime: Math.max(60, prev.afternoonTime - 30) 
                }))}
                className="p-1 bg-orange-200 text-orange-800 rounded hover:bg-orange-300 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="flex-1 text-center font-semibold">
                {formatDuration(config.afternoonTime)}
              </span>
              <button
                onClick={() => setConfig(prev => ({ 
                  ...prev, 
                  afternoonTime: Math.min(480, prev.afternoonTime + 30) 
                }))}
                className="p-1 bg-orange-200 text-orange-800 rounded hover:bg-orange-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Moon className="w-5 h-5 text-indigo-600" />
              <span className="font-medium text-indigo-900">Noite</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfig(prev => ({ 
                  ...prev, 
                  eveningTime: Math.max(60, prev.eveningTime - 30) 
                }))}
                className="p-1 bg-indigo-200 text-indigo-800 rounded hover:bg-indigo-300 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="flex-1 text-center font-semibold">
                {formatDuration(config.eveningTime)}
              </span>
              <button
                onClick={() => setConfig(prev => ({ 
                  ...prev, 
                  eveningTime: Math.min(480, prev.eveningTime + 30) 
                }))}
                className="p-1 bg-indigo-200 text-indigo-800 rounded hover:bg-indigo-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Configurações Avançadas */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          Configurações Avançadas
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duração das Pausas
            </label>
            <select
              value={config.breakDuration}
              onChange={(e) => setConfig(prev => ({ ...prev, breakDuration: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10 minutos</option>
              <option value={15}>15 minutos</option>
              <option value={20}>20 minutos</option>
              <option value={30}>30 minutos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intensidade de Trabalho
            </label>
            <select
              value={config.workIntensity}
              onChange={(e) => setConfig(prev => ({ ...prev, workIntensity: e.target.value as any }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Baixa - Mais pausas</option>
              <option value="medium">Média - Equilibrado</option>
              <option value="high">Alta - Foco intenso</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.includeWeekends}
              onChange={(e) => setConfig(prev => ({ ...prev, includeWeekends: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Incluir fins de semana na rotina</span>
          </label>
        </div>
      </div>

      {/* Botão Gerar */}
      <div className="flex justify-center">
        <button
          onClick={generateRoutine}
          disabled={!config.objective}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg font-semibold"
        >
          <RefreshCw className="w-6 h-6" />
          Gerar Rotina Personalizada
        </button>
      </div>
    </div>
  );

  const renderRoutineTab = () => {
    if (generatedRoutine.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma rotina gerada</h3>
          <p className="text-gray-500">Configure seus objetivos e gere uma rotina personalizada</p>
        </div>
      );
    }

    const objective = objectives.find(obj => obj.id === config.objective);

    return (
      <div className="space-y-6">
        {/* Header da Rotina */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                {objective && <objective.icon className="w-6 h-6 text-blue-600" />}
                Rotina para {objective?.name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {config.startTime} às {config.endTime}
                </span>
                <span className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  {formatDuration(getTotalDuration())} programados
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {generatedRoutine.length} atividades
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(exportRoutineText(), 'rotina')}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                {copiedField === 'rotina' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                Copiar
              </button>
              
              <button
                onClick={downloadRoutineAsPDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Timeline da Rotina */}
        <div className="space-y-3">
          {generatedRoutine.map((slot, index) => {
            const Icon = slot.icon;
            return (
              <div
                key={slot.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="text-sm font-mono text-gray-600 text-center">
                      <div>{slot.startTime}</div>
                      <div className="text-xs text-gray-400">↓</div>
                      <div>{slot.endTime}</div>
                    </div>
                  </div>
                  
                  <div className="w-px h-16 bg-gray-200"></div>
                  
                  <div className={`flex-shrink-0 p-3 rounded-lg ${slot.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">{slot.activity}</h4>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        {formatDuration(slot.duration)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{slot.description}</p>
                    <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {slot.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Estatísticas */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <Sun className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
            <div className="text-lg font-semibold text-yellow-900">
              {generatedRoutine.filter(s => {
                const hour = parseInt(s.startTime.split(':')[0]);
                return hour >= 6 && hour < 12;
              }).length}
            </div>
            <div className="text-sm text-yellow-700">Atividades Manhã</div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <Sun className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <div className="text-lg font-semibold text-orange-900">
              {generatedRoutine.filter(s => {
                const hour = parseInt(s.startTime.split(':')[0]);
                return hour >= 12 && hour < 18;
              }).length}
            </div>
            <div className="text-sm text-orange-700">Atividades Tarde</div>
          </div>
          
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
            <Moon className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
            <div className="text-lg font-semibold text-indigo-900">
              {generatedRoutine.filter(s => {
                const hour = parseInt(s.startTime.split(':')[0]);
                return hour >= 18;
              }).length}
            </div>
            <div className="text-sm text-indigo-700">Atividades Noite</div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-lg font-semibold text-green-900">
              {formatDuration(getTotalDuration())}
            </div>
            <div className="text-sm text-green-700">Tempo Total</div>
          </div>
        </div>
      </div>
    );
  };

  const renderPreviewTab = () => {
    if (generatedRoutine.length === 0) {
      return (
        <div className="text-center py-12">
          <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma rotina para visualizar</h3>
          <p className="text-gray-500">Gere uma rotina primeiro para ver a visualização</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Visualização tipo Agenda */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Agenda do Dia - {objectives.find(obj => obj.id === config.objective)?.name}
            </h3>
            <p className="text-blue-100 text-sm">
              {config.startTime} às {config.endTime} • {formatDuration(getTotalDuration())} programados
            </p>
          </div>
          
          <div className="p-6">
            <div className="space-y-2">
              {generatedRoutine.map((slot, index) => {
                const Icon = slot.icon;
                return (
                  <div
                    key={slot.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-sm font-mono text-gray-600 w-20 text-center">
                      {slot.startTime}
                    </div>
                    
                    <div className={`p-2 rounded ${slot.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{slot.activity}</div>
                      <div className="text-sm text-gray-600">{slot.description}</div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      {formatDuration(slot.duration)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Timeline Visual */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Timer className="w-5 h-5 text-purple-600" />
            Timeline Visual
          </h3>
          
          <div className="relative">
            {/* Linha do tempo */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-6">
              {generatedRoutine.map((slot, index) => {
                const Icon = slot.icon;
                return (
                  <div key={slot.id} className="relative flex items-start gap-4">
                    {/* Ponto na timeline */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full ${slot.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    
                    {/* Conteúdo */}
                    <div className="flex-1 bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{slot.activity}</h4>
                        <span className="text-sm text-gray-600 font-mono">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{slot.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-white text-gray-700 text-xs rounded-full border">
                          {slot.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDuration(slot.duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Resumo por Categoria */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Distribuição por Categoria
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              generatedRoutine.reduce((acc, slot) => {
                acc[slot.category] = (acc[slot.category] || 0) + slot.duration;
                return acc;
              }, {} as Record<string, number>)
            ).map(([category, duration]) => (
              <div key={category} className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium text-gray-900 mb-1">{category}</div>
                <div className="text-2xl font-bold text-blue-600">{formatDuration(duration)}</div>
                <div className="text-sm text-gray-500">
                  {((duration / getTotalDuration()) * 100).toFixed(1)}% do tempo
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Criador de Rotina Diária
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Monte sua rotina personalizada baseada em seus objetivos e disponibilidade de tempo
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
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
            {activeTab === 'config' && renderConfigTab()}
            {activeTab === 'routine' && renderRoutineTab()}
            {activeTab === 'preview' && renderPreviewTab()}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Target className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">🎯 Sobre o Criador de Rotina</h3>
            <div className="text-blue-800 leading-relaxed space-y-2">
              <p>
                Esta ferramenta cria rotinas personalizadas baseadas em seus objetivos específicos, 
                horários disponíveis e preferências pessoais. Cada rotina é única e adaptada ao seu estilo de vida.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Recursos
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 8 objetivos diferentes disponíveis</li>
                    <li>• Horários flexíveis e personalizáveis</li>
                    <li>• Atividades baseadas em evidências</li>
                    <li>• Visualização tipo agenda profissional</li>
                  </ul>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Exportação
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Copiar rotina como texto</li>
                    <li>• Exportar para arquivo</li>
                    <li>• Visualização para impressão</li>
                    <li>• Compartilhamento fácil</li>
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

export default DailyRoutineBuilder;