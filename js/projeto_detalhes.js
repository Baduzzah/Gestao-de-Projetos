document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const tituloEl = document.getElementById("tituloProjeto");
  const descEl = document.getElementById("descricaoProjeto");
  const cursoEl = document.getElementById("cursoProjeto");
  const profsEl = document.getElementById("profsProjeto");
  const acoesAluno = document.getElementById("acoesAluno");
  const acoesProfessor = document.getElementById("acoesProfessor");
  const btnParticipar = document.getElementById("btnParticipar");
  const btnEnviarEvidencia = document.getElementById("btnEnviarEvidencia");

  // Usuário
  const usuario = JSON.parse(localStorage.getItem("usuario")) || null;
  if (usuario) document.getElementById("nomeUsuario").textContent = usuario.nome;

  if (!id) {
    tituloEl.textContent = "Projeto não encontrado";
    return;
  }

  let projetos = JSON.parse(localStorage.getItem("projetos") || "[]");
  const projeto = projetos.find(p => p.id == id);

  if (!projeto) {
    tituloEl.textContent = "Projeto não encontrado";
    return;
  }

  // Mostra dados do projeto
  tituloEl.textContent = projeto.titulo;
  descEl.textContent = projeto.descricao || "(sem descrição)";
  cursoEl.textContent = projeto.curso || "Todos";

  // Professores responsáveis
  profsEl.innerHTML = (projeto.profsResponsaveis?.length > 0)
    ? projeto.profsResponsaveis.map(p => `<li>${p.nome} — ${p.disciplina}</li>`).join("")
    : "<li>(Nenhum professor cadastrado)</li>";

  // Exibir se é aluno
  if (usuario?.role === "aluno") {
    acoesAluno.style.display = "block";

    const jaInscrito = projeto.participantes?.some(p => p.nome === usuario.nome);

    // Projeto finalizado → sem inscrições
    if (projeto.status === "finalizado") {
      btnParticipar.textContent = "Projeto Finalizado";
      btnParticipar.classList.add("botao-desativado");
      btnParticipar.disabled = true;
      btnEnviarEvidencia.style.display = jaInscrito ? "inline-block" : "none";
      return;
    }

    // Já participa → mostra botão de enviar evidência
    if (jaInscrito) {
      btnParticipar.style.display = "none";
      btnEnviarEvidencia.style.display = "inline-block";
    }
    // Não participa → mostra botão de participar
    else {
      btnEnviarEvidencia.style.display = "none";
      btnParticipar.onclick = () => {
        projeto.participantes = projeto.participantes || [];
        projeto.participantes.push({ nome: usuario.nome, ra: usuario.ra || "RA" });

        localStorage.setItem("projetos", JSON.stringify(projetos));
        alert("Inscrição realizada com sucesso!");
        location.reload();
      };
    }
  }

  // Exibir se professor
  if (usuario?.role === "professor") {
    acoesProfessor.style.display = "block";
  }

});
