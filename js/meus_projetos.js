document.addEventListener('DOMContentLoaded', () => {

  let usuario = JSON.parse(localStorage.getItem('usuario'));
  if (!usuario) {
    usuario = { nome: "Usuário Teste", role: "aluno" };
    localStorage.setItem("usuario", JSON.stringify(usuario));
  }

  document.getElementById("nomeUsuario").textContent = usuario.nome;

  // Simulação para testes (troque depois pelo banco):
  const meusProjetosAluno = [1, 3]; // projetos que o aluno participa
  const meusProjetosProfessor = [2]; // projetos que o professor coordena

  const projetos = [
    { id: 1, titulo: "Robótica Sustentável", publico: "Engenharia", status: "aberto" },
    { id: 2, titulo: "Feira de Jogos Educacionais", publico: "ADS / SI", status: "aberto" },
    { id: 3, titulo: "Banco de Alimentos Comunitário", publico: "Logística", status: "em andamento" }
  ];

  let filtrados = [];

  if (usuario.role === "aluno") {
    document.getElementById("descricaoPagina").textContent = "Projetos nos quais você está inscrito.";
    filtrados = projetos.filter(p => meusProjetosAluno.includes(p.id));

  } else if (usuario.role === "professor") {
    document.getElementById("descricaoPagina").textContent = "Projetos pelos quais você é responsável.";
    filtrados = projetos.filter(p => meusProjetosProfessor.includes(p.id));
  }

  const lista = document.getElementById("listaMeusProjetos");

  lista.innerHTML = "";

  filtrados.forEach(p => {
    const card = document.createElement("a");
    card.className = "card";
    card.href = `projeto_detalhes.html?id=${p.id}`;

    card.innerHTML = `
      <h3>${p.titulo}</h3>
      <p><strong>Público:</strong> ${p.publico}</p>
      <p><strong>Status:</strong> ${p.status}</p>
    `;

    lista.appendChild(card);
  });

});
