---
title: "Construindo o gerenciador de conhecimento RAG com MarkItDown, Bunny CDN e assinatura de URLs"
date: 2026-08-06
status: Publicado
series: Magnetares Knowledge
seriesOrder: 3
project: 13
tags: [Magnetares Knowledge, Python, RAG, MarkItDown, Bunny CDN, SQLite]
readTime: 8 min
excerpt: "Para que a IA parasse de escrever no vazio, precisei construir uma biblioteca real de livros, teses e artigos convertidos para Markdown. Como integrei o MarkItDown, o armazenamento Anycast no Bunny CDN com links assinados e destravei o lock de banco SQLite no meio do menu Curses."
---

Quando terminei a unificação do banco SQLite e o filtro de instituições na versão `1.5.1` do **Magnetares Knowledge**, achei que a geração de matrizes curriculares e planos de ensino finalmente estava redonda. O catálogo de disciplinas funcionava bem, as cargas horárias batiam e o sistema já exportava os documentos básicos. Mas bastou usar o gerador para criar três ou quatro planos de ensino de pós-graduação seguidos para notar um problema incômodo nas bibliografias e no aprofundamento teórico das ementas.

Pedir para um modelo de linguagem sugerir bibliografias e estruturar tópicos acadêmicos apoiando-se apenas nos pesos do próprio treinamento é pedir para receber respostas genéricas ou referências inventadas. O modelo conhece os autores clássicos de Ciência da Computação, Direito ou Educação, mas frequentemente mistura edições, troca o ano de publicação de um livro ou simplesmente fabrica um artigo com título plausível que nunca existiu.

Para trabalho acadêmico sério, prompt bom não substitui biblioteca. Se eu queria que o **Magnetares Knowledge** montasse planos de ensino rigorosos e me ajudasse a redigir livros didáticos, apostilas e artigos científicos, ele precisava consultar obras reais que eu mesmo curasse: meus próprios livros em PDF, teses de doutorado, dissertações de mestrado e artigos de periódicos salvos na minha máquina.

Foi assim que entrei na construção da versão `1.5.2`, entre os dias 5 e 6 de agosto, focada em três frentes: o **Gerenciador de Conhecimento (`conhecimento.py`)**, o pipeline de conversão para Markdown com **MarkItDown** e armazenamento no **Bunny CDN**, e o conserto de um *database lock* no SQLite que congelava o terminal quando eu menos esperava.

---

## Modelando uma biblioteca acadêmica no SQLite

Antes de pensar em embeddings ou busca vetorial, eu precisava de um catálogo relacional onde cada obra tivesse identidade bibliográfica completa e texto limpo extraído. Não adiantava jogar dezenas de arquivos PDF soltos numa pasta e esperar que o sistema adivinhasse quem era o autor, qual era a editora ou como citar aquilo segundo a ABNT NBR 6023.

Abri o `src/core/academico_db.py` e desenhei quatro tabelas interligadas por chaves estrangeiras com `ON DELETE CASCADE`:

- `conhecimento_materiais` — armazena os metadados da obra (`id`, `titulo`, `tipo_material` como `ebook`, `artigo`, `tese`, `dissertacao`, `tcc` ou `monografia`, `autores`, `ano`, `editora_periodico`, `volume_edicao`, `local_publicacao`, `isbn`, `issn`, `doi`), ponteiros de armazenamento (`link_storage_original` e `link_storage_markdown`) e métricas (`total_caracteres` e `total_tokens_est`).
- `conhecimento_referencias` — guarda as três variações canônicas da referência processadas no cadastro: `abnt_referencia_completa`, `abnt_citacao_autor_data` — como `(PRESSMAN, 2021)` ou `(SOMMERVILLE et al., 2019)` — e `abnt_citacao_indireta` — como `Segundo Pressman (2021)`.
- `conhecimento_tags` e `material_tag` — relação muitos-para-muitos para marcar cada obra com assuntos (`Engenharia de Software`, `NoSQL`, `Redes Neurais`) e cruzá-la com as disciplinas dos cursos.

Automatizar a montagem da referência ABNT logo na entrada (`gerar_referencia_abnt` em `conhecimento_utils.py`) me poupou muita dor de cabeça. Em vez de deixar o LLM formatar o nome dos autores de um jeito diferente a cada chamada, o código Python separa os autores por ponto e vírgula, joga o último sobrenome para caixa alta, aplica a regra de `et al.` acima de três autores e monta a string exata conforme o tipo de material. Quando a IA vai escrever um plano de ensino ou capítulo, ela já recebe a chave `abnt_citacao_autor_data` pronta.

---

## O gargalo dos PDFs de duas colunas e a entrada do MarkItDown

Com o esquema relacional pronto, veio a parte suja do trabalho: extrair texto útil de arquivos `.pdf`, `.docx`, `.doc` e `.txt` que variam de artigos de 12 páginas a livros técnicos de 900 páginas.

Modelos de linguagem estruturam melhor suas respostas quando leem Markdown limpo, onde títulos são `#` e `##`, listas são `-` e tabelas usam pipes `|`. Se você extrai o texto bruto de um PDF sem preservar hierarquia, os títulos de capítulos se misturam com o parágrafo, os cabeçalhos se repetem a cada 40 linhas e as notas de rodapé cortam frases ao meio.

Para atacar a conversão de múltiplos formatos sem escrever cinco parsers do zero, integrei o **MarkItDown**, a biblioteca da Microsoft projetada para converter documentos de escritório e PDFs em Markdown voltado para LLMs:

```python
from markitdown import MarkItDown

def converter_documento_bruto(caminho_arquivo: Path) -> tuple[str, int, int]:
    mid = MarkItDown()
    resultado = mid.convert(str(caminho_arquivo))
    conteudo_md = resultado.text_content.strip()
    
    total_caracteres = len(conteudo_md)
    total_tokens_est = int(total_caracteres / 4)
    return conteudo_md, total_caracteres, total_tokens_est
```

Para arquivos `.docx` e `.txt`, o MarkItDown funcionou de primeira, preservando níveis de `Heading` e tabelas. Mas, quando comecei a subir artigos científicos em PDF diagramados em **duas colunas** (o padrão da IEEE, ACM e de boa parte dos periódicos nacionais), bati de frente com um problema clássico de extração.

Em vários PDFs de duas colunas, a leitura bruta atravessava a página horizontalmente: lia a primeira linha da coluna da esquerda e emendava direto com a primeira linha da coluna da direita, gerando frases sem sentido e palavras cortadas por hifens órfãos (`desen- volvimento`).

No commit `ec7362c`, criei uma etapa de pós-processamento no `conhecimento_utils.py` chamada `refinar_markdown_ia`. Antes de enviar ao modelo, passo o texto pelo `mdformat` para enxugar quebras redundantes; em seguida, se a obra for grande, fatio o Markdown em blocos de `250.000` caracteres (cerca de 60 mil tokens por fatia) e aplico um prompt específico de reconstrução estrutural:

- **Proibição de resumo** — o modelo é proibido de omitir ou resumir parágrafos, atuando estritamente como normalizador de layout.
- **Desmembramento de colunas mescladas** — quando detecta linhas que perderam o sentido por fusão horizontal de duas colunas, reordena o fluxo lógico da coluna esquerda antes da direita.
- **Remoção de ruído de paginação** — limpa cabeçalhos repetitivos, numeração solta (`Page 12 of 45`) e une palavras separadas por hifenação de fim de linha.

Se um bloco falhar na API após três tentativas, o sistema mantém a fatia original bruta para nunca perder uma página sequer do livro. Mais tarde, complementei essa esteira colocando também o `PyMuPDF4LLM` na linha de frente para PDFs nativos e o `RapidOCR` em CPU para PDFs escaneados antigos, mas essa arquitetura de fatiamento e limpeza em Markdown nasceu aqui na `1.5.2`.

---

## Armazenamento duplo no Bunny CDN, roteamento Anycast e timeouts de 180 segundos

Converter um livro de 600 páginas para Markdown resolve a leitura pela IA, mas cria outra questão: onde guardar tanto o binário original (`.pdf` ou `.docx`) quanto o arquivo `.md` processado, sem transformar o banco SQLite em um arquivo pesado de vários gigabytes?

Escolhi o **Bunny CDN Storage** pela simplicidade da API HTTP e pelo custo baixo. Mantive um **pipeline de upload duplo**: a cada obra cadastrada, o sistema sobe o arquivo original em `conhecimento/originais/` e o Markdown limpo em `conhecimento/markdown/`, gravando no SQLite apenas as URLs e metadados.

Logo nos primeiros testes de upload com livros reais da minha biblioteca, três problemas apareceram.

O primeiro foi de endpoint regional. O Bunny CDN usa subdomínios diferentes conforme a região da Storage Zone (`storage.bunnycdn.com` para Frankfurt, `ny.storage.bunnycdn.com` para Nova York, `la.storage.bunnycdn.com` para Los Angeles). Além disso, ao preencher o `.env`, era fácil colar a URL inteira no lugar do nome da zona. Adicionei uma sanitização na inicialização do `conhecimento_utils.py` para limpar protocolos `https://` e barras extras, montando o gateway Anycast correto a partir de `BUNNY_STORAGE_REGION`.

O segundo problema apareceu ao subir um livro de engenharia de software de `118 MB`. O `requests.put` padrão abortava por *timeout*. Ajustei o pipeline para operar com timeout estendido de **180 segundos** e fallback automático para disco local (`data/backup/storage_mock/`) quando estivesse offline:

```python
def upload_bunny_cdn(conteudo_bytes: bytes, nome_arquivo_destino: str) -> str | None:
    nome_arquivo_destino = nome_arquivo_destino.lstrip("/")
    url = f"https://{BUNNY_ENDPOINT}/{BUNNY_ZONE}/{nome_arquivo_destino}"
    headers = {
        "AccessKey": BUNNY_KEY,
        "Content-Type": "application/octet-stream",
    }
    response = requests.put(url, data=conteudo_bytes, headers=headers, timeout=180)
    response.raise_for_status()
    return gerar_url_assinada_bunny(nome_arquivo_destino)
```

O terceiro ponto era privacidade. Meu acervo contém livros comprados e documentos de pesquisa que não podem ficar expostos em uma Pull Zone pública. Ativei a autenticação por token (*Url Token Authentication*) no Bunny e implementei a função `gerar_url_assinada_bunny` (inicialmente `assinar_url_bunny` nos commits de 5 de agosto).

A assinatura calcula um hash **MD5** binário sobre a concatenação da chave (`BUNNY_SECURITY_KEY`), o caminho relativo do arquivo e o timestamp Unix de expiração (`expires`), codificando o digest em **Base64 URL-Safe**:

```python
def gerar_url_assinada_bunny(caminho_relativo: str, tempo_expiracao_segundos: int = 3600) -> str:
    pull_url = BUNNY_PULL_ZONE.rstrip("/") or f"https://{BUNNY_ZONE}.b-cdn.net"
    caminho_relativo = "/" + caminho_relativo.lstrip("/")
    expires = int(time.time() + tempo_expiracao_segundos)

    token_input = f"{BUNNY_SECURITY_KEY}{caminho_relativo}{expires}"
    md5_hash = hashlib.md5(token_input.encode("utf-8")).digest()
    token = base64.b64encode(md5_hash).decode("utf-8")
    token = token.replace("\n", "").replace("+", "-").replace("/", "_").replace("=", "")

    return f"{pull_url}{caminho_relativo}?token={token}&expires={expires}"
```

Com isso, a Pull Zone permanece fechada para acesso externo direto, mas o **Magnetares Knowledge** gera links válidos por 1 hora sempre que precisa baixar o `.md` ou abrir o PDF original.

---

## Caçando o `database is locked` no menu Curses e os backups a quente

Quando conectei o Gerenciador de Conhecimento ao módulo de **Planos de Ensino (`plano_ensino.py`)** — permitindo priorizar livros reais do acervo local na bibliografia das disciplinas —, um bug derrubou minha sessão no meio de um teste:

```text
sqlite3.OperationalError: database is locked
```

Eu já tinha configurado `PRAGMA journal_mode=WAL` no `conectar()` do `academico_db.py`, e o aplicativo rodava localmente no meu terminal. Quem estava segurando um lock de escrita no SQLite?

Rastreando a pilha de chamadas, encontrei uma armadilha clássica: em uma das rotinas de vinculação em `plano_ensino.py`, eu tinha aberto um bloco `with academico_db.conectar() as conn:`, executado uma atualização preliminar e, **ainda dentro do bloco `with`**, chamado o `menu_retro()` em `curses` para perguntar em qual instituição o registro deveria ser alocado.

Enquanto o menu `curses` ficava parado esperando `Enter`, aquela conexão continuava aberta com uma transação pendente. Quando a função chamada dentro do menu tentava abrir uma segunda conexão via `academico_db.salvar_instituicao()`, esbarrava na primeira transação aberta que nunca dava `commit()` porque estava bloqueada esperando meu teclado.

A correção na `v1.5.2` virou regra para todo o projeto: **nenhum prompt interativo (`Prompt.ask`, `Confirm.ask` ou `menu_retro` em `curses`) pode existir dentro do escopo de um `with conectar() as conn:`**. Toda leitura carrega os dados para memória e fecha a conexão imediatamente; a interface interage com o usuário fora de qualquer transação; e a escrita abre uma conexão curta, grava e commita em milissegundos. Também corrigi um sombreamento de variável nos callbacks de upload do `conhecimento.py` e o sangramento vertical de bordas no Dashboard Executivo.

Por fim, como o banco `academico.db` agora guardava todo o meu catálogo de obras e referências ABNT, criei o módulo `src/modules/backup.py` utilizando a API nativa `sqlite3.Connection.backup()`:

```python
src_conn = sqlite3.connect(DB_PATH)
dst_conn = sqlite3.connect(dest_path)
with src_conn, dst_conn:
    src_conn.backup(dst_conn)
```

Ao contrário de um `shutil.copyfile` simples, o `src_conn.backup(dst_conn)` copia página por página de forma atômica mesmo com o banco em uso, gerando um snapshot `.db` acompanhado de um manifesto `.json` em `data/backup/`, além de criar um backup preventivo automático antes de qualquer restauração.

---

## Resumo da versão 1.5.2

| Componente | O que foi implementado | Problema real que resolveu |
|---|---|---|
| `conhecimento.py` e Schema SQLite | Tabelas `conhecimento_materiais`, `conhecimento_referencias` e tags relacionais | Fim das bibliografias inventadas; referências ABNT NBR 6023 geradas de forma determinística |
| Conversão `MarkItDown` + Refinamento IA | Extração de `.pdf`, `.docx`, `.doc` e `.txt` em Markdown com limpeza em fatias de `250k` caracteres | Reconstrução de leitura em PDFs científicos de duas colunas e remoção de cabeçalhos/hifens |
| `upload_bunny_cdn` e Token Auth | Upload duplo (binário + `.md`), timeout de `180s` e assinatura MD5 + Base64 URL-Safe | Suporte a livros pesados (+100 MB) mantendo a Pull Zone privada com links temporários |
| Desacoplamento em `plano_ensino.py` | Retirada dos loops `curses` e prompts do Rich de dentro do contexto `with conectar()` | Eliminação definitiva do erro `sqlite3.OperationalError: database is locked` |
| `backup.py` (`sqlite3.backup`) | Cópias a quente do banco unificado com metadados JSON e backup preventivo na restauração | Segurança contra perda de dados no banco central do acervo acadêmico |

Com os livros e artigos convertidos para Markdown, guardados no Bunny CDN e catalogados no SQLite, eu tinha a matéria-prima na mão. O próximo passo apareceu quatro dias depois: usar esse acervo para redigir livros didáticos inteiros e planos de disciplinas avulsas. É o que conto no próximo artigo da série.
