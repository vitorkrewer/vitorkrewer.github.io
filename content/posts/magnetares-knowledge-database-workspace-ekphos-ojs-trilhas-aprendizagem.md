---
title: "Um estúdio estilo Ekphos no terminal, artigos no padrão OJS SciELO e o gerador de trilhas de aprendizagem"
date: 2026-09-11
status: Publicado
series: Magnetares Knowledge
seriesOrder: 7
project: 13
tags: [Magnetares Knowledge, Python, Textual, OJS, SciELO, Trilhas de Aprendizagem, EAD]
readTime: 8 min
excerpt: "Como transformei a interface de terminal em uma IDE de escrita inspirada no Ekphos com árvore do acervo e modos Split e Zen, criei o exportador HTML5 para periódicos científicos OJS/SciELO e estruturei o gerador de trilhas de aprendizagem com player HTML."
---

Quando o **Magnetares Knowledge** chegou à primeira semana de setembro de 2026, o banco de dados SQLite já guardava um volume considerável de produção: artigos científicos gerados a partir de propostas com grounding vetorial, livros didáticos divididos em capítulos, fichamentos ABNT, eBooks comerciais de lançamento de cursos e planos de ensino com Competências, Habilidades e Atitudes (CHA).

O problema é que cada um desses módulos tinha nascido no seu próprio canto do menu de terminal. Se eu quisesse revisar o capítulo 3 de um livro didático enquanto consultava um fichamento e ajustava a introdução de um artigo científico, precisava sair de um submenu Rich, voltar ao menu principal, entrar em outro módulo, selecionar o ID no banco e abrir o editor Markdown isolado. A navegação estava engessada.

Ao mesmo tempo, duas necessidades práticas da rotina acadêmica e docente bateram à porta entre os dias 3 e 11 de setembro (versões `v1.8.7` a `v1.8.9`): publicar artigos prontos diretamente no formato HTML exigido por revistas científicas que rodam Open Journal Systems (OJS) e transformar planos de ensino estáticos em trilhas de aprendizagem completas, aula por aula, com player navegável para os alunos e caderno docente em Word para o professor.

---

## Exportando artigos científicos no padrão OJS, PKP e SciELO

Até a versão `v1.8.6`, o módulo de escrita científica exportava os artigos em Markdown e Word (`.docx`). Isso resolvia a submissão inicial na maioria dos congressos, mas deixava uma ponta solta para publicação em periódicos digitais. Quem já trabalhou na editoração de revistas que utilizam o **OJS (Open Journal Systems / PKP)** ou acompanhou o fluxo de indexação na **SciELO** e no **Google Scholar** sabe que o arquivo final de leitura — o chamado *HTML Galley* — precisa cumprir uma lista estrita de requisitos semânticos e de metadados no `<head>`.

Se o HTML publicado não tiver as meta tags corretas do padrão **Highwire Press** (`citation_title`, `citation_author`, `citation_publication_date`, `citation_keywords`) e do **Dublin Core** (`DC.Title`, `DC.Creator`, `DC.Description`, `DC.Rights`), os indexadores do Google Scholar simplesmente ignoram o artigo ou registram os autores de forma truncada.

No dia 3 de setembro (`v1.8.7`), escrevi o módulo `src/modules/artigo_html_exportador.py` para gerar esse HTML5 semântico direto do SQLite. Em vez de converter Markdown às pressas, desenhei um template autônomo que já sai pronto para hospedagem ou upload no OJS:

```html
<!-- Meta tags Highwire Press (Google Scholar) e Dublin Core geradas no cabeçalho -->
<meta name="citation_title" content="Arquiteturas Híbridas de Recuperação Vetorial no Ensino Superior">
<meta name="citation_author" content="Krewer, Vitor">
<meta name="citation_publication_date" content="2026/09/03">
<meta name="citation_language" content="pt-BR">
<meta name="DC.Title" content="Arquiteturas Híbridas de Recuperação Vetorial no Ensino Superior">
<meta name="DC.Creator.PersonalName" content="Vitor Krewer">
<meta name="DC.Rights" content="https://creativecommons.org/licenses/by/4.0/">
```

Durante os primeiros testes com artigos reais da minha base, percebi três pontos que faziam falta na leitura em tela e no papel:

1. **Caixas bilíngues de Resumo e Abstract** — separei visualmente o resumo em português e o *abstract* em inglês com palavras-chave destacadas em *badges* semânticos, evitando que o parser misturasse os dois blocos com a Introdução.
2. **Cópia de citação ABNT com um clique** — adicionei um quadro lateral "Como citar este artigo (ABNT NBR 6023)" com um botão que copia a referência completa formatada para a área de transferência via `navigator.clipboard`.
3. **Folha de estilo `@media print` em A4** — quando mandei imprimir o HTML em PDF pelo navegador na primeira versão, o sumário lateral flutuante (*sticky TOC*) saía por cima do texto e os botões de ação apareciam na folha. Ajustei o CSS para ocultar a navegação lateral na impressão, forçar margens editoriais A4, evitar quebras no meio de tabelas (`page-break-inside: avoid`) e exibir o selo Creative Commons CC-BY 4.0 no rodapé.

Aproveitei o mesmo commit para ajustar a exportação de Projetos de Pesquisa completos: passei a criar automaticamente uma subpasta higienizada em `snake_case` truncada em até 100 caracteres dentro do diretório de destino, mantendo o artigo, a proposta original e o pacote de fontes locais agrupados.

---

## O Workspace Studio no terminal inspirado no Ekphos

Com a exportação OJS pronta, voltei ao incômodo da fragmentação entre módulos. Sempre gostei da proposta do **Ekphos** — a ideia de ter um ambiente de escrita e pesquisa em texto puro direto no terminal, leve, rápido e focado no conteúdo. Pensei: por que não construir um estúdio unificado dentro do próprio **Magnetares Knowledge DB** usando **Textual**, onde todas as coleções do banco pudessem ser abertas, lidas e editadas lado a lado sem sair da mesma tela?

O desafio arquitetural apareceu nos primeiros quinze minutos. Cada coleção do projeto morava em tabelas diferentes do SQLite e tinha granularidades distintas:

- Um **Artigo Científico** guarda metadados em `artigos_cientificos` e o texto fatiado em `artigo_secoes`;
- Um **Livro / Material Acadêmico** divide os capítulos em `material_capitulos`;
- **Propostas de Pesquisa**, **Fichamentos ABNT**, **eBooks Comerciais** e **Postagens Sociais** possuem esquemas próprios em suas respectivas tabelas.

Se a TUI tentasse fazer queries SQL direto em seis tabelas diferentes, o código da interface viraria um espaguete. Para evitar isso, criei no dia 4 de setembro (`v1.8.8`) uma camada intermediária desacoplada chamada `src/modules/workspace_adapter.py`.

O papel do `workspace_adapter.py` é traduzir qualquer item do banco para um contrato único (`WorkspaceDocument`), permitindo abrir tanto a **obra integral consolidada** quanto uma **seção ou capítulo específico**, e gravar as alterações de volta no SQLite em uma transação atômica.

Por cima desse adaptador, construí o `src/modules/workspace_studio.py` com um layout de 3 colunas no terminal:

| Painel / Atalho | Função no Workspace Studio (`v1.8.8`) | Detalhe Técnico de Implementação |
|---|---|---|
| **Coluna Esquerda (`Tree` + `Outline`)** | Árvore hierárquica do acervo e sumário dinâmico (TOC) | Carrega todas as coleções do SQLite e extrai em tempo real os cabeçalhos `#`, `##` e `###`; clicar em um tópico posiciona o cursor na linha correspondente |
| **Coluna Central (`TextArea`)** | Editor Markdown com telemetria ao vivo | Barra inferior com contagem de palavras, caracteres, linhas, cabeçalhos e estimativa de tempo de leitura acadêmica |
| **Coluna Direita (`Markdown Preview`)** | Preview formatado com diagramas Mermaid | Renderização instantânea com rolagem proporcional sincronizada e conversão de blocos Mermaid em diagramas Unicode via `termaid` |
| **`Ctrl+P`** | Paleta de Busca Global | Modal instantâneo para filtrar qualquer obra do acervo por título, autor ou termo de pesquisa |
| **`Ctrl+T`** | Alternância de Modos de Visualização | Cicla entre o modo **Split** (3 colunas), modo **Zen** (foco 100% no editor amplo) e modo **Leitura** (preview amplo) |

A sincronização de rolagem entre o editor e o preview exigiu cuidado: quando o texto continha diagramas Mermaid convertidos pelo `termaid`, a altura das linhas mudava bastante entre os painéis. Resolvi calculando a razão percentual da linha ativa em relação ao total de linhas do documento e aplicando o deslocamento proporcional no container direito.

---

## Trilhas de Aprendizagem por Disciplina e o bug do `Select[str]` no Textual

Em 11 de setembro (`v1.8.9`), encarei uma lacuna pedagógica do sistema. O **Magnetares Knowledge** já gerava Planos de Ensino completos, com ementa, objetivos, bibliografia verificada e matriz CHA (Competências, Habilidades e Atitudes). Mas, quando uma disciplina vai para a sala de aula — no presencial ou na Educação a Distância (EAD) —, é preciso desdobrar aquele plano em uma **Trilha de Aprendizagem** sequencial: Aula 1, Aula 2, até a Aula 16 ou 20, cada uma com roteiro detalhado, atividades práticas, avaliação e objetos de aprendizagem (vídeos do YouTube, artigos, podcasts, simuladores em HTML).

Tentar gerar 16 aulas em uma única chamada para a API do Gemini resulta em texto raso ou estoura o limite de saída. Por isso, desenhei o módulo sobre três novas tabelas relacionais (`trilhas_aprendizagem`, `trilha_aulas` e `trilha_objetos_aprendizagem`) operando em **dois ciclos resilientes**:

1. **Ciclo 1 (Mapa da Trilha)** — o sistema lê a ementa, o conteúdo programático e a matriz CHA da disciplina e estrutura o cronograma completo de aulas em JSON, garantindo progressão pedagógica.
2. **Ciclo 2 (Detalhamento Aula a Aula com Retomada)** — o motor redige cada aula individualmente e salva no SQLite assim que termina. Se a conexão cair na aula 11, basta acionar **Retomar** e o sistema continua da aula 12.

Também adicionei um seletor de **Nível Acadêmico da Trilha** (`Graduação`, `Pós-Graduação Lato Sensu`, `Mestrado` e `Doutorado`), que recalibra nos prompts a profundidade teórica, o grau de autonomia exigido, o peso de papers primários e o formato avaliativo.

### As idas e vindas na TUI e o crash em runtime com `query_one(Select[str])`

Logo que terminei a tela de criação de trilhas e o modal de cadastro de Objetos de Aprendizagem, fui testar a gravação de um vídeo do YouTube na Aula 1 e tomei um `TypeError` em tempo de execução que derrubou o aplicativo.

O culpado era uma sutileza do Textual ao lidar com tipos genéricos parametrizados:

```python
# O código que causava TypeError em runtime no Textual:
nivel_select = self.query_one("#select-nivel-academico", Select[str])

# A correção aplicada em todo o módulo:
nivel_select = self.query_one("#select-nivel-academico", Select)
```

O método `query_one` do Textual usa o segundo argumento para checar a instância do widget em runtime (`isinstance`), e passar o tipo subscrito `Select[str]` quebrava a validação interna. Removi os genéricos parametrizados de todas as chamadas `query_one` e o fluxo estabilizou.

Outros dois problemas visuais apareceram no uso real e exigiram correção imediata antes de fechar a `v1.8.9`:

- **Vazamento de tags Rich no painel Markdown** — durante a montagem das aulas, eu injetava mensagens de status com marcações Rich (`[bold cyan]...[/bold cyan]`) em um widget `Markdown` do Textual, fazendo os colchetes aparecerem literalmente na tela. Converti todas as mensagens de status para Markdown nativo.
- **Barra de botões e rodapé fixo** — reduzi a barra de ações da TUI para uma única linha com gradação cromática *flat* (inclusive nos estados desabilitados) e substituí o rodapé nativo filtrado por uma faixa clássica fixa que mantém `Montar`, `Retomar`, `Editar`, `Recurso`, `Pacote`, `HTML`, `Word`, `Excluir`, `Atualizar` e `Sair` sempre visíveis.

---

## O Course Player HTML estilo Alura/Udemy e o Plano Docente em DOCX

Na primeira tentativa de exportar a Trilha de Aprendizagem em HTML, gerei uma página única onde todas as aulas ficavam empilhadas em acordeões. Ao abrir no navegador, parecia uma apostila comprida demais.

Reescrevi o exportador HTML para transformá-lo em um **Course Player interativo**, inspirado nas plataformas de cursos modernas:

- A publicação abre em uma **Visão Geral** com *hero* do curso, carga horária, nível acadêmico e barra de progresso;
- O currículo lateral esquerdo carrega dinamicamente o Plano de Ensino ou a aula selecionada na área principal, já com vídeos do YouTube e recursos incorporados (*embeds* responsivos);
- O progresso de conclusão de cada aula fica salvo no `localStorage` do navegador, e em telas móveis o menu lateral funciona como painel *off-canvas* com fechamento automático.

Para fechar a entrega ao professor e à coordenação, criei o exportador `src/modules/trilha_docx_exportador.py` e um seletor de pastas no Textual que gera o pacote completo: o **Course Player HTML** para os estudantes e o **Plano Docente em Word (`.docx`)** com plano da disciplina, mapa da trilha, roteiros, atividades, avaliações e objetos de aprendizagem.

Na semana seguinte, o sistema daria o salto para a versão `2.0.0`, entrando em um território onde o rigor com a letra da lei e a resiliência contra falhas da API seriam colocados à prova: os módulos de concursos públicos e leis comentadas artigo por artigo.
