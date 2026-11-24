---
title: "Competências CHA, eBooks comerciais de cursos, base de legislação educacional e réplica na nuvem Turso"
date: 2026-09-02
status: Publicado
series: Magnetares Knowledge
seriesOrder: 6
project: 13
tags: [Magnetares Knowledge, Python, Turso, libSQL, Legislação Educacional, Design Instrucional]
readTime: 8 min
excerpt: "A inclusão da matriz de Competências, Habilidades e Atitudes (CHA) nos planos de ensino, o gerador de eBooks para lançamento de cursos, o consultor jurídico sobre normas do MEC e a sincronização das 27 tabelas SQLite com a nuvem Turso."
---

Na última semana de agosto de 2026, coloquei o indexador vetorial do **Magnetares Knowledge** para processar um lote de tratados jurídicos e livros clássicos de computação que passavam de 900 páginas cada um. Cada livro gerava entre 220 e 300 blocos (*chunks*) de texto para enviar ao modelo `gemini-embedding-001`.

Foi aí que esbarrei num problema clássico de operação em lote. Quando a conexão oscilava ou a API devolvia um erro transitório no chunk 180 de um livro de 250 blocos, aconteciam duas coisas ruins no código antigo: primeiro, se o arquivo `.md` vinha da nuvem (Bunny CDN), o script precisava baixar os vários megabytes do Markdown tudo de novo na tentativa seguinte; segundo, a rotina de checagem olhava apenas se a obra já tinha *algum* registro na tabela `conhecimento_embeddings` — ou ela pulava o livro achando que estava 100% pronto (deixando os últimos 70 chunks invisíveis para o RAG), ou apagava os 180 vetores já gravados e cobrava tudo do zero.

Antes de abrir novas frentes funcionais no sistema, tirei o dia 26 de agosto (`v1.8.1` e `v1.8.2`) para consertar a fundação do indexador.

---

## Retomada por chunk no RAG e sincronização de referências

A solução para os livros gigantes foi abandonar a lógica de "tudo ou nada" e implementar a **indexação incremental por índice de chunk** (`obter_indices_embeddings_conhecimento`).

Sempre que o indexador fatia um livro em $N$ blocos, ele consulta no SQLite exatamente quais `chunk_index` daquele `id_conhecimento` já possuem o vetor `embedding` gravado em BLOB. Se os índices `0` a `179` já estão lá, ele filtra a lista em memória e envia para a API do Gemini apenas o lote do `180` ao `249`.

Para evitar downloads repetidos do mesmo Markdown durante uma reindexação, criei um cache local em `data/cache/markdown/` aliado a três tentativas de download com timeout estendido. Também adicionei uma rota de contingência: quando a Pull Zone pública da CDN atrasa ou falha ao servir um arquivo recém-enviado, o cliente faz fallback automático para a rota privada da Storage API da Bunny, baixando o arquivo direto do storage.

No dia seguinte (`v1.8.3`, em 27 de agosto), resolvi outra ponta solta da manutenção do acervo. À medida que eu corrigia metadados de livros no Gerenciador de Conhecimento — adicionando um ISBN que faltava, corrigindo a grafia de um sobrenome ou atualizando o ano de edição —, os artigos científicos e materiais didáticos que eu havia gerado semanas antes continuavam com o snapshot antigo da referência congelado no banco.

Criei então um verificador de integridade bibliográfica dentro de **Minhas Pesquisas** e **Meus Materiais** (registrado na tabela `relatorios_referencias_sync`). Com um comando, o sistema compara o snapshot das fontes salvas em cada artigo com o estado atual do acervo local, mostra um *diff* claro no terminal apontando o que mudou e permite atualizar a seção de referências ABNT sem precisar reescrever uma única linha do conteúdo didático ou científico.

---

## A tríade CHA nos planos de ensino e o gerador de eBooks comerciais

Com o núcleo de dados estável, voltei os olhos para o design instrucional dos cursos de pós-graduação e formação técnica. Até a versão `v1.8.3`, os planos de ensino gerados pelo **Magnetares Knowledge** traziam ementa, objetivos (geral e específicos), conteúdo programático fatiado em unidades, metodologia, critérios de avaliação e bibliografia ABNT.

Funcionava bem para a secretaria acadêmica, mas faltava um pilar que toda diretriz curricular moderna do MEC e todo projeto pedagógico orientado ao mercado exigem: a matriz **CHA (Competências, Habilidades e Atitudes)**.

Em 31 de agosto (`v1.8.4`), rodei uma migração automática na tabela `plano_disciplina` adicionando as três colunas (`competencias`, `habilidades` e `atitudes`) e reformulei o ciclo de geração por IA tanto para planos de ensino completos quanto para disciplinas avulsas:

- **Competências (Saber Mobilizar)** descreve a capacidade de articular conceitos teóricos daquela disciplina para analisar e resolver problemas complexos da área.
- **Habilidades (Saber Fazer)** lista as entregas práticas, ferramentas, cálculos, códigos ou instrumentos técnicos que o estudante executa com as próprias mãos.
- **Atitudes (Saber Ser e Conviver)** define a postura ética, o rigor analítico, a responsabilidade legal e o comportamento profissional diante de dilemas reais.

Atualizei todos os exportadores (PDF, DOCX, Markdown, CSV e JSON) e os painéis de edição no terminal para exibir e permitir ajustar o CHA de cada disciplina.

Ter a matriz curricular enriquecida com ementas densas e a tríade CHA abriu espaço, no dia seguinte (`v1.8.5`, em 1º de setembro), para uma ferramenta que eu queria há meses: transformar um plano de ensino técnico em um **eBook Comercial de Lançamento de Curso** (`ebook_comercial.py`).

Quem trabalha com educação superior ou cursos livres sabe o trabalho que dá traduzir um Projeto Pedagógico de Curso (escrito em linguagem formal de regulação) para um material rico de marketing educacional — aquele guia em PDF ou DOCX que a instituição oferece como *lead magnet* para explicar a quem o curso se destina, como está o mercado de trabalho e o que o aluno vai aprender na prática.

Desenhei o `ebook_comercial.py` com persistência na tabela `ebooks_comerciais` para ler todos os dados do curso direto do SQLite e orquestrar uma linha editorial em **seis capítulos fixos**:

| Capítulo | Foco Editorial no `ebook_comercial.py` | Origem dos Dados no Banco |
|---|---|---|
| **1. Cenário e Oportunidade** | Dores reais do mercado de trabalho, escassez de especialistas e urgência de atualização | Justificativa de mercado e área do conhecimento |
| **2. Perfil e Momento de Carreira** | Para quem a formação foi desenhada e quais transições de carreira ela viabiliza | Público-alvo e objetivos gerais |
| **3. Proposta de Valor e Método** | Como funciona a metodologia andragógica e a aplicação prática dos estudos | Metodologias e avaliações detalhadas |
| **4. Mergulho na Matriz e CHA** | Tradução de cada disciplina e da matriz de Competências, Habilidades e Atitudes em ganhos reais | `plano_disciplina` (ementas + `competencias`, `habilidades`, `atitudes`) |
| **5. Impacto na Carreira** | Portfólio prático, cargos correlatos e diferenciais competitivos no dia a dia | Síntese transversal das unidades programáticas |
| **6. Próximo Passo** | Resumo da jornada e chamada para ação (*Call to Action*) | Promessa central e parâmetros da campanha |

Na primeira versão do exportador visual (`v1.8.5`), eu havia tentado paginar o layout A4 contando caracteres por bloco, o que gerava quebras artificiais no meio de raciocínios ou deixava espaços em branco enormes no fim da página. No dia seguinte (`v1.8.6`), joguei fora a quebra por contagem de caracteres e reescrevi o layout para fluir de maneira contínua e orgânica entre as páginas A4. Também adicionei no cadastro das instituições o suporte a duas versões de marca — **Logo Positiva** (para fundos claros) e **Logo Negativa** (para capas e cabeçalhos escuros) —, selecionadas automaticamente conforme o tema da capa do eBook ou da Landing Page.

---

## Consultor jurídico e base isolada de legislação educacional

Enquanto testava a geração de cursos e planos de ensino para diferentes faculdades, outra dor recorrente apareceu: toda decisão sobre carga horária mínima, percentual de atividades práticas, oferta em EAD, estágio supervisionado ou credenciamento esbarra em dezenas de normas do MEC e do Conselho Nacional de Educação (CNE).

Eu não queria misturar o texto da **LDB (Lei nº 9.394/1996)**, de decretos federais e de portarias normativas do MEC na mesma tabela `conhecimento_embeddings` onde ficavam os livros de Python, administração ou psicologia. Se um livro didático de gestão escolar comentasse uma portaria antiga revogada, o RAG jurídico não podia confundir o comentário de um autor com o texto frio da norma em vigor.

Por isso, na versão `v1.8.6`, construí o módulo `legislacao.py` como uma **vertical 100% isolada** dentro do banco de dados, com tabelas próprias para documentos normativos, chunks (`CHUNK_SIZE = 1500`, `CHUNK_OVERLAP = 200`), vetores de embedding, histórico de consultas e relatórios institucionais.

Cada norma cadastrada (seja por upload de PDF/DOCX/TXT ou download direto via URL pública) é classificada por tipo (`Lei`, `Decreto`, `Portaria`, `Resolução`, `Parecer`, `Deliberação`, `Nota Técnica`), número, data, órgão emissor e status de vigência. Como o módulo permite baixar atos normativos informando uma URL na linha de comando, aproveitei para blindar o downloader contra SSRF (*Server-Side Request Forgery*):

```python
def _url_publica_segura(url: str) -> bool:
    """Aceita apenas HTTP(S) público e bloqueia destinos locais ou redes privadas."""
    parsed = urlparse(url.strip())
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        return False
    try:
        enderecos = socket.getaddrinfo(parsed.hostname, None)
        for endereco in enderecos:
            ip = ipaddress.ip_address(endereco[4][0])
            if (
                ip.is_private
                or ip.is_loopback
                or ip.is_link_local
                or ip.is_reserved
                or ip.is_multicast
            ):
                return False
    except socket.gaierror:
        return False
    return True
```

Quando faço uma pergunta regulatória no consultor de legislação — vinculada a uma instituição específica —, o sistema busca por similaridade de cosseno apenas nos embeddings normativos ativos, injeta os dispositivos numerados (`[FONTE 1]`, `[FONTE 2]...`) e exige que o parecer aponte artigo, parágrafo, inciso e número da norma em cada afirmação, exportando ao final um parecer formal em Markdown ou Word (`.docx`) com o inventário exato dos trechos legais citados.

---

## Replicando 27 tabelas SQLite na nuvem Turso com HTTP Pipeline v2

Àquela altura, no dia 1º de setembro de 2026 (`v1.8.6`), o banco principal do **Magnetares Knowledge** já somava **27 tabelas relacionais** e dezenas de índices. Ali dentro estavam mais de 1.650 disciplinas catalogadas, dezenas de cursos e matrizes curriculares, planos de ensino com CHA, livros didáticos inteiros, artigos científicos, propostas de pesquisa, fichamentos, eBooks comerciais, a base de legislação educacional e milhares de vetores de embedding em formato binário.

Eu já tinha a rotina de backup local a quente (`sqlite3.backup`) que escrevi na `v1.5.2`, mas se o meu SSD queimasse ou se eu quisesse alternar do desktop para o notebook no meio de uma viagem, depender de copiar um arquivo `.db` manualmente era pedir para ter dor de cabeça.

Escolhi o **Turso (`libSQL`)** como nuvem de replicação remota por ser baseado nativamente na arquitetura do SQLite. Em vez de adicionar dependências nativas pesadas em C/Rust que complicariam o empacotamento multiplataforma mais tarde, implementei o sincronizador falando diretamente com o protocolo **HTTP Pipeline v2** do Turso (`v2/pipeline`).

Sincronizar um banco SQLite grande via HTTP exige cuidado com dois limites práticos: o tamanho do payload de cada requisição (especialmente quando há colunas de texto longo e BLOBs de embeddings) e a ordem das chaves estrangeiras durante a reconstrução. Resolvi isso estruturando o pipeline em lotes controlados (`TURSO_BATCH_SIZE = 250`):

1. **No Push (Backup Local → Turso Cloud):** O sincronizador lê o schema completo (`sqlite_master`), desativa temporariamente a checagem de chaves estrangeiras na sessão remota (`PRAGMA foreign_keys = OFF`), recria as 27 tabelas e dispara os `INSERT` parametrizados em lotes de 250 linhas por requisição HTTP, com controle de transação e retentativas automáticas em caso de falha de rede. Ao final, recria todos os índices e reativa as chaves estrangeiras.
2. **No Pull (Restauração Turso Cloud → Local):** Eu nunca sobrescrevo o banco local em uso durante o download. O sistema primeiro tira um snapshot preventivo do banco atual em `data/backup/`, cria um arquivo SQLite temporário no disco, baixa o schema e os lotes de 250 registros da nuvem Turso para dentro desse banco temporário e roda `PRAGMA integrity_check`. Só se o SQLite confirmar `ok` na checagem de integridade física é que o Python faz a substituição atômica do arquivo principal.

Adicionei também um painel de diagnóstico direto na TUI que mede a latência em milissegundos até a instância do Turso, exibe a versão remota do `libSQL`, compara a contagem de registros entre o disco local e a nuvem e permite configurar `TURSO_DATABASE_URL` e `TURSO_AUTH_TOKEN` sem abrir arquivo de texto.

Com os dados replicados na nuvem e toda a esteira de geração acadêmica, jurídica e comercial rodando, senti falta de um ambiente único para navegar e editar toda essa produção sem ficar entrando e saindo de submenus. No próximo post, mostro como construí o exportador científico no padrão OJS/SciELO, o Workspace Editorial inspirado no Ekphos dentro do terminal e as Trilhas de Aprendizagem interativas.
