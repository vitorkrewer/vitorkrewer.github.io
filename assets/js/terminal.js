// ============================================================
// terminal.js — Terminal interativo com xterm.js
// Simula uma sessão de terminal mostrando o perfil do Vitor
// ============================================================

const TERM_DATA = {
    user: 'vitor',
    host: 'krewer-dev',
    path: '~',
    delay: {
        typing: 40,    // ms por caractere
        line: 600,     // ms entre linhas de output
        cmd: 1000,     // ms antes de executar o comando
    }
};

function getWhoamiOutput() {
    const t = window.i18n ? window.i18n.t : (k) => k;
    return [
        '',
        `\x1b[1;32m  Vitor Matheus Krewer\x1b[0m`,
        '\x1b[90m  ──────────────────────────────────────────\x1b[0m',
        `  \x1b[36m${t('term_role')}\x1b[0m        Professor & Desenvolvedor`,
        `  \x1b[36m${t('term_focus')}\x1b[0m       Tecnologia Educacional · EAD · Sistemas`,
        `  \x1b[36m${t('term_location')}\x1b[0m    ${t('term_location_val')}`,
        '',
        `\x1b[90m  ${t('term_stack_label')}\x1b[0m`,
        `  \x1b[33m${t('term_languages')}\x1b[0m   JavaScript · Python · Google Apps Script`,
        `  \x1b[33m${t('term_platforms')}\x1b[0m   Moodle · Google Workspace · HTML/CSS`,
        `  \x1b[33m${t('term_interests')}\x1b[0m   EdTech · Automation · Data Engineering`,
        '',
        `\x1b[90m  ${t('term_connect')}\x1b[0m`,
        '  \x1b[35mGitHub\x1b[0m      github.com/vitorkrewer',
        '  \x1b[35mLinkedIn\x1b[0m    linkedin.com/in/vitorkrewer',
        '  \x1b[35mEmail\x1b[0m       vitormkrewer@gmail.com',
        '',
    ];
}

function getHelpOutput() {
    const t = window.i18n ? window.i18n.t : (k) => k;
    return [
        '',
        `\x1b[90m  ${t('term_available_cmds')}\x1b[0m`,
        `  \x1b[36mwhoami\x1b[0m     — ${t('term_whoami_info')}`,
        `  \x1b[36mprojects\x1b[0m   — ${t('term_projects_info')}`,
        `  \x1b[36mblog\x1b[0m       — ${t('term_blog_info')}`,
        `  \x1b[36mclear\x1b[0m      — ${t('term_clear_info')}`,
        `  \x1b[36mhelp\x1b[0m       — ${t('term_help_info')}`,
        '',
    ];
}

function getProjectsOutput() {
    const t = window.i18n ? window.i18n.t : (k) => k;
    const lang = localStorage.getItem('vk-lang') || 'pt-br';
    const desc = {
        'pt-br': [
            'Plataforma de gestão acadêmica para EAD',
            'Analisa e corrige problemas de SEO automaticamente',
            '+200 cursos coordenados, automação de processos'
        ],
        'en': [
            'Academic management platform for Distance Learning',
            'Analyzes and fixes SEO issues automatically',
            '+200 coordinated courses, process automation'
        ],
        'es': [
            'Plataforma de gestión académica para educación a distancia',
            'Analiza y corrige problemas de SEO automáticamente',
            '+200 cursos coordinados, automatización de procesos'
        ]
    }[lang];

    return [
        '',
        `\x1b[90m  ${t('term_featured_projects')}\x1b[0m`,
        '',
        '  \x1b[1;32m★\x1b[0m \x1b[1mFocusConnecta\x1b[0m    \x1b[90m[GAS · Moodle · HTML/CSS]\x1b[0m',
        `    ${desc[0]}`,
        '',
        '  \x1b[1;32m★\x1b[0m \x1b[1mSEO Auto-Fixer\x1b[0m   \x1b[90m[Python · Gemini API]\x1b[0m',
        `    ${desc[1]}`,
        '',
        '  \x1b[1;32m★\x1b[0m \x1b[1mImplantação NEAD\x1b[0m \x1b[90m[Moodle · GAS · Gestão]\x1b[0m',
        `    ${desc[2]}`,
        '',
        `  \x1b[90m  ${t('term_view_all_projects')}\x1b[0m`,
        '',
    ];
}

function getBlogOutput() {
    const t = window.i18n ? window.i18n.t : (k) => k;
    const lang = localStorage.getItem('vk-lang') || 'pt-br';
    const titles = {
        'pt-br': [
            'Automatizando o Ensino com Google Apps Script',
            'IA no Design Instrucional: ferramenta ou substituto?',
            'O que Engenharia de Dados ensina sobre Gestão Acadêmica'
        ],
        'en': [
            'Automating Teaching with Google Apps Script',
            'AI in Instructional Design: tool or substitute?',
            'What Data Engineering teaches about Academic Management'
        ],
        'es': [
            'Automatizando la Enseñanza con Google Apps Script',
            'IA en el Diseño Instruccional: ¿herramienta o sustituto?',
            'Lo que la Ingeniería de Datos enseña sobre la Gestión Académica'
        ]
    }[lang];

    return [
        '',
        `\x1b[90m  ${t('term_recent_articles')}\x1b[0m`,
        '',
        `  \x1b[36m2025-02-10\x1b[0m  ${titles[0]}`,
        `  \x1b[36m2025-01-22\x1b[0m  ${titles[1]}`,
        `  \x1b[36m2024-12-05\x1b[0m  ${titles[2]}`,
        '',
        `  \x1b[90m  ${t('term_view_all_blog')}\x1b[0m`,
        '',
    ];
}

// ── Bootstrap do Terminal ──────────────────────────────────
function initTerminal() {
    if (typeof Terminal === 'undefined') {
        const container = document.getElementById('terminal-container');
        if (container) {
            container.innerHTML = `
        <div style="padding:1rem; font-family: 'JetBrains Mono', monospace; font-size:0.82rem; color:#8b949e; line-height:1.7">
          <span style="color:#f78166">[erro]</span> xterm.js não carregou. Verifique a conexão com a internet.
        </div>`;
        }
        return;
    }

    const term = new Terminal({
        theme: {
            background: '#161b22',
            foreground: '#c9d1d9',
            cursor: '#58a6ff',
            cursorAccent: '#0d1117',
            selectionBackground: 'rgba(88,166,255,0.3)',
            black: '#21262d', red: '#ff7b72', green: '#3fb950', yellow: '#d29922',
            blue: '#58a6ff', magenta: '#d2a8ff', cyan: '#76e3ea', white: '#c9d1d9',
            brightBlack: '#6e7681', brightRed: '#ffa198', brightGreen: '#56d364',
            brightYellow: '#e3b341', brightBlue: '#79c0ff', brightMagenta: '#f0abfc',
            brightCyan: '#b3f0ff', brightWhite: '#ffffff',
        },
        fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
        fontSize: 12.5,
        lineHeight: 1.5,
        cursorBlink: true,
        cursorStyle: 'bar',
        scrollback: 400,
        convertEol: true,
        allowTransparency: true,
    });

    const fitAddon = typeof FitAddon !== 'undefined'
        ? new FitAddon.FitAddon()
        : null;

    if (fitAddon) term.loadAddon(fitAddon);

    const container = document.getElementById('terminal-container');
    if (!container) return;

    term.open(container);
    if (fitAddon) {
        fitAddon.fit();
        window.addEventListener('resize', () => fitAddon.fit());
    }

    // — Sequência de boot animada —
    let inputBuffer = '';
    let isReady = false;

    function prompt() {
        term.write(`\r\n\x1b[32m${TERM_DATA.user}@${TERM_DATA.host}\x1b[0m:\x1b[34m${TERM_DATA.path}\x1b[0m$ `);
        isReady = true;
        inputBuffer = '';
    }

    function typeText(text, speed, cb) {
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                term.write(text[i++]);
            } else {
                clearInterval(interval);
                if (cb) cb();
            }
        }, speed);
    }

    function printLines(lines, done) {
        let idx = 0;
        function next() {
            if (idx < lines.length) {
                term.writeln(lines[idx++]);
                setTimeout(next, 80);
            } else {
                if (done) done();
            }
        }
        next();
    }

    function execCommand(cmd) {
        const trimmed = cmd.trim().toLowerCase();
        isReady = false;
        term.writeln('');
        const t = window.i18n ? window.i18n.t : (k) => k;
        switch (trimmed) {
            case 'whoami': printLines(getWhoamiOutput(), prompt); break;
            case 'help': printLines(getHelpOutput(), prompt); break;
            case 'projects': printLines(getProjectsOutput(), prompt); break;
            case 'blog': printLines(getBlogOutput(), prompt); break;
            case 'clear': term.clear(); prompt(); break;
            case '': prompt(); break;
            default:
                term.writeln(`\x1b[31m  ${t('term_cmd_not_found')}: ${trimmed}\x1b[0m`);
                term.writeln(`  ${t('term_help_hint')}`);
                prompt();
        }
    }

    // Input handler
    term.onData(e => {
        if (!isReady) return;
        const code = e.charCodeAt(0);
        if (code === 13) {          // Enter
            execCommand(inputBuffer);
        } else if (code === 127) { // Backspace
            if (inputBuffer.length > 0) {
                inputBuffer = inputBuffer.slice(0, -1);
                term.write('\b \b');
            }
        } else if (code >= 32) {   // Printable chars
            inputBuffer += e;
            term.write(e);
        }
    });

    // — Animação de boot automático —
    function runBoot() {
        const t = window.i18n ? window.i18n.t : (k) => k;
        term.clear();
        term.writeln(`\x1b[90m  ${t('term_welcome')}\x1b[0m`);
        term.writeln('\x1b[90m  ─────────────────────────────────────\x1b[0m');
        setTimeout(() => {
            term.write(`\x1b[32m${TERM_DATA.user}@${TERM_DATA.host}\x1b[0m:\x1b[34m${TERM_DATA.path}\x1b[0m$ `);
            setTimeout(() => {
                typeText('whoami', TERM_DATA.delay.typing, () => {
                    setTimeout(() => {
                        term.writeln('');
                        printLines(getWhoamiOutput(), prompt);
                    }, TERM_DATA.delay.cmd);
                });
            }, 400);
        }, 800);
    }

    setTimeout(runBoot, 200);

    // Listen for language changes to refresh the terminal content if needed
    document.addEventListener('languageChanged', () => {
        if (isReady) {
            // Se o terminal estiver pronto, limpa e executa whoami novamente no novo idioma
            term.writeln('');
            term.writeln('\x1b[90m// language changed -> re-executing whoami...\x1b[0m');
            setTimeout(() => execCommand('whoami'), 300);
        } else {
            // Se ainda estiver bootando, o próximo whoami já pegará o idioma novo do localStorage
            console.log('Terminal still booting, language will be updated in next command.');
        }
    });
}

// Aguarda DOM + xterm.js carregarem
document.addEventListener('DOMContentLoaded', () => {
    // xterm pode carregar via CDN, aguarda um tick
    setTimeout(initTerminal, 100);
});
