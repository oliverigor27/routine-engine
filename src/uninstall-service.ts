import { existsSync, unlinkSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

function removerServicoSystemd() {
  const serviceName = 'qg-rotina.service';
  const serviceFilePath = join(homedir(), '.config', 'systemd', 'user', serviceName);

  console.log('🧹 Iniciando limpeza do serviço no Systemd...');

  try {
    execSync(`systemctl --user disable --now ${serviceName}`, { stdio: 'ignore' });
    console.log('⏹️ Serviço parado e desabilitado.');
  } catch {
  }

  if (existsSync(serviceFilePath)) {
    unlinkSync(serviceFilePath);
    console.log(`🗑️ Arquivo removido: ${serviceFilePath}`);
  } else {
    console.log('ℹ️ Nenhum arquivo de serviço encontrado para remover.');
  }

  try {
    execSync('systemctl --user daemon-reload', { stdio: 'inherit' });
    execSync('systemctl --user reset-failed', { stdio: 'ignore' });
    console.log('✨ Systemd limpo com sucesso!');
  } catch (erro) {
    console.error('⚠️ Erro ao recarregar o systemd:', erro);
  }
}

removerServicoSystemd();