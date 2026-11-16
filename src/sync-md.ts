import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import db from "./database.js";

const VAULT_PATH = join(homedir(), "Documents", "Routine");
const TAREFAS_HOJE_PATH = join(VAULT_PATH, 'Tarefas', 'Hoje.md');

function getDataHoje(): string {
  const hoje = new Date();
  return hoje.toISOString().split('T')[0];
}

export function sincronizeMarkdownFroDatabase() {
  if (!existsSync(TAREFAS_HOJE_PATH)) {
    console.log('⚠️ Arquivo Foco de Hoje.md não encontrado. Pulando sincronização.');
    return;
  }

  const contentMd = readFileSync(TAREFAS_HOJE_PATH, 'utf-8');
  const todayDate = getDataHoje();
  const tasks = contentMd.split('\n');

  const insertOrIgnore = db.prepare(`
    INSERT INTO tarefas (data, descricao, concluida)
    SELECT ?, ?, ? 
    WHERE NOT EXISTS (
      SELECT 1 FROM tarefas WHERE data = ? AND descricao = ?
    )
  `);

    for (const task of tasks) {
    const match = task.match(/^(\s*)-\s+\[([ xX])\]\s+(.*)$/);
    if (match) {
      const finishe = match[2].toLowerCase() === 'x' ? 1 : 0;
      const description = match[3].trim();
      insertOrIgnore.run(todayDate, description, finishe, todayDate, description);
    }
  }
}

export function atualizarStatusNoMarkdown(descricao: string, concluida: boolean) {
  if (!existsSync(TAREFAS_HOJE_PATH)) return;

  const conteudoMd = readFileSync(TAREFAS_HOJE_PATH, 'utf-8');
  const linhas = conteudoMd.split('\n');

  const novasLinhas = linhas.map(linha => {
    if (linha.includes(descricao)) {
      if (concluida) {
        return linha.replace(/\[\s*\]/, '[x]');
      } else {
        return linha.replace(/\[[xX]\]/, '[ ]');
      }
    }
    return linha;
  });

  writeFileSync(TAREFAS_HOJE_PATH, novasLinhas.join('\n'), 'utf-8');
}
