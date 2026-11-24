---
title: "Por que criei o Magnetares Knowledge, os menus retrô em Curses e a virada do JSON solto para o SQLite"
date: 2026-04-16
status: Publicado
series: Magnetares Knowledge
seriesOrder: 1
project: 13
tags: [Magnetares Knowledge, Python, SQLite, Curses, Rich, Textual, Arquitetura de Software]
readTime: 8 min
excerpt: "Como uma pasta cheia de arquivos JSON com 1.650 disciplinas deu origem ao Magnetares Knowledge. As idas e vindas dos primeiros scripts numerados por ciclos, a escolha de uma interface retrô estilo ERP MS-DOS no terminal e a refatoração para transformar o SQLite na única fonte da verdade."
---

Tudo começou com um arquivo chamado `disciplinas.json` aberto em uma aba do editor e uma planilha de controle na outra.

Dentro daquele arquivo moravam mais de **1.650 disciplinas** de ensino superior e pós-graduação *lato sensu*, cada uma com seu `id` em UUID, nome, carga horária padrão e unidades programáticas. O meu trabalho prático era cruzar esse catálogo para montar matrizes curriculares completas — geralmente grades de 9 a 12 disciplinas somando 360, 420 ou 480 horas, sempre encerradas pela disciplina obrigatória de *Docência do Ensino Superior* — além de redigir justificativa de mercado, apresentação, objetivos e perfil do egresso para cada novo curso.

Fazer essa curadoria manualmente para dois ou três cursos é perfeitamente viável. Você abre o arquivo, dá `Ctrl+F`, filtra termos próximos, soma as cargas horárias na calculadora e escreve a proposta pedagógica. Quando a meta passa para dezenas ou centenas de cursos distribuídos em múltiplas áreas do conhecimento, o processo manual trava. Você começa a esquecer quais disciplinas já existem no fim do catálogo, perde horas procurando equivalências e gasta uma energia mental enorme apenas copiando e colando IDs entre documentos.

Foi para resolver esse gargalo na minha própria mesa que comecei a escrever os primeiros scripts em Python do que viria a se tornar o **Magnetares Knowledge**.

---

## O erro de batizar módulos como etapas de uma linha de montagem

Na primeira semana de código, eu enxergava o problema como uma linha de produção estritamente sequencial. Na minha cabeça, o programa faria apenas uma viagem de ida, dividida em passos numerados.

Sem pensar duas vezes, batizei os arquivos do repositório exatamente na ordem em que eu pretendia rodá-los no terminal:

1. `ciclo_1_classificador.py` — lia o arquivo bruto `disciplinas.json` em blocos (*chunks* de 150 itens) e pedia para a API do Gemini classificar cada disciplina dentro de uma grande Área do Conhecimento, salvando o resultado em `areas_conhecimento.json`.
2. `ciclo_2_gerador.py` — lia o `areas_conhecimento.json`, recebia a configuração de carga horária e montava os cursos sugeridos dentro de `cursos_sugeridos.json`, acompanhados de um `inventario.json` para rastrear os lotes gerados.
3. `ciclo_3_exportador.py` — pegava o JSON de cursos gerados e despejava tudo em uma planilha Excel multi-abas com `pandas` e `openpyxl`.

Por alguns dias, essa estrutura pareceu suficiente. O problema apareceu assim que precisei voltar um passo.

Enquanto revisava as grades geradas, percebi que precisava sincronizar backups (`ciclo_4`), visualizar estatísticas das áreas no terminal (`ciclo_5`), emitir portarias institucionais em Markdown para cursos aprovados (`ciclo_6_portarias.py`) e consultar rapidamente quais cursos tinham determinada carga horária ou disciplina (`ciclo_7_consultas.py`). Quando dei por mim, a pasta `src/modules/` parecia um calendário fora de ordem, chegando até um `ciclo_14`.

A numeração por ciclos virou uma armadilha arquitetural por dois motivos simples:

- **O fluxo deixou de ser linear.** Eu não queria mais rodar o passo 1, depois o 2 e depois o 3. Na rotina real, eu abria o programa apenas para consultar um curso no passo 7, editar uma matriz no passo 11 e emitir uma portaria no passo 6.
- **Os nomes dos arquivos escondiam a responsabilidade do código.** Abrir um arquivo chamado `ciclo_6_portarias.py` ou lembrar a diferença entre o `ciclo_4` e o `ciclo_12` exigia consultar minhas próprias anotações.

Foi o primeiro grande aprendizado do projeto. Scripts utilitários podem ter nomes de etapas, mas um sistema vivo precisa ser organizado pelo que cada módulo **é** no domínio do problema, nunca pela ordem cronológica em que foi programado.

---

## Por que desenhei uma interface de ERP dos anos 90 com Curses

Quando decidi transformar aqueles scripts soltos em uma aplicação interativa operada a partir de um único ponto de entrada (`main.py`), precisei escolher como seria a navegação.

Eu não queria gastar semanas montando um frontend web naquele momento inicial, mas também já estava cansado de menus de terminal baseados em `input("Digite o número da opção: ")`. Quando você usa uma ferramenta por horas seguidas, digitar números e apertar `Enter` o tempo todo cansa e induz a erros de digitação. Eu queria navegar com as setas direcionais (`↑` e `↓`), bater o olho na barra selecionada e confirmar no `Enter`, exatamente como nos antigos sistemas ERP de MS-DOS e Clipper que dominavam escritórios nos anos 90.

Para construir essa experiência sem abrir mão de tabelas modernas e textos formatados, combinei três bibliotecas no terminal, dando a cada uma um papel bem delimitado:

- **Curses (`_menu_retro_curses` em `src/core/utils.py`)** para os menus flutuantes de navegação rápida com fundo azul clássico, janela central cinza com sombra projetada à direita e embaixo, e barra de seleção vermelha com texto branco em negrito;
- **Rich** para os painéis de leitura, logs coloridos de execução, tabelas de auditoria e prompts de entrada de dados;
- **Textual** para telas que exigiam componentes assíncronos mais pesados, como o console interativo de consultas SQL (`console_sql.py`) com tabela rolável (`DataTable`).

O coração visual desse menu retrô em `curses` cabia em poucas dezenas de linhas e lidava inclusive com a limpeza das tags de formatação do Rich para calcular a largura exata da janela e desenhar a sombra no terminal:

```python
def _menu_retro_curses(stdscr, titulo_app, sub_titulo, opcoes):
    curses.curs_set(0)
    curses.start_color()
    curses.init_pair(1, curses.COLOR_WHITE, curses.COLOR_BLUE)    # Fundo azul estilo DOS
    curses.init_pair(2, curses.COLOR_BLACK, curses.COLOR_WHITE)   # Corpo da janela
    curses.init_pair(3, curses.COLOR_WHITE, curses.COLOR_RED)     # Barra de seleção ativa
    curses.init_pair(4, curses.COLOR_YELLOW, curses.COLOR_BLUE)   # Título superior
    curses.init_pair(5, curses.COLOR_RED, curses.COLOR_WHITE)     # Alerta para ações críticas
```

Na versão `1.1.0`, publicada em 8 de abril, essa interface deu cara própria ao **Magnetares Knowledge**. Adicionei também o gerador automatizado de portarias — onde eu selecionava um curso recém-aprovado na lista com as setas e o sistema preenchia um template Markdown com variáveis `{{nome_curso}}`, `{{carga_horaria}}` e a tabela da matriz curricular (depois de trocar os colchetes `[]` originais por chaves duplas `{{}}`, já que os colchetes viviam conflitando com links nativos do Markdown nos meus editores).

Mas havia um problema sério escondido embaixo daquele menu azul.

---

## O caos silencioso de três arquivos JSON tentando conversar

Enquanto o sistema apenas acrescentava cursos novos ao final de `cursos_sugeridos.json`, o armazenamento em arquivos planos parecia funcionar. Bastava carregar o dicionário na memória e chamar `salvar_json()` a cada curso gerado para garantir persistência incremental caso a conexão caísse no meio de um lote.

O castelo de cartas começou a balançar quando adicionei o módulo de consultas avançadas e o editor de matrizes.

De repente, a mesma informação existia replicada em três ou quatro lugares diferentes:

1. O catálogo bruto morava em `data/input/disciplinas.json`.
2. As disciplinas agrupadas por área ficavam em `data/output/areas_conhecimento.json`.
3. Os cursos gerados e suas respectivas grades ficavam em `data/output/cursos_sugeridos.json`.
4. Um banco SQLite inicial (`academico.db`) recebia cópias desses dados por meio de uma rotina de sincronização (`ciclo_4`) para permitir filtros com operadores condicionais (`carga_horaria >= 400`, buscas por substring na justificativa, etc.).

Se eu excluísse um curso defeituoso no banco SQLite, ele reaparecia como um fantasma na próxima vez que a rotina de sincronização lia o `cursos_sugeridos.json`. Se eu alterasse o nome ou a carga horária de uma disciplina no catálogo JSON, os cursos já salvos continuavam exibindo o dado antigo. E quando o `disciplinas.json` ou algum arquivo auxiliar de configuração amanhecia vazio (`0 bytes`) por causa de uma interrupção abrupta, o sistema inteiro quebrava na inicialização com `json.decoder.JSONDecodeError`.

Ficou óbvio que manter arquivos JSON e um banco relacional disputando quem tinha a versão certa dos dados só me daria dor de cabeça.

---

## A virada da versão 1.3.0 e o susto do botão de reset

Em 16 de abril, parei a adição de novas funcionalidades para fazer a faxina arquitetural que consolidou a versão `1.3.0` do **Magnetares Knowledge**.

A primeira decisão foi decretar que o banco SQLite (`data/db/academico.db`) passaria a ser a **única fonte da verdade** para disciplinas, áreas, cursos, matrizes curriculares (`curso_disciplina`), planos de ensino e logs de auditoria. O arquivo `disciplinas.json` voltou para o único papel que fazia sentido: um arquivo de entrada inicial para alimentar ou atualizar o catálogo no banco. Toda criação de curso, edição de ementa, exclusão de matriz ou exportação para Excel passou a ler e gravar diretamente em transações SQLite.

A segunda decisão foi arrancar de vez os prefixos `ciclo_X_` de todo o código-fonte. O repositório finalmente ganhou nomes que diziam exatamente o que cada arquivo fazia:

| Nome antigo (orientado a etapas) | Nome novo na v1.3.0 (orientado a domínio) | Responsabilidade real no sistema |
|---|---|---|
| `ciclo_1_classificador.py` | `src/modules/classificador.py` | Classificação de disciplinas por área via Gemini e atualização incremental |
| `ciclo_2_gerador.py` | `src/modules/gerador_auto.py`, `gerador_manual.py`, `gerador_lote.py` | Geração de matrizes curriculares nos três modos de operação |
| `ciclo_3_exportador.py` | `src/modules/exporter_excel.py` | Exportação gerencial multi-abas para planilhas `.xlsx` |
| `ciclo_5_dashboard.py` | `src/modules/dashboard.py` | Estatísticas executivas e gráficos ASCII no terminal |
| `ciclo_6_portarias.py` | `src/modules/gerador_portarias.py` | Emissão de resoluções e portarias institucionais em Markdown |
| `ciclo_7_consultas.py` | `src/modules/console_sql.py` | Console de consultas relacionais e filtros dinâmicos em Textual |

Nessa mesma refatoração, corrigi dois problemas de usabilidade que me irritavam todos os dias.

O primeiro era a falta de uma saída limpa nos submenus de texto. Antes da `1.3.0`, se eu entrasse no gerador manual ou no configurador de cargas horárias por engano, a única forma de abortar e voltar ao menu principal era apertando `Ctrl+C`, o que disparava um `KeyboardInterrupt` feio na tela ou encerrava o processo inteiro. Padronizei a opção universal `0` em todos os prompts e menus para voltar ao nível anterior sem derrubar a sessão.

O segundo foi um bug real — e gelado na espinha — que apareceu logo após reorganizar a lista de opções do menu principal em `main.py`.

Na época, os despachos do menu principal dependiam do índice numérico (`idx`) retornado pelo `menu_retro`. Ao remover um item obsoleto de sincronização da lista de strings do menu e esquecer de deslocar um `elif idx == ...` logo abaixo no loop principal, o índice da opção **"Console de Consultas SQL"** passou a cair exatamente no bloco condicional que chamava a função de **Resetar o Banco de Dados**.

Felizmente, duas coisas me salvaram naquele teste local: a opção de reset exibia uma confirmação explícita antes de apagar as tabelas e eu já mantinha cópias dos dados em `data/backup/`. Corrigi o mapeamento dos índices na hora, adicionei destaque em vermelho (`color_pair(5)`) exclusivo para opções destrutivas na janela do `curses` e aprendi a nunca confiar em índices numéricos mágicos ao alterar a ordem de um menu.

---

## O saldo da primeira fundação

Ao final daquela segunda semana de abril, o **Magnetares Knowledge Database** tinha deixado de ser um punhado de scripts que liam e sobrescreviam arquivos JSON soltos para se tornar uma aplicação de terminal estável, rápida e centrada em um banco relacional único.

| Versão | Data | Marco principal na arquitetura |
|---|---|---|
| `1.1.0` | 08/04/2026 | Menu central interativo em `curses` (estilo ERP MS-DOS), gerador de portarias em Markdown (`{{}}`) e módulo de consultas |
| `1.2.0` | 14/04/2026 | Primeiros testes com busca vetorial, explorador de catálogo, auditoria de tokens/custos da API e travas contra duplicidade |
| `1.3.0` | 16/04/2026 | Migração definitiva para o SQLite (`academico.db`) como única fonte da verdade, fim dos arquivos `ciclo_X_` e navegação universal com `0` |

Com a casa em ordem e as 1.650 disciplinas devidamente estruturadas no SQLite, pude finalmente atacar o problema mais interessante do projeto: como impedir que a inteligência artificial montasse grades curriculares repetidas e como ensinar o sistema a cruzar disciplinas de áreas diferentes sem perder a coerência acadêmica. Mas essa é a história do próximo artigo da série.
