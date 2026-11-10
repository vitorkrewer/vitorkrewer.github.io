---
title: "Pulsares Explorer, parte 3: do laboratório privado à versão 1.0, aposentando utilitários soltos pelo caminho"
date: 2026-11-06
status: Publicado
series: Pulsares Explorer
seriesOrder: 3
project: 12
tags: [Pulsares Explorer, Produtividade, Regex, Segurança, Go, SQLite, Release]
readTime: 7 min
---

Existe uma liberdade enorme em construir um software sem pressa de mostrar para ninguém.

Da versão `0.1.0` até a `0.10.0`, o repositório do **Pulsares Explorer** ficou trancado como privado. Todas as versões eram compiladas apenas na minha máquina e usadas como ferramenta de trabalho no meu próprio dia a dia. Não havia anúncio, página de download nem ansiedade. Só o hábito de abrir o programa toda manhã, perceber o que ainda me obrigava a recorrer a outros aplicativos e voltar para o código.

E foi justamente nessa reta final antes do primeiro lançamento público que percebi que ainda tinha três pequenos programas instalados no computador que não precisavam mais estar ali: um renomeador de arquivos em lote, um comparador de pastas e um descompactador de arquivos `.zip`.

---

## Renomear duzentos arquivos sem frio na barriga (`0.9.0`)

Quem lida com materiais de aula, capítulos numerados, lotes de imagens ou arquivos exportados de sistemas sabe o trabalho braçal que é padronizar nomes um por um.

Na versão **0.9.0**, fiz com que selecionar vários arquivos de uma vez e apertar `F2` abrisse uma janela de **Renomeação em Lote**. Nela posso trocar palavras, usar expressões regulares (Regex), colocar prefixo ou sufixo, padronizar maiúsculas e minúsculas e numerar tudo em sequência (`001`, `002`, `003`).

Mas o que realmente me deixa tranquilo ao usar essa tela é a coluna do **"Como vai ficar"**: antes de encostar em qualquer arquivo no disco, o Pulsares simula toda a operação e confere se dois arquivos acabariam com o mesmo nome. Se houver batida, ele avisa em vermelho e trava a operação antes do estrago. E, se depois de aplicar eu achar que o nome não ficou bom, um único `Ctrl+Z` devolve os duzentos arquivos exatamente para os nomes que tinham antes.

Na mesma leva entraram mais três ferramentas que eu vivia procurando fora:
- **Paleta de Comandos (`Ctrl+Shift+P`):** um campo rápido no topo onde digito o que quero fazer — mudar a visão, abrir uma ferramenta, trocar o tema — sem precisar caçar ícone na tela.
- **Comparador de Pastas:** coloco duas pastas lado a lado e vejo na hora o que só existe de um lado, o que mudou e o que está igual.
- **Calculadora de Hashes (`MD5`, `SHA-1` e `SHA-256`):** lê o arquivo uma única vez e já entrega os três códigos de integridade, com um espaço para colar o hash oficial de um download e confirmar se bateu.

![Menu de contexto reunindo prévia rápida, abertura no terminal integrado, compactação/extração, cálculo de hashes MD5/SHA-256 e acesso direto aos estúdios](../content/posts/images/shot-3-context-db.png)

---

## Entrar num `.zip` sem espalhar pasta pela área de trabalho (`0.10.0`)

Outra cena clássica: você baixa um `.zip` ou `.tar.gz` gigante só porque precisa ler um único arquivo lá dentro. Para ver esse arquivo, você descompacta tudo, suja a pasta de downloads e depois esquece de apagar.

Lembra daquela escolha lá do começo, nos rascunhos de arquitetura, de criar um Sistema de Arquivos Virtual (`VFS`) antes de sair programando? Na **0.10.0** ela se pagou por inteiro.

Tratei pacotes **`.zip`, `.tar`, `.tar.gz` e `.tgz`** como se fossem pastas comuns. Dou duplo clique no arquivo compactado e entro nele na mesma aba, com caminho no topo e tudo. Posso apertar `Espaço` para ler um documento lá dentro ou arrastar só os dois arquivos que me interessam para fora. Nos bastidores, coloquei uma barreira de segurança contra o chamado *Zip-Slip* — um truque antigo em que pacotes maliciosos tentam usar caminhos com `../../` para jogar arquivos fora da pasta de destino durante a extração.

---

## A hora de abrir a porta: a chegada da versão 1.0.0

Quando a `0.10.0` rodou redonda na minha máquina, olhei para o `roadmap.md` que eu tinha escrito lá atrás com a ajuda do Gemini, do ChatGPT e do Claude. Todos os itens planejados tinham saído do papel.

Por ter segurado o projeto em repositório privado e usado cada versão como cobaia no meu próprio trabalho, a **versão 1.0.0** não nasceu como um rascunho apressado. Ela já tinha cicatriz de uso real. Ainda assim, antes de fechar o pacote oficial, parei de criar funções novas e fiz uma faxina completa:
- Coloquei um backup automático no banco SQLite antes de qualquer atualização de versão;
- Passei o detector de concorrência do Go (`-race`) em todos os módulos;
- Testei pastas extremas com mais de cem mil arquivos para ter certeza de que nada engasgava.

A versão `1.0.0` estava pronta e madura. Só que, como acontece com toda ferramenta que a gente passa a usar o dia inteiro, quanto mais o Pulsares resolvia minha rotina, mais eu enxergava o passo seguinte: faltava conversar com meus servidores remotos, abrir meus projetos de código e enxergar meus bancos de dados por dentro.

---

## Quadro rápido

| Versão | Etapa | O que entrou |
|---|---|---|
| 0.9.0 | Dev Local | Paleta de Comandos (`Ctrl+Shift+P`), Renomeação em Lote com Regex e prévia de conflitos, Comparador de Pastas e Calculadora de Hashes |
| 0.10.0 | Dev Local | Navegação dentro de `.zip`, `.tar`, `.tar.gz` e `.tgz` sem descompactar, extração seletiva e proteção contra *Zip-Slip* |
| 1.0.0 | Release | Fechamento do primeiro ciclo com maturidade de uso real, backup automático nas migrações SQLite e pacotes para Windows, Linux e macOS |

*Acompanhe o projeto pelo [GitHub](https://github.com/vitorkrewer/pulsares-file-explorer).*
