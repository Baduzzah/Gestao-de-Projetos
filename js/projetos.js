document.addEventListener('DOMContentLoaded', () => {

  let usuario = JSON.parse(localStorage.getItem('usuario')) || { role: 'aluno', nome: 'Visitante' };
  document.getElementById("nomeUsuario").textContent = usuario.nome;

  // Carrega projetos criados | ou usa exemplos caso ainda não exista nada ((dps tem q apagar iss))
  let projetos = JSON.parse(localStorage.getItem("projetos")) || [
    { id: 1, titulo: "Robótica Sustentável", curso: "GTI", status: "aberto", tematica: "Sustentabilidade" },
    { id: 2, titulo: "Feira de Jogos Educacionais", curso: "ADS", status: "aberto", tematica: "Educação" },
    { id: 3, titulo: "Banco de Alimentos Comunitário", curso: "GLI", status: "em andamento", tematica: "Impacto Social" }
  ];


  const lista = document.querySelector(".lista-projetos");

  function render() {
    const texto = document.getElementById("filtroTexto").value.toLowerCase();
    const curso = document.getElementById("filtroCurso").value;
    const status = document.getElementById("filtroStatus").value;

    lista.innerHTML = "";

    projetos
      .filter(p => p.titulo.toLowerCase().includes(texto) || (p.tematica || "").toLowerCase().includes(texto))
      .filter(p => curso === "" || p.curso === curso)
      .filter(p => status === "" || p.status === status)
      .forEach(p => {

        const statusClass = "status-" + p.status.toLowerCase().replaceAll(" ", "-");

        lista.innerHTML += `
      <div class="item-projeto">
        <div class="status ${statusClass}"></div>

        <div>
          <strong>${p.titulo}</strong><br>
          <small>${p.tematica || ""}</small>
        </div>

        <div><small>${p.curso}</small></div>
        <div><small>${p.status}</small></div>

        <a href="projeto_detalhes.html?id=${p.id}" class="botao-abrir">abrir</a>
      </div>
    `;
      });

  }

  render();

  document.getElementById("filtroTexto").oninput = render;
  document.getElementById("filtroCurso").onchange = render;
  document.getElementById("filtroStatus").onchange = render;
});
