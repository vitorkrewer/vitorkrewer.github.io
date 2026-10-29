---
title: "Pulsares, dia 2 (parte 1): etiquetas que se organizam e um grafo para enxergar as ideias"
date: 2026-10-28
status: Publicado
series: Pulsares Research
seriesOrder: 2
project: 11
tags: [Pulsares Research, Etiquetas, Grafo de Conhecimento, d3-force, Pesquisa Acadêmica]
readTime: 7 min
---

O segundo dia foi tão cheio que não cabe em um post só. Vou dividir em partes. Esta é a primeira, e fala de duas versões: a 0.2.0 e a 0.3.0.

A pergunta que me guiou foi: *depois que eu tenho cem anotações, como eu me encontro entre elas?*

---

## Etiquetas: simples até você ter muitas

No começo, etiqueta parece trivial. É só uma palavra. Só que, na prática, a bagunça aparece rápido: `fisica`, `Física`, `física`. Três etiquetas, a mesma ideia, nenhuma busca que as ache juntas.

Na versão **0.2.0** eu tratei isso como um problema de verdade:

- **Grupos com barra.** `metodologia/qualitativa` cria um nível dentro de `metodologia`. Mas depois percebi que digitar a barra era um incômodo, então o campo ganhou um seletor em chips, que mostra `Grupo › Etiqueta` e deixa escolher o grupo num menu.
- **Anti-duplicata.** Ao salvar, o Pulsares reconhece grafias equivalentes. `metafísica` vira `Filosofia › Metafísica` se esse for o único grupo com esse nome, e o campo me avisa o que foi unificado.
- **Painel de Etiquetas.** Uma tabela com todas as etiquetas, contagem por tipo, renomear, juntar duplicadas e excluir em lote. Nada disso apaga as anotações ou as obras. Só as etiquetas.
- **Filtros na Biblioteca** por tipo de produção, formato e etiqueta, com chips removíveis.
- **Busca mais tolerante.** Ignora acento, aceita vários termos em qualquer ordem (`minayo 2014` acha o que precisa) e agora também procura em ano, ISSN e título do livro.
- E o atalho `Ctrl+K` para focar a busca, porque eu abro o aplicativo para achar alguma coisa.

Decisões como "etiqueta é texto, com grupos por convenção" ficaram registradas em documentos de decisão (ADR) dentro do projeto. Daqui a seis meses eu não vou lembrar por quê, e quero que o repositório lembre por mim.

---

## O grafo: ver o que a tabela não mostra

Uma tabela mostra o que você tem. Um grafo mostra **como as coisas se ligam**.

A versão **0.3.0** trouxe o módulo **Conexões**, um mapa interativo parecido com o do Obsidian, que eu sempre achei bom para pensar. Cada obra, anotação, citação e etiqueta vira um nó. Cada ligação vira uma linha.

Escolhas que eu quero explicar:

- **`d3-force` em vez de uma biblioteca de grafos grande.** O motor de física pesa cerca de 15 KB, e o desenho é SVG puro. Eu não queria arrastar uma dependência enorme para desenhar bolinhas.
- **Formas e cores diferentes por tipo.** Círculos, losangos, quadrados e hexágonos. Assim o mapa não depende só de cor para ser lido, o que também ajuda quem enxerga cores de outro jeito.
- **As posições são minhas.** Se eu arrasto um nó, ele fica onde eu deixei, mesmo fechando e reabrindo o aplicativo. As coordenadas ficam no SQLite.
- **Modo Conectar.** Escolho duas notas e digito a relação: `relacionado`, `complementa`, `exemplo`, `dúvida` ou `contradiz`, com uma justificativa. É o que transforma "tenho notas" em "tenho um argumento".
- **Foco na vizinhança.** Para não me perder no emaranhado, posso olhar só um, dois ou três níveis ao redor de um nó.
- Teclado completo (`+`, `-`, `0`, `Tab`, `Enter`) e respeito a quem prefere menos movimento na tela.

Também tirei uma coisa: o seletor "Minha biblioteca" no topo da barra lateral. Era redundante, e uma interface limpa é feita de coisas que se tiram.

---

## O que aprendi nesta parte

Que organização sem relação é só arquivo. As etiquetas me ajudam a agrupar. O grafo me ajuda a **pensar**. No próximo post eu conto como as coleções entraram para completar esse quadro, e das correções que vieram logo depois.

---

## Quadro rápido

| Versão | Data | O que entrou |
|---|---|---|
| 0.2.0 | 28/10/2026 | Painel de Etiquetas, grupos, filtros e busca tolerante, `Ctrl+K` |
| 0.3.0 | 28/10/2026 | Módulo Conexões: grafo interativo com `d3-force`, relações tipadas, posições salvas |
