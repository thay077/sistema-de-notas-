const nomeInput = document.getElementById('nome');
const tri1Input = document.getElementById('tri1');
const tri2Input = document.getElementById('tri2');
const tri3Input = document.getElementById('tri3');
const adicionarBtn = document.getElementById('adicionar');
const tabelaBody = document.getElementById('tabela-body');
const themeToggle = document.getElementById('theme-toggle');

let alunos = JSON.parse(localStorage.getItem('alunos')) || [];

function salvarLocal() {
  localStorage.setItem('alunos', JSON.stringify(alunos));
}

function calcularMedia(t1, t2, t3) {
  return ((t1 + t2 + t3) / 3).toFixed(2);
}

function renderizarTabela() {
  tabelaBody.innerHTML = '';
  alunos.forEach((aluno, index) => {
    const row = document.createElement('tr');
    const media = calcularMedia(aluno.tri1, aluno.tri2, aluno.tri3);
    const situacao = media >= 6 ? 'Aprovado' : 'Reprovado';

    row.innerHTML = `
      <td>${aluno.nome}</td>
      <td>${aluno.tri1}</td>
      <td>${aluno.tri2}</td>
      <td>${aluno.tri3}</td>
      <td>${media}</td>
      <td class="${media >= 6 ? 'aprovado' : 'reprovado'}">${situacao}</td>
      <td>
        <button class="editar" onclick="editarAluno(${index})">✏️</button>
        <button class="excluir" onclick="excluirAluno(${index})">🗑️</button>
      </td>
    `;
    tabelaBody.appendChild(row);
  });
}

function adicionarAluno() {
  const nome = nomeInput.value.trim();
  const t1 = parseFloat(tri1Input.value);
  const t2 = parseFloat(tri2Input.value);
  const t3 = parseFloat(tri3Input.value);

  if (!nome || isNaN(t1) || isNaN(t2) || isNaN(t3)) {
    alert('Preencha todos os campos!');
    return;
  }

  alunos.push({ nome, tri1: t1, tri2: t2, tri3: t3 });
  salvarLocal();
  renderizarTabela();

  nomeInput.value = '';
  tri1Input.value = '';
  tri2Input.value = '';
  tri3Input.value = '';
}

function excluirAluno(index) {
  alunos.splice(index, 1);
  salvarLocal();
  renderizarTabela();
}

function editarAluno(index) {
  const aluno = alunos[index];
  const novoT1 = prompt(`Nova nota Tri 1 para ${aluno.nome}:`, aluno.tri1);
  const novoT2 = prompt(`Nova nota Tri 2:`, aluno.tri2);
  const novoT3 = prompt(`Nova nota Tri 3:`, aluno.tri3);

  if (novoT1 !== null && novoT2 !== null && novoT3 !== null) {
    alunos[index] = { nome: aluno.nome, tri1: parseFloat(novoT1), tri2: parseFloat(novoT2), tri3: parseFloat(novoT3) };
    salvarLocal();
    renderizarTabela();
  }
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

adicionarBtn.addEventListener('click', adicionarAluno);

renderizarTabela();
