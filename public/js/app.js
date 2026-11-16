/* ==========================================================================
   QG de Rotina — Lógica do painel
   ========================================================================== */

const API = {
  hoje: '/api/hoje',
  tarefa: (id) => `/api/tarefas/${id}`,
};

const RING_CIRCUMFERENCE = 2 * Math.PI * 52;

const el = {
  dataHoje: document.getElementById('data-hoje'),
  badgeDia: document.getElementById('badge-dia'),
  foco: document.getElementById('foco-hoje'),
  lazer: document.getElementById('lazer-hoje'),
  lista: document.getElementById('lista-tarefas'),
  btnRecarregar: document.getElementById('btn-recarregar'),
  progress: document.querySelector('.progress'),
  progressBar: document.getElementById('progress-bar'),
  progressPercent: document.getElementById('progress-percent'),
  progressCount: document.getElementById('progress-count'),
  status: document.getElementById('status-conexao'),
  toast: document.getElementById('toast'),
};

let tarefas = [];

/* Utilitários ------------------------------------------------------------ */

function setText(node, text) {
  node.textContent = text;
  node.classList.remove('is-skeleton');
}

function setStatus(online) {
  el.status.classList.toggle('is-online', online);
  el.status.classList.toggle('is-offline', !online);
  el.status.querySelector('.status__text').textContent = online
    ? 'Conectado ao servidor local'
    : 'Sem conexão com o servidor local';
}

let toastTimer;
function showToast(message, isError = false) {
  el.toast.textContent = message;
  el.toast.classList.toggle('is-error', isError);
  el.toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove('is-visible'), 2800);
}

function renderData() {
  const hoje = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  el.dataHoje.textContent = hoje;
}

/* Renderização ----------------------------------------------------------- */

function renderProgresso() {
  const total = tarefas.length;
  const concluidas = tarefas.filter((t) => t.concluida === 1).length;
  const pct = total === 0 ? 0 : Math.round((concluidas / total) * 100);

  el.progressBar.style.strokeDashoffset = RING_CIRCUMFERENCE * (1 - pct / 100);
  el.progressPercent.textContent = `${pct}%`;
  el.progressCount.textContent = `${concluidas} de ${total}`;
  el.progress.classList.toggle('is-complete', total > 0 && pct === 100);
}

function criarItemTarefa(tarefa) {
  const li = document.createElement('li');
  li.className = 'task';
  li.dataset.id = tarefa.id;
  li.classList.toggle('is-done', tarefa.concluida === 1);

  const label = document.createElement('label');
  label.className = 'task__label';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.className = 'task__input';
  input.checked = tarefa.concluida === 1;
  input.addEventListener('change', () => alternarTarefa(tarefa.id, input.checked, li, input));

  const check = document.createElement('span');
  check.className = 'task__check';
  check.setAttribute('aria-hidden', 'true');
  check.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

  const texto = document.createElement('span');
  texto.className = 'task__text';
  texto.textContent = tarefa.descricao;

  label.append(input, check, texto);
  li.append(label);
  return li;
}

function renderTarefas() {
  el.lista.replaceChildren();

  if (tarefas.length === 0) {
    const vazio = document.createElement('li');
    vazio.className = 'empty';
    vazio.innerHTML =
      '<strong>Nenhuma tarefa para hoje</strong>Adicione itens em <code>Foco de Hoje.md</code> e sincronize.';
    el.lista.append(vazio);
  } else {
    el.lista.append(...tarefas.map(criarItemTarefa));
  }

  renderProgresso();
}

/* Dados ------------------------------------------------------------------ */

async function carregarDados() {
  el.btnRecarregar.classList.add('is-spinning');

  try {
    const resposta = await fetch(API.hoje);
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

    const dados = await resposta.json();
    if (!dados.sucesso) throw new Error('Resposta inválida do servidor');

    const grade = dados.grade ?? {};
    setText(el.badgeDia, grade.dia_nome ?? '—');
    setText(el.foco, grade.foco ?? 'Nenhum foco definido para hoje.');
    setText(el.lazer, grade.lazer ?? '—');

    tarefas = dados.tarefas ?? [];
    renderTarefas();
    setStatus(true);
  } catch (erro) {
    console.error('Erro ao carregar dados:', erro);
    setStatus(false);
    setText(el.badgeDia, 'Offline');
    setText(el.foco, 'Não foi possível conectar ao servidor local.');
    setText(el.lazer, '—');
    tarefas = [];
    renderTarefas();
    showToast('Erro ao carregar os dados.', true);
  } finally {
    el.btnRecarregar.classList.remove('is-spinning');
  }
}

async function alternarTarefa(id, concluida, li, input) {
  const tarefa = tarefas.find((t) => t.id === id);
  if (!tarefa) return;

  const anterior = tarefa.concluida;

  // Atualização otimista
  tarefa.concluida = concluida ? 1 : 0;
  li.classList.toggle('is-done', concluida);
  li.classList.add('is-pending');
  renderProgresso();

  try {
    const resposta = await fetch(API.tarefa(id), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concluida }),
    });
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

    if (concluida && tarefas.every((t) => t.concluida === 1)) {
      showToast('Todas as tarefas de hoje concluídas!');
    }
  } catch (erro) {
    console.error('Erro ao atualizar tarefa:', erro);
    tarefa.concluida = anterior;
    input.checked = anterior === 1;
    li.classList.toggle('is-done', anterior === 1);
    renderProgresso();
    showToast('Não foi possível salvar a alteração.', true);
  } finally {
    li.classList.remove('is-pending');
  }
}

/* Inicialização ---------------------------------------------------------- */

el.btnRecarregar.addEventListener('click', carregarDados);

renderData();
carregarDados();
