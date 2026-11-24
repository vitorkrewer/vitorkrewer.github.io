---
title: "A Resolução CNE/CP nº 1/2026 na pesquisa acadêmica, parte 3 — autoria, transparência, alucinações e a proibição de treinar modelos com textos de alunos"
slug: resolucao-cne-cp-1-2026-pesquisa-autoria-abnt-treinamento-dados
date: "2026-11-26"
category: "Educação & IA"
tags: ["Resolução CNE/CP 1/2026", "Pesquisa Científica", "Propriedade Intelectual", "ABNT", "LGPD", "Magnetares Knowledge Database", "Pulsares Research"]
readTime: "14 min de leitura"
excerpt: "Análise profunda dos artigos 10, 15, 21 a 26 e das regras de pesquisa científica do Capítulo V da Resolução CNE/CP nº 1/2026 sobre propriedade intelectual docente e discente, declaração de uso de IA e responsabilidade sobre citações."
series: "IA na Educação Brasileira (Resolução CNE/CP nº 1/2026)"
seriesOrder: 3
status: Rascunho
---

Quando a discussão sobre inteligência artificial generativa chegou às salas dos professores e aos colegiados de curso entre 2023 e 2025, grande parte do debate ficou restrita ao pânico imediato sobre o plágio estudantil. Poucos gestores educacionais pararam para examinar a outra face da moeda, que era muito mais silenciosa e estruturalmente grave. Enquanto coordenadores discutiam como impedir que um graduando gerasse uma resenha automática, milhares de docentes, orientadores e estudantes despejavam diariamente apostilas autorais, bancos de questões inéditos, dados brutos de pesquisa de campo e capítulos inteiros de dissertações em interfaces web gratuitas de grandes provedores de modelos de linguagem, alimentando o treinamento comercial de corporações estrangeiras sem qualquer salvaguarda contratual.

Ao mesmo tempo, nas bancas de Trabalho de Conclusão de Curso (TCC) e nos comitês editoriais de periódicos científicos, começamos a enfrentar uma epidemia de referências fantasmas. Alunos bem-intencionados solicitavam a um assistente conversacional um levantamento bibliográfico sobre determinado tema, recebiam uma lista perfeitamente formatada nas normas da ABNT e a inseriam no projeto de pesquisa sem verificar se aqueles artigos e códigos DOI realmente existiam no mundo físico.

A **Resolução CNE/CP nº 1, de 11 de novembro de 2026** (homologada e publicada no Diário Oficial da União em 12/11/2026 a partir do Parecer CNE/CP nº 15/2026), ataca exatamente essas duas feridas abertas da vida universitária e escolar brasileira. Nesta terceira parte da nossa série técnica, vou dissecar os dispositivos que regulam a autoria intelectual (**Art. 10**), a blindagem da produção docente e discente contra a captura para treinamento de modelos (**Art. 15**), a governança e transparência algorítmica (**Capítulo IV, Arts. 21 a 26 e Art. 35**) e as diretrizes estritas para pesquisa científica e pós-graduação (**Capítulo V**). Ao longo da análise, mostrarei como essas exigências normativas validam decisões de arquitetura de software que tomei no desenvolvimento do **Magnetares Knowledge Database**, do **Pulsares Research** e do **Magnetares Notes**.

---

## O Artigo 10 e a Intransferibilidade da Autoria Científica e Docente

O ponto de partida jurídico para qualquer produção acadêmica mediada por algoritmos na Resolução CNE/CP nº 1/2026 está ancorado no **Art. 10**, que trata da autoria intelectual e da honestidade acadêmica. O texto normativo fecha de vez uma brecha que alguns pesquisadores tentaram explorar nos primeiros anos de popularização dos Grandes Modelos de Linguagem (LLMs), quando chegaram a listar ferramentas como coautoras em pré-prints internacionais.

Pela diretriz do Conselho Nacional de Educação, sistemas de inteligência artificial são instrumentos técnicos de processamento probabilístico e **não possuem personalidade jurídica, intencionalidade cognitiva nem capacidade de autoria científica, artística ou pedagógica**. A consequência prática dessa definição recai integralmente sobre o ser humano que assina o documento.

Quando um professor elabora um livro didático, um roteiro de laboratório ou uma apostila institucional utilizando apoio de modelos generativos para estruturação ou revisão, a titularidade e, sobretudo, a responsabilidade técnica, ética e civil pelo conteúdo permanecem 100% com o docente autor. O mesmo princípio rege a produção discente e científica. O graduando que submete uma monografia, o mestrando que deposita uma dissertação ou o pesquisador que envia um manuscrito a um periódico responde individualmente por cada afirmação factual, cada linha de código, cada interpretação estatística e cada citação bibliográfica contida no trabalho.

Na minha atuação no Ensino Superior, sempre deixei claro aos orientandos que a desculpa *"foi a ferramenta que gerou esse dado incorreto"* equivale juridicamente a culpar a calculadora por um erro de engenharia estrutural. O **Art. 10** transforma essa regra de bom senso acadêmico em dever normativo nacional. Se um sistema generativo reproduz um trecho protegido por direitos autorais de terceiros sem a devida atribuição ou fabrica uma premissa falsa, a infração ética de plágio ou de má conduta científica recai sobre o pesquisador que negligenciou o dever de verificação humana, jamais sobre o software.

---

## O Artigo 15 e a Proibição de Treinar Modelos com Textos de Professores e Alunos

Se o Art. 10 cobra responsabilidade do autor humano, o **Art. 15** entrega aos professores e estudantes brasileiros uma das proteções jurídicas mais vigorosas já redigidas em políticas públicas de tecnologia educacional no mundo.

Durante anos, o modelo de negócios padrão de diversas plataformas gratuitas de IA e de ambientes virtuais de aprendizagem baseou-se em uma troca assimétrica e opaca. A instituição ou o usuário individual recebia acesso a um assistente de texto, de transcrição ou de resumo; em contrapartida, os Termos de Uso continham cláusulas genéricas permitindo que todos os *inputs* enviados fossem retidos para "melhoria dos serviços" — o eufemismo corporativo padrão para **treinamento, ajuste fino (*fine-tuning*) e calibração de modelos comerciais de inteligência artificial de terceiros**.

Na rotina universitária e escolar, isso significava que:
1. O professor que levava dez anos refinando uma apostila original de Cálculo, Direito Constitucional ou Fisiologia e a subia em um chat aberto para gerar exercícios de fixação estava cedendo gratuitamente seu capital intelectual para compor os pesos neurais de um modelo proprietário;
2. Aulas gravadas em vídeo, contendo a voz, a imagem e a didática própria do docente, eram ingeridas por pipelines de treinamento multimodal sem qualquer remuneração ou controle;
3. Redações, monografias e projetos de pesquisa inéditos de alunos passavam a alimentar bases de treinamento antes mesmo de serem publicados ou patenteados.

O **caput do Art. 15** da Resolução CNE/CP nº 1/2026 interrompe essa prática ao **proibir expressamente** que a produção intelectual, os materiais didáticos, os planos de ensino, as aulas gravadas, as avaliações elaboradas por docentes e os trabalhos acadêmicos ou escolares produzidos por estudantes sejam utilizados para treinamento, ajuste fino ou calibração de modelos de IA de terceiros. A única exceção admitida para adultos exige **autorização específica, livre, informada e destacada**, sendo vedado o condicionamento do uso da plataforma educacional à cessão compulsória desses ativos para treinamento algorítmico.

### A Blindagem Absoluta do Parágrafo Único para Crianças e Adolescentes

A norma vai ainda mais longe no **Parágrafo único do Art. 15**, estabelecendo uma regra de ordem pública inegociável para a Educação Básica. Quando se tratar de dados pessoais, registros biométricos, vozes, imagens ou produções escolares de **crianças e adolescentes**, a proibição de utilização para treinamento, ajuste fino ou aperfeiçoamento comercial de modelos de inteligência artificial é **absoluta**.

Note a precisão técnica do legislador educacional em consonância com o Estatuto da Criança e do Adolescente (ECA) e com o Art. 14 da Lei Geral de Proteção de Dados (LGPD). Na Educação Básica, nem mesmo um termo de consentimento genérico assinado pelos pais ou responsáveis no ato da matrícula escolar tem validade para autorizar que as redações, desenhos, vídeos ou interações de estudantes menores de idade sirvam de matéria-prima para treinar algoritmos comerciais de fornecedores de tecnologia.

### Por que a Arquitetura Local-First do Magnetares Knowledge Database Antecipou o Artigo 15

Para quem desenvolve software voltado ao ecossistema acadêmico, o **Art. 15** separa imediatamente as ferramentas amadoras das arquiteturas sérias de engenharia de dados.

Quando projetei o **Magnetares Knowledge Database** (meu sistema integrado de gestão de acervo docente, geração de materiais didáticos e formatação acadêmica) e o **Magnetares Notes** (voltado à escrita técnica e organização de notas atômicas em Markdown), recusei desde o primeiro commit o modelo de SaaS multi-inquilino na nuvem que sequestra os documentos do professor em servidores proprietários.

A decisão de adotar uma arquitetura estritamente **Local-First**, na qual todo o banco de dados de livros, artigos em PDF, apostilas autorais, matrizes curriculares e bancos de questões reside localmente na máquina do próprio professor em um banco **SQLite** sob seu controle exclusivo, nasceu exatamente da preocupação que hoje está codificada no Art. 15.

No fluxo de engenharia do **Magnetares Knowledge Database**, a proteção da propriedade intelectual opera em três camadas técnicas verificáveis:
* **Persistência 100% Local no SQLite** — O acervo bibliográfico do docente, suas anotações privadas e suas aulas não ficam hospedados em um bucket de terceiros aguardando mineração de dados;
* **Ingestão Controlada com Zero Retenção para Treino** — Quando o usuário aciona uma chamada de inferência para estruturar um plano de aula, sintetizar um capítulo ou auditar citações, a comunicação ocorre exclusivamente via chamadas diretas de API autenticadas com a chave do próprio pesquisador ou da instituição, sob contratos de API comercial que garantem política de *zero data retention* para treinamento de modelos base;
* **Minimização de Contexto Enviado** — Em vez de despejar uma obra inteira na janela de contexto de um serviço web desconhecido, o motor de recuperação local seleciona apenas os fragmentos estritamente necessários para a tarefa pedagógica imediata.

A Resolução CNE/CP nº 1/2026 mostra que o hábito de colar provas inéditas, relatórios de pesquisa e textos de alunos em interfaces web gratuitas de consumo de massa não é apenas um descuido técnico, mas uma violação direta das diretrizes nacionais de proteção à propriedade intelectual escolar e universitária.

---

## Governança de Dados, Transparência Algorítmica e Gradação de Risco no Capítulo IV

O **Capítulo IV da Resolução (Arts. 21 a 26)**, articulado com os parâmetros de avaliação de impacto do **Art. 35**, estabelece a infraestrutura de governança de dados que toda instituição de ensino — da escola infantil à universidade federal ou comunitária — precisa implantar para operar sistemas de IA dentro da legalidade.

Os **Arts. 21 a 24** determinam a conformidade estrita com a LGPD, exigindo o princípio da **minimização de dados**. Sistemas educacionais só podem coletar e processar o conjunto mínimo de variáveis estritamente indispensável para a finalidade pedagógica declarada. É vedada a coleta oportunista de telemetria comportamental, microexpressões faciais, histórico de navegação extraclasse ou dados socioeconômicos sensíveis para alimentar motores de perfilização oculta. Além disso, o **Art. 26** impõe padrões rigorosos de segurança da informação, criptografia, controle de acesso baseado em papéis e planos de resposta a incidentes, responsabilizando solidariamente as instituições que contratam soluções tecnológicas sem auditar a arquitetura de armazenamento de seus fornecedores.

### O Direito à Explicação no Artigo 25

Dentro desse bloco, o **Art. 25** merece leitura atenta por parte de coordenadores pedagógicos e equipes de tecnologia da informação. Ele consagra o princípio da **Transparência Algorítmica e Explicabilidade** no ambiente educacional.

Pelo Art. 25, estudantes, famílias e professores possuem o direito inalienável de:
1. **Saber quando estão interagindo com uma IA** — Nenhum chatbot de tutoria, assistente de secretaria acadêmica ou sistema de atendimento ao estudante pode simular identidade humana ou ocultar sua natureza automatizada;
2. **Conhecer o escopo de coleta de dados** — Ter acesso a informações claras, redigidas em linguagem acessível à faixa etária e ao público escolar, sobre quais dados estão sendo capturados durante o uso da plataforma;
3. **Compreender a lógica decisória e os critérios de recomendação** — Sempre que um algoritmo classificar o desempenho de um aluno, recomendar uma trilha de recuperação, emitir alertas de risco de evasão ou sugerir agrupamentos pedagógicos, a instituição deve ser capaz de explicar quais variáveis pesaram naquela saída e como o resultado pode ser contestado e revisado por um profissional humano.

Em termos de arquitetura de sistemas, o Art. 25 proíbe a aplicação de "caixas-pretas" inauditáveis em processos que afetem a trajetória acadêmica do estudante. Quando construí o **Gerador de Trilhas de Aprendizagem**, por exemplo, fiz questão de que a recomendação de módulos e dependências curriculares não fosse um veredito opaco, mas uma estrutura explícita e editável pelo professor, na qual cada pré-requisito pedagógico e cada nível de complexidade pudessem ser inspecionados e alterados manualmente.

### A Matriz de Gradação de Risco do Artigo 35

Para evitar que uma ferramenta simples de apoio administrativo receba o mesmo peso burocrático de um sistema que decide o futuro escolar de um jovem, a Resolução adota no **Art. 35** uma governança baseada em **gradação de risco** em quatro níveis:

* **Risco Baixo** — Ferramentas de apoio operacional ou redacional sem coleta de dados pessoais sensíveis e sem poder decisório sobre a vida acadêmica (como corretores gramaticais locais, organizadores de layout de slides ou geradores de listas de exercícios sob revisão integral do professor);
* **Risco Moderado** — Sistemas de tutoria assistida, recomendação de conteúdos complementares ou análise agregada de engajamento de turmas, que exigem transparência ativa, supervisão docente contínua e relatórios periódicos de governança;
* **Risco Alto** — Qualquer sistema de IA que incida sobre avaliação de aprendizagem, triagem para programas de assistência estudantil, processos seletivos, predição individual de evasão ou monitoramento de frequência e comportamento. Sistemas de alto risco exigem avaliação prévia de impacto algorítmico, auditoria de vieses discriminatórios, registro de logs de rastreabilidade e garantia obrigatória de intervenção e decisão final humana;
* **Risco Excessivo ou Inaceitável** — Aplicações expressamente banidas do espaço educacional brasileiro, tais como sistemas de pontuação social (*social scoring*) de estudantes, reconhecimento biométrico de emoções para fins disciplinares ou avaliativos em sala de aula, perfilização discriminatória e uso de dados de crianças para treinamento comercial de modelos (conforme o Parágrafo único do Art. 15).

---

## Pesquisa Científica e Pós-Graduação no Capítulo V

Se na Educação Básica o foco da Resolução é a proteção cognitiva e etária, no Ensino Superior e na Pós-Graduação (*Stricto* e *Lato Sensu*) o **Capítulo V** enfrenta de frente a transformação do fazer científico. O CNE não cometeu o erro anacrônico de proibir o uso de inteligência artificial na universidade; pelo contrário, reconheceu que ferramentas computacionais avançadas fazem parte da ciência contemporânea, mas impôs duas regras metodológicas inflexíveis para preservar a integridade da pesquisa brasileira: **a transparência metodológica obrigatória** e **o rigor absoluto contra a fabricação e a alucinação de dados e referências**.

### A Obrigatoriedade de Declaração Explícita na Metodologia

A primeira regra prática que já precisa constar nos manuais de TCC, nos regimentos de programas de mestrado e doutorado e nas diretrizes de Comitês de Ética em Pesquisa (CEP) é o dever de **declaração explícita e detalhada**.

Sempre que ferramentas de inteligência artificial forem utilizadas de forma relevante em qualquer etapa de um trabalho acadêmico — seja na triagem de revisão sistemática de literatura, na limpeza ou tratamento estatístico de dados, na geração ou refatoração de scripts de análise, na tradução técnica de manuscritos ou no auxílio à estruturação textual —, o autor é obrigado a declarar esse uso de maneira transparente na **seção de Metodologia** (ou em nota específica de declaração de uso de tecnologia exigida pelo periódico ou programa).

Não basta escrever uma frase vaga no rodapé dizendo que *"utilizou-se IA para revisão"*. A boa prática exigida pelo Capítulo V demanda especificar:
1. Qual sistema, modelo e versão foram empregados (por exemplo, o nome do modelo de linguagem ou da ferramenta de análise de grafos);
2. Em qual etapa específica do fluxo de pesquisa a ferramenta atuou (extração de metadados, tradução de resumo, depuração de código em Python/R, revisão estilística);
3. Qual foi o protocolo de validação e curadoria humana aplicado pelos autores sobre as saídas geradas pelo sistema.

Ocultar o uso substancial de sistemas generativos na produção de uma dissertação ou artigo passa a configurar falha ética de transparência científica, sujeita às sanções regimentais de cada Instituição de Ensino Superior (IES) e das agências de fomento como CAPES e CNPq.

### O Problema Crítico das Alucinações Bibliográficas e a Engenharia de Grounding Verificável

O segundo ponto central do Capítulo V toca em um problema técnico que conheço na pele tanto como avaliador de bancas quanto como engenheiro de software acadêmico: **o fenômeno das alucinações bibliográficas**.

Por definição matemática, um Grande Modelo de Linguagem (LLM) puro não é um banco de dados relacional de obras científicas; ele é um preditor autorregressivo de tokens que estima qual palavra tem maior probabilidade estatística de suceder a anterior com base na distribuição de seu corpus de treinamento. Quando um pesquisador pede a um LLM sem ancoragem externa que cite cinco artigos sobre um tema específico nas normas da ABNT, o modelo frequentemente combina o sobrenome de um autor real daquela área com um título plausível, inventa um nome de periódico verossímil, atribui um ano recente e fabrica uma sequência numérica de DOI que não leva a lugar nenhum.

Inserir uma citação alucinada em um TCC, dissertação ou artigo científico destrói a credibilidade do trabalho e viola diretamente os deveres de honestidade acadêmica do **Art. 10** e as diretrizes de pesquisa do **Capítulo V**. A única forma de usar inteligência artificial na escrita científica sem contaminar a literatura com referências fictícias é substituir a geração livre pela **engenharia de software com *grounding* (ancoragem) estrito e determinístico**.

Foi exatamente para resolver essa falha estrutural dos modelos generativos que construí duas ferramentas complementares no meu ecossistema de pesquisa: o motor de citações do **Magnetares Knowledge Database** e o mapeador de literatura do **Pulsares Research**.

#### Como o Magnetares Knowledge Database Impõe Conformidade com as Normas ABNT NBR 10520 e NBR 6023

No **Magnetares Knowledge Database**, o modelo de linguagem é proibido por arquitetura de "lembrar" ou inventar referências bibliográficas a partir de seus pesos internos. Todo o fluxo de geração de material didático, apostilas e textos científicos obedece a um pipeline fechado de recuperação e validação:

1. **Fonte Única de Verdade no SQLite Local** — O sistema só pode citar obras que existam fisicamente cadastradas e indexadas na tabela de acervo do banco SQLite local do pesquisador, com seus metadados completos validados (autor, título, edição, local, editora, ano, página exata ou DOI);
2. **Motor Determinístico para ABNT NBR 10520 (Citações em Documentos)** — Quando o texto exige uma citação direta ou indireta, o motor de regras do software aplica rigorosamente a **ABNT NBR 10520:2023** (incluindo a mudança recente que adota letras maiúsculas e minúsculas para o sobrenome do autor dentro dos parênteses, como `(Silva, 2024, p. 42)`, e a formatação diferenciada para citações diretas com mais de três linhas em recuo próprio);
3. **Rastreabilidade Estrita de Citações Indiretas (`apud`)** — Um dos erros mais graves cometidos por alunos que usam IA genérica é transformar fontes secundárias em citações primárias falsas, fingindo que leram a obra original quando apenas leram um comentador. No **Magnetares Knowledge Database**, implementei um controle explícito de cadeia de custódia bibliográfica: se um conceito foi extraído de um autor citado dentro do livro de outro autor presente no banco local, o sistema preserva obrigatoriamente a relação `apud` e registra o vínculo exato com a obra consultada, impedindo a falsificação de leitura primária;
4. **Compilação Auditável pela ABNT NBR 6023** — Ao final do documento, a lista de referências não é redigida por geração livre de texto, mas compilada a partir dos identificadores únicos das obras efetivamente citadas no corpo do trabalho, garantindo correspondência de 1 para 1 entre citações no texto e referências finais.

#### Como o Pulsares Research Elimina Artigos Fantasmas na Revisão de Literatura

Quando o pesquisador está na fase exploratória — antes mesmo de ter os PDFs salvos em seu computador — e precisa descobrir a fronteira do conhecimento sobre um problema de pesquisa, entra em cena a arquitetura do **Pulsares Research**.

Em vez de pedir a um chatbot que "liste artigos sobre o tema X", o **Pulsares Research** consulta diretamente APIs científicas oficiais e bases indexadas verificáveis, como **CrossRef**, **Semantic Scholar** e **OpenAlex**. Cada nó no grafo de literatura gerado pelo **Pulsares Research** possui um código **DOI real**, metadados autenticados pelos editores científicos, contagem real de citações e rede de coautoria verificável. A inteligência artificial entra apenas na camada posterior para auxiliar na síntese comparativa, na clusterização temática e na leitura transversal dos resumos (*abstracts*) daqueles artigos que comprovadamente existem e foram recuperados via protocolo determinístico.

---

## O Novo Padrão de Engenharia Acadêmica Exigido pelo CNE

Ao articularmos o **Art. 10**, o **Art. 15**, os **Arts. 21 a 26**, o **Art. 35** e o **Capítulo V** da Resolução CNE/CP nº 1/2026, fica evidente que a fase do improviso tecnológico nas universidades e escolas brasileiras chegou ao fim.

Para os pesquisadores, orientadores e estudantes de pós-graduação, a mensagem normativa é cristalina: usar inteligência artificial na ciência exige transparência metodológica formal na seção de métodos, domínio técnico para evitar alucinações bibliográficas e responsabilidade integral sobre cada linha assinada. Para os gestores institucionais e desenvolvedores de ferramentas educacionais, o Art. 15 estabelece uma linha divisória intransponível ao proibir que o suor intelectual de professores e alunos — e, de modo absoluto, os dados e produções de crianças e adolescentes — sejam saqueados para treinar modelos comerciais de terceiros.

A boa notícia é que não precisamos escolher entre o atraso tecnológico e a entrega da nossa soberania intelectual. Arquiteturas **Local-First**, bancos de dados sob custódia do próprio pesquisador, contratos de API sem retenção de treinamento e motores de citação com ancoragem determinística nas normas da ABNT mostram que é perfeitamente possível construir e utilizar sistemas de alto desempenho acadêmico que respeitam integralmente a letra e o espírito da nova Resolução do CNE.

No quarto artigo desta série, sairemos dos laboratórios de pesquisa e entraremos diretamente no chão da sala de aula para examinar três temas explosivos da Resolução CNE/CP nº 1/2026: os limites de uso de IA por faixa etária na Educação Básica, a regulamentação da correção assistida de provas no **Art. 40** — que enterra de vez o uso isolado de "detectores de IA" para reprovar alunos — e as novas exigências para a formação inicial e continuada de professores.
