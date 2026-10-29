---
title: "Pulsares, dia 3: importar manuscritos .docx, .odt e .doc sem perder a estrutura"
date: 2026-10-29
status: Publicado
series: Pulsares Research
seriesOrder: 7
project: 11
tags: [Pulsares Research, Importador, DOCX, ABNT, Engenharia de Software, Go]
readTime: 7 min
---

Depois da IDE de Projetos, apareceu a pergunta que quem usa qualquer ferramenta de escrita acaba fazendo: *e o texto que eu já escrevi?*

Ninguém começa uma dissertação do zero dentro de um aplicativo novo. Quase todo mundo tem um manuscrito em Word ou LibreOffice, com capítulos, resumo e referências. Se o Pulsares não souber ler isso, a IDE de Projetos fica bonita, mas inalcançável para quem já está no meio do caminho.

Hoje, 29 de outubro, o dia foi do **Importador Estrutural** (versão 0.7.1).

---

## O que ele faz

Ao lado de **Novo Projeto**, passa a existir **Importar**. Posso escolher o formato (`.docx`, `.odt` ou o antigo `.doc`) e o tipo de trabalho de destino: tese, dissertação, monografia/TCC, artigo ou projeto de pesquisa.

Em vez de jogar tudo em um campo de texto, o importador tenta **entender a estrutura**:

- reconhece títulos pelos estilos do documento (`Heading 1..3`, níveis de tópicos e títulos do OpenDocument);
- lê a numeração `1`, `1.1`, `1.1.1`;
- identifica elementos pré-textuais (título, subtítulo, autor, orientador, instituição, natureza do trabalho, resumo e palavras-chave, abstract e keywords);
- localiza as referências ao final.

Depois preenche os campos do modelo escolhido: capa, folha de rosto, resumos, capítulos numerados (com as orientações metodológicas de cada seção) e lista de referências.

---

## A parte honesta: nem tudo é detectado

Documentos reais são bagunçados. Muita gente formata um título só com negrito e tamanho maior, sem usar estilo nenhum. Nesse caso nenhuma heurística acerta sempre.

Então, em vez de prometer o impossível, fiz um **vinculador manual**, no espírito dos editores de marcadores de PDF e EPUB. A tela mostra todos os parágrafos do documento ao lado da árvore resultante. Se algo não foi detectado, eu promovo o parágrafo a capítulo ou seção com um clique (`H1`, `H2`, `H3`). Se algo foi detectado errado, eu desfaço também com um clique.

A máquina faz o grosso. Eu corrijo o resto.

---

## Um processo que se explica

Importar um arquivo grande pode demorar, e interface parada gera dúvida. Por isso a área central vira uma tela de processamento: indicador girando, dados do arquivo, uma lista de quatro etapas e um console de diagnóstico que mostra o que está acontecendo. Se falhar, o erro aparece detalhado, com opção de tentar de novo.

No bastidor, a extração do pacote ZIP dos `.docx` e `.odt` passa pelo backend em Go, e os logs do terminal registram as etapas **sem gravar o conteúdo pessoal do documento**. Essa é uma das regras do projeto: nunca registrar conteúdo de livros ou notas nos logs.

---

## Os bugs do dia

Importar era a novidade, mas boa parte do dia foi caça a defeitos que apareceram no uso da IDE:

- **Botões sobrepostos.** Os botões de modo (Editor, Folha A4, Prévia ABNT) herdavam, sem querer, uma classe genérica que forçava 30 px e embolava ícone e texto. Criei uma classe própria.
- **Travamento ao voltar para a lista.** Ao sair de um projeto, o aplicativo recarregava e processava todos os projetos de uma vez, e às vezes travava (ou reabria a IDE sozinho). A solução veio em três frentes: cancelar o salvamento automático pendente ao sair, tirar a cópia em lote do catálogo de projetos do armazenamento do navegador, e calcular os contadores da tabela sem clonar listas inteiras a cada renderização.
- **Ergonomia.** O botão de recolher a árvore de capítulos mudou para o cabeçalho dos elementos pré-textuais, onde faz mais sentido, e a lista de projetos agora abre em **tabela** por padrão (a escolha por cartões continua sendo lembrada).

---

## O que vem agora

Três itens estão no planejamento do próximo ciclo:

1. Tabelas ABNT no editor, com numeração automática e nota de fonte.
2. Exportação direta em PDF vetorial, com as margens da norma.
3. Modelos personalizados de pesquisa criados pelo próprio usuário.

Em três dias saí de uma pasta vazia para um aplicativo que lê PDF, cruza ideias, fichas livros e escreve trabalhos inteiros. Ainda falta muito, e é justamente isso que torna o processo divertido. Sigo contando por aqui.

---

## Quadro rápido

| Versão | Data | O que entrou |
|---|---|---|
| 0.7.1 | 29/10/2026 | Importador estrutural (`.docx`, `.odt`, `.doc`), vinculador manual de títulos, tela de processamento, correções de botões e travamento, tabela como visualização padrão |
