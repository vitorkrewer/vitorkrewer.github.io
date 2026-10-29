---
title: "Pulsares, dia 2 (parte 5): uma IDE para escrever tese, dissertação e artigo"
date: 2026-10-28
status: Publicado
series: Pulsares Research
seriesOrder: 6
project: 11
tags: [Pulsares Research, ABNT, Projetos Acadêmicos, Editor, Escrita Científica]
readTime: 8 min
---

Tinha chegado a hora do passo maior. Com biblioteca, citações, conexões e fichamentos funcionando, faltava o lugar onde tudo isso vira texto: **o trabalho acadêmico em si**.

A ideia era algo parecido com uma IDE, só que para quem escreve tese, dissertação, monografia, TCC ou artigo científico.

---

## Projetos ou Pesquisas?

A primeira dúvida foi bem prosaica: como chamar o item novo no menu? Eu oscilava entre **Projetos** e **Pesquisas**. "Pesquisa" é mais amplo e cobre também a investigação em si. "Projeto" aponta para um **entregável**, um documento com começo, meio e fim.

Como o foco era escrever e formatar o trabalho, escolhi **Projetos**. Ele ficou logo abaixo de Fichamentos, e a trilha do menu passou a contar uma história: *Biblioteca → Anotações → Conexões → Citações → Fichamentos → Projetos*.

Como inspiração, olhei ferramentas de formatação estruturada que guiam o autor pelas partes do trabalho, e levei a ideia para o contexto do Pulsares: tudo local, ligado ao que eu já tenho guardado.

---

## O que a IDE tem

**Modelos por tipo de trabalho**, com as normas certas: Tese e Dissertação (NBR 14724), Monografia/TCC (NBR 14724), Artigo Científico (NBR 6022) e Projeto de Pesquisa (NBR 15287). Cada um nasce com capítulos sugeridos e uma meta de palavras.

**Três colunas**
- À esquerda, a **estrutura**: elementos pré-textuais (capa, folha de rosto, resumo e abstract), capítulos e subseções com numeração automática (`1`, `1.1`, `1.1.1`) e as referências. Cada seção traz uma orientação metodológica embutida.
- No centro, o **editor**, em três modos: editor normal, **folha A4** (margens de 3 cm e 2 cm, recuo de 1,25 cm, entrelinhas 1,5) e **prévia completa**, com capa, sumário gerado, capítulos e referências.
- À direita, o **painel de pesquisa**: Biblioteca, Citações, Fichamentos, Referências e Assistente de IA.

---

## A parte de que mais gosto: as referências se fazem sozinhas

Quem já escreveu um trabalho longo sabe como é fechar a lista de referências no último dia. Aqui, quando eu cito uma obra da Biblioteca, insiro uma citação direta ou importo a síntese de um fichamento, o Pulsares **inclui a obra nas Referências** (NBR 6023), em ordem alfabética e sem repetir. Posso também cadastrar à mão uma fonte que não está na Biblioteca.

O trabalho de formatar fica com a máquina. A decisão de o que citar continua sendo minha.

---

## Com IA ou sem IA

O Pulsares funciona 100% offline, sem chave. Se eu configurar uma chave de IA, o painel ganha um assistente por seção: ajuda a desenvolver um tópico, revisar estilo e coesão, sugerir transições e avaliar a consistência metodológica. Sempre como sugestão revisável.

---

## Imagens no disco, não no banco

Logo depois, pedi uma melhoria que parece técnica, mas muda a vida de quem escreve: **inserir imagens** no editor de Fichamentos e de Projetos.

Eu já tinha o armazenamento local, então a regra foi: as imagens ficam **como arquivos no disco**, e o banco guarda só o caminho e os metadados. O motivo é simples: um banco inchado de imagens pesa, e eu quero que o SQLite continue leve.

- Cada fichamento ganha uma pasta com nome curto, e cada projeto uma pasta por tipo e por nome (`Projetos/Dissertacoes/Impactos_da_IA/`).
- Posso inserir pelo botão **Figura**, colando da área de transferência ou arrastando o arquivo.
- A figura segue a NBR 14724: legenda em cima, **fonte** embaixo, e largura de 50%, 75% ou 100%. Um botão abre a pasta no explorador do sistema.

---

## E o "estilo" de novo

Como no fichamento, a primeira tela de Projetos saiu com a aparência desalinhada: o cabeçalho, os indicadores, os filtros e o formulário de criação fugiam do padrão do aplicativo. Mandei prints e pedi o acerto. Hoje a tela de Projetos se comporta como as outras, até no detalhe da paginação presa ao rodapé.

---

## Quadro rápido

| Versão | Data | O que entrou |
|---|---|---|
| 0.7.0 | 28/10/2026 | IDE de Projetos Acadêmicos em 3 colunas, modelos ABNT, folha A4, prévia completa, referências automáticas, IA opcional, figuras ABNT com arquivos no disco |

