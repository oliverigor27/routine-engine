import Database from 'better-sqlite3';
import { join } from 'node:path';

const dbPath = join(process.cwd(), 'rotina.sqlite');
const db = new Database(dbPath);

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS grade_semanal (
      dia_index INTEGER PRIMARY KEY,
      dia_nome TEXT NOT NULL,
      foco TEXT NOT NULL,
      lazer TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS tarefas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT NOT NULL,
      descricao TEXT NOT NULL,
      concluida INTEGER DEFAULT 0
    );
  `);

  const row = db.prepare('SELECT COUNT(*) as count FROM grade_semanal').get() as { count: number };
  
  if (row.count === 0) {
    const insert = db.prepare(`
      INSERT INTO grade_semanal (dia_index, dia_nome, foco, lazer) 
      VALUES (?, ?, ?, ?)
    `);

    const gradeInicial = [
      [0, 'Segunda-feira', 'Desenvolvimento do SaaS (Features centrais e MVP)', 'Leitura de HQs ou livros'],
      [1, 'Terça-feira', 'Pós-Graduação (Aulas, módulos e entregas)', 'Séries, jogos ou descanso livre'],
      [2, 'Quarta-feira', 'Engenharia & Arquitetura (Prática com TypeScript e Node.js)', 'Leitura de HQs ou livros'],
      [3, 'Quinta-feira', 'Desenvolvimento do SaaS (APIs, integrações e ajustes)', 'Séries, jogos ou descanso livre'],
      [4, 'Sexta-feira', 'Livre / Flexível (Adiantar pendências ou revisar metas)', 'Noite de Lazer Total (Sem estudo/código)'],
      [5, 'Sábado', 'Descanso / Livre', 'Lazer Livre'],
      [6, 'Domingo', 'Planejamento da Semana (5 min)', 'Lazer Livre']
    ];

    for (const item of gradeInicial) {
      insert.run(item[0], item[1], item[2], item[3]);
    }
    console.log('📦 Grade semanal inicial populada no SQLite com sucesso!');
  }
}

export default db;