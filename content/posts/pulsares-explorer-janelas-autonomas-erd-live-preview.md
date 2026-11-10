---
title: "Pulsares Explorer, parte 5: janelas independentes, Mapa ER de bancos de dados, prévia web viva e o terminal que caminha junto"
date: 2026-11-10
status: Publicado
series: Pulsares Explorer
seriesOrder: 5
project: 12
tags: [Pulsares Explorer, SQLite, Modelagem de Dados, Editor, Terminal, Go, Wails, Engenharia de Software]
readTime: 9 min
---

Existe uma diferença enorme entre testar uma ferramenta com um arquivo de exemplo de dez linhas e colocá-la para trabalhar num projeto real.

No dia seguinte à versão `1.1.0`, abri no **Pulsares DB Studio** um banco SQLite de verdade, com `37 MB` e `52.973` registros na tabela de matrizes de disciplinas. Logo depois, cliquei com o botão direito na pasta de um projeto web (`dev-full-stack-pos`) e pedi para abrir no **Pulsares Studio Editor**.

Em menos de dez minutos, anotei no caderno uma lista de coisas que precisavam mudar. Algumas eram erros claros de código; outras eram lições de design que só aparecem quando você realmente usa o que construiu. Daí nasceu a **versão 1.1.1**.

---

## 1. Integrar não é prender tudo na mesma janela (e o caso dos ícones azuis)

A primeira coisa que me incomodou foi estrutural. Na `1.1.0`, quando eu abria o **DB Studio** ou o **Studio Editor**, eles abriam acoplados dentro da janela do explorador de arquivos, cobrindo a lista de pastas lá atrás.

Na teoria parecia prático. Na prática, estragava o fluxo de trabalho. Se eu estava olhando uma tabela do banco ou editando um arquivo e queria conferir outro diretório no explorador, ficava preso. Percebi na hora: **integrar ferramentas no mesmo ecossistema não significa amarrar todas na mesma janela**. O Pulsares Studio Editor e o Pulsares DB Studio precisavam ser janelas independentes de verdade, livres para ir para outro monitor ou alternar no `Alt+Tab`.

Separei a arquitetura para que cada um abrisse na sua própria janela nativa do sistema. Mas aí apareceu um segundo detalhe: olhei para a barra de tarefas do Windows e vi **três ícones de pasta azul idênticos** lado a lado. Para saber qual era o explorador, qual era o editor de código e qual era o banco de dados, eu tinha que passar o mouse um por um.

Mantive o mesmo fundo azul arredondado para preservar a identidade da família Pulsares, mas desenhei um símbolo próprio para cada ferramenta — a **pasta** para o Explorer, o sinal de **código (`</>`)** para o Studio Editor e o **cilindro de dados com engrenagem** para o DB Studio — e fiz cada janela se registrar de forma independente no Windows (`AppUserModelID` e mensagens `WM_SETICON`). Agora bato o olho na barra de tarefas e sei exatamente onde clicar.

---

## 2. Bancos grandes sem engasgo, Mapa de Entidade-Relacionamento e Criador SQLite

Com o DB Studio em janela própria, voltei àquele banco de `52.973` linhas. Quando ele abriu da primeira vez, o rodapé da paginação mostrou um estranho `1–NaN of undefined` e a abertura demorou mais do que deveria.

O defeito do `NaN` era um desencontro bobo de nomes entre o Go e o TypeScript na hora de ler o total de linhas. Já a demora acontecia porque o aplicativo tentava contar todas as linhas de todas as tabelas na força bruta assim que o arquivo abria. Configurei o SQLite para usar memória mapeada (`mmap` de `256 MB` e cache de `64 MB` em RAM) e leitura instantânea de metadados. O banco de `52 mil` linhas passou a abrir num piscar de olhos.

Com a velocidade resolvida, coloquei no DB Studio dois recursos que eu queria há muito tempo:

### O Mapa de Entidade-Relacionamento (Mapa ER)
Quando você pega um banco de dados com várias tabelas que se relacionam por chaves primárias (`PK`) e chaves estrangeiras (`FK`), olhar só para tabelas isoladas não conta a história toda.

Adicionei o botão **Mapa ER** na barra superior. Ele lê as relações do banco e monta um diagrama interativo no estilo *React Flow*: cada tabela vira um cartão que posso arrastar pela tela, com as chaves primárias marcadas em dourado, as estrangeiras em azul e linhas curvas ligando uma tabela à outra (`1 ──< N`). Se clico numa tabela, ele ilumina todas as conexões dela; se preciso colocar o diagrama num trabalho ou documentação, um clique exporta o desenho inteiro em `.svg` vetorial.

### O Criador de Banco SQLite (de CSV e JSON para `.db`)
Sabe quando você tem uma planilha `.csv` grande ou um arquivo `.json` e queria poder fazer consultas SQL nele sem precisar criar banco e tabela na mão? Criei um assistente que lê o arquivo, descobre sozinho o separador e o tipo de cada coluna (número inteiro, decimal, data, texto) e gera o banco `.db` pronto em segundos — com um **Modo Simples** de um clique e um **Modo Desenvolvedor** para quem quiser ajustar chaves primárias, índices e ver o comando `CREATE TABLE` ao vivo.

---

## 3. O projeto web no Studio Editor: pastas reais, prévia conectada e botão direito

A segunda metade das correções veio do uso do **Pulsares Studio Editor** naquela pasta do projeto web `dev-full-stack-pos`.

Quando cliquei com o botão direito na pasta para abrir no Studio, aconteceram duas coisas erradas:
1. Em vez de simplesmente abrir a pasta na lateral, o sistema se confundiu e criou uma aba vazia sem extensão com o nome da pasta (e às vezes abas `sem-titulo.md` que eu não tinha pedido).
2. Quando abri o `index.html` do projeto e cliquei em **Prévia**, a página apareceu toda desmontada, em preto e branco. O HTML estava lá, mas não conversava com o `style.css` nem com os arquivos `.js` que estavam na mesma pasta.

Corrigi os dois pela raiz:
- **Abrir pasta abre a pasta, ponto final:** agora o Studio reconhece quando o caminho recebido é um diretório, carrega todos os arquivos na coluna **`ARQUIVOS DO PROJETO`**, limpa qualquer aba fantasma e já deixa o `index.html` ou `README.md` pronto na tela.
- **Prévia Web Conectada em Tempo Real:** criei uma ponte local (`/ __project /`) que serve o CSS, o JavaScript e as imagens da pasta junto com o HTML. E fui além: se eu estiver editando o `style.css` em uma aba e voltar para o `index.html`, a prévia já mostra o estilo novo na hora, mesmo antes de salvar o arquivo.
- **Menu de contexto completo nos arquivos do projeto:** cliquei com o botão direito na lista de arquivos da lateral do Studio e senti falta do básico. Agora posso criar arquivos novos (com botões rápidos para `.html`, `.css`, `.js`, `.ts`, `.go`, `.py`, `.sql`, `.md`), criar pastas, duplicar, renomear com `F2` (atualizando as abas abertas sozinho), mover para outra pasta ou excluir direto por ali.

---

## 4. O terminal que caminha junto (`Follow-up`) e 10 idiomas

Para fechar a versão **1.1.1**, nasceu uma ideia simples enquanto eu navegava pelo terminal integrado: muitas vezes eu dou `cd` em duas ou três pastas pelo terminal e, quando olho para cima, o gerenciador de arquivos ficou parado lá na pasta antiga.

Coloquei na barra do terminal um botão chamado **Follow-up**. Por padrão ele vem desligado, para não mudar sua pasta sem você querer. Mas, quando você o ativa (o pequeno ponto ao lado dele acende), toda vez que você navega para outra pasta no terminal, a aba ativa do explorador lá em cima **caminha junto na mesma hora**.

Também adicionamos uma barra estreita de ícones (**Activity Bar**) com gaveta flutuante quando a barra lateral está recolhida, o modo portátil para levar o Pulsares no pendrive e ampliamos as traduções completas para **10 idiomas** (`pt-BR`, `en`, `es`, `de`, `fr`, `it`, `ja`, `zh-CN`, `tr` e `sv`).

Olhar para trás — desde aqueles primeiros rascunhos debatidos com o Gemini, o ChatGPT e o Claude e da escrita cuidadosa do `AGENTS.md` e do `roadmap.md` em repositório fechado — até ver o Explorer, o Studio Editor e o DB Studio trabalhando juntos hoje na minha tela dá aquela sensação boa de que valeu a pena construir com calma. E, como todo projeto que uso todos os dias, a história certamente continua.

---

## Quadro rápido

| Versão | Data | O que entrou |
|---|---|---|
| 1.1.1 | 10/11/2026 | Studio Editor e DB Studio em janelas independentes com ícones próprios na barra de tarefas, otimização para bancos SQLite grandes, Mapa ER interativo com exportação SVG, Criador SQLite (CSV/JSON), abertura limpa de pastas e Prévia Web conectada no Studio, menu de contexto de projeto, botão Follow-up no terminal, Activity Bar e 10 idiomas |

*Acompanhe o projeto e baixe as versões pelo [GitHub](https://github.com/vitorkrewer/pulsares-file-explorer).*
