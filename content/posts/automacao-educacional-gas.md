---
title: Automatizando o Ensino Superior com Google Apps Script
date: 2025-02-10
tags: [Google Apps Script, Automação, EAD]
readTime: 8 min
---

# Automatizando o Ensino Superior com Google Apps Script

Durante cinco anos coordenando o NEAD do Grupo Focus, convivi com um paradoxo típico de instituições de ensino: processos complexos, equipes enxutas, e planilhas que cresciam mais rápido do que a capacidade de gerenciá-las.

A solução não veio de um ERP caro nem de uma plataforma pronta. Veio do Google Apps Script — uma ferramenta que a maioria ignora, escondida dentro do Google Workspace.

## O Problema Real

Imagine o seguinte cenário:

- **200+ cursos** com estrutura própria em Moodle
- **Matrículas** chegando via formulário, e-mail e sistema legado
- **Tutores** que precisavam de relatórios semanais
- **Certificados** emitidos manualmente após validação de carga horária
- **Tudo isso** coordenado por uma equipe de 4 pessoas

A planilha grew. O e-mail grew. O caos também.

## A Virada: Apps Script como cola entre sistemas

O Google Apps Script é JavaScript que roda nos servidores do Google e tem acesso nativo a toda a suite: Sheets, Forms, Gmail, Drive, Calendar e Docs. Não precisa de servidor. Não precisa de deploy. Funciona com um `Ctrl+S`.

```javascript
function enviarRelatorioSemanal() {
  const planilha = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const alunos = planilha.getSheetByName('Alunos').getDataRange().getValues();
  
  const atrasados = alunos.filter(row => row[STATUS_COL] === 'Atrasado');
  
  atrasados.forEach(aluno => {
    GmailApp.sendEmail(aluno[EMAIL_COL], 
      'Atenção: atividades pendentes no seu curso',
      gerarCorpoEmail(aluno)
    );
  });
  
  Logger.log(`${atrasados.length} alunos notificados.`);
}
```

Com esse padrão, automatizei:

1. **Envio de alertas** para alunos em atraso
2. **Geração de certificados** em PDF direto no Google Docs
3. **Relatórios** para coordenação com dados consolidados
4. **Integração** com formulários de matrícula

## O Que Aprendi

### 1. Simplicidade é funcional

Não precisei de React, Docker ou CI/CD. O script roda em um `trigger` diário configurado pela UI do Google. Simples e confiável.

### 2. Dados limpos valem mais que automação sofisticada

A automação boa começa na planilha bem organizada. Cabeçalhos descritivos, sem células mescladas, sem formatação condicional escondendo dados — esse trabalho manual de organização foi o que viabilizou tudo.

### 3. O erro é seu professor

O `try-catch` com log no Sheets virou debug padrão:

```javascript
function executarComLog(fn, contexto) {
  try {
    fn();
  } catch (e) {
    const logSheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName('Logs');
    logSheet.appendRow([new Date(), contexto, e.message]);
  }
}
```

## Resultado

O tempo gasto em tarefas manuais caiu **~70%**. A equipe de 4 pessoas passou a conseguir escalar para 200 cursos sem aumentar headcount proporcional. E eu aprendi que a ferramenta certa não é a mais poderosa — é a que elimina a fricção onde ela realmente dói.

---

*Tem interesse em saber mais sobre automação educacional com GAS? Entra em contato pelo [LinkedIn](https://linkedin.com/in/vitorkrewer).*
