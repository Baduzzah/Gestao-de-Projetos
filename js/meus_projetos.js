document.addEventListener('DOMContentLoaded', () => {

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  document.getElementById("nomeUsuario").textContent = usuario?.nome || "Usuário";

  let projetos = JSON.parse(localStorage.getItem("projetos") || "[]");

  // ALUNO → mostra projetos que ele participa
  if (usuario.role === "aluno") {
    projetos = projetos.filter(p =>
      p.participantes?.some(part => part.nome === usuario.nome)
    );
  }

  // PROFESSOR → mostra projetos que ele coordena
  if (usuario.role === "professor") {
    projetos = projetos.filter(p =>
      p.profsResponsaveis?.some(prof => prof.nome === usuario.nome)
    );
  }

  const lista = document.querySelector(".lista-projetos");

  function render() {

    const texto = document.getElementById("filtroTexto").value.toLowerCase();
    const status = document.getElementById("filtroStatus")?.value || "";

    lista.innerHTML = "";

    projetos
      .filter(p => p.titulo.toLowerCase().includes(texto) || (p.tematica || "").toLowerCase().includes(texto))
      .filter(p => status === "" || p.status === status)
      .forEach(p => {
        const statusClass = "status-" + p.status.replaceAll(" ", "-");

        lista.innerHTML += `
          <div class="item-projeto">
            <div class="status ${statusClass}"></div>
            <div><strong>${p.titulo}</strong><br><small>${p.tematica || ""}</small></div>
            <div><small>${p.status}</small></div>
            <a href="projeto_detalhes.html?id=${p.id}" class="botao-abrir">abrir</a>
          </div>
        `;
      });
  }

  render();

  document.getElementById("filtroTexto").oninput = render;
  document.getElementById("filtroStatus")?.addEventListener("change", render);

});
