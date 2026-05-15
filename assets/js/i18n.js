// ============================================================
// i18n.js — Internacionalização (Traduções estáticas da UI)
// ============================================================

const I18N_KEY = 'vk-lang';
const FALLBACK_LANG = 'pt-br';

// Supported languages: 'pt-br', 'en', 'es'
const currentLanguage = localStorage.getItem(I18N_KEY) || FALLBACK_LANG;

const translations = {
    'pt-br': {
        // Nav
        'nav_home': '~/home',
        'nav_career': '~/career',
        'nav_publications': '~/publications',
        'nav_projects': '~/projects',
        'nav_blog': '~/blog',
        'nav_contact': './contato',
        
        // Hero
        'hero_badge': 'disponível para novos projetos',
        'hero_title': 'Vitor Krewer<br><span class="highlight">Dev & Educação</span>',
        'hero_subtitle': 'Desenvolvo sistemas e laboratórios para educação no ensino superior. Automação, gestão acadêmica e tecnologia que transforma como se aprende.',
        'hero_btn_projects': 'Ver Projetos',
        
        // About Section
        'about_label': 'sobre',
        'about_title': 'Do ensino à engenharia',
        'about_p1': 'Há mais de 10 anos trabalho na interseção entre o ensino superior e os sistemas que o sustentam. Já coordenei núcleos de EAD, escrevi conteúdos para pós-graduação e automatizei fluxos inteiros com Google Apps Script.',
        'about_p2': 'Minha formação atravessa <strong style="color:var(--text-primary)">Ciência da Computação, Engenharia de Software, Direito e Teologia</strong>. Esse olhar multidisciplinar me permite ver relações, gargalos e atalhos onde outros veem apenas problemas.',
        'about_stack_label': '// Stack Principal',
        
        // Cards
        'card_1_title': 'Automação Educacional',
        'card_1_text': 'Scripts GAS e Python para otimizar gestão acadêmica e fluxos de EAD.',
        'card_2_title': 'Produção Editorial',
        'card_2_text': 'Escrita técnica, curadoria e gestão de conteúdo para ensino superior.',
        'card_3_title': 'Gestão Acadêmica',
        'card_3_text': 'Coordenação de núcleos EAD e liderança de equipes multidisciplinares.',
        'card_4_title': 'Design Instrucional',
        'card_4_text': 'Experiências de aprendizagem ativas e uso de IA na educação.',

        // Footer
        'footer_tagline': 'Professor & Desenvolvedor focado em Tecnologia Educacional e sistemas de gestão acadêmica para o ensino superior.',
        'footer_nav_heading': 'Navegação',
        'footer_links_heading': 'Links',
        'footer_nav_home': 'Home',
        'footer_nav_projects': 'Projetos',
        'footer_nav_blog': 'Blog',
        'footer_lattes': 'Currículo Lattes',
        'footer_built': 'built with <span style="color:var(--accent-orange)">♥</span> & html/css/js',
        
        // Common UI (Loading, Errors, Empty States)
        'ui_loading': 'Carregando...',
        'ui_error': 'Erro ao carregar dados.',
        'ui_empty': 'Nenhum item encontrado.',

        // Projects Page
        'projects_page_title': 'Projetos',
        'projects_page_subtitle': 'Sistemas, ferramentas e soluções desenvolvidas em Tecnologia Educacional.',
        'filter_all': 'Todos',
        'filter_systems': 'Sistemas',
        'filter_tools': 'Ferramentas',
        'filter_education': 'Educação',
        'loading_projects': 'Carregando projetos...',
        'github_cta_text': 'Mais projetos e experimentos no meu GitHub',
        'btn_view_github': 'Ver GitHub',
        'btn_article': 'Ler artigo',
        'private_badge': 'Repositório Privado',

        // Publications Page
        'pub_page_title': 'Produção Intelectual',
        'pub_page_subtitle': 'Livros didáticos, técnicos e materiais preparatórios. Clique nos cards para detalhes via terminal.',
        'loading_pubs': 'Carregando publicações...',
        'pub_total_1': 'Total:',
        'pub_total_2': 'arquivos encontrados',

        // Career Page
        'career_page_title': 'Trajetória Profissional',
        'career_page_subtitle': 'Mais de 10 anos na interseção entre ensino superior, tecnologia e gestão acadêmica.',
        'career_exp_label': 'experiência',
        'career_exp_title': 'Linha do Tempo',
        'timeline_1_date': 'Fev 2021 — Presente',
        'timeline_1_role': 'Professor & Coordenador de Núcleo de Conteúdo',
        'timeline_1_company': 'Faculdade Focus',
        'timeline_1_desc': 'Conteudista, tutor de pós-graduação e coordenador da produção de materiais didáticos para cursos EAD. Responsável pela qualidade pedagógica de disciplinas de pós-graduação nas áreas de tecnologia, gestão e educação.',
        'timeline_2_date': 'Abr 2019 — Jun 2025',
        'timeline_2_role': 'Coordenador NEAD',
        'timeline_2_company': 'Grupo Focus de Educação',
        'timeline_2_desc': 'Modelagem de cursos em Moodle, TOOLZZ e Hotmart. Design educacional e automação de processos de ensino com Google Apps Script. Implementei pipelines de dados acadêmicos e dashboards gerenciais para acompanhamento de turmas.',
        'timeline_3_date': 'Jan 2016 — Jan 2019',
        'timeline_3_role': 'Editor Executivo',
        'timeline_3_company': 'Focus Concursos',
        'timeline_3_desc': 'Organização e elaboração de apostilas para concursos públicos, gestão de equipe editorial e curadoria de conteúdo jurídico e de TI. Co-autoria em mais de 6 obras para preparação a concursos federais e estaduais.',
        'timeline_4_date': 'Out 2014 — Dez 2015',
        'timeline_4_role': 'IT Helpdesk Analyst',
        'timeline_4_company': 'Região de Cascavel',
        'timeline_4_desc': 'Suporte técnico, acesso remoto e atendimento a alunos e professores. Configuração de redes, manutenção de hardware e suporte a sistemas educacionais.',
        'career_edu_label': 'educação',
        'career_edu_title': 'Formação Acadêmica',
        'status_in_progress': 'Em andamento',
        'status_completed': 'Concluído',
        'edu_eng_title': 'Engenharia de Software',
        'edu_eng_desc': 'Análise, desenvolvimento e garantia de qualidade de sistemas complexos.',
        'edu_cs_title': 'Ciência da Computação',
        'edu_cs_desc': 'Fundamentos sólidos em algoritmos, estruturas de dados e sistemas.',
        'edu_law_title': 'Direito',
        'edu_law_desc': 'Formação jurídica com foco em legislação digital e concursos públicos.',
        'edu_theo_title': 'Teologia',
        'edu_theo_desc': 'Multidisciplinaridade, ética e pensamento filosófico aplicados ao ensino.',

        // Terminal
        'term_welcome': 'Bem-vindo ao terminal de Vitor Krewer',
        'term_whoami_info': 'Exibe informações de perfil',
        'term_projects_info': 'Lista projetos em destaque',
        'term_blog_info': 'Mostra artigos recentes',
        'term_clear_info': 'Limpa o terminal',
        'term_help_info': 'Exibe esta ajuda',
        'term_cmd_not_found': 'comando não encontrado',
        'term_help_hint': 'Digite help para ver os comandos disponíveis.',
        'term_role': 'Role',
        'term_focus': 'Focus',
        'term_location': 'Localização',
        'term_location_val': 'Cascavel, PR, Brasil',
        'term_stack_label': '// Stack Principal',
        'term_languages': 'Linguagens',
        'term_platforms': 'Plataformas',
        'term_interests': 'Interesses',
        'term_connect': '// Conecte-se',
        'term_available_cmds': 'Comandos disponíveis:',
        'term_featured_projects': '// Projetos em Destaque',
        'term_recent_articles': '// Artigos Recentes',
        'term_view_all_projects': '→ Ver todos: projects.html',
        'term_view_all_blog': '→ Ver todos: blog/index.html',

        // UI Toggles
        'toggle_theme': 'Alternar tema claro/escuro',
        'toggle_lang': 'Trocar idioma',
        'loading_posts': 'Carregando artigos...',
        'search_posts_placeholder': 'Pesquisar artigos...',
        'no_posts_found': 'Nenhum artigo encontrado.',
        'blog_page_title': 'Blog',
        'blog_page_subtitle': 'Tecnologia educacional, automação e reflexões sobre ensino e desenvolvimento.'
    },
    'en': {
        // Nav
        'nav_home': '~/home',
        'nav_career': '~/career',
        'nav_publications': '~/publications',
        'nav_projects': '~/projects',
        'nav_blog': '~/blog',
        'nav_contact': './contact',
        
        // Hero
        'hero_badge': 'available for new projects',
        'hero_title': 'Vitor Krewer<br><span class="highlight">Dev & Education</span>',
        'hero_subtitle': 'Developing systems and labs for higher education. Automation, academic management, and technology that transforms learning.',
        'hero_btn_projects': 'View Projects',
        
        // About Section
        'about_label': 'about',
        'about_title': 'From teaching to engineering',
        'about_p1': 'For over 10 years, I have worked at the intersection of higher education and the systems that support it. I have coordinated Distance Learning centers, authored postgraduate content, and automated entire workflows using Google Apps Script.',
        'about_p2': 'My background spans <strong style="color:var(--text-primary)">Computer Science, Software Engineering, Law, and Theology</strong>. This multidisciplinary perspective allows me to spot connections, bottlenecks, and shortcuts where others see only problems.',
        'about_stack_label': '// Core Stack',
        
        // Cards
        'card_1_title': 'Educational Automation',
        'card_1_text': 'GAS and Python scripts to optimize academic management and Distance Learning workflows.',
        'card_2_title': 'Editorial Production',
        'card_2_text': 'Technical writing, curation, and content management for higher education.',
        'card_3_title': 'Academic Management',
        'card_3_text': 'Coordination of distance learning centers and multidisciplinary team leadership.',
        'card_4_title': 'Instructional Design',
        'card_4_text': 'Active learning experiences and the use of AI in education.',

        // Footer
        'footer_tagline': 'Professor & Developer focused on Educational Technology and academic management systems for higher education.',
        'footer_nav_heading': 'Navigation',
        'footer_links_heading': 'Links',
        'footer_nav_home': 'Home',
        'footer_nav_projects': 'Projects',
        'footer_nav_blog': 'Blog',
        'footer_lattes': 'Lattes Resume',
        'footer_built': 'built with <span style="color:var(--accent-orange)">♥</span> & html/css/js',

        // Common UI
        'ui_loading': 'Loading...',
        'ui_error': 'Error loading data.',
        'ui_empty': 'No items found.',

        // Projects Page
        'projects_page_title': 'Projects',
        'projects_page_subtitle': 'Systems, tools, and solutions developed in Educational Technology.',
        'filter_all': 'All',
        'filter_systems': 'Systems',
        'filter_tools': 'Tools',
        'filter_education': 'Education',
        'loading_projects': 'Loading projects...',
        'github_cta_text': 'More projects and experiments on my GitHub',
        'btn_view_github': 'View GitHub',
        'btn_article': 'Read article',
        'private_badge': 'Private Repository',

        // Publications Page
        'pub_page_title': 'Intellectual Production',
        'pub_page_subtitle': 'Textbooks, technical books, and preparatory materials. Click on cards for terminal details.',
        'loading_pubs': 'Loading publications...',
        'pub_total_1': 'Total:',
        'pub_total_2': 'files found',

        // Career Page
        'career_page_title': 'Professional Journey',
        'career_page_subtitle': 'Over 10 years at the intersection of higher education, technology, and academic management.',
        'career_exp_label': 'experience',
        'career_exp_title': 'Timeline',
        'timeline_1_date': 'Feb 2021 — Present',
        'timeline_1_role': 'Professor & Content Center Coordinator',
        'timeline_1_company': 'Focus College',
        'timeline_1_desc': 'Content creator, postgraduate tutor, and coordinator of the production of teaching materials for distance learning courses. Responsible for the pedagogical quality of postgraduate disciplines in the areas of technology, management, and education.',
        'timeline_2_date': 'Apr 2019 — Jun 2025',
        'timeline_2_role': 'DE Center Coordinator',
        'timeline_2_company': 'Focus Education Group',
        'timeline_2_desc': 'Course modeling in Moodle, TOOLZZ, and Hotmart. Educational design and teaching process automation with Google Apps Script. Implemented academic data pipelines and management dashboards for class tracking.',
        'timeline_3_date': 'Jan 2016 — Jan 2019',
        'timeline_3_role': 'Executive Editor',
        'timeline_3_company': 'Focus Concursos',
        'timeline_3_desc': 'Organization and preparation of study guides for public examinations, editorial team management, and curation of legal and IT content. Co-authored more than 6 books for federal and state exam preparation.',
        'timeline_4_date': 'Oct 2014 — Dec 2015',
        'timeline_4_role': 'IT Helpdesk Analyst',
        'timeline_4_company': 'Cascavel Region',
        'timeline_4_desc': 'Technical support, remote access, and assistance to students and teachers. Network configuration, hardware maintenance, and support for educational systems.',
        'career_edu_label': 'education',
        'career_edu_title': 'Academic Background',
        'status_in_progress': 'In progress',
        'status_completed': 'Completed',
        'edu_eng_title': 'Software Engineering',
        'edu_eng_desc': 'Analysis, development, and quality assurance of complex systems.',
        'edu_cs_title': 'Computer Science',
        'edu_cs_desc': 'Solid foundations in algorithms, data structures, and systems.',
        'edu_law_title': 'Law',
        'edu_law_desc': 'Legal training focusing on digital legislation and public examinations.',
        'edu_theo_title': 'Theology',
        'edu_theo_desc': 'Multidisciplinarity, ethics, and philosophical thinking applied to teaching.',

        // Terminal
        'term_welcome': 'Welcome to Vitor Krewer\'s terminal',
        'term_whoami_info': 'Display profile information',
        'term_projects_info': 'List featured projects',
        'term_blog_info': 'Show recent articles',
        'term_clear_info': 'Clear the terminal',
        'term_help_info': 'Display this help',
        'term_cmd_not_found': 'command not found',
        'term_help_hint': 'Type help to see available commands.',
        'term_role': 'Role',
        'term_focus': 'Focus',
        'term_location': 'Location',
        'term_location_val': 'Cascavel, PR, Brazil',
        'term_stack_label': '// Core Stack',
        'term_languages': 'Languages',
        'term_platforms': 'Platforms',
        'term_interests': 'Interests',
        'term_connect': '// Connect',
        'term_available_cmds': 'Available commands:',
        'term_featured_projects': '// Featured Projects',
        'term_recent_articles': '// Recent Articles',
        'term_view_all_projects': '→ View all: projects.html',
        'term_view_all_blog': '→ View all: blog/index.html',

        // UI Toggles
        'toggle_theme': 'Toggle light/dark theme',
        'toggle_lang': 'Change language',
        'loading_posts': 'Loading articles...',
        'search_posts_placeholder': 'Search articles...',
        'no_posts_found': 'No articles found.',
        'blog_page_title': 'Blog',
        'blog_page_subtitle': 'Educational technology, automation, and reflections on teaching and development.'
    },
    'es': {
        // Nav
        'nav_home': '~/home',
        'nav_career': '~/career',
        'nav_publications': '~/publications',
        'nav_projects': '~/projects',
        'nav_blog': '~/blog',
        'nav_contact': './contacto',
        
        // Hero
        'hero_badge': 'disponible para nuevos proyectos',
        'hero_title': 'Vitor Krewer<br><span class="highlight">Dev & Educación</span>',
        'hero_subtitle': 'Desarrollo sistemas y laboratorios para educación superior. Automatización, gestión académica y tecnología que transforma el aprendizaje.',
        'hero_btn_projects': 'Ver Proyectos',
        
        // About Section
        'about_label': 'sobre mí',
        'about_title': 'De la enseñanza a la ingeniería',
        'about_p1': 'Durante más de 10 años he trabajado en la intersección de la educación superior y los sistemas que la respaldan. He coordinado centros de educación a distancia, creado contenido de posgrado y automatizado flujos de trabajo con Google Apps Script.',
        'about_p2': 'Mi formación abarca <strong style="color:var(--text-primary)">Ciencias de la Computación, Ingeniería de Software, Derecho y Teología</strong>. Esta perspectiva multidisciplinaria me permite ver relaciones, cuellos de botella y atajos donde otros solo ven problemas.',
        'about_stack_label': '// Stack Principal',
        
        // Cards
        'card_1_title': 'Automatización Educativa',
        'card_1_text': 'Scripts en GAS y Python para optimizar la gestión académica y la educación a distancia.',
        'card_2_title': 'Producción Editorial',
        'card_2_text': 'Escritura técnica, curaduría y gestión de contenidos para educación superior.',
        'card_3_title': 'Gestión Académica',
        'card_3_text': 'Coordinación de centros virtuales y liderazgo de equipos multidisciplinarios.',
        'card_4_title': 'Diseño Instrucional',
        'card_4_text': 'Experiencias de aprendizaje activas y uso de IA en la educación.',

        // Footer
        'footer_tagline': 'Profesor y Desarrollador centrado en Tecnología Educativa y sistemas de gestión académica para educación superior.',
        'footer_nav_heading': 'Navegación',
        'footer_links_heading': 'Enlaces',
        'footer_nav_home': 'Inicio',
        'footer_nav_projects': 'Proyectos',
        'footer_nav_blog': 'Blog',
        'footer_lattes': 'Currículum Lattes',
        'footer_built': 'built with <span style="color:var(--accent-orange)">♥</span> & html/css/js',

        // Common UI
        'ui_loading': 'Cargando...',
        'ui_error': 'Error al cargar los datos.',
        'ui_empty': 'No se encontraron artículos.',

        // Projects Page
        'projects_page_title': 'Proyectos',
        'projects_page_subtitle': 'Sistemas, herramientas y soluciones desarrolladas en Tecnología Educativa.',
        'filter_all': 'Todos',
        'filter_systems': 'Sistemas',
        'filter_tools': 'Herramientas',
        'filter_education': 'Educación',
        'loading_projects': 'Cargando proyectos...',
        'github_cta_text': 'Más proyectos y experimentos en mi GitHub',
        'btn_view_github': 'Ver GitHub',
        'btn_article': 'Leer artículo',
        'private_badge': 'Repositorio Privado',

        // Publications Page
        'pub_page_title': 'Producción Intelectual',
        'pub_page_subtitle': 'Libros de texto, manuales técnicos y materiales de preparación. Haz clic en las tarjetas para detalles vía terminal.',
        'loading_pubs': 'Cargando publicaciones...',
        'pub_total_1': 'Total:',
        'pub_total_2': 'archivos encontrados',

        // Career Page
        'career_page_title': 'Trayectoria Profesional',
        'career_page_subtitle': 'Más de 10 años en la intersección de la educación superior, tecnología y gestión académica.',
        'career_exp_label': 'experiencia',
        'career_exp_title': 'Línea de Tiempo',
        'timeline_1_date': 'Feb 2021 — Presente',
        'timeline_1_role': 'Profesor y Coordinador de Centro de Contenidos',
        'timeline_1_company': 'Facultad Focus',
        'timeline_1_desc': 'Creador de contenidos, tutor de posgrado y coordinador de la producción de materiales didácticos para cursos a distancia. Responsable de la calidad pedagógica de las disciplinas de posgrado en las áreas de tecnología, gestión y educación.',
        'timeline_2_date': 'Abr 2019 — Jun 2025',
        'timeline_2_role': 'Coordenador NEAD',
        'timeline_2_company': 'Grupo Focus de Educación',
        'timeline_2_desc': 'Modelado de cursos en Moodle, TOOLZZ y Hotmart. Diseño educativo y automatización de procesos de enseñanza con Google Apps Script. Implementé tuberías de datos académicos y paneles de gestión para el seguimiento de clases.',
        'timeline_3_date': 'Ene 2016 — Ene 2019',
        'timeline_3_role': 'Editor Ejecutivo',
        'timeline_3_company': 'Focus Concursos',
        'timeline_3_desc': 'Organización y elaboración de guías de estudio para exámenes públicos, gestión de equipos editoriales y curación de contenidos jurídicos y de TI. Coautor de más de 6 libros para la preparación de exámenes federales y estatales.',
        'timeline_4_date': 'Oct 2014 — Dic 2015',
        'timeline_4_role': 'IT Helpdesk Analyst',
        'timeline_4_company': 'Región de Cascavel',
        'timeline_4_desc': 'Soporte técnico, acceso remoto y asistencia a alumnos y profesores. Configuración de redes, mantenimiento de hardware y soporte de sistemas educativos.',
        'career_edu_label': 'educación',
        'career_edu_title': 'Formación Académica',
        'status_in_progress': 'En curso',
        'status_completed': 'Completado',
        'edu_eng_title': 'Ingeniería de Software',
        'edu_eng_desc': 'Análisis, desarrollo y aseguramiento de calidad de sistemas complejos.',
        'edu_cs_title': 'Ciencias de la Computación',
        'edu_cs_desc': 'Sólidos fundamentos en algoritmos, estructuras de datos y sistemas.',
        'edu_law_title': 'Derecho',
        'edu_law_desc': 'Formación jurídica orientada a la legislación digital y oposiciones públicas.',
        'edu_theo_title': 'Teología',
        'edu_theo_desc': 'Multidisciplinariedad, ética y pensamiento filosófico aplicados a la enseñanza.',

        // Terminal
        'term_welcome': 'Bienvenido al terminal de Vitor Krewer',
        'term_whoami_info': 'Muestra información del perfil',
        'term_projects_info': 'Lista proyectos destacados',
        'term_blog_info': 'Muestra artículos recientes',
        'term_clear_info': 'Limpia el terminal',
        'term_help_info': 'Muestra esta ayuda',
        'term_cmd_not_found': 'comando no encontrado',
        'term_help_hint': 'Escribe help para ver los comandos disponibles.',
        'term_role': 'Rol',
        'term_focus': 'Enfoque',
        'term_location': 'Ubicación',
        'term_location_val': 'Cascavel, PR, Brasil',
        'term_stack_label': '// Stack Principal',
        'term_languages': 'Lenguajes',
        'term_platforms': 'Plataformas',
        'term_interests': 'Intereses',
        'term_connect': '// Conéctate',
        'term_available_cmds': 'Comandos disponibles:',
        'term_featured_projects': '// Proyectos Destacados',
        'term_recent_articles': '// Artículos Recientes',
        'term_view_all_projects': '→ Ver todos: projects.html',
        'term_view_all_blog': '→ Ver todos: blog/index.html',

        // UI Toggles
        'toggle_theme': 'Alternar tema claro/oscuro',
        'toggle_lang': 'Cambiar idioma',
        'loading_posts': 'Cargando artículos...',
        'search_posts_placeholder': 'Buscar artículos...',
        'no_posts_found': 'No se encontraron artículos.',
        'blog_page_title': 'Blog',
        'blog_page_subtitle': 'Tecnología educativa, automatización y reflexiones sobre enseñanza y desarrollo.'
    }
};

// Translates the page DOM dynamically based on data-i18n attributes
function translatePage(lang = currentLanguage) {
    document.documentElement.lang = lang; // Set HTML lang attribute
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            // Se o conteúdo possuir tags HTML, usamos innerHTML, caso contrário innerText
            if (translations[lang][key].includes('<')) {
                el.innerHTML = translations[lang][key];
            } else {
                el.innerText = translations[lang][key];
            }
        }
    });
}

function setLanguage(lang) {
    if (!translations[lang]) return;
    localStorage.setItem(I18N_KEY, lang);
    translatePage(lang);
    
    // Dispara evento global informando à UI/scripts que o idioma mudou
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

// Retorna a string traduzida no idioma atual (útil para JS dinâmico)
function t(key, lang = localStorage.getItem(I18N_KEY) || FALLBACK_LANG) {
    return translations[lang] && translations[lang][key] ? translations[lang][key] : key;
}

// Executa a tradução na carga
document.addEventListener('DOMContentLoaded', () => {
    translatePage();
});

// Tornar métodos disponíveis globalmente
window.i18n = {
    setLanguage,
    t,
    currentLanguage: () => localStorage.getItem(I18N_KEY) || FALLBACK_LANG,
    FALLBACK_LANG
};
