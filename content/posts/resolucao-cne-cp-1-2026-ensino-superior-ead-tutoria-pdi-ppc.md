---
title: "A Resolução CNE/CP nº 1/2026 no Ensino Superior e na EaD, parte 2 — por que chatbot não conta como tutor e o impacto no PDI e nos PPCs"
slug: resolucao-cne-cp-1-2026-ensino-superior-ead-tutoria-pdi-ppc
date: "2026-11-25"
category: "Educação & IA"
tags: ["Resolução CNE/CP 1/2026", "Ensino Superior", "EaD", "PDI", "PPC", "Tutoria", "Magnetares Knowledge Database"]
readTime: "14 min de leitura"
excerpt: "O que muda na regulação do Ensino Superior, na Educação a Distância e na Educação Profissional com o Art. 9º, § 2º e o Capítulo V da Resolução CNE/CP nº 1/2026, da proibição de substituir tutores humanos por avatares à revisão obrigatória de PDI e PPCs."
series: "IA na Educação Brasileira (Resolução CNE/CP nº 1/2026)"
seriesOrder: 2
status: Rascunho
---

Na primeira parte desta série sobre a **Resolução CNE/CP nº 1, de 11 de novembro de 2026** (publicada no DOU em 12/11/2026, oriunda do Parecer CNE/CP nº 15/2026 e registrada sob o ID `15979` no portal MEC Normas), analisei os filtros de legitimidade dos artigos iniciais, as cláusulas obrigatórias nos contratos de software (Art. 5º) e as regras de classificação de risco do Anexo II.

Nesta segunda parte, entro no território onde atuo diariamente como professor, coordenador e desenvolvedor de ferramentas como o **Magnetares Knowledge**, e outros projetos prototipados como o **FocusConnecta** e o **Gerador de Trilhas de Aprendizagem**. Examino os dispositivos que atingem a operação da **Educação a Distância (EaD)**, a governança na **Educação Superior** e a prática na **Educação Profissional e Tecnológica (EPT)** — cobrindo o **Art. 9º, § 2º**, o **Capítulo V (Art. 27 e seguintes)** e o **Capítulo VI**.

---

## O artigo 9º e seu parágrafo 2º põem fim à farsa do chatbot contabilizado como tutor na EaD

Para entender a precisão do **Art. 9º, § 2º**, ainda dentro do Capítulo III da Resolução CNE/CP nº 1/2026, vale lembrar o que ocorreu nos bastidores de diversos grupos de Educação a Distância entre 2023 e 2026. Pressionadas por margens estreitas e pela queda no tíquete médio, várias operações passaram a enxergar as APIs de grandes modelos de linguagem (LLMs) como instrumento de corte de folha salarial. A conta parecia tentadora em planilhas financeiras: conectar um agente conversacional ou avatar generativo à base de apostilas, batizá-lo de "Tutor Digital 24/7" e encolher o quadro de tutores humanos, tentando inclusive somar as interações com o bot como tempo de mediação pedagógica efetiva perante o MEC.

O **Art. 9º e o seu § 2º** desmontam essa prática sem margem para interpretação criativa. O *caput* do Art. 9º reafirma que sistemas de IA em atividades de ensino atuam exclusivamente como **instrumento auxiliar e complementar**, subordinado ao planejamento docente. Em seguida, o **§ 2º** fixa duas determinações regulatórias diretas para a Educação a Distância e os cursos híbridos:

1. **Vedação de cômputo regulatório** — A mediação realizada por sistemas de IA (chatbots, assistentes virtuais, agentes autônomos, tutores algorítmicos ou avatares generativos) **não será computada, sob nenhuma hipótese**, para fins de cumprimento dos requisitos regulatórios de composição e dimensionamento do **corpo de tutores humanos**, do **corpo docente** ou da **carga horária obrigatória de interação pedagógica síncrona e assíncrona** exigida pelas normas da EaD.
2. **Verificação direta nas avaliações do MEC e do INEP** — O uso de IA na mediação pedagógica será **objeto de verificação específica e direta nos instrumentos de avaliação *in loco*, nos processos de regulação (autorização, reconhecimento, renovação de reconhecimento, credenciamento e recredenciamento) e nos procedimentos de supervisão do MEC e do INEP**.

Na prática de quem recebe comissão avaliadora do INEP, o recado é direto. A instituição pode oferecer assistentes de IA para ajudar o aluno a localizar conceitos no material didático de madrugada, mas **jamais pode** demitir tutores humanos e apresentar logs de chatbot quando o INEP auditar a relação de alunos por tutor, a titulação da equipe e o feedback docente nos fóruns. Se a visita *in loco* constatar que correções discursivas, mediações de fóruns avaliativos ou orientações de TCC são despachadas por rotinas automatizadas mascaradas de tutoria, a consequência vai além de nota baixa no indicador e abre processo de supervisão por descumprimento regulatório.

---

## A diferença arquitetural entre substituir o professor e amplificar a autonomia do aluno

A resolução não proíbe o uso de assistentes inteligentes na EaD; ela proíbe a fraude de fingir que um endpoint de API equivale a um educador. Quando abandonamos a ideia de substituir o tutor humano, abrimos espaço para atacar o verdadeiro gargalo do aluno a distância, que é a **desorganização do estudo autônomo** diante de dezenas de PDFs e videoaulas.

Foi com essa filosofia que projetei duas ferramentas que utilizo na docência e no ecossistema de estudos: o **FocusConnecta** e o **Gerador de Trilhas de Aprendizagem** (integrado ao fluxo de workspace e cadernos do **Magnetares Knowledge Database**).

| Critério Pedagógico e Regulatório | Uso Ilegítimo (Vedado pelo Art. 9º, § 2º) | Uso Legítimo e Auditável (Exemplos na minha arquitetura) |
| :--- | :--- | :--- |
| **Papel do sistema de IA no AVA** | O bot assume a identidade de "Tutor da Disciplina", responde fóruns oficiais e valida entregas sem revisão humana. | O sistema atua explicitamente como organizador cognitivo do estudante e copiloto de curadoria do professor. |
| **Impacto no dimensionamento humano** | Usado pela mantenedora para inflar a relação aluno/tutor humano ou cortar horas de docência. | Mantém intacto o quadro docente e de tutoria humana, reduzindo apenas o esforço mecânico de formatação. |
| **Transparência para o estudante** | Interface ambígua ou avatar antropomórfico que induz o aluno a crer que interage com a equipe docente. | No **FocusConnecta**, o estudante controla ciclos de concentração, metas de leitura e revisão espaçada ciente da automação. |
| **Geração de roteiros de estudo** | Algoritmo opaco que altera o currículo obrigatório ou aprova o aluno automaticamente por cliques. | No **Gerador de Trilhas de Aprendizagem**, a trilha deriva estritamente do plano de ensino aprovado pelo docente no **Magnetares Knowledge Database**. |

No **FocusConnecta**, a tecnologia apoia o aluno em sua escrivaninha durante a noite, ajudando-o a manter o foco, estruturar sessões de leitura ativa e anotar dúvidas para levar à mediação humana. Já no **Gerador de Trilhas de Aprendizagem**, o algoritmo não inventa conteúdos nem avalia o mérito final do estudante; ele decompõe as unidades programáticas já homologadas pelo professor no **Magnetares Knowledge Database** em etapas lógicas de leitura, fichamento e prática. O software organiza a jornada individual do estudante, enquanto a tutoria e a avaliação permanecem 100% nas mãos de professores e tutores humanos contratados.

---

## O Capítulo V e o artigo 27 exigem políticas próprias de IA integradas ao PDI e aos PPCs

No **Capítulo V (Da Utilização da Inteligência Artificial na Educação Superior)**, o **Art. 27** impõe um dever institucional imediato às reitorias, pró-reitorias acadêmicas, procuradorias institucionais e NDEs. **Toda Instituição de Ensino Superior (IES) fica obrigada a instituir uma política interna própria de governança, ética e utilização de Inteligência Artificial**, cobrindo de forma articulada os quatro pilares universitários:

1. **Ensino** (graduação e pós-graduação, presencial e EaD, metodologias, avaliação da aprendizagem e integridade acadêmica).
2. **Pesquisa** (uso ético na revisão de literatura e processamento de dados científicos, rastreabilidade metodológica, vedação de dados sintéticos não declarados e regras sobre autoria intelectual em artigos, dissertações e teses).
3. **Extensão** (impacto comunitário, letramento algorítmico aberto à sociedade e projetos aplicados com responsabilidade social).
4. **Gestão Acadêmica** (sistemas de secretaria, predição de evasão, atendimento ao discente, processos seletivos e proteção do acervo institucional).

O ponto decisivo do **Art. 27** é a proibição da "governança de fachada" baseada em portarias avulsas ou PDFs soltos no site. A resolução exige que a política de IA da IES esteja **formalmente integrada ao Plano de Desenvolvimento Institucional (PDI)** e **refletida nos Projetos Pedagógicos de Curso (PPCs)** da graduação e da pós-graduação.

- **No PDI**, a instituição precisa atualizar políticas acadêmicas, plano de infraestrutura tecnológica (segurança da informação, LGPD e cláusulas contratuais do Art. 5º) e programas de capacitação docente e técnica.
- **Em cada PPC**, o Núcleo Docente Estruturante (NDE) deve explicitar como a IA se conecta ao **perfil profissional do egresso** daquela área, quais competências críticas e éticas são trabalhadas na matriz, quais são as regras para **avaliações de aprendizagem** e **Trabalho de Conclusão de Curso (TCC)** e quais ferramentas homologadas apoiam as disciplinas.

---

## Como a arquitetura Human-in-the-Loop do Magnetares Knowledge Database antecipa o artigo 27 na criação de PPCs e Planos de Ensino

As exigências do Art. 27 e seguintes do Capítulo V validam diretamente a arquitetura que construí no **Magnetares Knowledge Database**. Gerar um PPC ou plano de ensino pedindo um texto corrido em um chat genérico da web produz ementas repetitivas, bibliografias alucinadas e zero vínculo com a biblioteca real da faculdade — um passivo regulatório imediato sob a Resolução CNE/CP nº 1/2026.

No **Magnetares Knowledge Database**, desenhei a engenharia curricular como um fluxo **Human-in-the-Loop (HITL)** determinístico e auditável sobre SQLite (`academico.db`), onde o coordenador e o NDE governam cada transição de estado:

1. **Filtro contratual e institucional na origem** — Antes de montar qualquer grade, o módulo multi-instituição (`instituicoes_ui.py` e `gerador_utils.py`) filtra o catálogo SQLite mantendo apenas as disciplinas e produtoras autorizadas para aquela IES específica, garantindo aderência ao PDI.
2. **Cruzamento semântico por embeddings e trava de integridade** — O motor vetorial (`indexador_vetorial.py`) seleciona disciplinas candidatas cruzando Área Primária e Área Secundária entre as 1.650 matérias do banco, e a função `verificar_integridade_global()` aplica comparação de conjuntos e hash MD5 para barrar grades duplicadas entre cursos.
3. **Curadoria humana de ementas, unidades e bibliografia real** — Na geração de planos de ensino (`plano_ensino.py`) e livros didáticos (`escritor_academico.py`), implementei um **grounding duplo** que cruza o acervo local da instituição (convertido em Markdown via MarkItDown e indexado em chunks) com a API do Google Books. O coordenador e o NDE auditam no terminal ou no **Magnetares Knowledge Studio** (Tauri + React) cada objetivo geral e específico, as unidades hierárquicas (`1.1`, `1.2`) e as referências ABNT NBR 6023, aprovando ou editando item por item antes da exportação pelo `plano_exportador.py`.

A mesma rastreabilidade governa o pilar da **Pesquisa** no **Pulsares Research**, onde fichamentos, coleções e grafos de conhecimento mantêm ponteiros exatos para a página do PDF original, exigindo síntese intelectual humana e blindando a pesquisa contra citações fabricadas.

---

## O Capítulo VI e a Educação Profissional e Tecnológica entre a inovação e o domínio do fundamento

Por fim, o **Capítulo VI** regula a Inteligência Artificial na **Educação Profissional e Tecnológica (EPT)**, alcançando cursos de qualificação, cursos técnicos de nível médio, **Cursos Superiores de Tecnologia (CSTs)** e pós-graduações tecnológicas. Como o egresso da EPT ingressa diretamente em cadeias produtivas onde sistemas inteligentes já operam no chão de fábrica e nos ambientes de software, o CNE equilibra inovação com rigor técnico em quatro eixos:

- **Inovação tecnológica e pesquisa aplicada**, fomentando projetos práticos e soluções com IA para problemas reais do setor produtivo.
- **Compreensão crítica das transformações do mundo do trabalho**, preparando o estudante para analisar os impactos ergonômicos, ocupacionais e produtivos da automação.
- **Sustentabilidade socioambiental**, integrando a análise de consumo energético, pegada hídrica e responsabilidade ambiental dos sistemas computacionais.
- **Domínio ético e técnico dos fundamentos profissionais**, assegurando que o uso de copilotos jamais elimine a capacidade do técnico ou tecnólogo de compreender o funcionamento basal do sistema e operar com segurança quando a automação falha.

Esse quarto eixo ataca um problema que vejo toda semana ensinando tecnologia e cibersegurança: o estudante que terceiriza o laboratório inteiro para um prompt, cola comandos no terminal sem entender uma única flag e trava diante do primeiro erro de permissão ou roteamento.

Foi para combater essa dependência passiva e garantir o domínio real do fundamento exigido pelo Capítulo VI que desenvolvi o **Kali Linux Labs Beginner**. Em um laboratório virtualizado de terminal no navegador, o aluno não aprende segurança ofensiva e administração Linux pedindo respostas prontas a um chatbot; ele precisa operar o shell, explorar diretórios, inspecionar portas, ler logs reais e construir o diagnóstico técnico passo a passo. Na EPT e nos CSTs, a IA deve amplificar quem já domina o fundamento técnico, e nunca servir de muleta para ocultar a falta de base profissional.

---

## O roteiro prático para coordenadores de curso e NDEs começarem a adequação agora

Para fechar esta segunda parte, resumo as quatro ações que qualquer coordenação de curso superior ou diretoria de EaD e EPT já deve pautar na próxima reunião de NDE com base no **Art. 9º, § 2º** e nos **Capítulos V e VI**:

1. **Auditoria imediata da mediação no AVA** — Mapear todos os bots ou assistentes na plataforma EaD, identificando-os como sistemas automatizados de apoio e assegurando que o dimensionamento de tutores e docentes humanos cumpra integralmente as métricas do MEC sem computar interações automatizadas.
2. **Abertura de revisão do PDI** — Acionar a Procuradoria Institucional e a CPA para inserir o capítulo de Governança e Uso Ético de IA no PDI, cobrindo ensino, pesquisa, extensão, gestão, infraestrutura auditável e capacitação docente.
3. **Atualização estruturada dos PPCs via NDE** — Incluir nas atas de NDE e nos PPCs a matriz de competências em IA alinhada ao perfil do egresso, as regras para avaliações e TCCs e os recursos tecnológicos homologados.
4. **Blindagem das práticas de laboratório na EPT e nos CSTs** — Revisar os planos de ensino das disciplinas práticas para garantir avaliações onde o aluno demonstre domínio autônomo dos fundamentos técnicos antes de usar copilotos de IA.

Na **Parte 3** desta série, recuo na numeração dos capítulos para examinar o **Capítulo IV**, dedicado à **Educação Básica**, à proteção de crianças e adolescentes, ao desenvolvimento cognitivo por faixa etária e ao papel insubstituível da escola na alfabetização e na socialização humana.
