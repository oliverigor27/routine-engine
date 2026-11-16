import { spawn } from 'node:child_process';
import db from './database.js';

export function dispararNotificacaoHoje() {
  const jsDay = new Date().getDay();
  const hojeIdx = jsDay === 0 ? 6 : jsDay - 1;

  const stmt = db.prepare('SELECT dia_nome, foco, lazer FROM grade_semanal WHERE dia_index = ?');
  const grade = stmt.get(hojeIdx) as { dia_nome: string; foco: string; lazer: string } | undefined;

  if (!grade) return;

  const titulo = `🎯 QG de Rotina — ${grade.dia_nome}`;
  const mensagem = `Foco: ${grade.foco}\nLazer: ${grade.lazer}`;

  const child = spawn('notify-send', [
    titulo,
    mensagem,
    '--icon=dialog-information',
    '-u', 'normal',
    '--action=abrir=Abrir Painel do QG'
  ]);

  child.stdout.on('data', (data) => {
    const resposta = data.toString().trim();
    if (resposta === 'abrir') {
      console.log('🌐 Notificação clicada! Abrindo o painel no navegador...');
      
      spawn('xdg-open', ['http://localhost:3456'], {
        detached: true,
        stdio: 'ignore'
      }).unref();
    }
  });

  child.on('error', (error) => {
    console.error('⚠️ Erro ao disparar notificação do sistema:', error);
  });
}