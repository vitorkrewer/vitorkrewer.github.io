---
title: "A Resolução CNE/CP nº 1/2026 explicada na prática, parte 1 — princípios, contratos de software e o fim da adoção de IA por impulso"
slug: resolucao-cne-cp-1-2026-ia-educacao-principios-contratos-governanca
date: "2026-11-24"
status: Publicado
category: "Educação & IA"
tags: ["Resolução CNE/CP 1/2026", "MEC", "Ensino Superior", "Governança de IA", "Legislação Educacional", "Magnetares Knowledge Database"]
readTime: "13 min de leitura"
excerpt: "Uma análise artigo por artigo dos Capítulos I, II e III (Arts. 1º a 8º) e dos Anexos I e II da Resolução CNE/CP nº 1/2026 sob a ótica de quem atua no Ensino Superior e constrói ferramentas de IA para engenharia acadêmica."
series: "IA na Educação Brasileira (Resolução CNE/CP nº 1/2026)"
seriesOrder: 1
---

No dia 12 de novembro de 2026 saiu no Diário Oficial da União, a **Resolução CNE/CP nº 1, de 11 de novembro de 2026** (registrada no portal MEC Normas, em `https://mecnormas.mec.gov.br/pesquisa/detalhar/15979`, e originada do Parecer CNE/CP nº 15/2026).

Minha primeira reação não foi a de um espectador acompanhando uma novidade legislativa. Li cada parágrafo com duas janelas abertas na cabeça. Na primeira estava a minha rotina no Ensino Superior e na Educação a Distância — reuniões de NEAD, estruturação de matrizes curriculares, revisão de planos de ensino e preparação para comissões de avaliação do MEC e do INEP. Na segunda estavam os repositórios de código das ferramentas de engenharia acadêmica e inteligência artificial que venho construindo nos últimos anos, especialmente o **Magnetares Knowledge** e o **Pulsares Research**, que ainda está em desenvolvimento.

Durante os últimos três anos, o setor educacional brasileiro viveu uma espécie de corrida do ouro desregulada com modelos de linguagem. Vi mantenedoras comprarem pacotes de chatbots da noite para o dia prometendo atendimento pedagógico integral, coordenações conectarem planilhas de notas de alunos em APIs públicas sem contrato de processamento de dados e plataformas de ensino embutirem botões de geração automática de provas sem nenhuma camada de revisão docente. Havia um vácuo normativo específico para a sala de aula e para a gestão acadêmica.

A Resolução CNE/CP nº 1/2026 encerra esse período de improviso. Distribuída em **47 artigos organizados ao longo de 8 capítulos**, além de **dois anexos normativos densos** (um Glossário Técnico-Pedagógico com 94 verbetes e um Guia Operacional de Classificação de Risco), a norma institui as Diretrizes Nacionais para a Utilização da Inteligência Artificial na Educação Brasileira.

Para analisar o conteúdo da resolução sem cair em resumos superficiais com intuito de ranquear em buscadores, decidi escrever e estruturar esta série em cinco partes, analisando a resolução bloco por bloco. Neste primeiro artigo, examino os **Capítulos I, II e o início do Capítulo III (Artigos 1º ao 8º)**, em conjunto com os **Anexos I e II**, traduzindo o texto regulatório do Conselho Nacional de Educação para a prática real de quem coordena cursos, assina contratos de software educacional e projeta sistemas de IA para universidades.

Como critério de transparência, todos os textos foram escritos com auxílio de IA e revisados por IA e humanos, inclusive utilizando o Magnetares Knowledge, repositório de informações sobre direito educacional do MEC e INEP.

Um ponto que deve ser observado com olhos atentos é que o uso da inteligência artificial, sob a minha análise e entendimento, deixou de ser uma decisão meramente técnica das equipes de TI para se tornar um ato de conformidade regulatória sujeito à supervisão direta do Ministério da Educação. Não é uma questão de escolha, mas sim uma questão de sobrevivência para as instituições de ensino, visto que a inadequação aos novos parâmetros impacta diretamente os processos de avaliação, regulação e supervisão institucional.

A todos que aprenderem, de alguma forma, a operar agentes de inteligência artificial, passaram a fazer mais, dentro de um lapso temporal menor do que seria humanamente possível. Isso se aplica a todos os setores, sejam eles corporativos, sejam eles acadêmicos. 

Enquanto escrevo, por exemplo, este artigo, diversas tarefas estão sendo desempenhadas por ferramentas de IA, com ciclos de monitoramento e correção, com revisões finais feitas por mim. Claude, Antigravity e Codex passaram a operar como aplicações de rotina, quase como uma extensão da minha cognição e capacidade de operação.

---

## O escopo nacional e os cinco filtros de legitimidade nos artigos 1º ao 3º

O **Capítulo I (Disposições Preliminares)** estabelece a cerca jurídica onde todo o resto da resolução opera. Quem trabalha com regulação educacional sabe que o primeiro instinto de algumas mantenedoras diante de uma norma nova é procurar brechas de escopo. O **Art. 1º, §§ 1º e 2º**, fecha essas portas de uma só vez.

As diretrizes têm alcance nacional obrigatório para redes e instituições **públicas e privadas** em todas as etapas e modalidades, abarcando Educação Básica, **Educação Superior** (graduação e pós-graduação *lato* e *stricto sensu*), **Educação a Distância (EaD)** e **Educação Profissional e Tecnológica (EPT)**. Mais importante do que a abrangência territorial é a trava de entrada do Art. 1º. O uso de IA em ambientes educacionais não se justifica por mera eficiência administrativa ou corte de custos; toda aplicação precisa atravessar simultaneamente **cinco filtros de legitimidade**:

1. **Finalidade educacional legítima**, demonstrando como a tecnologia serve ao projeto formativo e não apenas à automação burocrática.
2. **Necessidade**, comprovando que o tratamento algorítmico resolve um problema real não suprido por fluxos pedagógicos convencionais.
3. **Proporcionalidade**, calibrando o volume de dados coletados e o grau de interferência tecnológica ao objetivo didático pretendido.
4. **Supervisão humana efetiva**, exigindo que profissionais da educação detenham poder real de revisão, intervenção e veto sobre o resultado computacional.
5. **Centralidade da mediação pedagógica**, preservando o vínculo humano entre docente e estudante como núcleo inegociável do processo educativo.

Logo em seguida, o **Art. 2º** desfaz uma armadilha conceitual comum. Muitas diretorias tratam "Inteligência Artificial" como sinônimo exclusivo de grandes modelos de linguagem (LLMs) ou chatbots conversacionais. O CNE adota uma definição funcional abrangente que regula não apenas a **IA generativa e conversacional**, mas também os **sistemas preditivos** (como algoritmos de predição de evasão ou risco de reprovação no AVA), os **algoritmos gerenciais de recomendação e ranqueamento** (motores de trilhas adaptativas e alocação de turmas) e os **agentes autônomos ou semiautônomos** integrados aos fluxos institucionais. Se o seu Ambiente Virtual de Aprendizagem calcula uma nota de propensão à desistência do aluno e dispara ações na secretaria, esse módulo está tão submetido à resolução quanto um assistente generativo de texto.

Fechando o capítulo preliminar, o **Art. 3º** amarra a norma educacional ao ordenamento legal brasileiro vigente, subordinando qualquer sistema de IA escolar ou universitário à **Lei Geral de Proteção de Dados Pessoais (LGPD, Lei nº 13.709/2018)**, ao **Marco Civil da Internet (Lei nº 12.965/2014)**, ao **ECA Digital** e aos direitos fundamentais constitucionais. Uma falha de governança em um sistema de IA acadêmico deixa de ser mero apontamento pedagógico em recredenciamento do MEC para configurar infração direta à legislação de proteção de dados.

---

## A regência humana no artigo 4º e como aplico esse princípio no código

No **Capítulo II (Princípios, Objetivos e Diretrizes Pedagógicas)**, o **Art. 4º** detalha os quatro eixos estruturantes da arquitetura educacional mediada por algoritmos. No **Inciso I**, o CNE crava a **centralidade da regência humana**, distinguindo *assessoramento* de *decisão*. Sistemas de IA podem organizar insumos, sugerir recortes bibliográficos e mapear lacunas de aprendizagem, mas **jamais substituem o julgamento e a decisão pedagógica do professor, do coordenador ou do colegiado**.

Quando arquitetei o **Magnetares Knowledge** para estruturar matrizes curriculares, planos de ensino e livros didáticos em SQLite e Python, parti exatamente dessa premissa. No módulo de montagem de matrizes (`gerador_utils.py`) e no gerador de planos (`plano_ensino.py`), o modelo de linguagem nunca publica um currículo sozinho. Ele opera sob restrições determinísticas — buscando disciplinas por embeddings vetoriais no catálogo homologado da instituição e aplicando travas de integridade por hash MD5 contra grades clonadas — e entrega uma proposta para que eu, como docente ou coordenador, revise cada ementa, ajuste objetivos e aprove a bibliografia ABNT antes da exportação. O algoritmo faz o cruzamento semântico entre 1.650 disciplinas; a regência curricular permanece 100% humana.

Os demais incisos do Art. 4º completam essa estrutura:

- **Integração curricular progressiva (Inciso II)** — A IA entra nos cursos de maneira gradual e coerente com o amadurecimento cognitivo do estudante e com as Diretrizes Curriculares Nacionais (DCNs) de cada área.
- **Proteção de dados, privacidade e segurança da informação (Inciso III)** — Vedação à prática de submeter dados sensíveis de alunos e produções acadêmicas inéditas a serviços de nuvem sem isolamento de locatário (*tenant*) ou garantias contra treinamento externo.
- **Inclusão, equidade, acessibilidade e autonomia intelectual (Inciso IV)** — A tecnologia deve apoiar o Desenho Universal para a Aprendizagem e recursos assistivos enquanto combate a atrofia cognitiva. O objetivo da IA na universidade é expandir a capacidade investigativa do aluno — algo que materializo no **Pulsares Research**, onde o fichamento e o grafo de conceitos exigem leitura ativa sobre o PDF original —, e nunca transformar o estudante em um copista de respostas prontas.

---

## Por que o artigo 5º muda todos os contratos com fornecedores de tecnologia educacional

Se o Art. 4º orienta a coordenação pedagógica, o **Art. 5º** atinge diretamente a mantenedora, a diretoria de TI e o departamento jurídico das instituições de ensino. Até novembro de 2026, a contratação de plataformas SaaS (*Software as a Service*) com recursos de IA seguia um roteiro padronizado em que a faculdade assinava um contrato de adesão genérico e os termos de uso transferiam toda a responsabilidade por erros do algoritmo ou vazamentos de contexto para a própria instituição.

O **Art. 5º da Resolução CNE/CP nº 1/2026** torna esse modelo contratual irregular perante o MEC. Todo processo de aquisição, contratação, licenciamento, parceria ou adoção gratuita de sistemas de IA por instituições de ensino passa a exigir **cláusulas explícitas** garantindo cinco pontos:

1. **Governança e conformidade regulatória**, vinculando o software às exigências da Resolução CNE/CP nº 1/2026.
2. **Direito de auditoria técnica e pedagógica**, assegurando que a instituição e os órgãos de supervisão possam inspecionar parâmetros de funcionamento, fontes de dados e critérios de decisão do sistema.
3. **Transparência algorítmica e explicabilidade**, obrigando o fornecedor a documentar modelos subjacentes, limitações conhecidas, taxas de erro e lógica de recomendação ou avaliação.
4. **Proteção rigorosa contra uso secundário ou indevido de dados**, vedando que dados pessoais, históricos escolares, interações no AVA e produções intelectuais de docentes e discentes sejam capturados para treinar modelos comerciais próprios ou de terceiros.
5. **Responsabilização solidária de fornecedores e operadores**, impedindo cláusulas de isenção total da EdTech quando defeitos de projeto, vieses discriminatórios ou falhas de segurança causarem danos acadêmicos, morais ou regulatórios.

Quem participa de avaliações de fornecedores no Ensino Superior sabe que muitas ferramentas vendidas como "plataformas inteligentes de gestão acadêmica" são apenas *wrappers* que enviam o texto do aluno via API para modelos externos sem controle de retenção nem trilha de auditoria local. Foi por esbarrar nessa caixa-preta dos softwares de prateleira que construí arquiteturas soberanas e auditáveis no **Magnetares Knowledge**. Mantendo o banco canônico em SQLite local (com sincronização controlada via Turso Cloud e armazenamento próprio no Bunny CDN) e registrando nas tabelas `planos_ensino`, `plano_disciplina`, `materiais_academicos` e `material_secoes` exatamente qual fonte do acervo alimentou cada seção via RAG (*Retrieval-Augmented Generation*), qual revisão humana foi aplicada e qual o hash de integridade da matriz, garanto rastreabilidade completa perante qualquer comissão do MEC.

Se você não está familiarizado com termos como RAG, LLM ou API, não se preocupe. Vou explicar tudo isso de forma simples e clara. Wrapper é uma aplicação que envolve outra aplicação, LLM ou modelo de linguagem é o cérebro que processa a informação e API ou Interface de Programação de Aplicações é a ponte que conecta as aplicações.

---

## O fim da adoção por impulso e a governança baseada em risco nos artigos 6º ao 8º

No **Capítulo III (Da Adoção, Governança e Gestão de Riscos)**, o **Art. 6º** decreta o fim da implantação de IA por tentativa e erro. **Nenhum sistema de inteligência artificial pode entrar em produção no ambiente institucional sem ser precedido por uma avaliação técnica, pedagógica e de impacto formalmente documentada**. Liberar um plugin de IA no Moodle para todas as turmas "para testar no semestre" passa a configurar não conformidade direta. Antes de ativar qualquer ferramenta, a instituição precisa documentar o problema pedagógico atacado, os dados consumidos, os riscos éticos e cognitivos, a capacitação docente realizada e o protocolo de contingência contra falhas ou alucinações.

Os **Artigos 7º e 8º** conectam essa avaliação prévia a uma **governança proporcional ao risco**, estruturada pelos dois anexos normativos da resolução. O **Anexo I** traz um **Glossário Técnico-Pedagógico com 94 verbetes oficiais**, padronizando termos como *alucinação algorítmica*, *viés de automação*, *supervisão humana significativa*, *avaliação formativa mediada por IA*, *perfilamento estudantil*, *dados sintéticos* e *explicabilidade*. Já o **Anexo II (Guia de Classificação de Risco e Salvaguardas Obrigatórias)** divide as aplicações em faixas que vão do risco baixo ou mínimo até sistemas de **risco elevado** (que impactam acesso, avaliação somativa, certificação, progressão, retenção ou perfilamento comportamental) e práticas de **risco inaceitável ou vedadas**.

---

## As quatro regras de ouro do Anexo II que todo arquiteto de software educacional precisa dominar

O ponto mais estratégico do **Anexo II** em conjunto com os **Arts. 7º e 8º** reside nas **quatro regras metodológicas de enquadramento** que impedem a burla regulatória e redefinem projetos como o **Magnetares Knowledge** e o **Gerador de Trilhas de Aprendizagem**.

| Regra de Enquadramento (Anexo II) | O que a Resolução CNE/CP nº 1/2026 determina | Impacto prático na TI e na Coordenação Acadêmica |
| :--- | :--- | :--- |
| **1. Primazia da finalidade concreta sobre o rótulo comercial** | Classifica-se o risco pelo uso real e pelos efeitos práticos na vida acadêmica do estudante, e nunca pelo rótulo de marketing do fornecedor. | Se um software vendido como "Assistente Lúdico de Engajamento" gera um score usado para cortar bolsas ou bloquear rematrículas, ele é auditado como **Alto Risco**. |
| **2. Prevalência do nível mais restritivo em sistemas multifuncionais** | Quando uma mesma plataforma executa múltiplas funções com diferentes criticidades, todo o sistema obedece às salvaguardas do nível mais alto presente. | Se um AVA possui um gerador de resumos (baixo risco) e, no mesmo pipeline, um corretor automatizado de provas finais (alto risco), toda a suíte submete-se aos controles de alto risco. |
| **3. Princípio da precaução em caso de dúvida classificatória** | Havendo incerteza técnica ou pedagógica entre dois níveis de risco na avaliação do Art. 6º, a instituição deve aplicar o estrato mais rigoroso. | Elimina zonas cinzentas em comitês de governança. Na dúvida se um recomendador de trilha afeta a progressão curricular formal, exige-se supervisão docente obrigatória. |
| **4. Gatilho de reavaliação obrigatória por integração com banco institucional** | Ferramentas de baixo risco exigem **nova avaliação formal de risco** no instante em que passam a se integrar ao banco de dados institucional (ERP acadêmico ou AVA oficial). | Um chatbot avulso sem login tem um perfil de risco. No segundo em que a TI o conecta via API ao banco do ERP para ler históricos e gravar conceitos, o risco escala e exige nova homologação. |

Essa quarta regra merece atenção redobrada das equipes de desenvolvimento universitário. Quando operamos uma ferramenta desacoplada — como o **Magnetares Knowledge** manipulando apenas matrizes curriculares, ementas e acervos bibliográficos institucionais —, não há tratamento de dados pessoais de alunos nem decisão automatizada sobre indivíduos, mantendo o risco baixo e controlado. Porém, a Resolução CNE/CP nº 1/2026 deixa claro que **conectar uma aplicação de IA ao ERP acadêmico (Totvs RM, Lyceum, JACAD) ou ao banco de produção do AVA não é uma simples tarefa de engenharia de dados; é um evento regulatório** que altera a natureza do sistema e aciona todas as travas de governança crítica.

A resolução traça uma linha divisória muito clara: enquanto sistemas de apoio à gestão ou ferramentas de criação de conteúdo *off-line* operam com risco baixo, qualquer arquitetura que utilize os dados de alunos (histórico, notas, frequência, perfil socioeconômico) ou de corpo docente como insumo para gerar recomendações, avaliações, cortes ou trilhas passa a ser tratada como ** Alto Risco (AR)** — independentemente de o fornecedor se posicionar como "assistente" ou "ferramenta pedagógica".

Para o desenvolvedor universitário, isso tem duas implicações arquitetônicas brutais:
1. **Migração de arquitetura obrigatória**:
A transferência de dados da máquina local (como o SQLite do Magnetares K) para o banco do ERP/AVA configura uma mudança de "espectro de risco". A arquitetura de "banco próprio + sincronização controlada" deixa de ser apenas uma decisão técnica de soberania de dados e se transforma em requisito legal de conformidade.
2. **Rotulagem e transparência por padrão**:
A resolução exige que a instituição mantenha um **inventário público e atualizado** de todos os sistemas de IA em uso, com classificação de risco, versão do modelo, responsáveis, origem dos dados e salvaguardas aplicadas. Isso invalida a prática comum de "esconder" o uso de IA por trás de uma interface de usuário neutra ou de rótulos genéricos.

---

## O que vem a seguir na Parte 2 desta série

Na **Parte 2** desta série, vou avançar para o **Art. 9º, § 2º**, e para os **Capítulos V e VI (Art. 27 e seguintes)**, dedicados especificamente à Educação Superior, à Educação a Distância e à Educação Profissional e Tecnológica. Vamos analisar por que o CNE proibiu expressamente que chatbots, avatares e "tutores digitais" sejam contabilizados como corpo de tutoria na EaD, como isso será fiscalizado *in loco* pelo INEP e como estruturar a revisão obrigatória do **PDI (Plano de Desenvolvimento Institucional)** e dos **PPCs (Projetos Pedagógicos de Curso)** usando engenharia curricular auditável.

Se você quiser consultar ou imprimir o texto normativo integral dos Artigos 1º ao 10 com todas as anotações técnicas, doutrinárias e de governança universitária, **[clique aqui para baixar a versão comentada em PDF](../content/posts/pdf/resolucao-cne-cp-1-2026-comentada.pdf)**.

