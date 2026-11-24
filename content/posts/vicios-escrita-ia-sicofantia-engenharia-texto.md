---
title: "O que aprendi depurando os vícios de escrita de LLMs em um motor de textos longos"
date: 2026-11-17
status: Publicado
series: Magnetares Knowledge
seriesOrder: 11
project: 13
tags: [Magnetares Knowledge, Inteligência Artificial, Engenharia de Prompt, Escrita Científica, LLMs, Engenharia de Software]
readTime: 9 min
excerpt: "Quando construí um pipeline em Python para ler artigos científicos completos e planos de ensino em Markdown, o problema deixou de ser o limite de tokens e passou a ser o estilo do modelo. Da equipe fantasma de post-its à sicofantia e aos títulos com dois-pontos, veja como corrigi os vícios mais comuns de textos gerados por IA."
---

Nos últimos dias, estive trabalhando na evolução do motor editorial de uma aplicação que desenvolvo em Python com SQLite e a API do Gemini. A ideia era resolver um problema prático da minha rotina acadêmica e de produção de conteúdo: selecionar cinco ou seis artigos científicos da minha base de conhecimento em Markdown — ou o plano de ensino completo de uma pós-graduação que desenhei — e transformar esse material em ensaios densos para o blog, Medium e LinkedIn, afinal, na era dos "superocupados", tempo é poder. 

O primeiro obstáculo que encontrei foi puramente mecânico. Eu selecionava cinco artigos científicos que, somados, davam cerca de 205 mil tokens (bem abaixo da janela de 1 milhão de tokens do modelo), mas o sistema me devolvia apenas duas páginas de texto.

De cara já faço um alerta: de nada adianta ter uma janela de tokens gigante se você não souber arquitetar o pipeline que vai ler, processar e utilizar os arquivos dentro do contexto do modelo. E não para por aí. A seleção de conteúdo deve ser criterioso, portanto, é preciso ler e acima de tudo analisar o referencial. Há claramente uma gama de "apudização" de conteúdos que é perigosa. Outro ponto é diversas fontes citando as mesmas "fontes primárias", o que torna a base do RAG, ao meu ver, redundante e "pobre".

Abri o código para auditar o pipeline e achei três culpados clássicos de engenharia: um corte antigo de `25.000` caracteres (`res.text[:25000]`) que jogava fora quase 90% de cada arquivo `.md` antes do envio, um modo de seleção local que mandava apenas o título da obra sem ler o arquivo e uma geração em chamada única (*single-shot*) que fazia o modelo parar sempre perto de 800 palavras.

Coisas como essa são erros clássicos quando agentes editam o código com contexto limitado e não reviso todas as alterações. Resumindo, o erro e a falha é minha.

Removi a trava para enviar 100% dos arquivos Markdown, criei uma tabela de auditoria de tokens no terminal e substituí a chamada única por um orquestrador em duas etapas: primeiro o modelo planeja os eixos do artigo e distribui a meta de palavras; depois, redige seção por seção mantendo todas as obras primárias no contexto e citando os autores pelas normas da ABNT.

Na parte de volume e rigor técnico, funcionou na hora. Fiz um teste pedindo um artigo longo sobre um artigo científico que eu mesmo habia estruturado e desenvolvido. O sistema entregou um documento de 16 páginas, com equações de autoatenção em LaTeX, três tabelas comparativas, diagramas em ASCII e 22 referências bibliográficas.

Mas bastou ler o primeiro parágrafo para perceber um problema muito mais sutil — e que quase todo sistema que gera texto com IA sofre hoje em silêncio.

---

## A equipe fantasma na sala cheia de post-its

O primeiro parágrafo do artigo gerado começava assim:

> *"Em uma tarde de planejamento acadêmico, cercados por dezenas de post-its coloridos e arquiteturas de software desenhadas no quadro branco, nossa equipe de design instrucional e cientistas de dados deparou-se com uma constatação incômoda..."*

O parágrafo era bem escrito sob o ponto de vista gramatical, mas tinha um defeito grave: **aquela cena nunca aconteceu**.

Não havia equipe de design instrucional, não havia grupo de cientistas de dados ao redor de um quadro branco e muito menos post-its coloridos na parede. Eu construí o artigo científico sozinho, no meu computador, cruzando literatura técnica e demandas reais de engenharia.

Por que o modelo inventou um comitê inteiro? Porque, no treinamento de grandes modelos de linguagem, textos institucionais sobre criação de cursos e produtos quase sempre são escritos na primeira pessoa do plural (*"nós desenhamos"*, *"nossa equipe"*). Quando pedimos um tom de *storytelling* sem especificar a **perspectiva autoral** (*Single-User* vs. *Multi-User*), o modelo preenche a lacuna estatística criando uma sala de reunião corporativa.

Esse foi o primeiro ajuste estrutural que levei para o código: separar explicitamente se o contexto é de **autor individual** (primeira pessoa do singular, proibindo a invenção de equipes ou reuniões fictícias), de **equipe/instituição** (primeira pessoa do plural) ou **impessoal** (terceira pessoa analítica).

Depois de corrigir a voz narrativa, passei um pente-fino nas 16 páginas geradas para mapear todos os outros cacoetes que entregam, em três segundos de leitura, que um texto saiu de um LLM.

---

## Os cinco vícios estilísticos que entregam um texto de IA

Quando lemos dezenas de textos gerados por modelos de linguagem em sequência, percebemos que o problema raramente está no vocabulário isolado. Ele está na **estrutura repetitiva**, na **bajulação automática** e na **falta de variação de ritmo**.

No diagnóstico do meu próprio gerador, separei cinco padrões que precisei bloquear via engenharia de prompt e restrições negativas.

### 1. A febre dos títulos longos com dois-pontos

Olhe para esta sequência real de títulos e subtítulos que o modelo gerou na primeira versão do artigo:

- *Da Alquimia dos Prompts à Engenharia de Sistemas: Como Desenhamos a Pós-Graduação que Decodifica a Fronteira da IA*
- *A Gênese Curricular e o Falso Dilema da IA: Por Que a Engenharia Começa no Rigor Matemático*
- *O Dilema Paramétrico vs. Não-Paramétrico: Fine-Tuning e RAG Desmistificados*
- *A Blindagem Axiológica: Auditoria de Vulnerabilidades e Governança Regulatória*
- *A Ciência da Verificação Factual: Da Falácia Empírica às Métricas RAGAS*

Praticamente **todos os títulos tinham dois-pontos (`:`)**. O modelo segue sempre a mesma receita: coloca uma metáfora abstrata antes dos dois-pontos (*"A Blindagem Axiológica"*, *"O Voo Industrial"*, *"A Travessia Cognitiva"*) e uma explicação comprida depois.

Nenhum engenheiro ou pesquisador escreve doze subtítulos seguidos com essa estrutura. Pessoas reais vão direto ao assunto em frases de quatro a nove palavras, sem batizar cada seção como se fosse o subtítulo de um filme:

| Como o LLM escreve por padrão | Como um autor humano escreve |
|---|---|
| *A Blindagem Axiológica: Auditoria de Vulnerabilidades e Governança Regulatória* | *Segurança, auditoria de vulnerabilidades e governança em produção* |
| *O Dilema Paramétrico vs. Não-Paramétrico: Fine-Tuning e RAG Desmistificados* | *Quando usar Fine-Tuning e quando escolher RAG* |
| *A Ciência da Verificação Factual: Da Falácia Empírica às Métricas RAGAS* | *Medindo e reduzindo alucinações com métricas RAGAS* |

### 2. A sicofantia e o autoelogio exagerado

A **sicofantia** (*sycophancy*) é a tendência que modelos alinhados por RLHF têm de concordar com o usuário, validar suas premissas e elogiar qualquer material que você forneça no contexto.

Em um chat casual, isso aparece naquele clássico *"Excelente pergunta! Você tocou em um ponto brilhante!"*. Mas, quando você constrói um sistema que usa IA para redigir artigos baseados em um projeto ou curso seu, a sicofantia se transforma em **autopromoção hiperbólica** dentro do próprio texto gerado.

Sem restrições explícitas, o modelo descreveu as disciplinas do curso usando expressões como:

- *"foram milimetricamente projetadas para operar como a blindagem industrial..."*
- *"o marco civilizatório da IA moderna..."*
- *"o zênite da transformação dos ecossistemas digitais contemporâneos..."*
- *"os patamares mais nobres do intelecto humano..."*
- *"este manifesto técnico é leitura obrigatória..."*

Em escrita técnica, científica ou de liderança de pensamento, **autoridade vem da precisão e da sobriedade**. Quando um texto afirma que ele mesmo é *"leitura obrigatória"* ou que um currículo foi *"milimetricamente projetado"*, o leitor experiente sente imediatamente o cheiro de verniz artificial. Um bom sistema de escrita precisa proibir o modelo de adjetivar o próprio trabalho.

### 3. A muleta sintática do "não é apenas X, é Y"

Se existe uma construção sintática que os LLMs usam até a exaustão, é a antítese corretiva: *"Isso não é apenas X; é Y"* ou *"Longe de ser X, trata-se de Y"*.

No mesmo artigo, o modelo repetiu esse molde em quase todas as seções:

- *"Um prompt não é um pedido em linguagem coloquial; é a compilação do estado inicial..."*
- *"A Engenharia de Prompt moderna não é um ofício de tentativas intuitivas; é uma disciplina..."*
- *"Essa não é apenas uma encruzilhada de engenharia; é uma bifurcação epistemológica."*
- *"O alinhamento não é uma reflexão meramente filosófica; é uma ciência computacional..."*
- *"Construir o futuro não significa apenas maravilhar-se...; significa assumir..."*

Usar um contraste desses uma vez em um ensaio longo funciona bem. Repetir o mesmo truque retórico dez vezes transforma o texto em um pêndulo mecânico previsível. Quando você instrui o modelo a cortar o preâmbulo negativo e fazer a afirmação direta, o parágrafo perde gordura na hora.

### 4. O dicionário de clichês dramáticos

Modelos de linguagem adoram dramatizar transições técnicas. Em vez de dizer que aplicações em produção trazem novos problemas de segurança e custo, o modelo escreve que *"uma nova e perigosa camada de desafios emerge das sombras"* ou que a tecnologia *"cruzou em definitivo sua linha de demarcação histórica"*.

Existe uma lista de palavras e expressões que funcionam como um alarme de texto sintético em português:

- *emerge das sombras*, *feitiçaria digital*, *alquimia*, *divisor de águas*;
- *desmistificar*, *destrinchar*, *mergulhar fundo*, *no cenário contemporâneo*;
- *vale ressaltar*, *em última análise*, *tecido corporativo*, *ecossistema pulsante*;
- o uso de travessões duplos (`— ... —`) no meio de quase todos os parágrafos.

### 5. A falta de variação de ritmo e de limites reais

Por fim, textos gerados por IA costumam ter baixa variação de cadência (*burstiness*). Quase todas as frases têm entre 25 e 35 palavras, separadas por duas ou três vírgulas no mesmo compasso. Falta aquela frase curta, de seis palavras, que freia o ritmo antes de uma explicação densa.

Além disso, devido ao viés prestativo do treinamento, a IA tende a apresentar toda ferramenta como perfeita. Um texto humano escrito por quem realmente coloca sistemas no ar sempre aponta onde a ferramenta quebra, quanto custa manter um índice vetorial atualizado e em quais casos o método mais simples ainda ganha do mais sofisticado.

---

## Como transformei esse diagnóstico em regras no código

Em vez de corrigir esses vícios manualmente a cada postagem gerada, incorporei uma camada fixa de **Humanização Editorial e Anti-Sicofantia** diretamente no módulo `copywriting.py` do projeto (que hoje também conta com interface gráfica em React, Tauri v2 e editor Milkdown).

Sempre que o sistema monta o prompt — tanto no planejamento das seções quanto na redação de cada parte —, ele injeta um bloco de restrições estritas junto com os arquivos `.md` de referência:

```python
def _construir_diretrizes_humanizacao_anti_sicofantia() -> str:
    return (
        "- PROIBIÇÃO DE TÍTULOS COM DOIS-PONTOS (:): Nunca escreva títulos H1, H2 ou H3 "
        "no formato 'Metáfora Abstrata: Explicação Longa'. Escreva títulos diretos, "
        "naturais, de 4 a 10 palavras e sem dois-pontos.\n"
        "- ZERO SICOFANTIA E ZERO AUTOELOGIO: É proibido usar adjetivos grandiloquentes "
        "ou autopromocionais sobre o curso, projeto ou texto ('milimetricamente projetado', "
        "'marco civilizatório', 'zênite', 'leitura obrigatória', 'divisor de águas'). "
        "A autoridade deve vir da sobriedade e da análise real de trade-offs.\n"
        "- BLOQUEIO DA ANTÍTESE MECÂNICA: Não repita a estrutura 'Não é apenas X; é Y' "
        "ou 'Longe de ser X, trata-se de Y'. Vá direto à afirmação concreta.\n"
        "- LISTA NEGRA DE CLICHÊS: Não use expressões como 'emerge das sombras', "
        "'feitiçaria digital', 'desmistificar', 'destrinchar', 'mergulhar fundo', "
        "'no cenário contemporâneo' ou excesso de travessões em todo parágrafo.\n"
        "- CADÊNCIA HUMANA E REALISMO: Alterne frases curtas (6 a 12 palavras) com "
        "períodos analíticos e aponte limitações práticas e custos reais."
    )
```

Somado ao seletor de **Perspectiva Autoral** (*Individual / Single-User*, *Equipe / Multi-User* ou *Impessoal*), ao envio integral dos arquivos Markdown sem truncamento e à opção de **Citações ABNT nos parágrafos**, o comportamento do gerador mudou da água para o vinho.

---

## Resumo prático para quem constrói sistemas de escrita com IA

Se você está desenvolvendo qualquer ferramenta que utiliza LLMs para redigir relatórios, artigos técnicos ou materiais didáticos, vale guardar este checklist de engenharia de contexto:

| Sintoma no texto gerado | Causa no modelo | Como resolver no sistema |
|---|---|---|
| Texto de 2 páginas mesmo com 5 artigos no contexto | Truncamento fixo no código (`[:25000]`) + chamada única (*single-shot*) | Enviar os arquivos `.md` integrais na janela de 1M tokens e dividir textos longos (> 1.800 palavras) em planejamento + escrita por seção |
| Invenção de "nossa equipe" e salas de reunião com post-its | Viés estatístico de textos corporativos em 1ª pessoa do plural | Parametrizar explicitamente a perspectiva do autor (*Single-User* em 1ª pessoa do singular vs. *Multi-User*) |
| 100% dos títulos com dois-pontos (`Metáfora: Explicação`) | Padrão dominante de títulos ensaísticos no ajuste fino do LLM | Proibir dois-pontos em `H1/H2/H3` já no prompt de planejamento do sumário JSON |
| Tom bajulador (*"milimetricamente projetado"*, *"leitura obrigatória"*) | Sicofantia induzida por RLHF para agradar o autor do prompt | Injetar regra explícita de *Zero Sicofantia*, exigindo tom sóbrio e foco em limites e *trade-offs* |
| Repetição de *"Não é apenas X; é Y"* em toda seção | Muleta retórica de transição do modelo | Bloquear o molde sintático negativo-positivo e limitar o uso de travessões |

No fim das contas, construir boas ferramentas com inteligência artificial passa muito menos por aceitar o primeiro texto bonito que aparece na tela e muito mais por tratar o prompt e o pipeline como engenharia de software: observar onde o modelo escorrega, entender o viés estatístico por trás do erro e colocar trilhos claros no código.

Por hoje, isso é tudo pessoal. Até a próxima!