---
title: "Escrita de artigos científicos com rastreabilidade de apud, fichamentos em ciclos e catálogo bibliográfico"
date: 2026-08-20
status: Publicado
series: Magnetares Knowledge
seriesOrder: 5
project: 13
tags: [Magnetares Knowledge, Python, Escrita Científica, ABNT, RAG, Textual, SQLite]
readTime: 9 min
excerpt: "Como impedi o modelo de inventar referências bibliográficas cruzando quatro bases científicas, criei o inventário JSON de rastreabilidade para citações apud na norma ABNT e resolvi o fichamento de livros extensos em ciclos de 75 mil caracteres."
---

Quando terminei o gerador de livros didáticos e o indexador vetorial do **Magnetares Knowledge**, achei que dar o próximo passo para escrever artigos científicos seria apenas trocar o prompt pedagógico por um prompt acadêmico. Bastaria pedir resumo, introdução, fundamentação teórica, metodologia, resultados e referências na norma ABNT NBR 6023.

Na primeira bateria de testes do `artigo_cientifico.py`, em 16 de agosto de 2026 (`v1.6.0`), o sistema me entregou um texto com cara de periódico Qualis, dividido em seções, com linguagem impessoal na terceira pessoa e uma lista de doze referências no final. O problema apareceu quando fui checar uma por uma.

Duas obras da lista final simplesmente não existiam — o modelo havia juntado o sobrenome de um pesquisador real da área com um título plausível e um ano recente. Em outros três parágrafos da revisão de literatura, ele lia um artigo contemporâneo do meu acervo local que mencionava um autor clássico de 1995 e citava o autor de 1995 diretamente, como se eu tivesse o livro original de 1995 aberto na minha máquina. Pior ainda, quando ele tentava aplicar a regra de `apud`, às vezes colocava o título do PDF no lugar do sobrenome do autor secundário, gerando aberrações como `(RUSSELL; NORVIG, 2021 apud A INFLUÊNCIA DA IA NA EDUCAÇÃO, 2026)`.

Escrever material didático tolera paráfrases amplas. Escrever um artigo científico ou um projeto de pesquisa para agências de fomento não tolera citação fantasma nem falso acesso a fonte primária. Passei os dez dias seguintes, entre as versões `v1.6.0` e `v1.7.9`, desmontando e reconstruindo a forma como o sistema lida com fontes, citações, fichamentos de obras longas e metadados bibliográficos.

---

## Das propostas de pesquisa ao artigo completo

Antes de atacar a validação das referências em si, percebi que raramente começo um paper direto pela introdução do artigo. Na prática acadêmica, quase tudo nasce como um projeto ou proposta de pesquisa — aquele documento estruturado no estilo FAPESP ou CNPq em que definimos o problema de pesquisa, a justificativa, o objetivo geral, os objetivos específicos e o desenho metodológico.

Na versão `v1.7.0`, criei a tabela `propostas_pesquisa` no SQLite e integrei um fluxo de duas etapas dentro do `artigo_cientifico.py`. Eu podia cadastrar uma proposta manualmente preenchendo cada campo ou, a partir da `v1.7.9`, rodar a geração por briefing. No modo por briefing, digito apenas um parágrafo descrevendo a hipótese ou o recorte que quero investigar; o sistema converte esse parágrafo em vetor, busca no meu acervo local os livros e papers com maior similaridade de cosseno e monta a proposta completa amarrada exclusivamente às obras que eu realmente possuo.

Coloquei uma trava simples antes de gravar no banco. Assim que o modelo termina de redigir a proposta, ela abre direto no editor Markdown em tela dividida (`editor_md.py`) no terminal. Eu reviso o problema de pesquisa, corto o que estiver genérico, ajusto os objetivos e só então aprovo a persistência. Se eu rejeitar na tela de revisão, o rascunho é descartado sem sujar o banco.

Uma vez aprovada a proposta, adicionei a ação de converter proposta em artigo. Em vez de digitar tudo de novo, o gerador de artigos herda o problema, os objetivos, a metodologia e a lista exata de fontes validadas na proposta, fatiando a redação seção por seção e injetando os trechos reais dos arquivos Markdown indexados no RAG (`v1.8.0`). Na `v1.7.8`, juntei as duas pontas na visão **Minhas Pesquisas**, que permite exportar um pacote único contendo a proposta original, o artigo derivado, o relatório de citações e uma pasta com os PDFs e Markdowns locais usados no embasamento.

---

## A batalha contra as citações inventadas e o apud malformado

Para impedir o modelo de citar o título da obra como se fosse autor ou de fingir que leu uma fonte primária que só apareceu citada por terceiros, parei de mandar metadados soltos no prompt. Passei a pré-processar cada obra selecionada no Python para gerar uma chave canônica imutável chamada `CITACAO_AUTOR_DATA`, acompanhada do identificador interno e da referência ABNT já higienizada.

Além disso, obriguei o modelo a devolver, ao final de cada seção escrita, um bloco delimitado por `---INVENTARIO_FONTES---`. O Python intercepta a resposta bruta, separa o texto acadêmico em Markdown do bloco JSON de auditoria e salva o inventário na coluna `inventario_fontes` da tabela da seção.

```python
# Trecho do contrato exigido em cada ciclo do artigo_cientifico.py
PROMPT_INVENTARIO = """
Cada fonte é apresentada com ID_FONTE, CITACAO_AUTOR_DATA e REFERENCIA_ABNT.
Use exatamente a chave CITACAO_AUTOR_DATA indicada. Nunca use o título da obra como autor.

Quando fundamentar ideias que o autor da fonte citou de outra obra (sem acesso à obra primária),
aplique obrigatoriamente a regra da ABNT NBR 10520:
(SOBRENOME_AUTOR_ORIGINAL, ANO apud CITACAO_AUTOR_DATA_FONTE_CONSULTADA, p. X)

Ao final da resposta, gere obrigatoriamente o bloco:
---INVENTARIO_FONTES---
[
  {
    "fato": "Síntese do argumento afirmado no parágrafo",
    "id_fonte": "local_42",
    "citacao_no_texto": "(RUSSELL; NORVIG, 2021 apud TEIXEIRA; MANUEL, 2026, p. 14)",
    "citacao_tipo": "apud",
    "autor_original": "RUSSELL; NORVIG",
    "ano_original": "2021",
    "autor_fonte_secundaria": "TEIXEIRA; MANUEL",
    "ano_fonte_secundaria": "2026",
    "pagina_ou_paragrafo": "p. 14"
  }
]
"""
```

Exigir esse JSON ao final de cada seção teve um efeito curioso no comportamento do modelo. Quando o LLM sabe que precisará preencher `id_fonte`, `citacao_tipo` (`direta`, `indireta` ou `apud`), `autor_original` e `autor_fonte_secundaria` num array estruturado logo abaixo do texto, a taxa de alucinação de autores no corpo dos parágrafos despenca. E, quando o modelo ainda errava a associação na compilação final, eu tinha os dados estruturados no SQLite para cruzar `id_fonte` e `CITACAO_AUTOR_DATA` por código e consolidar a seção de referências de forma determinística, sem deixar o LLM reescrever a lista final de cabeça.

O segundo flanco dessa guerra estava nos planos de ensino e nas disciplinas em que meu acervo local ainda não tinha livros suficientes sobre um tema muito específico. Nas versões `v1.7.4` e `v1.7.5`, construí um pipeline de consulta bibliográfica externa que roda antes da chamada do Gemini, interrogando cinco fontes de dados reais:

1. **Google Books API** e **Open Library** para livros e manuais técnicos (destinados exclusivamente à Bibliografia Básica).
2. **Crossref**, **OpenAlex** e **Semantic Scholar** para artigos revisados por pares e anais (destinados à Bibliografia Complementar).

Claro que integrar cinco APIs públicas no meio de um gerador em lote trouxe dores de cabeça imediatas no mesmo dia (`2026-08-20`):

- O **Google Books** começou a devolver erro `429 Too Many Requests` quando eu gerava várias disciplinas em sequência; precisei tratar o `429` de forma silenciosa e fazer fallback automático para a Open Library sem abortar o plano.
- O **Semantic Scholar** estourava limite de taxa quando eu não tinha uma `SEMANTIC_SCHOLAR_API_KEY` configurada no `.env`; ajustei o cliente para pular a consulta silenciosamente quando a chave estiver vazia.
- Muitas APIs devolvem registros sujos — livros sem editora ou sem ISBN, e papers de preprint sem periódico nem DOI. Criei um filtro estrito em Python que descarta qualquer candidato incompleto antes de montar o prompt e normaliza nomes no formato `SOBRENOME, Prenomes` sem pontos duplicados. Se as APIs retornarem apenas três livros válidos em vez de cinco, o sistema preserva apenas os três reais. Nunca preenche a lacuna com obras inventadas.

---

## Fichamentos em ciclos de 75 mil caracteres e diagramas no terminal

Com o acervo cheio de livros de 400 páginas e teses de doutorado convertidas para Markdown, surgiu outra necessidade prática da pós-graduação: gerar **fichamentos acadêmicos** (temáticos, de citações ou crítico-analíticos) para estudo próprio.

Na primeira versão do `fichamentos_academicos.py` (`v1.7.1`), tentei mandar a obra inteira de uma vez. Para artigos de 15 páginas funcionava muito bem, mas quando selecionei um livro de quase 600 mil caracteres, aconteceram dois problemas: o modelo comprimia capítulos inteiros em duas linhas superficiais para caber na janela de saída, ou a conexão caía aos quatro minutos de processamento e eu perdia tudo.

No mesmo dia (`v1.7.2`), refatorei a leitura para operar em **ciclos de 75 mil caracteres** (`TAMANHO_CICLO_CARACTERES = 75_000`), apoiada por uma nova tabela relacional `fichamento_ciclos`.

```python
def _fatiar_markdown_em_ciclos(conteudo_md: str, limite: int = 75_000) -> list[str]:
    """Divide obras extensas respeitando quebras de parágrafo para fichamento incremental."""
    if len(conteudo_md) <= limite:
        return [conteudo_md]
    blocos, atual, tamanho_atual = [], [], 0
    for paragrafo in conteudo_md.split("\n\n"):
        tam_p = len(paragrafo) + 2
        if tamanho_atual + tam_p > limite and atual:
            blocos.append("\n\n".join(atual))
            atual, tamanho_atual = [paragrafo], tam_p
        else:
            atual.append(paragrafo)
            tamanho_atual += tam_p
    if atual:
        blocos.append("\n\n".join(atual))
    return blocos
```

A lógica passou a imitar como eu ficho um livro grosso na vida real. O sistema fatia o Markdown respeitando as quebras de parágrafo, lê o bloco 1 (primeiros 75 mil caracteres), extrai as teses, conceitos, citações literais verificáveis e páginas daquele trecho e grava o mapa intermediário na tabela `fichamento_ciclos`. Se a internet cair ou a API falhar no bloco 6 de 8, basta clicar em **Retomar Geração por Ciclos** no menu e ele continua exatamente do bloco 6. Só quando todos os blocos intermediários estão salvos é que o modelo faz a síntese final consolidada, separando com clareza o que é argumento do autor original e o que é comentário crítico do fichador.

Para ajudar a visualizar a estrutura de uma tese sem sair do terminal, pedi para o fichamento gerar ao final dois diagramas em sintaxe Mermaid (`mindmap` e `flowchart TD`). E, na versão `v1.7.3`, integrei a biblioteca `termaid` dentro do `editor_md.py`. Quando abro o fichamento no editor Textual em tela dividida, o painel da esquerda mostra o código Markdown puro e o painel da direita intercepta os blocos ````mermaid` e desenha o fluxograma em caracteres Unicode direto no terminal, mantendo o código original intacto na hora de exportar. Aproveitei para consertar um bug irritante no preview (`v1.7.2`): envolvi o painel direito num contêiner `VerticalScroll` com sincronização proporcional bidirecional, para que rolar o texto no editor desça o preview exatamente na mesma proporção.

---

## Por que criei um segundo banco SQLite só para o catálogo bibliográfico

Até a versão `v1.7.6`, toda obra conhecida pelo sistema morava na tabela `conhecimento` do `academico.db`. Mas essa tabela foi desenhada para o acervo físico/digital do RAG — ela esperava um arquivo PDF ou DOCX original, um arquivo `.md` convertido, links para o Bunny CDN e dezenas de vetores na tabela `conhecimento_embeddings`.

Na rotina de coordenação e elaboração de matrizes curriculares, porém, muitas vezes eu tenho planilhas, listas de bibliografias de cursos ou arquivos `.json` e `.yaml` com centenas de referências clássicas homologadas pelo MEC para as quais eu não tenho (nem preciso ter) o PDF completo no disco. Eu só preciso dos metadados exatos — título, autores, ano, editora, edição, ISBN, DOI e referência ABNT — para compor a bibliografia básica e complementar de planos de ensino sem depender de buscas externas a toda hora.

Misturar milhares de referências "somente metadados" na tabela do RAG ia poluir os seletores de escrita profunda (que exigem texto integral em Markdown para fazer grounding). Por isso, na versão `v1.7.7`, tomei a decisão de criar um segundo banco SQLite dedicado: `data/db/catalogo_bibliografico.db`.

| Característica | Acervo de Conhecimento (`academico.db`) | Catálogo Bibliográfico (`catalogo_bibliografico.db`) |
|---|---|---|
| **Objetivo principal** | Grounding de conteúdo profundo, leitura integral, RAG e fichamentos | Referenciamento rápido ABNT para planos de ensino, ementas e bibliografias |
| **Exige arquivo físico (`.pdf`/`.md`)?** | Sim (local ou sincronizado na Bunny CDN) | Não (armazena apenas metadados verificados) |
| **Possui vetores de embedding?** | Sim (`conhecimento_embeddings` com `gemini-embedding-001`) | Não |
| **Deduplicação automática** | Por hash e nome de arquivo normalizado | Por `DOI`, `ISBN`, `ISSN` ou chave composta `título + autor + ano` |
| **Formas de alimentação** | Upload de arquivos com conversão OCR/MarkItDown | Importador JSON/YAML em lote, cadastro manual ou busca assistida nas 5 APIs |

Construí um navegador próprio em Textual para esse catálogo, com busca incremental por título, autor ou área, painel lateral de detalhes e o atalho `E` para editar qualquer campo na hora. Também criei um modo de **Busca e Revisão de Candidatos**: digito uma lista de termos (por exemplo, cinco temas de engenharia de dados), o sistema varre Google Books, Open Library, Crossref e OpenAlex em segundo plano, exibe os resultados formatados em ABNT numa tabela de revisão e eu marco apenas os livros e artigos que quero importar para o `catalogo_bibliografico.db`.

A partir daí, na versão `v1.8.0`, a fronteira ficou cristalina dentro do **Magnetares Knowledge**: o catálogo bibliográfico e as APIs científicas fornecem metadados limpos e referências padronizadas para planos de ensino, enquanto a redação argumentativa de artigos científicos e livros didáticos consome os trechos reais em Markdown do acervo vetorizado. No próximo post da série, conto como levei essa mesma base para gerar matrizes baseadas em Competências, Habilidades e Atitudes (CHA), eBooks comerciais de lançamento de cursos, consultoria sobre legislação do MEC e replicação na nuvem com Turso.
