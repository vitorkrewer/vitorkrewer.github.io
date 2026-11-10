---
title: "Pulsares Explorer, parte 2: o terminal morando embaixo da pasta, quatro jeitos de enxergar arquivos e busca sem espera"
date: 2026-11-05
status: Publicado
series: Pulsares Explorer
seriesOrder: 2
project: 12
tags: [Pulsares Explorer, Terminal, ConPTY, Xterm.js, Busca, Go, Wails, Engenharia de Software]
readTime: 7 min
---

Tem um movimento que todo desenvolvedor faz dezenas de vezes por dia sem perceber: você navega até uma pasta no explorador, copia o caminho lá no topo, dá `Alt+Tab` para o terminal, digita `cd `, cola o caminho e aperta `Enter`.

Cinco minutos depois, você muda de pasta no explorador e faz tudo de novo.

Quando o alicerce do **Pulsares Explorer** ficou pronto na versão `0.4.0` (ainda rodando fechado no meu ambiente de desenvolvimento), a primeira janela externa que decidi aposentar foi justamente o terminal avulso.

---

## O terminal no andar debaixo (`` Ctrl+` ``)

Quem usa o VS Code conhece o conforto de apertar `` Ctrl+` `` e ver o terminal subir na parte debaixo da tela. Eu queria exatamente essa sensação dentro do gerenciador de arquivos, mas já nascendo na pasta da aba que estou olhando.

Colocar um terminal de verdade ali dentro (`0.5.0`) deu um bom trabalho nos bastidores. Não dava para ser um campo de texto fingindo que roda comandos; precisava ser um pseudoterminal nativo do sistema operacional (`ConPTY` no Windows, `PTY` no Linux e no macOS) conversando com o `xterm.js` na interface.

O aplicativo detecta sozinho o que está instalado na máquina — PowerShell 7, Windows PowerShell, CMD, Git Bash, WSL, Bash ou Zsh — e permite abrir várias sessões em abas ou dividir o terminal lado a lado. E coloquei um detalhe pequeno que economiza muita digitação: se eu arrastar qualquer arquivo da lista e soltar dentro do terminal, ele já escreve o caminho com as aspas certas daquele shell.

### O susto do comando que fala demais
Logo nos primeiros testes locais, rodei um comando que despejou milhares de linhas de texto de uma vez só. Quando cada linha tentava atravessar a ponte entre o Go e a interface, a tela engasgava.

A solução veio das conversas de arquitetura: em vez de mandar linha por linha, o núcleo em Go junta a saída em pequenos pacotes a cada `8 milissegundos` e espera a interface avisar que já desenhou antes de mandar o próximo lote. Depois disso, pude rodar qualquer comando pesado no terminal enquanto continuava navegando pelas pastas no andar de cima como se nada estivesse acontecendo.

---

## Quatro jeitos de olhar para a mesma pasta e a tecla `Espaço`

Nem toda pasta pede a mesma leitura. Quando estou mexendo em código, quero uma tabela detalhada. Quando procuro a capa de um livro ou uma imagem para uma aula, uma tabela de nomes não me ajuda em nada.

Na versão **0.6.0**, cada aba passou a escolher entre quatro visões:
- **Detalhes**, com colunas que ordenam e redimensionam;
- **Lista compacta**, para caber o máximo de itens na tela;
- **Grade de miniaturas**, que gera as prévias das imagens em segundo plano e guarda num cache em disco para abrir instantaneamente na próxima visita;
- **Colunas (estilo Miller)**, igual ao Finder do macOS, ótima para atravessar pastas profundas só com as setas do teclado.

Junto com elas entrou o recurso que mais me poupa cliques no dia a dia: selecionar um arquivo e apertar a barra de **`Espaço`**.

Uma janela limpa se abre na hora mostrando a imagem com zoom, o PDF, o texto em Markdown já formatado ou o código-fonte colorido — sem precisar esperar um programa externo pesado carregar só para eu descobrir que abri o arquivo errado.

---

## Achar uma agulha sem congelar o palheiro (`0.7.0` e `0.8.0`)

A busca no explorador padrão do sistema sempre foi uma loteria: às vezes demora uma eternidade, às vezes não acha um trecho que você tem certeza de que está escrito dentro de um arquivo.

Dividi esse problema em dois atalhos:
- **`Ctrl+F` (na pasta atual):** filtra na mesma hora o que já está na tela, sem nem perguntar nada ao disco.
- **`Ctrl+Shift+S` (busca profunda):** abre uma gaveta lateral que varre subpastas inteiras procurando por nome, expressão regular (Regex), tamanho, data ou **palavras dentro do conteúdo dos arquivos**, mostrando a linha exata onde o texto apareceu. Os resultados vão pingando na tela conforme o Go encontra, e posso cancelar a qualquer momento.

Para fechar essa etapa (`0.8.0`), faltava fazer o explorador perceber o mundo ao redor. Quando um script no terminal cria arquivos novos ou o Git troca de *branch*, um vigia silencioso (`fsnotify`) percebe a mudança na pasta, espera uma fração de segundo para não piscar a tela à toa e atualiza a lista sozinho, sem perder o arquivo que eu estava selecionando nem o lugar da barra de rolagem.

O explorador já tinha ganhado olhos e voz com o terminal e a prévia. Na sequência, conto como fechei a primeira fase do roadmap rumo à versão `1.0.0`.

---

## Quadro rápido

| Versão | Etapa | O que entrou |
|---|---|---|
| 0.5.0 | Dev Local | Terminal integrado multi-shell (`ConPTY`/`PTY`), divisão de painel, arrastar arquivo com aspas automáticas e controle de fluxo em lotes |
| 0.6.0 | Dev Local | 4 modos de visão (Detalhes, Lista, Grade com cache de miniaturas e Colunas Miller), painel de prévia e *Quick Look* na tecla `Espaço` |
| 0.7.0 | Dev Local | Filtro instantâneo (`Ctrl+F`), busca recursiva em streaming (`Ctrl+Shift+S`) por nome, Regex e conteúdo de texto, mais índice SQLite opcional |
| 0.8.0 | Dev Local | Atualização automática da pasta em tempo real (`fsnotify`), propriedades recursivas com hash `SHA-256`, *"Abrir com…"* e ejeção de pendrives |

*Acompanhe o projeto pelo [GitHub](https://github.com/vitorkrewer/pulsares-file-explorer).*
