---
title: "Apostilas para concursos públicos, leis comentadas artigo por artigo, OCR local e recuperação de falhas da API"
date: 2026-09-17
status: Publicado
series: Magnetares Knowledge
seriesOrder: 8
project: 13
tags: [Magnetares Knowledge, Python, Concursos Públicos, Leis Comentadas, OCR, DOCX, Resiliência]
readTime: 9 min
excerpt: "O salto para a versão 2.0 com os módulos de apostilas para editais de concursos e leis comentadas artigo por artigo, a entrada do OCR local em CPU com RapidOCR e a caçada ao bug do Ciclo 24 que salvou um dump da API no meio de uma apostila de Saúde Mental."
---

O dia 17 de setembro de 2026 foi um dos dias mais intensos de desenvolvimento do **Magnetares Knowledge**. Em menos de vinte e quatro horas, o projeto saltou da versão `2.0.0` para a `2.2.0`, ganhando dois módulos grandes voltados para o estudo jurídico e preparatório, um pipeline de OCR local rodando na CPU e uma cirurgia de emergência no motor de geração após um bug silencioso contaminar o capítulo 24 de uma apostila real de Saúde Mental.

Até aquele momento, toda a arquitetura pedagógica do sistema estava voltada para o ensino superior e pós-graduação: planos de ensino, artigos científicos, fichamentos e livros acadêmicos. Mas quem estuda ou prepara materiais para **concursos públicos**, **Exame da OAB** ou disciplinas de Direito sabe que a lógica de um edital é muito diferente da lógica de uma ementa universitária.

Em um curso de graduação, você explora correntes teóricas e debates abertos. Em uma apostila para enfrentar a **FGV**, o **Cebraspe (CESPE)**, a **FCC** ou a **Vunesp**, você precisa mapear exatamente cada tópico e subtópico do edital, entender como a banca cobra a letra da lei, cruzar com a jurisprudência dominante do STF e do STJ, apontar as pegadinhas recorrentes de prova e treinar com questões comentadas alternativa por alternativa.

---

## O salto para a v2.0.0 com Concursos Públicos e Leis Comentadas

Para atender essa demanda sem descaracterizar o módulo de livros acadêmicos, criei dois novos motores independentes no banco SQLite unificado.

O primeiro foi o **Escritor de Material Didático para Concursos Públicos** (`src/modules/material_concursos.py`). Em vez de amarrar o conteúdo a um curso universitário, estruturei um cadastro relacional de **Concursos, Órgãos, Cargos, Escolaridade (Médio, Técnico, Superior), Ano do Edital e Banca Organizadora**. Um detalhe de modelagem que fez diferença prática foi permitir vincular o mesmo conjunto de tópicos e subtópicos a múltiplos concursos: ao preparar uma matéria comum a três editais, não é preciso recadastrar a árvore programática do zero.

A geração da apostila roda em ciclos iterativos subtópico a subtópico, combinando o perfil da banca escolhida com o acervo RAG vetorial (quando ativado) e salvando cada seção concluída em tempo real no SQLite.

O segundo módulo que estreou na `v2.0.0` foi o **Escritor de Leis Comentadas Artigo por Artigo** (`src/modules/lei_comentada.py`), apoiado pelas tabelas `leis_comentadas` e `lei_comentada_artigos`. A ideia nasceu de uma dor clássica: ler uma lei extensa direto do PDF oficial é árido, e muitos comentários jurídicos tradicionais usam um jargão que afasta estudantes de outras áreas.

Desenhei o fluxo do `lei_comentada.py` em duas etapas:

1. **Ingestão e Fatiamento Sequencial** — faço o upload da norma em `.pdf`, `.docx` ou `.txt`, o sistema converte o texto e fatia a estrutura sequencialmente dispositivo por dispositivo (`Art. 1º`, `Art. 2º`, parágrafos, incisos e alíneas), gravando cada artigo como um registro individual no banco.
2. **Comentário Estruturado em Cinco Camadas** — para cada artigo, o motor gera o texto legal seguido de explicação em linguagem simples para não-advogados, exemplos práticos do cotidiano, decisões dos Tribunais Superiores (STF/STJ), quadro de pegadinhas OAB/bancas e esquemas em tabelas com links diretos para as fontes.

---

## OCR local na CPU com RapidOCR antes de chamar a nuvem

Logo que comecei a subir leis municipais antigas, portarias e editais de concursos em PDF para testar os novos módulos, esbarrei em um clássico da administração pública: **PDFs digitalizados como imagem ou gerados por impressoras antigas sem camada de texto selecionável**.

No pipeline original, o sistema tentava extrair o texto com `PyMuPDF4LLM` e `PyMuPDF`. Quando o arquivo voltava vazio, ele recorria ao `MarkItDown` ou enviava o PDF para a API do Gemini fazer a leitura multimodal. Mandar um PDF escaneado de 80 páginas para a API a cada teste consumia cota e demorava.

Na mesma versão `v2.0.0` (e refinado na `v2.1.0`), inseri uma camada de **OCR local orientado a CPU** usando o `rapidocr_onnxruntime` antes do fallback em nuvem:

| Ordem no Pipeline | Ferramenta / Motor | Quando entra em ação | Custo de API |
|---|---|---|---|
| **1º Estágio** | `PyMuPDF4LLM` + `PyMuPDF` | PDFs digitais com camada de texto nativa | Zero (Local) |
| **2º Estágio** | `rapidocr_onnxruntime` (CPU) | PDFs digitalizados, antigos ou vetoriais sem camada de texto | Zero (Local) |
| **3º Estágio** | `MarkItDown` | Formatos de escritório variados e estruturas híbridas | Zero (Local) |
| **4º Estágio** | API Gemini Multimodal | Último fallback quando o documento exige leitura multimodal complexa | Consome Tokens |

Por rodar sobre o ONNX Runtime na CPU, o `rapidocr_onnxruntime` dispensa GPU dedicada, roda de forma idêntica no Windows, Linux e macOS e resolveu localmente quase todos os PDFs escaneados de legislações e editais que processei.

---

## O bug da cerca ` ```json` órfã que engoliu uma apostila de 39 capítulos

Quando exportei para Word (`.docx`) a primeira apostila grande gerada pelo módulo de concursos — um material real de **Saúde Mental** com 39 capítulos —, abri o arquivo no Word e levei um susto.

Do capítulo 1 ao 14, o documento estava bem diagramado. Da metade do capítulo 15 até a última página do capítulo 39, **todo o restante do livro tinha virado um bloco de código monoespaçado**, cheio de `##`, `**` e asteriscos literais, além de um sumário no início que listava dezenas de frases soltas em negrito como se fossem títulos de capítulos.

Inspecionei o Markdown salvo no banco e o código de exportação e encontrei dois problemas encadeados:

1. No capítulo 15, o modelo abriu uma cerca ` ```json` para exemplificar um registro estruturado, mas esqueceu de fechar com os três acentos graves ` ``` `. Como o parser antigo concatenava os capítulos antes de converter para o Word, aquela cerca aberta no capítulo 15 deixou os outros 24 capítulos seguintes presos dentro do estado de bloco de código!
2. Na geração do Sumário, uma regra frouxa classificava qualquer linha inteira em `**negrito**` como título de capítulo, poluindo o índice.

Isso motivou a versão `v2.1.0`, na qual centralizei a conversão de Markdown para Word no módulo compartilhado `src/core/docx_utils.py`.

Reescrevi o parser (`renderizar_markdown()`) para isolar o escopo de cada seção e neutralizar cercas ` ``` ` ou ` ```json` incompletas antes da renderização. Também padronizei o acabamento editorial dos `.docx` do **Magnetares Knowledge DB**:

- Margens uniformes de **2 cm**, capa sem paginação visível e remoção automática de títulos de capa duplicados no corpo;
- Sumário navegável com índice estático, links internos para cada tópico/artigo, líderes pontilhados, campos `PAGEREF` e instrução de campo `TOC` nativo do Word;
- Conversão de links Markdown em **hyperlinks nativos clicáveis** no Word e tabelas uniformes com colunas distribuídas pela largura útil da página, cabeçalhos repetidos e linhas alternadas.

Ao reexportar a apostila de Saúde Mental, o sumário cravou os 39 títulos principais com zero resíduos de sintaxe Markdown. Mas, ao rolar até o capítulo 24 daquele arquivo, encontrei uma falha ainda mais séria.

---

## A caçada ao bug do Ciclo 24 e o dump `GenerateContentResponse` no meio da apostila

O capítulo 24 tratava do subtópico **"Crack e Outras Drogas"** dentro da política de saúde mental e redução de danos. Quando abri a página correspondente no Word, em vez de texto didático, lá estava impresso um despejo técnico bruto do SDK do Google:

```text
GenerateContentResponse(
    candidates=[Candidate(
        content=Content(parts=[], role='model'),
        finish_reason=<FinishReason.RECITATION: 4>,
        safety_ratings=[...]
    )],
    usage_metadata=GenerateContentResponseUsageMetadata(...)
)
```

Como um objeto interno do Python foi parar no banco SQLite e no arquivo Word final?

Abri o `src/core/gerador_utils.py` na função `smart_generate()` e achei a causa. Quando a API do Gemini encerra uma geração sem texto por `finish_reason = RECITATION` (quando o detector julga que a saída está próxima demais de reproduzir trechos extensos de uma fonte) ou por filtros de segurança, o objeto `response` retorna sem levantar exceção HTTP, mas com `response.text` vazio.

No código antigo, havia um fallback perigoso no final da função:

```python
# O fallback antigo que contaminou o Ciclo 24:
texto = getattr(response, "text", None)
if not texto:
    texto = str(response)  # <-- Convertia o objeto do SDK em string e salvava como aula!
return texto
```

Como `str(response)` gerava uma string longa com os metadados do SDK, o orquestrador achava que o capítulo 24 tinha sido redigido com sucesso e gravava aquele dump no banco de dados. Para piorar, o tema *"Crack e Outras Drogas"* acionava facilmente tanto os filtros de termos sensíveis quanto o `RECITATION`, por citar normas do Ministério da Saúde e a Lei nº 11.343/2006.

Na versão `v2.2.0`, resolvi o problema na raiz em quatro frentes:

1. **Bloqueio de `str(response)` e inspeção de `finish_reason`** — respostas sem `.text` válido nunca mais são convertidas por `str()` nem salvas como conteúdo didático.
2. **Fallback automático de `RECITATION` com redação autoral** — quando `smart_generate()` detecta uma resposta vazia encerrada por `RECITATION`, ele acrescenta automaticamente uma instrução de **redação autoral analítica** ao prompt e avança para o próximo modelo configurado na fila (tratando também erros `404` / `NOT_FOUND` sem abortar o lote e desativando o aviso de AFC com `AutomaticFunctionCallingConfig(disable=True)`).
3. **Enquadramento clínico e de saúde pública** — tópicos sobre álcool, crack e outras drogas passaram a receber diretriz explícita de abordagem clínica, preventiva, educacional e de saúde pública, evitando falsos positivos nos filtros.
4. **Ação "Regenerar Seções com Erro Técnico"** — criei uma rotina de recuperação seletiva que identifica e reescreve somente as seções vazias, com erro ou contaminadas por dumps, preservando intactos os outros 38 capítulos válidos. Também corrigi a importação de `re` no módulo de concursos para garantir a limpeza de cercas Markdown/JSON no pós-processamento da regeneração.

Executei a recuperação seletiva na apostila de Saúde Mental: o sistema reprocessou apenas o Ciclo 24 (*"Crack e Outras Drogas"*), gerou **20.366 caracteres válidos** de conteúdo didático e limpou definitivamente o banco SQLite e o `.docx`.

No mesmo dia 17 de setembro, fechei a `v2.2.0` empacotando o sistema com **PyInstaller** (`onedir`), instaladores sem privilégios administrativos para Windows, Linux, macOS Intel e Apple Silicon, inventário automático `THIRD_PARTY_LICENSES.txt` e pipeline de GitHub Release com trava de compliance para impedir que arquivos `.env`, bancos locais ou caches entrassem nos artefatos públicos.
