import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

function instalarServicoSystemd() {
  const projetoDir = process.cwd();
  const userHome = homedir();
  const systemdDir = join(userHome, '.config', 'systemd', 'user');

  if (!existsSync(systemdDir)) {
    mkdirSync(systemdDir, { recursive: true });
    console.log('📁 Pasta systemd do usuário criada.');
  }

  const serviceFilePath = join(systemdDir, 'qg-rotina.service');
  const nodePath = process.execPath; 
  const tsxPath = join(projetoDir, 'node_modules', '.bin', 'tsx');

  const serviceContent = `[Unit]
Description=QG de Rotina - Servidor Express, SQLite e Obsidian Sync
After=network.target

[Service]
ExecStart=${nodePath} ${tsxPath} ${join(projetoDir, 'src', 'server.ts')}
WorkingDirectory=${projetoDir}
Restart=always
Environment=PATH=${process.env.PATH || '/usr/bin:/bin:/usr/local/bin'}
Environment=NODE_ENV=production

[Install]
WantedBy=default.target
`;

  writeFileSync(serviceFilePath, serviceContent, 'utf-8');
  console.log(`📝 Arquivo de serviço gerado com sucesso em: ${serviceFilePath}`);

  try {
    console.log('🔄 Registrando e ativando o serviço no Systemd...');
    execSync('systemctl --user daemon-reload', { stdio: 'inherit' });
    execSync('systemctl --user enable --now qg-rotina.service', { stdio: 'inherit' });
    console.log('🚀 QG de Rotina configurado e rodando em segundo plano no Fedora!');
  } catch (erro) {
    console.error('⚠️ Erro ao registrar no systemd:', erro);
  }
}

instalarServicoSystemd();