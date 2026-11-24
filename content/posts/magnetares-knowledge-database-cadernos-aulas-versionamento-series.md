---
title: "Cadernos de aulas didáticas com controle de versão, técnicas socráticas e séries de postagens"
date: 2026-09-21
status: Publicado
series: Magnetares Knowledge
seriesOrder: 9
project: 13
tags: [Magnetares Knowledge, Python, Cadernos de Aulas, Didática, Copywriting, Medium, SQLite]
readTime: 8 min
excerpt: "Como criei o módulo de Cadernos de Aulas para fatiar disciplinas em aulas com Storytelling, Microcopy e método socrático, implementei o histórico de versões (v1, v2, v3) no SQLite e conectei tudo ao gerador de séries para o Medium e LinkedIn."
---

Quando terminei o gerador de Trilhas de Aprendizagem e os módulos de apostilas para concursos e leis comentadas no **Magnetares Knowledge**, percebi que ainda faltava uma peça essencial para a rotina de sala de aula. A trilha organizava muito bem o roteiro pedagógico, as atividades avaliativas e os vídeos complementares, enquanto a apostila de concurso mergulhava na letra fria da banca e na jurisprudência. Mas, na hora de preparar uma disciplina universitária ou um curso livre de ponta a ponta, eu precisava de um texto-base corrido, com ritmo de aula falada, exemplos concretos no início de cada encontro e perguntas que fizessem o aluno pensar antes de receber a resposta pronta.

Eu queria pegar uma disciplina de 60 ou 80 horas da minha base, dizer ao sistema *"divida essa ementa em exatamente 8 aulas"* e escolher quais técnicas didáticas conduziriam a explicação de cada encontro. Foi dessa necessidade prática que nasceu o módulo `src/modules/caderno_aulas.py`, inaugurado na versão `2.3.0` e amadurecido ao longo das versões `2.4.0` e `2.5.0`.

Como quase tudo o que construí neste projeto, o caminho entre o primeiro protótipo funcional e uma ferramenta que dá gosto de usar no dia a dia foi cheio de idas e vindas. Descobri rápido que gerar uma aula inteira não basta quando você decide mudar a abordagem da Aula 3 e tem medo de perder o texto que já estava bom, ou quando você quer transformar um caderno de seis aulas em uma série encadeada de artigos para o Medium sem precisar copiar e colar texto de um módulo para o outro.

---

## O salto da trilha de aprendizagem para a redação didática em caderno_aulas.py

O primeiro obstáculo apareceu antes mesmo de chamar a API do Gemini. Na versão `2.3.0`, o meu banco de dados já acumulava mais de 500 disciplinas espalhadas entre planos de ensino gerados por inteligência artificial e o catálogo geral da base. Um seletor simples de terminal que despejasse todas as linhas na tela não funcionava mais.

Precisei construir primeiro a função `selecionar_disciplina_interativa`, uma interface paginada no terminal (`Pág X de Y`) com busca textual por termo, filtro por Área do Conhecimento e uma chave para alternar instantaneamente entre as disciplinas dos Planos de Ensino e o Catálogo Geral. Só depois de resolver a localização da matéria é que entrei na engenharia de particionamento pedagógico.

Em vez de pedir para o modelo escrever tudo de uma vez, dividi o fluxo em duas fases estritas, apoiadas em duas novas tabelas relacionais no SQLite (`cadernos_aulas` e `caderno_aula_itens`). Na primeira fase, o prompt `PROMPT_DIVIDIR_AULAS` recebe a carga horária, a ementa e o conteúdo programático completo da disciplina e tem a obrigação de fatiar toda a matéria no número exato de aulas que eu defini, combinando o conteúdo com uma lista de dez técnicas de aprendizagem que estruturei no código:

```python
LISTA_TECNICAS_APRENDIZAGEM = [
    "Storytelling & Narrativa Didática (Engajamento através de estudos de caso e cenários do mundo real)",
    "Copywriting & Microcopying (Títulos persuasivos, gatilhos de memorização, destaques e resumos sintéticos)",
    "Método Socrático (Diálogo reflexivo, perguntas investigativas e exame de premissas)",
    "Aprendizagem em Espiral - Bruner (Aprofundamento contínuo conectando conhecimentos prévios)",
    "Aprendizagem Baseada em Problemas - PBL (Problemas autênticos como ponto de partida)",
    "Aprendizagem Baseada em Projetos - ABP (Construção prática de soluções aplicadas)",
    "Taxonomia de Bloom (Níveis progressivos: lembrar, compreender, aplicar, analisar, criar)",
    "Aprendizagem por Competências (Articulação de Competências, Habilidades e Atitudes - CHA)",
    "Sala de Aula Invertida (Contato prévio e consolidação prática em aula)",
    "Gamificação & Desafios (Gatilhos de engajamento, progressão e verificação de aprendizagem)"
]
```

O modelo analisa a progressão dos tópicos e devolve um array JSON onde cada aula já nasce com número, título instrucional, lista de subtópicos atribuídos e a `metodologia_foco` mais adequada para aquele recorte.

Na segunda fase, cada aula é redigida individualmente pelo `PROMPT_ESCREVER_AULA_DIDATICA`, podendo usar apenas o conhecimento do modelo ou o grounding híbrido com busca vetorial RAG no meu acervo local de livros e artigos. Configurei as diretrizes de redação para exigir quatro elementos que mudam completamente a leitura do material:

1. **Abertura com Storytelling ou estudo de caso real**, situando o problema no mundo concreto antes de apresentar qualquer definição teórica ou fórmula.
2. **Intervenções pelo Método Socrático**, inserindo perguntas investigativas no meio das seções para desmontar premissas superficiais e conduzir o raciocínio passo a passo.
3. **Aprendizagem em Espiral de Bruner**, retomando conceitos das aulas anteriores em um nível maior de complexidade.
4. **Caixas de Microcopy (`INSIGHT CHAVE DE MEMORIZAÇÃO`)**, blocos curtos e diretos que sintetizam o conceito central da seção e que o exportador Word (`docx_utils.py`) transforma em caixas sombreadas com margens de 2 cm, capa própria e sumário navegável.

---

## Separando as águas entre planos de ensino acadêmicos e editais de concursos

Logo que comecei a gerar os primeiros cadernos na versão `2.3.0`, percebi uma mistura conceitual que me incomodava. Eu havia conectado o `caderno_aulas.py` tanto ao menu do Escritor Acadêmico (`escritor_academico.py`) quanto ao módulo de Material para Concursos Públicos (`material_concursos.py`), já que o formato de aulas numeradas funcionava muito bem nos dois mundos. O problema é que, no primeiro desenho, o cadastro de cadernos buscava sempre da mesma listagem de disciplinas, mesmo quando eu estava preparando aulas focadas em um edital da FGV ou do Cebraspe.

Na versão `2.4.0`, voltei ao esquema do banco e refatorei o fluxo de entrada para separar estritamente as duas origens de dados:

- **Quando entro pelo modo Acadêmico**, o sistema consulta apenas os Planos de Ensino e a base curricular universitária, orientando a redação para profundidade conceitual, debate bibliográfico e articulação de Competências, Habilidades e Atitudes (CHA).
- **Quando entro pelo modo Concursos Públicos**, o seletor ignora as disciplinas universitárias e busca diretamente as matérias, tópicos e subtópicos cadastrados na base de editais, vinculando o caderno às chaves `id_concurso` e `id_topico` no SQLite. Com isso, o prompt injeta automaticamente o perfil da banca organizadora, o cargo pretendido, a jurisprudência do STF e do STJ, os alertas de pegadinhas recorrentes e uma bateria de questões comentadas ao final de cada aula.

Também reformulei o painel visual de progresso no terminal. Antes, quando eu criava a estrutura de um caderno com 10 aulas mas só mandava escrever as três primeiras para testar o tom, a listagem não deixava claro o que estava pronto e o que era apenas esqueleto. Criei indicadores explícitos de estado para o caderno inteiro (`⏳ AULAS AINDA NÃO GERADAS`, `⏳ PARCIALMENTE GERADO` e `✔ TOTALMENTE GERADO`) e badges individuais por aula (`[✔ CONCLUÍDA]`, `[⏳ NÃO GERADA]` e `[✖ ERRO]`), exibindo a contagem de palavras de cada encontro e permitindo escolher se quero gerar todas as pendentes em lote ou redigir apenas uma aula específica.

---

## O problema de reescrever a Aula 3 e a chegada do controle de versão no SQLite

A maior dor de cabeça prática surgiu quando comecei a revisar as aulas prontas no editor Markdown de tela dividida (`editor_md.py`). Imagine que gerei um caderno de oito aulas sobre *Arquitetura de Sistemas Distribuídos*. As aulas 1 e 2 ficaram excelentes com foco em *Storytelling*, mas achei a Aula 3 teórica demais e quis refazê-la aplicando *Aprendizagem Baseada em Problemas (PBL)* e pedindo um exemplo prático de falha de consenso em banco de dados.

Na versão `2.3.0`, clicar em *"Regenerar Aula"* simplesmente sobrescrevia a coluna `conteudo_markdown` daquela aula no SQLite. Se a nova geração ficasse pior do que a primeira, ou se eu quisesse aproveitar uma explicação que estava na versão antiga, aquele texto já tinha desaparecido.

Para resolver isso de forma definitiva na `2.4.0`, implementei um sistema de controle de versão nativo por aula (`v1`, `v2`, `v3...`) diretamente na tabela `caderno_aula_itens`. Adicionei duas novas colunas na migração automática do banco: `versao` (inteiro iniciando em `1`) e `historico_versoes_json` (um array JSON persistido no SQLite).

```python
# Estrutura lógica de arquivamento em arquivar_e_incrementar_versao_aula()
registro_historico = {
    "versao": versao_atual,
    "conteudo_markdown": conteudo_atual,
    "metodologia_foco": metodologia_anterior,
    "instrucoes_extras": instrucoes_anteriores,
    "palavras": len(conteudo_atual.split()),
    "arquivado_em": datetime.now().isoformat()
}
```

Sempre que peço uma nova versão de uma aula já escrita, o módulo abre um formulário rápido onde posso manter ou trocar a metodologia pedagógica daquele encontro (por exemplo, trocar *Método Socrático* por *Estudo de Caso + PBL*) e digitar instruções extras de direcionamento para a IA. Antes de disparar a chamada ao Gemini, a função `arquivar_e_incrementar_versao_aula` empacota o texto atual da `v1` com seu timestamp, contagem de palavras e metodologia original dentro de `historico_versoes_json` e incrementa a aula ativa para `v2`.

Se eu quiser comparar as abordagens, abro o menu de histórico daquela aula no terminal, leio qualquer versão anterior no visualizador split-screen do `editor_md.py` e, com um comando (`restaurar_versao_historico_aula`), promovo a `v1` ou a `v2` de volta ao posto de versão principal sem perder nenhuma das tentativas no arquivo histórico.

---

## O bug da coluna em branco e o excesso de arquivos .zip na exportação

Duas correções aparentemente pequenas na `2.4.0` eliminaram atritos constantes que eu enfrentava no uso diário.

O primeiro era um bug silencioso na tabela do terminal Rich. Quando o Gemini dividia a disciplina em aulas no passo inicial, ele devolvia no JSON a chave `"metodologia_foco": "Storytelling + Método Socrático"`. Porém, ao persistir os itens no SQLite ou recarregar o dicionário da aula para desenhar a tabela no terminal, um desalinhamento no nome da chave fazia com que a coluna **Técnica / Metodologia** aparecesse completamente em branco na listagem, embora o dado existisse na resposta bruta. Corrigi o mapeamento de `metodologia_foco` na camada de persistência e nos seletores de aula, garantindo que a técnica atribuída apareça tanto na tabela do terminal quanto na ficha técnica do documento exportado.

O segundo ajuste veio de uma irritação com os pacotes `.zip`. Na primeira versão do exportador, sempre que eu pedia para exportar aulas em Word (`.docx`), o sistema criava um arquivo `.zip` — mesmo quando eu acabava de escrever uma única aula avulsa e só queria abrir o `.docx` imediatamente no Word. Pior ainda: se eu exportasse um caderno de 10 aulas no qual apenas 4 estavam concluídas e 6 ainda estavam pendentes (`[⏳ NÃO GERADA]`), o pacote `.zip` incluía seis documentos `.docx` quase vazios, contendo apenas a capa e o cabeçalho das aulas não escritas.

Reescrevi a lógica de exportação com duas regras simples:
1. **Exportação direta de aula única**, que grava e entrega diretamente o arquivo `.docx` diagramado na pasta de exportação assim que termino de gerar ou revisar uma aula individual, sem embrulhar um único arquivo dentro de um `.zip`.
2. **Filtro estrito no pacote `.zip` do caderno completo**, que inspeciona o status e o tamanho de `conteudo_markdown` de cada item e ignora todas as aulas vazias ou pendentes, empacotando exclusivamente as aulas efetivamente concluídas junto com o documento consolidado.

---

## Conectando os cadernos de aulas e papers estrangeiros ao gerador de séries

Com dezenas de aulas densas armazenadas e versionadas no SQLite, percebi que tinha uma mina de conteúdo autoral parada dentro do banco. Até então, o meu módulo de Ghostwriter e Copywriting (`src/modules/copywriting.py`) gerava postagens avulsas para LinkedIn, Instagram e blogs a partir de artigos científicos ou livros do acervo. Mas faltavam duas pontes que implementei entre as versões `2.4.0` e `2.5.0`.

A primeira foi a criação do canal **Medium** dentro do `copywriting.py` e a conexão direta com os **Cadernos de Aulas**. Primeiro, habilitei a seleção de uma aula específica de qualquer caderno para servir como *grounding* teórico de um ensaio analítico de 800 a 2.500 palavras para o Medium. Em seguida, na versão `2.5.0`, dei o passo que eu realmente queria: o **Gerador de Séries de Postagens e Histórias Encadeadas**.

Quando seleciono um Caderno de Aulas com 6 aulas concluídas no modo de série, o `copywriting.py` percorre as aulas em ordem cronológica e transforma o caderno inteiro em uma temporada contínua de artigos ou postagens (`PARTE 1 de 6`, `PARTE 2 de 6`... até `PARTE 6 de 6`). O prompt de cada episódio recebe o contexto do episódio anterior e da aula seguinte, abrindo com uma recapitulação fluida do que foi discutido antes e encerrando cada texto com um gancho de retenção (*open loop*) que convida o leitor para a próxima parte da série. Ao final, a função `_exportar_postagens_lote_zip` empacota toda a temporada de uma vez em `.docx` (passando pelo renderizador editorial unificado `_gerar_arquivo_post_docx`) e em `.md`.

Na mesma versão `2.5.0`, adicionei mais uma modalidade ao `copywriting.py` que uso toda semana: o **Grounding com Papers e Obras Estrangeiras da Base de Conhecimento**. Boa parte dos livros e artigos que subo para o meu acervo RAG está em inglês e não tem tradução publicada no Brasil. Criei um fluxo dedicado em que seleciono um ou mais papers estrangeiros do acervo, e o sistema traduz os conceitos-chave, sintetiza as descobertas em português claro para o público brasileiro no Medium ou no LinkedIn e insere ao final a seção `### Referências e Obras Consultadas` formatada rigorosamente no padrão ABNT.

---

## Quadro de evolução entre as versões 2.3.0 e 2.5.0

| Versão | Módulo Principal | O que foi construído e corrigido |
|---|---|---|
| `v2.3.0` | `caderno_aulas.py` | Particionamento exato de disciplinas por IA, 10 técnicas pedagógicas (Storytelling, Método Socrático, Espiral de Bruner, Microcopy), tabelas `cadernos_aulas` e `caderno_aula_itens` e seletor paginado para 500+ disciplinas |
| `v2.4.0` | `caderno_aulas.py` | Controle de versão por aula (`v1`, `v2`, `v3...`) com `historico_versoes_json` e restauração no SQLite, separação entre origem Acadêmica e Concursos (`id_concurso`, `id_topico`), correção do campo `metodologia_foco` e exportação direta `.docx` sem `.zip` desnecessário |
| `v2.4.0` | `copywriting.py` | Novo canal Medium para artigos densos e uso de aulas individuais dos Cadernos de Aulas como lastro teórico das publicações |
| `v2.5.0` | `copywriting.py` | Gerador de Séries encadeadas (`PARTE X de Y`) a partir de todas as aulas concluídas de um caderno, tradução e síntese comentada de papers estrangeiros com referências ABNT e exportação em lote `.zip` com renderização DOCX unificada |

Com os módulos de ensino, pesquisa, concursos, leis comentadas, cadernos de aulas versionados e séries editoriais funcionando de ponta a ponta no terminal, o motor em Python do **Magnetares Knowledge** tinha chegado à maturidade que eu planejava. Foi aí que olhei para aquela tela de terminal cheia de menus numéricos e decidi encarar o maior desafio arquitetural do projeto até então: construir uma interface gráfica completa para Desktop e Web sem quebrar nem reescrever uma única linha do sistema de terminal. É essa virada para a versão `3.0.0` que eu conto no próximo artigo da série.
