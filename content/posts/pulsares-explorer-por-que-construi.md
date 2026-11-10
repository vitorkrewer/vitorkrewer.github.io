---
title: "Por que comecei o Pulsares Explorer: seis programas abertos, muitos rascunhos e um plano antes do código"
date: 2026-11-04
status: Publicado
series: Pulsares Explorer
seriesOrder: 1
project: 12
tags: [Pulsares Explorer, Go, Wails, React, TypeScript, SQLite, Local-First, Engenharia de Software]
readTime: 7 min
---

Olhei para a barra de tarefas do computador no meio de uma tarde de trabalho e contei seis janelas abertas para fazer uma única coisa.

De um lado estava o explorador de arquivos do sistema, travando para abrir uma pasta cheia de arquivos pequenos. Ao lado dele, um terminal solto. Mais à direita, um cliente SFTP só para puxar um arquivo de um servidor, um visualizador de banco SQLite para checar uma tabela, um editor pesado aberto só para mudar duas linhas de um `.json` e um programa avulso para comparar duas pastas.

Eu já tinha testado quase todo gerenciador de arquivos alternativo que existe. Alguns são ótimos em atalhos de teclado; outros têm painel duplo clássico; outros têm uma interface bonita. Mas nenhum resolvia essa fragmentação. Eu continuava precisando de meia dúzia de ferramentas abertas ao mesmo tempo para dar conta da minha rotina entre aulas, pesquisa e desenvolvimento.

Foi aí que me veio a pergunta que deu origem ao **Pulsares Explorer**: *e se essas ferramentas estivessem juntas no mesmo ecossistema, leves, locais e falando a mesma língua?*

---

## Antes da primeira linha de código: os cadernos, as IAs e o `AGENTS.md`

Seria bonito dizer que abri o editor e saí programando tudo de cabeça num fim de semana, mas não foi assim que aconteceu.

O Pulsares Explorer nasceu primeiro como uma pilha de rascunhos. Passei dias conversando e debatendo ideias com o **Gemini**, o **ChatGPT** e o **Claude**. Usei os três como parede de rebote: jogava um problema na mesa, questionava como evitar que a interface congelasse numa pasta com cem mil arquivos, pedia críticas sobre o desenho das abas, comparava o peso de diferentes arquiteturas e descartava o que parecia complicado demais.

Desses diálogos saiu uma lição que mudou meu jeito de construir software: **antes de escrever uma única linha da aplicação, escrevi toda a documentação de base**.

Sentamos e estruturamos primeiro o `AGENTS.md` (com as regras do projeto e o papel de cada módulo), o `docs/architecture.md`, o catálogo de funcionalidades em `docs/features.md` e um `docs/roadmap.md` completo, fatiado da versão `0.1.0` até a `1.0.0`.

Quando você programa em dupla com inteligência artificial sem um mapa, cada conversa puxa o código para um lado. Quando o repositório já nasce com um `AGENTS.md` rigoroso e um roadmap claro, a IA deixa de improvisar e passa a construir dentro dos trilhos que você escolheu. A visão de produto, o corte do que entra ou sai e o teste no uso real continuam sendo meus; a velocidade de execução é que muda de patamar.

---

## O repositório fechado e o teste silencioso

Tomei outra decisão logo no início: **o repositório começou privado, e todas as primeiras versões foram geradas e usadas apenas localmente, em modo `dev`**. O clássico `wails dev` rodava a todo momento, atualizando a cada alteração feita na aplicação e ajustes feitos no Antigravity. 

Eu não queria publicar um protótipo frágil só para dizer que lancei alguma coisa. Queria usar o explorador de verdade, todos os dias, nas minhas próprias pastas da faculdade e do trabalho, nos meus bancos de dados e nos meus projetos. Se algo quebrasse ou ficasse lento, quebrava na minha mão. Quando a primeira versão ao público finalmente saiu, ela já tinha passado por testes reais. 

Como utilizo nuvens do Google Drive for Education e OneDrive for Business como "HD" na minha máquina, em pastas do Windows, o explorador precisava lidar com arquivos sincronizados na nuvem, o que significa que às vezes o arquivo pode não estar disponível localmente. Para resolver isso, implementei um sistema de cache local que armazena os arquivos que estão sendo acessados no momento. Terabytes de arquivos exigiam buscas avançadas para auxiliar. Ideias iam e vinham e tudo ia para o papel, ou melhor, para os arquivos .md e documentos de especificação. 

Para guiar essa construção, deixei cinco regras no topo do `AGENTS.md`, em ordem de prioridade:

1. **Segurança dos dados acima de tudo.** Nenhuma operação pode perder arquivo em silêncio. Cópias passam por arquivo temporário (`.pulsares-part`), `fsync` no disco e só então ganham o nome final. Exclusão vai para a Lixeira nativa por padrão. E tudo fica registrado no SQLite para poder desfazer com `Ctrl+Z`.
2. **A tela nunca trava.** Leitura de pasta grande tem que vir aos poucos, em lotes (*streaming*), e se eu mudar de ideia e clicar em outra pasta no meio do caminho, a leitura anterior é cancelada na hora.
3. **Mouse e teclado em pé de igualdade.** Tudo o que faço com clique direito ou arrastando também precisa ter atalho para quando estou com as mãos no teclado.
4. **Privacidade total.** Tudo local, 100% offline, zero telemetria.
5. **Um sistema de arquivos virtual (`VFS`).** O código não fala direto com o disco em qualquer lugar; ele conversa com uma camada abstrata. Foi isso que permitiu, mais tarde, tratar um arquivo `.zip` ou um servidor SSH remoto exatamente como se fossem pastas comuns.

---

## Da 0.1.0 à 0.4.0: colocando o alicerce de pé

Com o plano traçado e a stack escolhida — **Go** no núcleo, **Wails v2** na ponte nativa, **React + TypeScript** na interface e **SQLite** para guardar o estado — as quatro primeiras versões locais saíram uma atrás da outra:

- **O esqueleto que não engasga (`0.1.0`):** listagem em streaming do Go para o React com virtualização de linhas. Abri pastas enormes que antes congelavam a janela e a rolagem continuou lisa. Entraram também a barra de endereço clicável, a ordenação natural (`arquivo2` antes de `arquivo10`) e os temas claro e escuro.
- **Abas de verdade e árvore preguiçosa (`0.2.0`):** cada aba ganhou vida própria, com histórico independente, fixação de aba e o `Ctrl+Shift+T` para reabrir aquela aba que a gente sempre fecha sem querer. Na lateral esquerda (`Ctrl+B`), a árvore de pastas carrega só o que está visível e reconhece *symlinks* para não cair em loops infinitos.
- **Fila de cópia segura e `Ctrl+Z` (`0.3.0`):** copiar e mover viraram trabalhos em segundo plano, com barra de progresso, velocidade em tempo real, botão de pausar e uma janela clara para resolver conflitos quando o arquivo já existe no destino.
- **Painel Duplo Commander e arrastar e soltar (`0.4.0`):** dividi a tela em dois painéis independentes. Seleciono na esquerda, aperto `F5` e ele copia para a pasta da direita; `F6` move. E, ao arrastar arquivos com o mouse, coloquei uma trava simples que evita aquela dor de cabeça clássica de soltar uma pasta dentro dela mesma sem perceber.

![Pulsares Explorer no tema claro exibindo a árvore de pastas, barra de endereços e a própria estrutura do projeto com o AGENTS.md e o CHANGELOG.md](../content/posts/images/shot-1-explorer-light.png)

O gerenciador básico já funcionava melhor do que o padrão do sistema. Mas eu ainda estava com o terminal e os outros programas abertos ao lado. Era hora de começar a trazê-los para dentro.

---

## Quadro rápido

| Versão | Etapa | O que entrou |
|---|---|---|
| Pré-0.1 | Planejamento | Rascunhos com Gemini, ChatGPT e Claude; criação do `AGENTS.md`, arquitetura, catálogo de recursos e `roadmap.md` |
| 0.1.0 | Dev Local | Base em Go + Wails + React, contrato `VFS`, listagem em streaming virtualizada, barra de endereço e temas |
| 0.2.0 | Dev Local | Múltiplas abas com sessão salva no SQLite, reabrir aba fechada (`Ctrl+Shift+T`) e árvore de pastas sob demanda |
| 0.3.0 | Dev Local | Fila de operações com escrita atômica (`.pulsares-part`), resolução de conflitos, Lixeira nativa e Desfazer (`Ctrl+Z`) |
| 0.4.0 | Dev Local | Painel duplo estilo Commander (`F5`/`F6`), Favoritos, Recentes, Unidades e arrastar e soltar com trava anti-loop |

*Acompanhe o projeto pelo [GitHub](https://github.com/vitorkrewer/pulsares-file-explorer).*
