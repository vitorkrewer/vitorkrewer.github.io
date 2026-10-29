---
title: "Pulsares, dia 2 (parte 4): fichamento de verdade, com fórmulas, diagramas e ABNT"
date: 2026-10-28
status: Publicado
series: Pulsares Research
seriesOrder: 5
project: 11
tags: [Pulsares Research, Fichamento, Tiptap, KaTeX, Mermaid, ABNT, Magnetares Notes]
readTime: 8 min
---

Fichar uma obra é um dos trabalhos mais antigos da vida acadêmica, e um dos mais mal servidos por software. A maioria dos aplicativos oferece uma nota solta. Pesquisador de verdade precisa de outra coisa: um **registro estruturado**, ligado à fonte, que sirva depois como matéria-prima do texto.

Este foi o módulo que decidi atacar em seguida.

---

## O ponto de partida

Eu queria duas coisas. Primeiro, um **editor robusto**. Segundo, que o fichamento pudesse ser de uma obra da Biblioteca **ou avulso**, porque nem tudo que eu leio está em PDF. Muita coisa importante é livro de papel.

O editor eu já tinha. No Magnetares ele cobre fórmulas matemáticas, diagramas Mermaid, blocos de engenharia, destaques e mais. Pedi para trazê-lo para o Pulsares, com a interface e o estilo daqui.

Também decidi o nome da versão. O ciclo do fichamento ia ser a **0.6.0**, e pedi para corrigir o changelog de acordo. Gosto de que cada ciclo tenha um número que conte uma história.

---

## O que o módulo faz

**Dois tipos de fichamento**
- **Obra da Biblioteca:** a referência ABNT vem pronta e há um botão para abrir a obra no leitor.
- **Obra física / avulsa:** título, autoria, ano, editora e detalhes do acervo. Sem arquivo digital nenhum.

**Quatro modalidades**, cada uma com um propósito: temático e de conteúdo, de citações e conceitos, crítico-analítico e bibliográfico.

**Estrutura de 10 seções.** Ao criar, posso pedir que o fichamento já nasça com a estrutura acadêmica padronizada: identificação da obra, tese central, quadro de conceitos, as citações que já coletei daquela obra, comentário crítico e mapas de pesquisa em Mermaid. É um esqueleto para preencher, não uma resposta pronta.

**Painel de apoio ao lado do editor.** Mostra as citações e anotações da obra (ou de todo o acervo, para cruzar autores). Com um clique, insiro uma **citação curta** ou **longa**: a longa vira bloco recuado quando passa de três linhas, com `(SOBRENOME, ANO, p. X)`, conforme a NBR 10520.

**O editor** tem fórmulas com KaTeX (inclusive química), diagramas Mermaid com zoom, blocos de teorema e experimento, cálculos dentro do texto e blocos retráteis para estudo ativo.

**IA, só se eu quiser.** Se há chave configurada, o assistente gera o fichamento ou só algumas seções, usando as citações e os dados que já estão no Pulsares. Sem chave, tudo continua funcionando. E o resultado vem como rascunho para eu revisar, nunca como verdade.

**Exportação** para Word ABNT (`.docx`), Markdown e uma página HTML com as fórmulas e os diagramas.

---

## O que precisou de uma segunda rodada

A primeira versão funcionava, mas **a aparência estava errada**. Os estilos não tinham sido aplicados de forma consistente com o resto do aplicativo: botões sem acabamento, campos sem estilo, a barra de ferramentas com os rótulos sobrepostos. Mandei capturas de tela, e fizemos um ciclo inteiro só de correção.

Foi também nesse ciclo que lembrei o assistente de uma regra do projeto: o Pulsares é **independente**. Nenhuma tela deve mencionar projetos de onde eu tirei ideias. O usuário do Pulsares não tem nada a ver com meus outros projetos.

Depois ainda pedi dois ajustes de usabilidade: juntar as opções de exportação em **um único botão com menu**, e oferecer a lista de fichamentos em **cartões ou em tabela**, a escolha do usuário. Hoje, ao abrir a tela de fichamentos, ela já se parece com o resto do aplicativo.

---

## Reflexão

Trazer um editor de um projeto para outro me ensinou algo sobre reaproveitamento: o código é a parte fácil. A parte difícil é **adaptar o jeito de pensar** da interface. Fichar à mão tem uma lógica: você lê, marca, anota, relaciona. Ela só funciona se o software acompanhar esse ritmo.

No próximo post eu subo um nível: do fichamento para o **trabalho completo**.

---

## Quadro rápido

| Versão | Data | O que entrou |
|---|---|---|
| 0.6.0 | 28/10/2026 | Fichamentos acadêmicos (digital e avulso), editor científico (KaTeX, Mermaid, blocos), citações ABNT inseridas com um clique, assistente de IA opcional, exportação Word/Markdown/HTML |
