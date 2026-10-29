---
title: "Pulsares, dia 2 (parte 2): coleções e as correções que ninguém comemora"
date: 2026-10-28
status: Publicado
series: Pulsares Research
seriesOrder: 3
project: 11
tags: [Pulsares Research, Coleções, UX, Qualidade, SQLite]
readTime: 6 min
---

Continuando o segundo dia. Depois das etiquetas e do grafo, faltava uma peça: um jeito de agrupar obras **por projeto de pesquisa**, sem mexer nos arquivos.

Eu pesquiso vários assuntos ao mesmo tempo. Uma obra pode servir a dois deles. Pasta no disco não resolve isso, porque um arquivo só mora em um lugar.

---

## Coleções: agrupar sem mover nada

A versão **0.4.0** trouxe as **Coleções Temáticas**. A regra de ouro, que virou decisão registrada no repositório, é que elas são **não destrutivas**.

Uma coleção é só uma lista de referências. Se eu apagar uma coleção, nenhuma obra, anotação, citação ou arquivo no disco é tocado. Tecnicamente é uma relação muitos-para-muitos no SQLite, com exclusão em cascata só do vínculo.

O que ela faz na prática:

- Aparece na barra lateral com cor e contagem de obras.
- Aceita **arrastar e soltar**: pego uma obra na Biblioteca e solto em cima da coleção.
- Tem tela própria, com três abas: **Obras**, **Anotações** (reúne todas as notas e citações das obras daquela coleção) e **Visão Geral**, com números, gráficos de distribuição por tipo e as etiquetas mais frequentes.
- Cada coleção ganhou ícone e cor, escolhidos entre uma paleta pequena, para eu reconhecer de relance.
- Ganhei também avisos curtos na tela (os *toasts*) quando salvo algo, e um estado "Salvando..." nos botões. Parece detalhe, mas é o que dá a certeza de que o clique funcionou.

---

## As correções (a parte menos glamourosa)

Logo depois de usar de verdade, apareceram dois defeitos que eu preciso admitir.

**Caixas gigantes nos modais.** A regra de estilo que eu tinha feito para os campos de texto também atingia as caixas de seleção. Resultado: quadrados vazios enormes nos diálogos de coleção. O erro estava em uma única linha do CSS. A correção foi fazer a regra ignorar `checkbox` e `radio`. Saiu na **0.4.1**, junto com o cabeçalho da coleção, cuja faixa colorida do ícone esticava na horizontal.

Na mesma versão consertei a barra de paginação, que flutuava no meio da tela quando a lista era curta. Ela agora fica sempre ancorada no rodapé, como nos outros módulos.

**Coleções dentro do grafo.** A **0.4.2** fechou o ciclo: as coleções agora também aparecem no grafo de Conexões, como nós de forma própria, ligados às obras que contêm. Um botão na barra de ferramentas liga e desliga essas coleções no mapa. Foi aqui que as coleções deixaram de ser "pastas" e viraram parte do raciocínio. Eu consigo ver que duas obras de assuntos diferentes aparecem juntas na mesma coleção.

Também arrumei a tela de visão geral, que estava sem formatação (texto solto onde deviam estar cartões), e corrigi anotações que mostravam as tags `<p>` literais no meio do texto.

---

## O que fica

Aprendi (de novo) que a maior parte do trabalho de um produto está depois de "funciona". Uma regra de CSS mal escrita, uma paginação no lugar errado, um texto que mostra HTML cru. Ninguém posta sobre isso, mas é o que separa um protótipo de algo que dá vontade de abrir todo dia.

---

## Quadro rápido

| Versão | Data | O que entrou |
|---|---|---|
| 0.4.0 | 28/10/2026 | Coleções temáticas não destrutivas, tela própria, arrastar e soltar, ícones e cores |
| 0.4.1 | 28/10/2026 | Correção de caixas de seleção, cabeçalho e paginação fixa no rodapé |
| 0.4.2 | 28/10/2026 | Coleções no grafo e correção da visão geral e dos cartões de anotação |

