import express, { Request, Response } from 'express';
import db, { initDatabase } from './database.js';
import { sincronizeMarkdownFroDatabase, atualizarStatusNoMarkdown } from './sync-md.js';
import { dispararNotificacaoHoje } from './notifier.js';

initDatabase();

const app = express();
const PORT = 3456;

app.use(express.static('public'));
app.use(express.json());

function getHojeIndex(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

app.get('/api/hoje', (req: Request, res: Response) => {
  sincronizeMarkdownFroDatabase();

  const hojeIdx = getHojeIndex();

  const gradeStmt = db.prepare('SELECT * FROM grade_semanal WHERE dia_index = ?');
  const gradeHoje = gradeStmt.get(hojeIdx);

  const dataHoje = new Date().toISOString().split('T')[0];

  const tarefasStmt = db.prepare('SELECT * FROM tarefas WHERE data = ?');
  const tarefasHoje = tarefasStmt.all(dataHoje);

  res.json({
    sucesso: true,
    grade: gradeHoje,
    tarefas: tarefasHoje
  });
});

app.patch('/api/tarefas/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { concluida } = req.body;

  const statusInt = concluida ? 1 : 0;

  const tarefaStmt = db.prepare('SELECT * FROM tarefas WHERE id = ?');
  const tarefa = tarefaStmt.get(id) as { descricao: string } | undefined;

  if (!tarefa) {
    res.status(404).json({ sucesso: false, erro: 'Tarefa não encontrada.' });
    return;
  }

  const updateStmt = db.prepare('UPDATE tarefas SET concluida = ? WHERE id = ?');
  updateStmt.run(statusInt, id);

  atualizarStatusNoMarkdown(tarefa.descricao, concluida);

  res.json({ sucesso: true, mensagem: 'Tarefa atualizada com sucesso!' });
});

app.listen(PORT, () => {
  console.log(`🚀 QG de Rotina ativo em http://localhost:${PORT}`);
  dispararNotificacaoHoje();
});