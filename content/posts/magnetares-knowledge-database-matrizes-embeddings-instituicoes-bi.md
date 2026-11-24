---
title: "Matrizes curriculares sem repetição, busca vetorial entre áreas e o filtro por produtoras e instituições"
date: 2026-07-30
status: Publicado
series: Magnetares Knowledge
seriesOrder: 2
project: 13
tags: [Magnetares Knowledge, Python, SQLite, Embeddings, Curadoria Acadêmica, BI]
readTime: 8 min
excerpt: "Da geração de cursos em lote ao problema das grades parecidas. Como usei embeddings semânticos para cruzar áreas primárias e secundárias, criei travas de integridade contra duplicatas e adicionei o controle multi-instituição com filtro de produtoras e BI no terminal."
---

Depois de transformar o banco SQLite (`academico.db`) na única fonte da verdade do **Magnetares Knowledge**, o trabalho de montagem de cursos de pós-graduação ganhou três modos de operação: o **Gerador Automático** (em que a IA sugere novos títulos de cursos para uma área), o **Gerador Manual** (para criar um curso específico sob medida) e o **Gerador em Lote** (onde passo uma lista de 20 ou 30 títulos de uma vez para o sistema estruturar as matrizes em sequência).

Nos primeiros lotes que rodei com cursos tradicionais — como *Direito Civil e Processual Civil* ou *Gestão de Pessoas* —, as grades curriculares saíram redondas.

O problema apareceu quando comecei a pedir cursos multidisciplinares.

Pedi ao sistema que montasse uma pós-graduação em **Inteligência Artificial Aplicada à Saúde** e outra em **Direito do Agronegócio e Sustentabilidade**. Quando abri as grades geradas para revisar, levei um banho de água fria. O primeiro curso tinha disciplinas ótimas de algoritmos, redes neurais e ciência de dados, mas absolutamente nenhuma disciplina da área médica ou de gestão hospitalar. O segundo tinha nove disciplinas de Direito puro e ignorava completamente gestão rural, legislação ambiental ou economia do agronegócio.

O defeito não estava no modelo de linguagem; estava na gaiola que eu mesmo havia construído no código.

---

## O gargalo das áreas rígidas e o pipeline de três etapas

Na primeira versão do gerador, o fluxo funcionava com uma viseira estreita. Antes de escolher as disciplinas, o sistema associava o curso a **uma única área do conhecimento** do catálogo. Se *Inteligência Artificial Aplicada à Saúde* caísse na gaveta de *Tecnologia da Informação*, o script filtrava o banco SQLite trazendo apenas as disciplinas daquela gaveta. As disciplinas de *Ciências da Saúde* sequer chegavam ao prompt de montagem.

Para piorar, eu não podia simplesmente enviar todas as 1.650 disciplinas do catálogo em toda chamada da API. Além de encarecer cada geração em lote e poluir o contexto, quando você joga 1.650 opções de uma vez para um LLM escolher apenas 9, ele tende a viciar nas disciplinas que aparecem no topo da lista ou a inventar IDs que não existem.

Entre as versões `1.2.0` e `1.4.0` (refinadas até julho de 2026), reescrevi o coração do módulo `src/core/gerador_utils.py` dividindo o problema em um pipeline de três etapas combinando **área primária + área secundária**, *fuzzy matching* lexical e **busca vetorial por embeddings**.

### Etapa 1 — Decomposição em Área Primária, Secundária e Tópicos

Em vez de pedir a grade direto, a função `analisar_curso()` faz uma chamada rápida e barata ao Gemini pedindo três coisas em JSON: qual é a **Área Primária** do curso, qual é a **Área Secundária** complementar e uma lista de **10 a 20 tópicos específicos** que aquele currículo precisa cobrir.

Logo nos primeiros testes dessa etapa, esbarrei em um detalhe chato: mesmo recebendo a lista oficial de áreas no prompt, o modelo às vezes devolvia `"Ciências Agrárias e Ambientais"` quando o nome gravado no banco era `"Ciências Agrárias"`, ou trocava um acento, fazendo a comparação exata (`==`) falhar e descartar a área inteira. Resolvi isso em `gerador_utils.py` adicionando busca aproximada com `fuzzywuzzy` e `python-Levenshtein`:

```python
def _encontrar_melhor_match_area(nome_area_ia: str, areas_disponiveis: list[dict]) -> dict | None:
    """Encontra a área mais próxima no catálogo usando fuzzy matching."""
    nomes_disponiveis = {a["nome"]: a for a in areas_disponiveis}
    melhor_match = fuzzy_process.extractOne(nome_area_ia, nomes_disponiveis.keys())

    if melhor_match and melhor_match[1] > 80:  # Limiar de 80% de confiança
        return nomes_disponiveis[melhor_match[0]]
    return None
```

Com esse ajuste simples, nenhuma geração em lote voltou a ser abortada por divergência de uma palavra no nome da área.

### Etapa 2 — Pool híbrido e grafo semântico vetorial

Uma vez identificadas as duas áreas (por exemplo, *Tecnologia da Informação* e *Saúde*), o sistema une as disciplinas de ambas em um único *pool* sem duplicar IDs. Mas e quando uma disciplina perfeita para o curso foi classificada originalmente em uma terceira área — como *Bioética e Proteção de Dados* dentro de *Direito*?

Foi para furar essa parede que implementei o **Motor de Grafo Semântico** (`indexador_vetorial.py`). Criei a tabela `disciplinas_embeddings` no SQLite e indexei o catálogo inteiro convertendo o nome e as unidades programáticas de cada uma das 1.650 disciplinas em vetores densos via API de embeddings. Na hora de montar essa indexação, tive que corrigir um bug de tipagem porque parte do catálogo legado guardava o campo `unidades` como uma lista de strings simples e outra parte como objetos estruturados, o que derrubava o serializador antes de gerar o vetor.

Com os vetores salvos e o ranqueador local `_score_cobertura_topicos()` cruzando interseção de vocabulário e similaridade de sequência (`SequenceMatcher`), a Etapa 2 seleciona apenas as 45 a 60 disciplinas mais aderentes aos tópicos do curso, garantindo que *Docência do Ensino Superior* entre sempre ao final do *pool*.

### Etapa 3 — Montagem restrita e verificação de IDs

Na terceira etapa (`montar_curso()`), o modelo recebe apenas aquela lista enxuta de candidatas pré-aprovadas, escolhe as 9 ou 10 disciplinas que fecham exatamente a carga horária pedida e redige os textos institucionais do projeto pedagógico. Ao receber o JSON de volta, o código confere ID por ID contra o conjunto de candidatos enviados para impedir qualquer alucinação de código inexistente.

---

## A dor de cabeça das matrizes gêmeas e a trava por MD5

Resolver a qualidade multidisciplinar de um curso isolado abriu espaço para o segundo problema prático da rotina em lote.

Quando você gera 80 ou 100 cursos em uma mesma grande área — digamos, *Educação* ou *Engenharia de Produção* —, cursos com títulos parecidos (como *Gestão Escolar e Coordenação Pedagógica* e *Administração e Liderança Educacional*) começam a disputar exatamente as mesmas disciplinas mais fortes do catálogo. Sem uma trava no banco de dados, você corre o risco de aprovar dois cursos com nomes comerciais diferentes que possuem **exatamente a mesma grade curricular**, o que é inaceitável do ponto de vista acadêmico e regulatório.

O oposto também acontecia: rodar um lote semanas depois e tentar cadastrar um curso com o mesmo nome de um curso já existente, mas com uma matriz diferente.

Para blindar o banco contra esses dois cenários, implementei a função `verificar_integridade_global()` em `src/core/gerador_utils.py`, que roda antes de qualquer persistência:

```python
def verificar_integridade_global(nome_novo: str, disciplinas_novas: list[dict], id_instituicao: str = None) -> tuple[bool, str]:
    ids_novos = sorted([str(d.get("id")) for d in disciplinas_novas if d.get("id")])
    matriz_hash_nova = hashlib.md5("".join(ids_novos).encode()).hexdigest()

    # 1. Mesmo nome no banco (verifica se a matriz é igual ou conflitante)
    # ...
    # 2. Nomes diferentes tentando usar exatamente o mesmo conjunto de disciplinas
    grades_existentes = academico_db.obter_grades_existentes(id_instituicao)
    set_novo = set(ids_novos)
    for grade_set in grades_existentes:
        if set_novo == grade_set and len(set_novo) > 0:
            return True, "CONFLITO: Esta MATRIZ EXATA já está sendo usada por outro curso no banco de dados."

    return False, "OK"
```

Ao ordenar os UUIDs das disciplinas e calcular um hash MD5 (além de comparar os conjuntos `set(ids_novos)`), o **Magnetares Knowledge** passou a barrar instantaneamente qualquer matriz clonada, avisando no terminal qual curso já utilizava aquela combinação de disciplinas.

---

## Governança multi-instituição e o filtro por produtoras na v1.5.0

Até meados de julho, o sistema tratava todo o catálogo de 1.650 disciplinas como se pertencesse a uma única instituição. Na prática do trabalho com ensino superior, porém, o cenário mudou: passei a organizar cursos para **diferentes faculdades e instituições de ensino**, e cada instituição possuía contratos específicos que só permitiam utilizar disciplinas de determinadas **produtoras de conteúdo** (`produtora`).

Se a Faculdade A só tem direito contratual sobre o acervo das produtoras `X` e `Y`, o gerador de cursos jamais pode incluir na matriz dela uma disciplina da produtora `Z`, por melhor que seja a compatibilidade semântica daquela disciplina com o tema do curso.

No final de julho de 2026, estruturei a versão `1.5.0` para transformar o projeto em uma plataforma multi-instituição:

1. **Tabela `instituicoes` e vínculo relacional:** Adicionei o cadastro de instituições (`instituicoes_ui.py`) guardando a lista de `produtoras_permitidas` de cada faculdade, além da chave estrangeira `id_instituicao` e `produtoras_usadas` na tabela `cursos`.
2. **Corte do espaço de busca na origem:** Antes mesmo de rodar a Etapa 2 de matching de candidatos ou de criar planos de ensino do zero, o sistema filtra o catálogo SQLite mantendo apenas as disciplinas cujas produtoras fazem parte da lista autorizada para a instituição ativa na sessão.
3. **Evolução do schema de Unidades (`v1.3`):** Atualizei as tabelas `disciplinas`, `curso_disciplina` e `plano_disciplina` com as colunas `produtora` e `unidades_json`, permitindo armazenar e exportar para Excel, PDF, DOCX e Markdown não apenas os títulos das unidades, mas objetos completos com `nome` e `conteudo_programatico`.
4. **Sincronização Smart do Delta:** Melhorei a opção *"Sincronizar Base (JSON ↔ Banco Unificado)"* no hub central para detectar automaticamente apenas as disciplinas novas que entraram no arquivo de catálogo e disparar a classificação por IA somente sobre esse *delta*, sem reprocessar o que já estava pronto.

---

## Dois bugs reais no terminal e o painel de BI das disciplinas

Nenhuma mudança desse tamanho em um esquema relacional passa sem quebrar alguma coisa no meio do caminho. Dois problemas me fizeram perder boas horas depurando a versão `1.5.0` e a `1.5.1`.

O primeiro aconteceu na janela flutuante do `curses`. Quando abri a tela para selecionar quais produtoras uma instituição podia consumir, a lista de opções ultrapassou a altura do meu terminal. Como a primeira versão do `_menu_retro_curses` tentava desenhar todas as linhas de uma vez sem paginação, o `stdscr.addstr()` tentou escrever fora dos limites da tela e derrubou a TUI com `curses.error: addwstr() returned ERR`. Tive que implementar um cálculo de janela deslizante (*scroll offset* baseado em `max_opcoes_visiveis = box_h - 5`) para que a lista rolasse suavemente conforme o cursor descia.

O segundo bug apareceu no **Explorador de Catálogo** (`explorador_catalogo.py`) logo após adicionar a coluna `produtora` na tabela do SQLite. O explorador começou a quebrar ao abrir a ficha de uma disciplina. A causa era uma armadilha clássica do driver nativo `sqlite3` do Python: as consultas configuradas com `conn.row_factory = sqlite3.Row` retornam objetos `Row` que permitem acesso por chave (`row["nome"]`), mas **não possuem o método `.get()`** de um dicionário Python padrão. Ao chamar `disciplina.get("produtora", "N/A")` diretamente sobre o retorno da query sem convertê-lo antes com `dict(row)`, o código levantava `AttributeError: 'sqlite3.Row' object has no attribute 'get'`.

Corrigido o desempacotamento para `dict` e ajustado o fluxo de cursos importados na `1.5.1` (permitindo inclusive ajustar a produtora por disciplina antes de consolidar um curso no console SQL), fechei o ciclo construindo um painel de **Business Intelligence (BI)** diretamente no terminal.

Esse dashboard passou a cruzar todas as matrizes geradas por instituição e listar o **Top 15 das disciplinas mais reutilizadas** no acervo. Bater o olho nesse ranking revelou algo valioso: enquanto algumas disciplinas coringas (como *Metodologia da Pesquisa* e *Gestão de Projetos*) apareciam em dezenas de cursos, centenas de disciplinas excelentes e superespecíficas estavam paradas no catálogo com zero utilizações — um diagnóstico imediato que passou a guiar quais novos cursos eu deveria criar nos lotes seguintes.

---

## Resumo da evolução entre as versões 1.2.0 e 1.5.1

| Versão | Foco técnico | O que mudou na prática |
|---|---|---|
| `1.2.0` | Grafo Semântico e Travas | Indexação vetorial (`disciplinas_embeddings`), auditoria de custos Gemini e bloqueio de matrizes duplicadas via hash MD5 |
| `1.4.0` | Cursos Multidisciplinares | Pipeline em 3 etapas com Área Primária + Área Secundária, *fuzzy matching* (`fuzzywuzzy`) e documentação dos 14 módulos |
| `1.5.0` | Multi-Instituição e BI | Tabela `instituicoes`, filtro global por `produtora`, schema de unidades `v1.3`, scroll nos menus `curses` e ranking Top 15 no BI |
| `1.5.1` | Importação e Rastreabilidade | Ajuste de produtora por disciplina na importação de planos e filtro dedicado de cursos importados no console SQL |

Com as matrizes curriculares íntegras, multidisciplinares e respeitando as regras de cada instituição, o passo seguinte se desenhou sozinho: sair da grade macro do curso e mergulhar no detalhamento profundo de cada disciplina — gerando planos de ensino completos com ementas, bibliografias reais verificadas e livros didáticos inteiros. É o que veremos no terceiro artigo desta série.
