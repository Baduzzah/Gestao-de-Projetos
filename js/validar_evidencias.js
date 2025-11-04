document.addEventListener('DOMContentLoaded', () => {

  let usuario = JSON.parse(localStorage.getItem("usuario"));
  if(!usuario || usuario.role !== "professor") {
    alert("Acesso restrito a professores.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("nomeUsuario").textContent = usuario.nome;

  const pendentes = [
    { id: 1, aluno: "Maria Lopes", projeto: "Robótica Sustentável", arquivo: "certificado.pdf" },
    { id: 2, aluno: "João Silva", projeto: "Banco de Alimentos", arquivo: "foto_atividade.jpg" }
  ];

  const lista = document.getElementById("listaValidar");
  lista.innerHTML = "";

  pendentes.forEach(ev => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${ev.projeto}</h3>
      <p><strong>Aluno:</strong> ${ev.aluno}</p>
      <p><strong>Arquivo:</strong> ${ev.arquivo}</p>

      <button onclick="aprovar(${ev.id})" class="button is-success">Aprovar</button>
      <button onclick="rejeitar(${ev.id})" class="button is-danger">Rejeitar</button>
    `;

    lista.appendChild(card);
  });

});

function aprovar(id) { alert("Aprovado! (aqui salva no BD)"); }
function rejeitar(id) { alert("Rejeitado! (aqui salva no BD)"); }
