---
title: "YouTube Crawler & IA: arquitetura Cloud-Native e análise de sentimentos em tempo real"
date: 2026-05-25
tags: [Python, FastAPI, LibSQL, Chrome CDP, Gemini API, Cloud-Native]
readTime: 12 min
---

# YouTube Crawler & IA: arquitetura Cloud-Native e análise de sentimentos em tempo real

Extrair dados do YouTube parece uma tarefa simples até você precisar de **escala, resiliência e inteligência**. Quando me deparei com o desafio de analisar a performance de centenas de vídeos educacionais e milhares de comentários, a primeira versão do meu sistema (baseada na API oficial e arquivos JSON locais) desmoronou rapidamente.

As cotas da API do YouTube são severas. Arquivos JSON geram dor de cabeça na concorrência de leitura/escrita. E o mais crítico: ler comentários não diz nada sobre *o que o público realmente está sentindo*.

Foi assim que decidi reconstruir o **YouTube Crawler Dashboard** do zero, transformando um script frágil em uma plataforma Cloud-Native alimentada por IA.

## A Arquitetura: do Arquivo Local à Nuvem

O gargalo inicial era o armazenamento. O sistema antigo salvava cada extração em arquivos `data/result_*.json`. Isso impossibilitava buscas rápidas, cruzamento de dados e concorrência (ex: rodar o crawler enquanto se acessava o painel).

A virada foi migrar para o **BunnyDB (LibSQL / SQLite na nuvem)**. Com o `DatabaseAdapter`, criei uma arquitetura de banco de dados *Database-First*:

1. **Estado Centralizado**: O painel e o crawler conversam exclusivamente via banco de dados.
2. **Resumption Nativo**: O crawler usa `UPSERT` e a flag `crawled_at`. Se o servidor cair, ao reiniciar, ele retoma exatamente do vídeo onde parou, sem duplicar dados.
3. **Escala**: Posso ter múltiplos painéis conectados no mesmo banco sem lock-in de arquivos.

## Bypassing Limites com Chrome CDP

A API oficial do YouTube não entrega tudo que precisamos e cobra caro (em tokens) pelo que entrega. A solução foi adotar uma abordagem de extração direta via **CDP (Chrome DevTools Protocol)** através da biblioteca `pychrome`.

Em vez de usar bibliotecas padrão como Selenium (que são facilmente detectadas e lentas), o sistema se acopla a uma instância real do Chrome rodando em modo debug. Ele intercepta as requisições de rede (`Network.getResponseBody`) das chamadas internas (YouTubei API) que o próprio YouTube faz para carregar o front-end.

O resultado? **Extração cirúrgica de métricas e comentários**, burlando bloqueios de bots tradicionais, de forma extremamente veloz.

## O Coração do Sistema: Pipeline de IA com Gemini

Não basta saber que um vídeo tem 500 comentários. É preciso saber:
- O tom geral da audiência é positivo ou há uma crise estourando?
- Quais são os principais temas discutidos?
- Algum aluno está relatando um problema urgente que precisa de suporte imediato?

Integrei o **Google Gemini 2.5 Flash** *diretamente no loop do crawler*. Quando o CDP termina de raspar os comentários de um vídeo, antes de salvar no banco, o payload é enviado para a IA.

O modelo não apenas traduz sentimentos, mas devolve um JSON estruturado classificando cada comentário em:
- **Sentimento**: `positivo`, `neutro`, `negativo`.
- **Categoria**: `Elogio`, `Dúvida`, `Reclamação`, etc.
- **Score de Urgência**: de 1 a 5 (onde 5 aciona um alerta no painel).
- **Tema Central**: O assunto principal do comentário.

## Orquestração e UI em Tempo Real

Para controlar essa engrenagem, construí um backend em **FastAPI**. A interface do usuário é um painel web que se comunica com o backend através de **SSE (Server-Sent Events)**.

Quando o usuário clica em "Iniciar Crawler", o FastAPI spawna um processo nativo CLI no sistema operacional, mas direciona o `stdout` linha por linha via stream (SSE) para o painel. O usuário vê o log do terminal fluindo na web em tempo real.

Mais do que isso: adotei a "regra de ouro" de segurança. Se o usuário der F5, fechar a aba ou a conexão cair, o backend detecta a desconexão e encerra preventivamente o processo filho (`process.terminate()`). Graças ao design do banco de dados, nenhum dado pela metade é salvo, e o usuário pode retomar de onde parou com um simples clique.

## Conclusão: O poder de pensar como Plataforma

O que começou como um script de "baixar comentários do YouTube" evoluiu para um motor de inteligência de audiência. 

Ao combinar **Extração CDP** para dados brutos, **LLMs (Gemini)** para dados não-estruturados, e **LibSQL** para persistência ágil, criei uma arquitetura robusta que resolve um problema real de marketing e suporte, de maneira autônoma. 

Este projeto consolidou uma crença que levo em todos os meus desenvolvimentos: ferramentas não resolvem problemas; *sistemas bem arquitetados resolvem problemas*.

---
*Este código faz parte do meu portfólio privado. Se quiser bater um papo sobre arquitetura, web scraping escalável ou IA aplicada, sinta-se à vontade para me chamar no LinkedIn.*
