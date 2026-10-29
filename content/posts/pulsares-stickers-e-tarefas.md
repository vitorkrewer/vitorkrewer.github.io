---
title: "Pulsares, dia 2 (parte 3): trazendo stickers e tarefas do Magnetares"
date: 2026-10-28
status: Publicado
series: Pulsares Research
seriesOrder: 4
project: 11
tags: [Pulsares Research, Magnetares Notes, Stickers, Tarefas, Produtividade]
readTime: 6 min
---

Quando comecei o Pulsares, eu disse que algumas peças viriam do Magnetares. A primeira delas foi a que eu mais usava no dia a dia: **stickers e listas de tarefas**.

Pesquisar não é só ler e anotar. Há também a ideia solta que não cabe em lugar nenhum ("ver aquele artigo do Minayo") e a lista de coisas por fazer ("terminar capítulo 2", "pedir revisão ao orientador"). Eu já tinha resolvido isso no Magnetares. Não fazia sentido resolver de novo.

---

## Reaproveitar, mas não copiar

Passei para o assistente o código do Magnetares (a lógica de stickers, a de listas, os testes e as telas) e pedi uma coisa específica: **aproveite o máximo possível da lógica, mas siga a interface e a folha de estilos do Pulsares**.

Essa segunda metade importa. O Pulsares tem linguagem visual própria, editorial e sóbria. Trazer a funcionalidade sem trazer a "cara" do outro aplicativo deu mais trabalho do que parece. Um recurso transplantado que parece estrangeiro quebra a sensação de ferramenta única.

---

## O que entrou na 0.5.0

**Stickers, o mural de post-its**
- Quadros de stickers, com um quadro padrão "Geral" protegido contra exclusão.
- Cartões com cores pastéis, opção de fixar no topo e uma separação clara entre "Fixados" e "Outros".
- Edição direta no cartão, com salvamento automático. Se eu saio do campo, salva na hora.
- Busca instantânea e **lixeira** por quadro, onde dá para restaurar ou apagar de vez.
- Posso arrastar um sticker e soltá-lo sobre outro quadro na barra lateral.

**Listas de tarefas**
- Listas, tarefas e subtarefas, com prioridade (alta, média, baixa) e data de vencimento.
- Prazos atrasados ou que vencem hoje ganham destaque. E o destaque não depende só de cor.
- Painel lateral para editar a tarefa: título, prazo, checklist de subtarefas e **várias anotações** por tarefa.
- Listas concluídas podem ser **arquivadas** e restauradas depois.

Tudo isso com testes em Go para criação, lixeira, arquivamento e contadores. Não quero que uma lista "perca" tarefas por um erro silencioso.

---

## O que não deu certo de primeira

Fiz o teste que faço sempre: usei. E encontrei dois problemas.

1. **Eu não conseguia criar uma lista.** O botão estava lá, mas não fazia nada. Pedi para o assistente investigar. (Curiosidade: ao conferir, o fluxo de adicionar tarefas funcionava. O defeito era só na criação da lista.)
2. **A ordem na barra lateral estava errada.** Stickers e Listas precisavam ficar **acima** de Coleções. É o tipo de detalhe que só se percebe usando. As ferramentas rápidas devem estar à mão, antes da organização de longo prazo.

Os dois foram corrigidos no mesmo dia.

---

## Por que isso importa para pesquisa

Parece um desvio, mas não é. A distância entre "li um artigo" e "escrevi o capítulo" é cheia de pequenas tarefas e ideias avulsas. Se elas moram em outro aplicativo, eu me distraio e perco o fio. Aqui, a lista de leituras pendentes e o mural de lembretes ficam a um clique do leitor de PDF.

No próximo post eu mostro a peça maior que veio do Magnetares: o editor.

---

## Quadro rápido

| Versão | Data | O que entrou |
|---|---|---|
| 0.5.0 | 28/10/2026 | Quadros de Stickers (lixeira, cores, fixados) e Listas de Tarefas (subtarefas, prioridades, arquivamento, múltiplas notas) |

