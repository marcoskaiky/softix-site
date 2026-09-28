/* ==========================================================================
   SOFTIX · Conteúdo editável
   --------------------------------------------------------------------------
   Este é o ÚNICO arquivo que você precisa editar para gerenciar o portfólio.

   Campos de cada projeto:
     title        Nome do projeto                                 (obrigatório)
     category     Categoria — vira um filtro automaticamente      (obrigatório)
     summary      Resumo curto exibido no card                    (obrigatório)
     year         Ano de entrega
     client       Cliente
     description  Texto completo do modal de detalhes (usa summary se vazio)
     tags         Tecnologias utilizadas
     results      Resultados/destaques exibidos no modal
     image        Capa real: caminho ou URL (ex.: 'img/orbit.webp', 16:10).
                  Vazio = capa ilustrada gerada automaticamente.
     url          Link do projeto no ar
     github       'usuario/repositorio' ou URL completa do GitHub.
                  Se preenchido, estrelas, forks e linguagem são carregados
                  ao vivo da API pública do GitHub (cache de 1h).
     accent       Cor da capa ilustrada (hex)
     cover        Estilo da capa ilustrada: 'web' | 'dashboard' | 'mobile' |
                  'chat' | 'shop' | 'code' (padrão: definido pela categoria)
   ========================================================================== */

window.SOFTIX_CONFIG = {
  // Usuário ou organização do GitHub. Se preenchido, os repositórios públicos
  // mais recentes entram sozinhos no portfólio (categoria "Open Source")
  // e aparece o botão "Ver todos no GitHub".
  githubUser: '',
  githubLimit: 6,

  // Endpoint do formulário de contato (ex.: Formspree 'https://formspree.io/f/xxxx').
  // Vazio = o formulário abre o app de e-mail do visitante com a mensagem pronta.
  formEndpoint: '',
  email: 'contato@softix.com.br',
};

// Projetos de exemplo (mock) — substitua pelos reais.
window.SOFTIX_PROJECTS = [
  {
    title: 'Orbit CRM',
    category: 'SaaS',
    year: 2025,
    client: 'Orbit Tecnologia',
    summary: 'CRM multiempresa com funil de vendas, automações e dashboards em tempo real.',
    description: 'Plataforma SaaS multi-tenant que centraliza todo o ciclo comercial: captação de leads, funil de vendas visual, automações de follow-up, integrações com WhatsApp e e-mail, e dashboards em tempo real para gestores.',
    tags: ['Next.js', 'NestJS', 'PostgreSQL', 'AWS'],
    results: ['+38% na conversão de leads', '−60% no tempo de resposta', '12 mil usuários ativos'],
    image: '',
    url: '',
    github: '',
    accent: '#19d696',
  },
  {
    title: 'Nexa Bank',
    category: 'Mobile',
    year: 2025,
    client: 'Nexa Pagamentos',
    summary: 'Conta digital com Pix, cartões virtuais e investimentos — nota 4,8 nas lojas.',
    description: 'Aplicativo de banco digital com onboarding 100% online, Pix, cartões virtuais, investimentos e controle financeiro inteligente. Arquitetura de microsserviços com alta disponibilidade e segurança de nível bancário.',
    tags: ['Flutter', 'Go', 'PostgreSQL', 'Kubernetes'],
    results: ['4,8★ na App Store e Google Play', '500 mil downloads no 1º ano', '99,99% de disponibilidade'],
    image: '',
    url: '',
    github: '',
    accent: '#5ad2ff',
  },
  {
    title: 'Sofia IA',
    category: 'IA',
    year: 2026,
    client: 'Grupo Vértice',
    summary: 'Assistente com IA generativa que resolve 70% dos atendimentos sem intervenção humana.',
    description: 'Assistente virtual baseado em LLM com RAG sobre a base de conhecimento da empresa, integrado ao WhatsApp, site e sistemas internos. Escala para atendimento humano com contexto completo quando necessário.',
    tags: ['Python', 'FastAPI', 'LLM + RAG', 'PostgreSQL'],
    results: ['70% dos atendimentos automatizados', 'Atendimento 24/7 multicanal', 'NPS de 82'],
    image: '',
    url: '',
    github: '',
    accent: '#a78bfa',
  },
  {
    title: 'LogiTrack',
    category: 'SaaS',
    year: 2024,
    client: 'LogiTrack Transportes',
    summary: 'Gestão de frotas com rastreamento em tempo real, roteirização e telemetria.',
    description: 'Sistema de gestão de frotas com mapa em tempo real, roteirização inteligente, telemetria de veículos, alertas de manutenção preditiva e relatórios de custo por rota.',
    tags: ['Vue.js', 'Go', 'Redis', 'Google Cloud'],
    results: ['−35% no custo operacional', '+2.000 veículos monitorados', 'Rotas 22% mais curtas'],
    image: '',
    url: '',
    github: '',
    accent: '#fbbf24',
  },
  {
    title: 'Vitta Saúde',
    category: 'Web',
    year: 2024,
    client: 'Vitta Clínicas',
    summary: 'Telemedicina com agendamento online, prontuário eletrônico e videochamadas.',
    description: 'Plataforma web de telemedicina com agendamento inteligente, prontuário eletrônico, prescrição digital e videoconsultas criptografadas — em total conformidade com a LGPD.',
    tags: ['React', 'Node.js', 'WebRTC', 'PostgreSQL'],
    results: ['+120 mil consultas realizadas', 'Conformidade total com a LGPD', 'Carregamento abaixo de 1s'],
    image: '',
    url: '',
    github: '',
    accent: '#2de2c8',
  },
  {
    title: 'Aura Store',
    category: 'E-commerce',
    year: 2025,
    client: 'Aura Moda',
    summary: 'E-commerce headless com checkout otimizado, Pix e recomendações personalizadas.',
    description: 'Loja virtual headless de alta performance com catálogo inteligente, busca instantânea, checkout em uma etapa com Pix e cartão, e recomendações personalizadas por comportamento.',
    tags: ['Next.js', 'Node.js', 'Mercado Pago', 'Algolia'],
    results: ['+54% na taxa de conversão', 'Lighthouse 98 no mobile', 'Checkout em 1 clique'],
    image: '',
    url: '',
    github: '',
    accent: '#f472b6',
  },
  {
    title: 'EduPlay',
    category: 'Mobile',
    year: 2023,
    client: 'EduPlay Educação',
    summary: 'App educacional gamificado com trilhas adaptativas e modo offline.',
    description: 'Aplicativo educacional para crianças com trilhas de aprendizagem adaptativas, gamificação, modo offline e painel de acompanhamento para pais e professores.',
    tags: ['React Native', 'Firebase', 'TypeScript'],
    results: ['4,9★ nas lojas', '+80 mil alunos ativos', '68% de retenção em 30 dias'],
    image: '',
    url: '',
    github: '',
    accent: '#fb923c',
  },
  {
    title: 'Pulse Analytics',
    category: 'IA',
    year: 2026,
    client: 'Rede Mercato',
    summary: 'BI com previsão de demanda por machine learning e dashboards em tempo real.',
    description: 'Plataforma de inteligência de dados que unifica vendas, estoque e logística, com modelos de machine learning para previsão de demanda e alertas automáticos de ruptura.',
    tags: ['Python', 'Airflow', 'BigQuery', 'React'],
    results: ['94% de acurácia nas previsões', '−40% em ruptura de estoque', 'Dashboards em tempo real'],
    image: '',
    url: '',
    github: '',
    accent: '#60a5fa',
    cover: 'dashboard',
  },
  {
    title: 'Softix UI',
    category: 'Open Source',
    year: 2026,
    summary: 'Design system open source com 60+ componentes React acessíveis e temáveis.',
    description: 'Biblioteca de componentes que usamos como base dos nossos produtos: acessível (WCAG 2.2 AA), temável via design tokens e otimizada para tree-shaking.',
    tags: ['TypeScript', 'React', 'Storybook'],
    results: ['60+ componentes', 'WCAG 2.2 AA', 'Tree-shakeable'],
    image: '',
    url: '',
    github: 'sua-org/softix-ui', // exemplo: troque pelo repositório real
    accent: '#19d696',
  },
];
