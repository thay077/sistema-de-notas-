const btn = document.getElementById("btnAdicionar");
const tabela = document.querySelector("#tabela tbody");
const btnTema = document.getElementById("btnTema");
const body = document.body;

// ===== Adicionar aluno =====
btn.addEventListener("click", () => {
  const nome = document.getElementById("nome").value.trim();
  const nota1 = parseFloat(document.getElementById("nota1").value);
  const nota2 = parseFloat(document.getElementById("nota2").value);

  if (!nome || isNaN(nota1) || isNaN(nota2)) {
    alert("Por favor, preencha todos os campos corretamente!");
    return;
  }

  const media = ((nota1 + nota2) / 2).toFixed(2);
  const situacao = media >= 6 ? "Aprovado" : "Reprovado";

  const linha = document.createElement("tr");
  linha.innerHTML = `
    <td>${nome}</td>
    <td>${nota1}</td>
    <td>${nota2}</td>
    <td>${media}</td>
    <td class="${situacao.toLowerCase()}">${situacao}</td>
  `;

  tabela.appendChild(linha);

  // limpa os campos
  document.getElementById("nome").value = "";
  document.getElementById("nota1").value = "";
  document.getElementById("nota2").value = "";

  salvarTabela();
});

// ===== Modo escuro =====
btnTema.addEventListener("click", () => {
  body.classList.toggle("dark");

  if (body.classList.contains("dark")) {
    btnTema.textContent = "☀️ Modo Claro";
    localStorage.setItem("tema", "dark");
  } else {
    btnTema.textContent = "🌙 Modo Escuro";
    localStorage.setItem("tema", "light");
  }
});

// ===== Salvar e carregar dados =====
function salvarTabela() {
  localStorage.setItem("tabelaNotas", tabela.innerHTML);
}

window.addEventListener("load", () => {
  const dadosSalvos = localStorage.getItem("tabelaNotas");
  const temaSalvo = localStorage.getItem("tema");

  if (dadosSalvos) tabela.innerHTML = dadosSalvos;
  if (temaSalvo === "dark") {
    body.classList.add("dark");
    btnTema.textContent = "☀️ Modo Claro";
  }
});
