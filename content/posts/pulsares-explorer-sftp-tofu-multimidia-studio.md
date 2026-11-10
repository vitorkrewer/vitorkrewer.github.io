---
title: "Pulsares Explorer, parte 4: servidores SSH sem programas extras, vídeos gigantes sem engasgo e o nascimento dos estúdios"
date: 2026-11-08
status: Publicado
series: Pulsares Explorer
seriesOrder: 4
project: 12
tags: [Pulsares Explorer, SFTP, SSH, Cibersegurança, SQLite, Go, Wails, Engenharia de Software]
readTime: 8 min
---

Com a versão `1.0.0` rodando firme, passei uma semana prestando atenção em todas as vezes que minha mão ia até o menu Iniciar para abrir outro programa.

Foram três momentos bem claros:

1. Quando precisei entrar num servidor Linux remoto para olhar os arquivos de um serviço em produção e tive que abrir um cliente SFTP separado;
2. Quando fui revisar uma vídeo-aula longa gravada em alta resolução e uma apresentação de slides `.pptx` da faculdade;
3. Quando estava dentro da pasta de um projeto e quis editar um código rápido ou olhar os dados de um arquivo `.db` (SQLite), mas tive que esperar uma IDE pesada e um gerenciador de banco de dados abrirem.

Aquela conversa inicial de integrar o fluxo em um só lugar ainda não tinha terminado. Abri novamente os documentos de arquitetura e o roadmap e comecei a desenhar a **versão 1.1.0**.

---

## Um servidor do outro lado do mundo tratado como uma pasta local (`SSH / SFTP`)

Para conectar em servidores remotos via SSH e SFTP, eu não queria fazer uma gambiarra que chama programas externos escondidos no sistema. Queria que a conexão fosse nativa em Go e fizesse parte daquele mesmo Sistema de Arquivos Virtual (`VFS`) que já cuidava do disco local e dos arquivos `.zip`.

Assim nasceu o módulo **SSH / SFTP** na barra lateral do Pulsares Explorer:
- Clico em nova conexão, escolho minha chave privada (ele já encontra sozinho as chaves da pasta `~/.ssh` ou conversa com o *SSH Agent* do sistema) e conecto.
- A pasta do servidor abre numa aba comum (`sftp://...`). Posso navegar pelos diretórios, abrir um arquivo de configuração para editar e salvar direto lá no servidor, ou arrastar uma pasta do meu computador para fazer upload em segundo plano.
- E, se precisar rodar comandos lá dentro, um botão ao lado da conexão abre o terminal integrado já logado no servidor via SSH.

### Segurança sem atalho: chave verificada e senha só na memória
Como trabalho também com ensino de cibersegurança, não admitia descuido nessa parte. No primeiro acesso a qualquer servidor, o Pulsares mostra a impressão digital criptográfica (`SHA-256`) da máquina remota e pergunta se confio nela — o modelo **TOFU (*Trust On First Use*)**. Se um dia alguém tentar interceptar a conexão ou a chave do servidor mudar, o acesso é bloqueado na hora com um alerta claro na tela.

Além disso, se eu optar por entrar com senha em vez de chave SSH, essa senha **nunca é gravada no banco de dados nem no disco**. Ela vive apenas na memória RAM enquanto o programa está aberto; fechou a janela, ela some.

---

## Vídeos de vários gigabytes e slides de aula direto na prévia

O segundo incômodo apareceu revisando vídeos grandes de aula. Tentar carregar um vídeo `.mp4` de `2 GB` inteiro pela memória do aplicativo antes de dar o *play* simplesmente não funciona.

Resolvi isso criando um pequeno servidor interno de mídia dentro do núcleo em Go que responde por partes (**HTTP 206 Partial Content**). Na prática, quando aperto `Espaço` num vídeo enorme, ele começa a tocar no mesmo instante e posso clicar lá no minuto `50:00` da barra de tempo que o Pulsares busca no disco apenas o pedaço daquele segundo, sem gastar memória à toa.

Aproveitei o embalo da rotina de professor e incluí também um leitor nativo para apresentações **PowerPoint (`.pptx`)** e **LibreOffice Impress (`.odp`)**: seleciono o arquivo de slides e já consigo passar slide por slide, ler os tópicos e conferir as anotações do apresentador sem sair da pasta.

---

## O nascimento do Pulsares Studio Editor e do Pulsares DB Studio

A maior novidade da `1.1.0`, porém, foi dar ao Pulsares duas ferramentas irmãs voltadas para quem constrói software:

- **Pulsares Studio Editor (`Ctrl+E`):** um editor de código e texto leve, com abas, numeração de linhas, minimapa, comparação de arquivos lado a lado (*Diff*), biblioteca de *snippets* e formatação automática para linguagens como `Go`, `TypeScript`, `JavaScript`, `JSON`, `SQL`, `HTML` e `Markdown`.
- **Pulsares DB Studio:** ao clicar em qualquer banco de dados **SQLite** (`.db`, `.sqlite`) ou **DuckDB**, em vez de ver uma tela dizendo que o arquivo é binário, o Pulsares abre um estúdio completo mostrando todas as tabelas, filtros de busca, estrutura `DDL`, console para rodar consultas SQL e exportação para CSV ou JSON.

![Menu de contexto de uma pasta de projeto com atalho direto para abrir no Pulsares Studio Editor ou no Terminal Integrado](../content/posts/images/shot-6-context-folder.jpg)

![Pulsares Studio Editor aberto com a árvore de arquivos do projeto na lateral, barra de ferramentas de código e minimapa](../content/posts/images/shot-7-studio.jpg)

![Pulsares DB Studio inspecionando um banco SQLite real com 46 tabelas, contagem de registros e paginação instantânea](../content/posts/images/shot-4-dbstudio.jpg)

Também ampliamos as traduções da interface para **7 idiomas** e criamos ícones próprios para dezenas de linguagens e ferramentas (`.git`, `node_modules`, Docker, bancos de dados) para deixar a leitura visual das pastas de código imediata.

A `1.1.0` parecia fechar tudo. Mas bastou eu abrir um banco de dados real com mais de `52 mil` linhas e a pasta de um projeto web completo na manhã seguinte para perceber um erro de arquitetura que precisava ser corrigido imediatamente. É o que conto na quinta e última parte.

---

## Quadro rápido

| Versão | Data | O que entrou |
|---|---|---|
| 1.1.0 | 08/11/2026 | Cliente nativo SSH/SFTP v3 com verificação TOFU (`SHA-256`) e senhas apenas em RAM, streaming de vídeo pesado (`HTTP 206`), leitor de slides `.pptx`/`.odp`, estreia do **Pulsares Studio Editor** e do **Pulsares DB Studio**, ícones para devs e 7 idiomas |

*Acompanhe o projeto pelo [GitHub](https://github.com/vitorkrewer/pulsares-file-explorer).*
