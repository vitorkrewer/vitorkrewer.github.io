---
title: "Crawler Semantic Auditor: como construí um motor de inteligência competitiva para sites de concursos"
date: 2026-05-13
tags: [Python, FalkorDB, Playwright, Gemini API, Web Crawling, Análise Competitiva]
readTime: 14 min
---

# Crawler Semantic Auditor: como construí um motor de inteligência competitiva para sites de concursos e Instituições de Ensino Superior

Existe uma distância enorme entre *ter um site* e *entender o que ele representa competitivamente*. Trabalhando em projetos em uma empresa do setor educacional, convivi com perguntas que ninguém conseguia responder com precisão: quantos cursos um concorrente tem? Nossa plataforma cobra mais ou menos que a concorrência? Quais páginas dos concorrentes têm estrutura de conversão melhor?

A resposta era sempre "dá trabalho descobrir". O Crawler Semantic Auditor nasceu para mudar isso.

## O Problema

O mercado de preparatórios para concursos públicos é denso, competitivo e movimenta bilhões por ano. Plataformas do setor publicam centenas, às vezes milhares, de páginas com cursos, apostilas, preços e conteúdo de blog.

Mapear tudo isso manualmente é inviável. As ferramentas existentes (Semrush, Ahrefs) são caras e superficiais: te dizem palavras-chave, não te mostram a estrutura de produto do concorrente.

A proposta do Crawler Semantic Auditor é diferente: **crawlar, extrair, classificar e grafar** toda a estrutura de um site — e comparar múltiplos sites dentro de um grafo de conhecimento.

## Arquitetura em 4 Camadas

O sistema funciona em quatro camadas que se alimentam sequencialmente:

```
 ┌─────────────────────┐
 │  1. CRAWLER (httpx  │   Playwright para JS-heavy
 │     + Playwright)   │   httpx para volume
 └──────────┬──────────┘
            │
 ┌──────────▼──────────┐
 │  2. SQLITE          │   crawled_urls, seo_analysis,
 │  (dados brutos)     │   security_analysis, ads_analysis,
 └──────────┬──────────┘   page_content, robots_txt, sitemaps
            │
 ┌──────────▼──────────┐
 │  3. AI PIPELINE     │   content_extractor → ai_classifier
 │  (Gemini Flash)     │   (classifica tipos, limpa preços)
 └──────────┬──────────┘
            │
 ┌──────────▼──────────┐
 │  4. FALKORDB        │   Grafo de nós: Site, Page, Product,
 │  (grafo semântico)  │   Price, Tracking — comparação multi-site
 └─────────────────────┘
```

### Camada 1 — Crawler Híbrido

O crawler usa duas estratégias dependendo da complexidade da página:

- **httpx + BeautifulSoup**: para volume. Rápido, eficiente, processa centenas de páginas por minuto.
- **Playwright (Chromium headless)**: para páginas com JavaScript pesado. Usa CDP (Chrome DevTools Protocol) para interceptar requests de rede em tempo real — fundamental para detectar trackers como GA4, Meta Pixel e TikTok que são carregados via GTM após o render.

Um aprendizado importante: `wait_until="networkidle"` trava em sites modernos com polling contínuo (ads, chat, analytics). A solução foi uma cascata: tenta `domcontentloaded` → aguarda `networkidle` por no máximo 3s → aceita o que tiver. Isso reduziu o timeout de 30s para casos médios de ~8s.

### Camada 2 — SQLite como Buffer

Tudo que o crawler coleta vai para um banco SQLite local antes de qualquer análise. As tabelas principais:

| Tabela | O que armazena |
|---|---|
| `crawled_urls` | URL, status, profundidade, SEO on-page |
| `seo_analysis` | Score, issues, tags OG, schema.org |
| `security_analysis` | Headers HTTP, HSTS, CSP, SSL |
| `ads_analysis` | GTM, GA4, Meta Pixel, Clarity, TikTok |
| `page_content` | Tipo da página, texto, produtos, preços |
| `robots_txt` | Caminhos bloqueados, crawl-delay, sitemaps |
| `sitemaps` | URLs declaradas por sitemap |

O SQLite como buffer é uma decisão deliberada: permite reprocessamento sem recrawlar, scripts de backfill para sessões antigas, e análise local com qualquer ferramenta SQL.

### Camada 3 — Pipeline de IA

Essa é a camada que diferencia o Crawler Semantic Auditor de um simples crawler. Após a extração, o `content_extractor.py` classifica cada página por tipo (`course`, `product`, `blog`, `home`, `other`) e extrai preços com regex.

O problema: **regex é ingênua**. Um artigo de blog sobre "concurso da Polícia Civil com salário de R$ 5.488,70" extrai esse valor como preço de produto. Um sidebar com "Assine por R$ 26/mês" vaza para todas as páginas do blog.

A solução foi o `ai_classifier.py` — um reclassificador com Gemini 2.5 Flash que recebe URL, tipo atual, preços detectados e texto da página, e retorna:

```json
{
  "page_type": "blog",
  "has_real_price": false,
  "real_prices": [],
  "contaminated_prices": ["R$ 26", "R$ 5.488,70"],
  "confidence": 0.97,
  "reason": "Artigo informativo; valores são salários de cargo, não preços de produto"
}
```

O Gemini identifica corretamente que `R$ 26` é um plano de assinatura aparecendo no sidebar de um artigo — não o preço da página — e `R$ 5.488,70` é o vencimento do cargo mencionado no texto informativo.

### Camada 4 — FalkorDB como Grafo de Inteligência

O grafo é onde a análise competitiva ganha forma visual. Cada site é um nó `Site`, suas páginas são nós `Page`, cursos e produtos viram nós `Product`, preços viram `Price`, e as tags de rastreamento viram `Tracking`.

A query que mais uso para comparação:

```cypher
MATCH p1 = (a:Site {domain: "plataforma-a.com.br"})-[:TEM_PAGINA]->(pg1:Page)
MATCH p2 = (b:Site {domain: "plataforma-b.com.br"})-[:TEM_PAGINA]->(pg2:Page)
RETURN p1, p2 LIMIT 200
```

Isso renderiza visualmente a diferença de escala entre os sites — tornando palpável o que antes era abstrato: quantas páginas cada player tem, como estão conectadas, onde há buracos de conteúdo.

## A TUI — Interface no Terminal

O sistema inteiro é controlado via uma TUI (Terminal User Interface) construída com [Textual](https://textual.textualize.io/), a framework Python para interfaces de terminal modernas.

A decisão de usar terminal em vez de uma interface web foi pragmática: o sistema roda localmente, precisa de controle preciso sobre threads, e a audiência somos eu e a equipe de estratégia — não clientes externos.

A TUI tem 7 abas:

- **🕷️ Crawler** — inicia sessões, monitora progresso, log em tempo real
- **📄 URLs** — lista todas as URLs com status, filtros por quebrado/externo
- **🎯 SEO** — score médio, issues por página, análise AI
- **🛡️ Segurança** — headers HTTP, SSL, CSP por página
- **📊 Ads/Tracking** — quais trackers o site usa
- **🏢 Sites** — painel comparativo com todos os sites cadastrados
- **⚡ Performance** — tempos de carga, core web vitals

## Pipeline Pós-Crawl Automática

O fluxo mais importante é o que acontece *depois* que o crawler termina. Em vez de rodar scripts manuais, tudo é encadeado automaticamente em 4 passos:

**[1/4] Extração de conteúdo semântico**
O `content_extractor.py` processa cada página e classifica tipo, extrai produtos e preços.

**[2/4] Robots.txt e Sitemaps**
O `backfill_robots_sitemaps.py` coleta e armazena as diretivas de crawling e o mapa de URLs declarado pelo site.

**[3/4] Reclassificação com IA**
O `ai_classifier.py` passa pelo Gemini Flash corrigindo tipos errados e removendo preços contaminados (salários, widgets de sidebar).

**[4/4] Sync do Grafo**
O `enrich_sites.py` e o `graph_db.py` sincronizam tudo para o FalkorDB, atualizam contadores de produtos e respeitam o tipo de cada site (`meu` vs `concorrente`).

## Insights que o Sistema Revelou

Após crawlar os principais players do setor onde atuei, alguns padrões ficaram claros:

**Modelo de precificação**

O setor apresenta modelos de negócio bastante distintos. Uma das plataformas analisadas adota preço único de assinatura anual com acesso a todo o catálogo — o produto é o ecossistema, não o curso individual. Outra oferece cursos avulsos com ticket unitário baixo, apostando na granularidade. Uma terceira atua no segmento de pós-graduação com ticket alto e público diferente. Cada modelo reflete uma proposta de valor distinta e um estágio diferente do funil de decisão do aluno.

**Tracking**

Todos os players usam GTM como camada de gerenciamento. GA4, Meta Pixel e outros pixels são carregados via GTM em runtime — invisíveis no HTML estático, visíveis apenas com Playwright + CDP. Esse foi um dos achados mais relevantes: a análise de HTML puro subestima drasticamente o uso de rastreadores.

**Escala de conteúdo**

A proporção entre páginas de produto e páginas de blog varia muito entre os players. Alguns concentram a maior parte do volume em páginas de produto — estratégia de fundo de funil. Outros dominam em blog — estratégia de topo de funil com SEO informacional. Essa diferença é visível diretamente no grafo e difícil de enxergar com outras ferramentas.

## O Que Aprendi

### 1. Grafos são a estrutura certa para dados relacionais complexos

A pergunta "quais produtos o concorrente A tem que eu não tenho?" é trivial num grafo. Em SQL seria um anti-join com múltiplas tabelas. A forma como o FalkorDB renderiza visualmente a rede de páginas, produtos e preços torna a análise intuitiva de um jeito que tabelas não conseguem.

### 2. IA não substitui estrutura — ela limpa ruído

O `ai_classifier.py` não faz milagre: ele limpa o que a extração ingênua sujou. O trabalho pesado (crawl, extração, armazenamento) ainda é estruturado. A IA entra como um filtro de qualidade, não como a fundação.

### 3. A interface importa tanto quanto o backend

A TUI com Textual foi um investimento que se pagou. Ver o progresso do crawl em tempo real, os logs de pipeline, os scores de SEO em tabela — isso torna o sistema utilizável. Um script de linha de comando puro, por mais poderoso, teria sido abandonado.

### 4. SQLite é subestimado

O SQLite como buffer entre crawler e grafo se mostrou extremamente flexível. Qualquer query de diagnóstico, qualquer backfill de dados históricos, qualquer exportação para Excel — tudo parte do mesmo arquivo local. Sem servidor, sem configuração, sem latência.

## Estado Atual e Próximos Passos

O sistema está em uso para análise competitiva contínua em projetos nos quais atuo. As próximas evoluções planejadas:

- **Persona Builder** — classificar cursos por público-alvo (policial, fiscal, administrativo) e gerar mapa de cobertura por disciplina
- **Alertas de mudança** — detectar quando um concorrente adiciona ou remove produtos entre sessões
- **Dashboard web** — interface visual para não-técnicos consultarem os dados do grafo

---

*O repositório é privado. Se você tem interesse em discutir a arquitetura ou adaptar algo para seu contexto, entre em contato pelo [LinkedIn](https://linkedin.com/in/vitorkrewer).*
