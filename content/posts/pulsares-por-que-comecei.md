---
title: Por que comecei o Pulsares Research (e o que o Magnetares tem a ver com isso)
date: 2026-10-27
status: Publicado
series: Pulsares Research
seriesOrder: 1
project: 11
tags: [Pulsares Research, Local-First, Pesquisa Acadêmica, Magnetares Notes, Go, Wails]
readTime: 7 min
---

Existe um tipo de bagunça que só quem lê muito conhece. O PDF que está numa pasta, a anotação que ficou em outro aplicativo, o trecho que você sublinhou e nunca mais achou, a referência que você montou à mão na madrugada antes de uma entrega.

Cada coisa, sozinha, é pequena. Juntas, elas viram a razão pela qual escrever um trabalho acadêmico às vezes parece mais difícil do que pensar nele.

Foi dessa irritação que nasceu o **Pulsares Research**. Hoje, 27 de outubro, escrevi a primeira linha dele. Este é o primeiro post de uma série em que vou contar, dia a dia, como ele está sendo construído.

---

## A ideia, sem rodeio

O Pulsares Research é um aplicativo de desktop, pessoal e *local-first*, para organizar, ler e estudar ebooks, artigos, teses e dissertações. A proposta inicial era organizar minha própria rotina de estudos no curso de Engenharia Mecatrônica. O trecho que você lê vira destaque, nota, citação e relação entre ideias, sem nunca perder a fonte de onde veio. A ideia era maximiar a leitura, associando funcionalidades de outras ferramentas que tenho desenvolvido nos últimos dois anos.

Quando fui escrever as regras do projeto, quatro frases ficaram no topo:

1. **Os dados são seus.** Os arquivos ficam na pasta que você escolher. O catálogo e as notas ficam em um banco SQLite no seu computador.
2. **Funciona offline.** Nada essencial depende de conta, de rede ou de chave de API.
3. **Rastreabilidade.** Toda anotação sabe de onde veio: obra, página, trecho.
4. **IA é opcional.** Se você quiser, ela ajuda. Se não quiser, o aplicativo continua inteiro.

Pesquisa acadêmica é trabalho de anos. Eu não queria que o acesso aos meus próprios destaques dependesse de uma assinatura ou de uma empresa continuar existindo.

No roadmap, claro, está o fluxo de implementação para que usuários possam escolher sincronizar arquivos com algumas opções de serviços em nuvem. Mas a base será sempre local e soberana. Nuvem será para backup e sincronização entre dispositivos, além de restauração. Mas isso já é assunto para as próximas postagens.

---

## E o Magnetares?

Quem me acompanha sabe do **Magnetares Notes**, o meu caderno local-first. Foi nele que aprendi, no uso diário, o que importa em um aplicativo de anotações: velocidade, um editor confortável e nada que atrapalhe o pensamento.

O Pulsares Research nasce desse aprendizado, mas com outro foco. O Magnetares é um caderno geral. O Pulsares é um ambiente de **pesquisa**: tem leitor de PDF, citações em ABNT, fichamentos e, mais adiante, a escrita de teses, dissertações e artigos. Meu foco, como já comentei foi o uso pessoal na rotina de estudos.

Por isso existe uma ponte entre os dois. Algumas peças que já estavam maduras no Magnetares, como o editor, os stickers e as listas de tarefas, vão ser trazidas para o Pulsares adaptadas à interface dele. Sobre isso eu conto nos próximos posts. A ideia é aproveitar o que já funciona em vez de reescrever tudo do zero.

---

## Como estou trabalhando

Uma coisa que quero deixar clara desde o início: estou construindo o Pulsares Research em dupla com assistente de IA. Antes que alguém pense que isso é "trapaça" ou coisa do gênero, deixa eu explicar.

Eu trago a direção, o gosto e a experiência de quem estuda e escreve. O assistente escreve código comigo, propõe estruturas, procura erros, auxilia na implementação de funcionalidades e executa os testes. Eu reviso, discordo quando preciso e peço correções, e já pedi muitas. 

Mas um ponto crucial continua "humanizado". A arquitetura, com acertos e erros, a escolha da linguagem de programação e os frameworks foram escolha 100% minha. 

Não acho que isso diminua o projeto. Acho que é uma forma honesta de um desenvolvedor sozinho tocar um aplicativo deste tamanho. E é coerente com o que o Pulsares Research prega: a IA ajuda, mas a autoria e a responsabilidade continuam com quem pesquisa.

---

## O que saiu no primeiro dia

Dois marcos no mesmo dia: a base (versão 0.0.1) e a primeira versão realmente utilizável (0.1.0).

**A base**
- Aplicativo desktop com **Wails** (Go no núcleo, React e TypeScript na interface).
- Banco **SQLite** com migrações versionadas desde o começo.
- Importação de PDF, EPUB e HTML pela janela de arquivos do sistema, sem duplicar o arquivo original.
- Uma interface editorial: tipografia pensada para ler por horas, tema claro e escuro, ícones vetoriais.
- A marca, que mistura o feixe de rádio de um pulsar com as páginas de um fólio aberto.

**A primeira versão útil**
- Leitor de PDF nativo, que lê o arquivo aos pedaços para não pesar na memória, mesmo com documentos enormes.
- Destaques e notas ancorados na página e no trecho, salvos no banco.
- Botão **Citar**: seleciono um trecho e o Pulsares guarda a citação com a página e já a copia no padrão ABNT.
- Cofre criptografado para chaves de IA (AES-256-GCM), para o caso de eu querer usar um assistente.
- Nomes de arquivo padronizados, como `Silva_2024_Emissao_de_radio_em_pulsares.pdf`.

---

## Para onde isso vai

Tenho um mapa na cabeça: biblioteca, anotações, citações, conexões entre ideias, fichamentos e, no fim, um ambiente para escrever o trabalho acadêmico completo. Nos próximos posts mostro cada uma dessas etapas e o que deu errado no caminho.

Se você também vive entre PDFs e referências, fique por aqui.

---

## Quadro rápido

| Versão | Data | O que entrou |
|---|---|---|
| 0.0.1 | 27/10/2026 | Base do projeto, SQLite, importação de arquivos e interface editorial |
| 0.1.0 | 27/10/2026 | Leitor de PDF, anotações, citações ABNT, editor com KaTeX e cofre de IA |

*Acompanhe o desenvolvimento pelo [GitHub](https://github.com/vitorkrewer).*
