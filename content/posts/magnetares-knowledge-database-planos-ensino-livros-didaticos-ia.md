---
title: "Planos de ensino completos, disciplinas avulsas e o escritor iterativo de livros didáticos"
date: 2026-08-12
status: Publicado
series: Magnetares Knowledge
seriesOrder: 4
project: 13
tags: [Magnetares Knowledge, Python, Design Instrucional, Planos de Ensino, Google Books API, SQLite]
readTime: 8 min
excerpt: "A evolução do gerador de planos de ensino para suportar disciplinas avulsas com numeração hierárquica e o nascimento do escritor de livros didáticos e apostilas em ciclos, combinando o acervo local com a API do Google Books."
---

Logo depois de colocar o Gerenciador de Conhecimento e a integração com o Bunny CDN de pé na versão `1.5.2` do **Magnetares Knowledge**, percebi que meu fluxo de trabalho diário tinha duas pontas soltas.

A primeira estava na granularidade dos planos de ensino. Até ali, o módulo `plano_ensino.py` pensava apenas em cursos inteiros de pós-graduação — seja puxando uma matriz curricular existente no banco (`tipo='base'`), seja desenhando um curso completo de dez ou doze disciplinas do zero (`tipo='novo'`). Só que, na rotina acadêmica real, muitas vezes eu não preciso estruturar uma pós-graduação inteira de 360 horas; preciso apenas criar ou reformular o plano de ensino de **uma única disciplina isolada**, com unidades detalhadas e subtópicos numerados. Além disso, todas as disciplinas ricas que a IA já vinha gerando dentro dos planos de ensino ficavam presas dentro de cada curso, sem uma tela onde eu pudesse pesquisar, filtrar e reaproveitar uma matéria específica.

A segunda ponta solta era o passo seguinte ao plano de ensino. Ter a ementa, os objetivos, o conteúdo programático e a bibliografia ABNT aprovados resolve a estrutura curricular, mas quem prepara aulas de pós-graduação ainda precisa redigir o **livro didático ou apostila** daquela disciplina. Tentar gerar uma apostila densa de 60 páginas em um único prompt sempre falha: o modelo resume o que não deve, perde o fôlego na metade e esquece de citar as fontes.

Entre os dias 10 e 12 de agosto, nas versões `1.5.3` e `1.5.4`, ataquei essas duas frentes. Construí o **Catálogo de Disciplinas Geradas por IA**, o gerador e exportador de **Disciplinas Avulsas** e o **Escritor de Material Acadêmico e Livros Didáticos (`escritor_academico.py`)** baseado em ciclos iterativos com persistência por seção no SQLite. No caminho, esbarrei em erros clássicos de serialização de dicionários no driver do SQLite e JSONs vazios que quebravam a inicialização.

---

## Libertando as disciplinas dos planos com um catálogo relacional próprio

Quando eu gerava um plano de ensino completo no `plano_ensino.py` — tanto no fluxo derivado da base (`fluxo_uso_base`) quanto no fluxo de curso inédito (`fluxo_novo_curso`) —, o sistema gravava os metadados do curso na tabela `planos_ensino` e inseria cada matéria na tabela filha `plano_disciplina`, com ementa, objetivos, conteúdo programático em JSON e bibliografias básica e complementar.

Depois de algumas dezenas de planos gerados, acumulei centenas de disciplinas detalhadas no banco `academico.db`. O problema é que, para encontrar uma disciplina sobre *Arquitetura de Microsserviços* que eu sabia que já tinha gerado semanas atrás, eu precisava abrir plano por plano no menu até achar em qual curso ela estava.

Para resolver isso na `v1.5.3`, criei o **Catálogo de Disciplinas Geradas por IA** (`explorar_catalogo_disciplinas_ia` em `plano_ensino.py`, também acessível pelo `explorador_catalogo.py`). No `src/core/academico_db.py`, implementei a função `listar_disciplinas_plano_ia` fazendo um `JOIN` direto entre `plano_disciplina` e `planos_ensino`, com paginação (`LIMIT` e `OFFSET`) e três filtros combináveis:

```python
select_query = f"""
    SELECT 
        pd.id, pd.id_plano, pd.nome, pd.ordem, pd.carga_horaria,
        pd.ementa, pd.objetivo, pd.conteudo_programatico,
        pd.bibliografia_basica, pd.bibliografia_complementar,
        pd.metodologia, pd.avaliacao, pd.produtora,
        p.nome_curso, p.area, p.tipo AS tipo_plano, p.criado_em
    FROM plano_disciplina pd
    JOIN planos_ensino p ON pd.id_plano = p.id
    {query_where}
    ORDER BY p.criado_em DESC, pd.ordem ASC
    LIMIT ? OFFSET ?
"""
```

Na interface de terminal com Rich, passei a navegar por páginas de 12 disciplinas por vez (`N` para avançar, `P` para voltar), filtrando por palavra-chave (buscando no nome da disciplina, ementa, conteúdo programático e curso de origem), por Área do Conhecimento ou pela origem do plano (`novo`, `base` ou `individual`). Ao digitar o número de qualquer item, o sistema abre a ficha completa daquela matéria, pronta para leitura, edição ou uso no escritor de livros.

---

## Planos de disciplinas avulsas e numeração hierárquica na v1.5.4

Logo após criar esse catálogo na `1.5.3`, veio a pergunta óbvia: *por que me obrigar a gerar um curso inteiro de 10 disciplinas quando só quero estruturar uma matéria nova?*

Dois dias depois, na versão `1.5.4`, adicionei o `fluxo_disciplina_individual` ao `plano_ensino.py`. Em vez de pedir dados de um curso, o sistema pergunta apenas o nome da disciplina, a área do conhecimento, a carga horária (por exemplo, `40h`), as metodologias e avaliações em um seletor múltiplo e **a quantidade de unidades ou tópicos centrais** que a matéria deve contemplar.

Nos planos de cursos inteiros, o conteúdo programático de cada matéria costumava ser mais sintético porque o modelo precisava detalhar várias disciplinas em sequência. Na disciplina individual, como o foco está concentrado em uma única matéria, ajustei o prompt do `gerar_plano_disciplina_individual_ia` para exigir um **conteúdo programático hierárquico clássico**, numerando cada unidade central e seus respectivos subtópicos aninhados:

- `1. Fundamentos e Arquitetura de Sistemas Distribuídos`
  - `1.1 Evolução histórica dos monólitos à computação em nuvem`
  - `1.2 Falácias da computação distribuída e teorema CAP`
  - `1.3 Padrões de comunicação síncrona (REST, gRPC) e assíncrona (Mensageria)`
- `2. Modelagem de Dados e Consistência Eventual`
  - `2.1 Bancos de dados poliglotas e desnormalização`
  - `2.2 Padrão Saga e transações distribuídas em duas fases`

Para não duplicar tabelas nem quebrar as chaves estrangeiras e consultas com `JOIN` no `academico_db.py`, tomei uma decisão pragmática de modelagem: quando gero uma disciplina individual, o código cria uma "casca" de plano na tabela `planos_ensino` marcada com `tipo='individual'` (onde `nome_curso` recebe o nome da própria disciplina) e vincula a matéria como item único em `plano_disciplina`. Assim, o `ON DELETE CASCADE`, o catálogo unificado e o vínculo com apostilas funcionaram sem mudar o esquema relacional.

Porém, na hora de exportar uma disciplina avulsa, usar o exportador de cursos inteiros gerava capa de pós-graduação e tabela de grade curricular para uma única matéria. Abri o `plano_exportador.py` e escrevi três exportadores dedicados (`exportar_disciplina_individual_pdf`, `exportar_disciplina_individual_docx` e `exportar_disciplina_individual_markdown`), desenhados para produzir um documento limpo, indo direto ao cabeçalho da disciplina, ementa, objetivos, unidades hierárquicas (`1.`, `1.1`, `1.2`) e bibliografia ABNT.

---

## O bug do `type 'dict' is not supported` no SQLite e os JSONs de 0 bytes

Foi exatamente testando a gravação das primeiras disciplinas individuais que recebi um erro seco ao final da chamada da API do Gemini:

```text
sqlite3.InterfaceError: Error binding parameter 6 - probably unsupported type.
Error binding parameter 6: type 'dict' is not supported
```

Inspecionando o payload retornado pela IA para o parâmetro 6 da query de inserção em `plano_disciplina` — correspondente à coluna `objetivo` —, entendi a causa.

Nos prompts antigos, o modelo costumava devolver `objetivo` como uma string corrida. Mas, ao pedir um detalhamento pedagógico maior com objetivo geral e objetivos específicos separados, o JSON retornado pela IA passou a entregar um dicionário estruturado:

```json
{
  "geral": "Capacitar o estudante na arquitetura e implementação de pipelines RAG...",
  "especificos": [
    "Compreender o funcionamento de embeddings vetoriais e busca por cosseno",
    "Implementar rotinas de ingestão e limpeza de documentos em Markdown"
  ]
}
```

O driver `sqlite3` do Python aceita `str`, `int`, `float`, `bytes` e `None`, mas recusa qualquer `dict` ou `list` que não tenha passado por `json.dumps()` antes do `conn.execute()`. Como eu já serializava `conteudo_programatico` e as bibliografias, mas assumia que `objetivo` era sempre string simples, o banco travava quando o modelo devolvia um objeto aninhado.

Refatorei o `salvar_plano`, o `editar_plano_metadados` e o `carregar_plano` no `academico_db.py`, além dos exportadores PDF/DOCX/MD, para tratar `objetivo` de forma polimórfica:

```python
objetivo_val = d.get("objetivo", "")
if isinstance(objetivo_val, dict):
    objetivo_val = json.dumps(objetivo_val, ensure_ascii=False)
```

Na leitura e exportação, se a string começa com `{`, o sistema faz o `json.loads()` seguro e formata o **Objetivo Geral** seguido da lista de **Objetivos Específicos**; se for texto plano legado, exibe direto sem quebrar.

No mesmo dia, blindei outro ponto frágil: se um arquivo JSON auxiliar (`areas_conhecimento.json`) estivesse vazio (`0 bytes`) ou se `input_dir` apontasse para a raiz por falta de variável no `.env`, o sistema levantava `json.decoder.JSONDecodeError` na inicialização. Adicionei fallbacks dinâmicos para `data/input/` no `main.py`, `classificador.py`, `indexador_vetorial.py` e `utils.py`, retornando `{}` para arquivos vazios, e incluí `fuzzywuzzy`, `python-Levenshtein` e `plotext` nos requisitos para estabilizar a busca aproximada e os gráficos no terminal.

---

## O nascimento do `escritor_academico.py` e a escrita de livros em ciclos

Se a `1.5.4` resolveu os planos avulsos, a grande estreia arquitetural daquela semana aconteceu na `1.5.3` com a criação do módulo **`src/modules/escritor_academico.py`**.

Meu objetivo era construir um motor capaz de pegar qualquer disciplina — do catálogo base ou dos planos de ensino — e redigir um **livro didático ou apostila completa de pós-graduação**, seguindo os princípios de **Andragogia** e as normas **ABNT NBR 6023 e NBR 10520**.

Como chamadas únicas (*single-shot*) não escrevem livros, desenhei o módulo como uma máquina de estados em **seis etapas**, apoiada em duas novas tabelas no `academico.db`: `materiais_academicos` (metadados da obra, ementa base, sumário JSON e fontes selecionadas) e `material_secoes` (cada capítulo ou seção individualmente, com seu `conteudo_md`, `inventario_fontes`, `status_escrita` e contagem de tokens).

### Grounding duplo combinando o Acervo Local com a Google Books API

Antes de escrever uma linha do livro, o sistema precisa saber em quais obras reais vai se apoiar. Na Etapa 3 do fluxo, conectei duas fontes de embasamento (*grounding*):

1. **Acervo Local (Gerenciador de Conhecimento)** — o sistema faz um `LEFT JOIN` entre `conhecimento_materiais` e `conhecimento_referencias` e abre um menu de múltipla seleção no terminal para eu marcar quais e-books, teses ou artigos do meu acervo entrarão no contexto.
2. **Google Books API (`src/core/google_books_utils.py`)** — criei um integrador para a API oficial do Google Books (`https://www.googleapis.com/books/v1/volumes` com `GOOGLE_BOOKS_API_KEY`). O sistema lê a bibliografia da disciplina, sugere os termos de busca e permite pesquisar múltiplos termos separados por vírgula, retornando título, autores, editora, ano, ISBN-13 e descrição para eu marcar com `Espaço` quais obras reais devem compor o referencial do livro.

### Aprovação do sumário e persistência imediata seção por seção

Com a disciplina, a unidade temática e as fontes escolhidas, o `escritor_academico.py` gera primeiro uma proposta de **Sumário Pedagógico Estruturado** em JSON (`_gerar_sumario_ia`, com 4 a 8 capítulos e 3 a 5 subtópicos cada).

O terminal renderiza esse sumário numa tabela Rich para revisão. Só depois que aprovo o sumário é que o sistema grava o registro em `materiais_academicos` (`status='em_andamento'`) e pré-popula `material_secoes` com `status_escrita='pendente'`.

Em seguida entra o loop de escrita iterativa (`_executar_ciclos_escrita`). Para cada seção pendente:

1. O sistema monta o prompt injetando os subtópicos obrigatórios, as fontes de grounding (com suas chaves ABNT) e o resumo do que já foi tratado nas seções anteriores para manter coesão.
2. O prompt exige estrutura completa de livro universitário: objetivos de aprendizagem, desenvolvimento conceitual denso com citações diretas, indiretas e regra de `apud`, quadros de destaque (`> **Atenção Prática**` e `> **Nota / Saiba Mais**`), tabela comparativa em Markdown, estudo de caso prático, mini-glossário técnico e um bloco `---INVENTARIO_FONTES---` mapeando de qual obra saiu cada conceito.
3. Assim que a seção termina de ser gerada, **ela é salva e commitada imediatamente no SQLite** (`status_escrita='concluido'`).

Essa persistência imediata seção por seção trouxe resiliência real ao processo. Se a conexão cair no capítulo 6 ou se eu precisar fechar o notebook, nada do que foi escrito nos capítulos 1 a 5 se perde. Quando volto ao menu `Meus Materiais`, o sistema identifica quais seções já estão com `status_escrita='concluido'` e retoma a geração do capítulo 6 em diante, compilando ao final o livro inteiro para Markdown (`.md`) e Microsoft Word (`.docx`) pelo `material_exportador.py`.

---

## Quadro resumo das versões 1.5.3 e 1.5.4

| Módulo / Arquivo | O que entrou nas versões `1.5.3` e `1.5.4` | Impacto prático no uso diário |
|---|---|---|
| `academico_db.py` (`listar_disciplinas_plano_ia`) | Catálogo paginado com `JOIN` entre `plano_disciplina` e `planos_ensino` e filtros combináveis | Disciplinas geradas pela IA ficaram pesquisáveis e reaproveitáveis fora de seus cursos |
| `plano_ensino.py` (`fluxo_disciplina_individual`) | Geração de planos de ensino para disciplinas avulsas (`tipo='individual'`) | Criação rápida de matérias isoladas com subtópicos em numeração hierárquica (`1.`, `1.1`, `1.2`) |
| `plano_exportador.py` | Exportadores exclusivos PDF, DOCX e Markdown para disciplinas individuais | Documentos limpos focados em uma única matéria, sem capas de curso completo |
| Tratamento de `objetivo` e JSONs vazios | Serialização polimórfica (`json.dumps` para `dict`) e fallback `{}` para JSONs de 0 bytes | Fim do `sqlite3.InterfaceError: type 'dict' is not supported` e de quebras de boot |
| `escritor_academico.py` + `google_books_utils.py` | Geração iterativa de livros didáticos com sumário pré-aprovado, grounding duplo e persistência por seção | Produção de apostilas completas em `.md` e `.docx` com citações ABNT e retomada automática |

Ter o escritor de livros didáticos funcionando em ciclos abriu o caminho para o passo seguinte do projeto: estruturar **artigos científicos completos (papers)**, traduzir materiais em inglês do acervo e implementar busca semântica vetorial com embeddings na versão `1.6.0`.
