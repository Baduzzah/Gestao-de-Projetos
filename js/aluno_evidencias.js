document.addEventListener('DOMContentLoaded', () => {

  let usuario = JSON.parse(localStorage.getItem("usuario"));
  if(!usuario) return;

  document.getElementById("nomeUsuario").textContent = usuario.nome;

  // MOCK - Substituir depois pelo banco
  const evidencias = [
    { id: 1, projeto: "Robótica Sustentável", iniciativa: "Workshop 1", status: "Aguardando validação" },
    { id: 2, projeto: "Feira de Jogos Educacionais", iniciativa: "Desenvolvimento", status: "Aprovado" },
    { id: 3, projeto: "Banco de Alimentos Comunitário", iniciativa: "Palestra", status: "Rejeitado" }
  ];

  const lista = document.getElementById("listaEvidencias");
  lista.innerHTML = "";

  evidencias.forEach(ev => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${ev.projeto}</h3>
      <p><strong>Iniciativa:</strong> ${ev.iniciativa}</p>
      <p><strong>Status:</strong> ${ev.status}</p>
    `;

    lista.appendChild(card);
  });

});
