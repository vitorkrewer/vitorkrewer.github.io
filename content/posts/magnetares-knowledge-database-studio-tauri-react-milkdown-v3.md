---
title: "Da tela azul do terminal ao desktop multiplataforma com Tauri v2, React, FastAPI, Docker e editor Milkdown"
date: 2026-11-07
status: Publicado
series: Magnetares Knowledge
seriesOrder: 10
project: 13
tags: [Magnetares Knowledge, Tauri, Rust, React, TypeScript, FastAPI, Milkdown, Docker]
readTime: 9 min
excerpt: "O salto para a versão 3.0 sem tocar em uma única linha da interface de terminal. Como construí a interface gráfica Desktop e Web usando Tauri v2 em Rust, FastAPI em Python, React, temas claro e escuro, controle do .env em tempo real e o editor visual Milkdown."
---

Até a versão `2.5.0`, toda a minha relação com o **Magnetares Knowledge** acontecia dentro da janela do terminal. Eu gosto genuinamente da velocidade das interfaces de texto construídas com Rich, Curses e Textual. Navegar pelas opções pelo teclado, disparar um pipeline de geração de plano de ensino ou acompanhar os logs de indexação vetorial sem tirar as mãos do lugar tem uma agilidade difícil de bater.

Mas, à medida que o banco de dados cresceu para mais de 220 cursos, 1.650 disciplinas catalogadas, dezenas de cadernos de aulas versionados, leis comentadas artigo por artigo e textos longos de copywriting, comecei a sentir os limites físicos do terminal em três momentos específicos: quando eu queria revisar e diagramar um artigo ou livro longo com conforto tipográfico real, quando precisava cruzar indicadores visuais do acervo inteiro em uma única tela e quando queria editar uma matriz curricular arrastando ou filtrando componentes sem precisar atravessar três submenus sequenciais.

Eu queria dar o salto para a versão `3.0.0` construindo um estúdio gráfico completo, capaz de rodar tanto como aplicativo Desktop nativo (Windows, Linux e macOS) quanto no navegador via Docker. Só que impus a mim mesmo uma regra inegociável antes de criar a pasta `app/`: **eu não quebraria nem reescreveria uma única linha do `main.py` ou dos módulos em `src/modules/`**. A interface de terminal (TUI) e a nova interface gráfica (GUI) teriam que conviver em paridade absoluta, lendo e gravando exatamente nos mesmos arquivos SQLite (`academico.db` e `catalogo_bibliografico.db`) ao mesmo tempo.

---

## O dilema de criar uma interface gráfica sem quebrar uma linha do terminal

Quando um projeto em Python cresce no terminal e o autor resolve criar uma interface gráfica depois, o erro mais comum é copiar regras de negócio para dentro das rotas da web ou reescrever consultas SQL em outra linguagem. Se eu fizesse isso, teria dois sistemas diferentes para manter sozinho, e cada melhoria nas regras ABNT ou nos prompts do Gemini precisaria ser duplicada.

A saída arquitetural que desenhei para o **Magnetares Knowledge Studio** isolou toda a novidade dentro do diretório `app/`, dividido em duas metades que conversam com o núcleo original sem modificá-lo:

1. **`app/api/server.py` (Backend Unificado em FastAPI)** que importa diretamente `src/core/academico_db.py`, `src/core/catalogo_bibliografico_db.py`, `src/core/gerador_utils.py`, `src/core/docx_utils.py` e os módulos especializados de `src/modules/`. Ele expõe mais de 60 rotas REST (`/api/*`) sobre a mesma lógica que o terminal executa e, em modo de produção ou container, também serve os arquivos estáticos compilados do frontend.
2. **`app/frontend/` (SPA em React 18 + TypeScript + Vite + Tailwind CSS + Shell Nativo em Tauri v2)** que organiza toda a operação em oito workspaces gráficos sincronizados.

```python
# Trecho da inicialização em app/api/server.py conectando-se ao núcleo original
ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

os.chdir(ROOT_DIR)
load_dotenv(ROOT_DIR / ".env")

from src.core import academico_db, catalogo_bibliografico_db, trilha_aprendizagem_db

academico_db.inicializar_banco()
catalogo_bibliografico_db.inicializar_banco()
```

Essa decisão me deu uma liberdade enorme no dia a dia. Posso estar com o terminal aberto gerando um lote de disciplinas em segundo plano e, no mesmo segundo, abrir a janela gráfica para editar uma aula no editor visual ou exportar uma portaria institucional em Word. Como o SQLite opera com `WAL` (*Write-Ahead Logging*) ativado na camada central de persistência, as duas interfaces enxergam exatamente os mesmos registros sem conflito de travamento.

---

## Por que escolhi Tauri v2 em Rust, React 18 e um servidor FastAPI acoplado ao núcleo

Para empacotar a aplicação no Desktop, descartei o Electron logo no início. Carregar uma instância inteira do Chromium e do Node.js só para exibir a interface ao lado de um runtime Python deixaria o pacote pesado e consumiria memória à toa. Escolhi o **Tauri v2**, escrito em **Rust** (`app/frontend/src-tauri/`), que utiliza a WebView nativa do sistema operacional e gera um executável enxuto com os ícones nativos do projeto (`.ico`, `.icns` e `.png`).

O desafio mais interessante no Rust foi gerenciar o ciclo de vida do processo Python de forma invisível para quem abre o programa. Quando clico no ícone do aplicativo Desktop, eu não quero abrir um terminal antes para digitar `uvicorn app.api.server:app`. Por isso, programei o `src-tauri/src/main.rs` para disparar automaticamente o processo do servidor FastAPI em background (`spawn_python_api`) durante a inicialização da janela e guardar o identificador do processo filho. Assim que fecho a janela do aplicativo Desktop, o hook de encerramento do Tauri executa `child.kill()`, encerrando o servidor Python sem deixar processos órfãos rodando na máquina.

Ao mesmo tempo, eu queria que a mesma base de código rodasse no navegador ou em um servidor local sem precisar instalar nada na máquina hospedeira. Para isso, criei um `app/run_studio.py` — um inicializador de comando único que sobe o FastAPI e já abre a aba do navegador — e também um setup **Docker Multi-Stage** (`app/Dockerfile` e `docker-compose.yml`).

No primeiro estágio do Dockerfile (`node:22-alpine`), o container compila o bundle de produção do React e do TypeScript; no segundo estágio (`python:3.12-slim`), ele instala as dependências do motor de IA, do OCR local (`rapidocr_onnxruntime`) e do FastAPI, copia o `dist/` gerado pelo Node e monta os volumes `./data` e `.env` diretamente do host. O resultado é que tanto o app Desktop em Rust quanto o container Docker e o terminal local operam sobre a mesma pasta `data/db/`.

---

## Oito áreas de trabalho, temas claro e escuro e controle ao vivo do arquivo .env

Para que a interface gráfica não virasse apenas um painel de leitura bonito, mas incompleto em relação ao terminal, mapeei todas as operações do menu principal para oito workspaces dedicados dentro de `app/frontend/src/views/`:

| Workspace Gráfico | Componente Principal | O que substitui ou expande do Terminal |
|---|---|---|
| **Dashboard Executivo & BI** | `DashboardView.tsx` | KPIs globais, distribuição de cursos por área do conhecimento, telemetria de tokens e custos da API Gemini e ranking das disciplinas mais reutilizadas |
| **Cursos & Matrizes Curriculares** | `CursosView.tsx` | Criação de cursos com IA nos modos Manual, Lote e Automático (`POST /api/cursos/gerar-ia`), edição interativa da grade curricular, emissão de Portarias e exportação `.xlsx` |
| **Planos de Ensino & Trilhas** | `PlanosTrilhasView.tsx` | Leitura e edição de ementas, Competências, Habilidades e Atitudes (CHA), bibliografias ABNT, conversão de Plano em Curso, download em PDF/DOCX/MD e inspetor de Trilhas aula a aula |
| **Estúdio Editorial IA** | `EditorialView.tsx` | Geração e edição visual de Artigos Científicos, Livros Didáticos, Propostas FAPESP/CNPq, eBooks Comerciais, Cadernos de Aulas e Postagens de Copywriting |
| **Concursos & Leis Comentadas** | `ConcursosLeisView.tsx` | Gestão de bancas e editais, leitura das apostilas geradas por ciclos e inspetor artigo por artigo das Leis Comentadas |
| **Acervo RAG, Catálogo & Legislação** | `AcervoLegislacaoView.tsx` | Busca semântica vetorial por similaridade de cosseno (`POST /api/acervo/busca-semantica`), status de embeddings, Catálogo Bibliográfico, Fichamentos ABNT e Legislação Educacional |
| **Sistema, SQL & Copiloto** | `SistemaView.tsx` | Copiloto Pedagógico IA integrado ao `smart_generate()`, Console SQL Read-Only (`SELECT`/`PRAGMA`), explorador paginado das 1.650+ disciplinas, backups quentes e reparo de integridade |
| **Configurações & Ambiente `.env`** | `ConfigEnvView.tsx` | Gerenciador visual de todas as variáveis do arquivo `.env` com mascaramento de chaves secretas e recarregamento a quente (`Hot-Reload`) |

Dois detalhes de usabilidade me tomaram bastante tempo de ajuste fino no `App.tsx` e no `index.css`. O primeiro foi a **barra lateral recolhível** (`w-64` expandida e `w-20` compacta apenas com ícones e tooltips) combinada com um sistema completo de **Tema Claro e Escuro (`Light` / `Dark` Mode)** persistido no `localStorage`. Ler textos longos à noite pede fundo escuro repousante, mas revisar tabelas curriculares e documentos institucionais durante o dia funciona muito melhor em um tema claro com contraste editorial limpo.

O segundo foi a criação da **Central de Configurações e Variáveis de Ambiente (`ConfigEnvView.tsx`)**. No terminal, trocar o modelo principal do Gemini (por exemplo, alternar entre `gemini-2.5-flash` e `gemini-2.5-pro`), ajustar o tamanho do lote do Turso ou atualizar a `GOOGLE_API_KEY` exigia abrir o arquivo `.env` em um editor externo e reiniciar a aplicação. Construí os endpoints `/api/config/env` para ler o arquivo `.env` preservando todos os comentários originais, organizar as variáveis por categorias na tela (Chaves de API e Segurança, Modelos Gemini e Fallback, Diretórios e Parâmetros de Geração), mascarar segredos com botão de revelação e aplicar **Hot-Reload imediato diretamente em `os.environ`**, permitindo trocar de modelo ou chave de API sem reiniciar o servidor.

---

## Edição visual com Milkdown e normalização via mdformat

O coração do `EditorialView.tsx` precisava ser o editor de texto. Como todos os livros didáticos, artigos científicos, leis comentadas, cadernos de aulas e postagens de copywriting são salvos em Markdown no SQLite, eu não queria editar código Markdown bruto dentro de um `<textarea>` gigante na interface gráfica — para isso eu já tinha o editor do terminal. Eu queria uma experiência visual *WYSIWYG* fluida, parecida com escrever no Notion ou no Typora, em que tabelas, blocos de citação (`>`), títulos e listas aparecessem diagramados na hora, mas sem corromper a estrutura Markdown que o meu exportador Word (`docx_utils.py`) espera receber.

A solução foi integrar o **Milkdown (`@milkdown/kit` + `@milkdown/react`)** dentro do componente `MarkdownViewer.tsx`, construído sobre a arquitetura do ProseMirror e com suporte nativo a CommonMark e GitHub Flavored Markdown (`@milkdown/preset-gfm`).

Para garantir que a edição visual nunca gerasse um Markdown torto ou inconsistente ao salvar no banco de dados, fechei um ciclo entre o React e o Python na barra superior do componente:

1. **Alternância instantânea entre Modo Visual (Milkdown) e Código-Fonte Markdown**, permitindo editar tanto na superfície tipográfica rica quanto diretamente no código quando quero ajustar uma tabela ou citação na mão.
2. **Botão de formatação acoplado ao Python `mdformat` (`POST /api/markdown/format`)**, que recebe o conteúdo atual do editor, normaliza espaçamentos, listas e cabeçalhos segundo as regras canônicas de Markdown e devolve o texto limpo para a tela.
3. **Exportação direta para Word Editorial (`POST /api/markdown/export-docx`)**, um botão fixo na barra do editor que envia o documento aberto para o `src/core/docx_utils.py` e baixa imediatamente o `.docx` diagramado com estilos de título, tabelas distribuídas e rodapé paginado.

---

## Três bugs reais no caminho até a paridade total

Colocar uma interface React em cima de um banco SQLite populado ao longo de meses por dezenas de scripts de terminal revelou inconsistências nos dados que passavam despercebidas na tela de texto. Três bugs reais que enfrentei e corrigi durante a construção da versão `3.0.0` mostram bem esse choque de realidade.

### 1. Os 229 cursos marcando 0h de carga horária e disciplinas sem ementa na tela

Assim que abri a aba **Cursos & Matrizes Curriculares (`CursosView.tsx`)** pela primeira vez com o banco real, levei um susto: 229 cursos apareciam no cartão com carga horária total de `0h`, e ao abrir a grade curricular de vários deles, a lista de disciplinas vinha apenas com os códigos e nomes, sem exibir a ementa nem as competências de cada matéria.

Investigando os registros antigos no SQLite, descobri duas causas. Primeiro, muitos cursos importados nas primeiras versões do projeto tinham suas disciplinas gravadas no JSON da grade sem o somatório consolidado na coluna de carga horária ou com vínculos desatualizados após refatorações do catálogo. Executei e expus na própria interface gráfica (`SistemaView.tsx`) a rotina `consertar_integridade_cursos()`, que varreu o banco recalculando as cargas horárias reais e reparando os vínculos. Segundo, criei no `app/api/server.py` a função `_enriquecer_curso_completo()`, que intercepta a leitura de um curso na API, cruza cada `id_disciplina` da matriz curricular com o catálogo central de disciplinas e injeta em tempo real a ementa completa, a bibliografia e os campos de CHA antes de devolver o JSON para o React.

### 2. O erro 422 Unprocessable Entity na listagem ampla e o processo fantasma do Uvicorn

Quando criei o explorador de disciplinas e os seletores completos dos cursos no frontend, configurei o cliente HTTP do React para buscar lotes maiores (`?limit=1000`) a fim de permitir filtragem instantânea na tela. De repente, a listagem parou de carregar e o console do navegador acusou `422 Unprocessable Entity`.

No código do `server.py`, o parâmetro de paginação da rota tinha nascido com uma trava `Query(100, le=500)` no FastAPI. Aumentei o limite no código para `le=5000`, salvei o arquivo, atualizei a página no navegador e... o erro `422` continuou acontecendo exatamente igual. Quebrei a cabeça por vários minutos até perceber o culpado: havia um processo antigo do `uvicorn` rodando em background na porta `8000` que tinha sido iniciado sem a flag `reload=True`. O meu editor salvava o arquivo novo, mas quem respondia às requisições na porta `8000` ainda era a instância antiga em memória com a trava `le=500`. Depois de matar o processo órfão e padronizar o inicializador em `app/run_studio.py`, a listagem de milhares de registros abriu instantaneamente.

### 3. A tela branca ao clicar em Planos e Trilhas por causa de objetivos em formato JSON

Outro tropeço clássico de integração entre Python e React aconteceu na aba **Planos de Ensino & Trilhas (`PlanosTrilhasView.tsx`)**. Em alguns planos de ensino, a tela renderizava normalmente; em outros, bastava clicar no nome do plano na lista lateral para a aplicação inteira ficar branca, acusando no console do React o erro `Objects are not valid as a React child (found: object with keys {geral, especificos})`.

A causa estava na evolução histórica do banco SQLite. Nos planos mais antigos, a coluna `objetivos` era salva como uma string Markdown simples. Já nos planos gerados pelas versões mais recentes do pipeline de IA, o modelo devolvia uma estrutura aninhada e o banco serializava um objeto JSON com a chave `"geral"` (string) e a chave `"especificos"` (array de strings). No terminal Rich, o Python convertia qualquer coisa com `str()` ou formatava o dicionário sem reclamar, mas o JSX do React quebrava na hora ao tentar renderizar um objeto dentro de um parágrafo. Ajustei tanto a normalização no `server.py` quanto o renderizador defensivo em `PlanosTrilhasView.tsx` e `CursosView.tsx` para inspecionar o tipo de `objetivos` e desenhar separadamente o Objetivo Geral e a lista de Objetivos Específicos quando o campo vier estruturado.

---

## Resumo da arquitetura na versão 3.0.0

Com a versão `3.0.0` consolidada e o pipeline de release (`.github/workflows/release.yml`) atualizado para compilar e validar o bundle do React junto com os artefatos multiplataforma, o **Magnetares Knowledge** passou a operar em três frentes simultâneas sobre o mesmo núcleo:

1. **Terminal TUI (`python main.py`)**, preservando 100% da velocidade de teclado com Rich, Curses e Textual.
2. **Aplicativo Desktop Nativo (`Tauri v2` + `Rust` + `FastAPI`)**, gerenciando o processo Python automaticamente em segundo plano.
3. **Estúdio Web e Docker (`app/run_studio.py` ou `docker compose up`)**, acessível pelo navegador com edição visual no **Milkdown**, temas claro e escuro e controle ao vivo do `.env`.

Depois de colocar o estúdio gráfico de pé, minha atenção voltou para a qualidade do texto gerado pela inteligência artificial em artigos longos. Eu queria acabar de vez com o truncamento de 25 mil caracteres na leitura dos livros do acervo, enviar arquivos Markdown inteiros para a janela de 1 milhão de tokens do Gemini e criar uma blindagem rigorosa contra os vícios de escrita da IA — como títulos com dois-pontos e autoelogios exagerados. Esse motor Long-Form da versão `3.1.0` é o tema do décimo primeiro e último artigo desta série.
