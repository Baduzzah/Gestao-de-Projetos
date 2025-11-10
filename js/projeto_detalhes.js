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
  const btnSairProjeto = document.getElementById("btnSairProjeto");
  const btnFinalizar = document.getElementById("btnFinalizarProjeto");

  const usuario = JSON.parse(localStorage.getItem("usuario")) || null;
  if (usuario) document.getElementById("nomeUsuario").textContent = usuario.nome;

  if (!id) return tituloEl.textContent = "Projeto não encontrado";

  let projetos = JSON.parse(localStorage.getItem("projetos") || "[]");
  const projeto = projetos.find(p => p.id == id);
  if (!projeto) return tituloEl.textContent = "Projeto não encontrado";

  document.getElementById("linkEnviarEvidencia").href = `enviar_evidencias.html?id=${projeto.id}`;


  // Preencher dados principais
  tituloEl.textContent = projeto.titulo;
  descEl.textContent = projeto.descricao || "(sem descrição)";
  cursoEl.textContent = projeto.curso || "Todos";

  // Datas
  document.getElementById("dataInicio").textContent = projeto.dataInicio || "(não informado)";
  document.getElementById("dataFim").textContent = projeto.dataFim || "(não informado)";

  const arquivoBox = document.getElementById("arquivoBox");
  const arquivoConteudo = document.getElementById("arquivoConteudo");

  if (projeto.arquivo) {
    arquivoBox.style.display = "block";

    // Se for imagem → mostrar imagem
    if (projeto.arquivo.startsWith("data:image")) {
      arquivoConteudo.innerHTML = `<img src="${projeto.arquivo}" style="max-width:300px; border-radius:8px;">`;
    }
    // Se for PDF → botão para abrir
    else if (projeto.arquivo.startsWith("data:application/pdf")) {
      arquivoConteudo.innerHTML = `<a href="${projeto.arquivo}" target="_blank" class="botao-secundario">Abrir PDF</a>`;
    }
  }


  // Professores
  profsEl.innerHTML = (projeto.profsResponsaveis?.length > 0)
    ? projeto.profsResponsaveis.map(p => `<p>${p.nome} — ${p.disciplina}</p>`).join("")
    : "<p>(Nenhum professor cadastrado)</p>";

  // Etapas / Iniciativas
  document.getElementById("listaEtapas").innerHTML =
    projeto.etapas?.length ? projeto.etapas.map(e => `<p>${e}</p>`).join("") : "<p>(Nenhuma etapa cadastrada)</p>";

  document.getElementById("listaIniciativas").innerHTML =
    projeto.iniciativas?.length ? projeto.iniciativas.map(i => `<p>${i.nome} — <small>${i.etapa}</small></p>`).join("") : "<p>(Nenhuma iniciativa cadastrada)</p>";

  // Se aluno
  if (usuario?.role === "aluno") {
    acoesAluno.style.display = "block";

    const jaInscrito = projeto.participantes?.some(p => p.nome === usuario.nome);

    // Projeto finalizado
    if (projeto.status === "finalizado") {
      btnParticipar.disabled = true;
      btnParticipar.textContent = "Projeto Finalizado";
      btnEnviarEvidencia.style.display = jaInscrito ? "inline-block" : "none";
      return;
    }

    if (jaInscrito) {
      btnParticipar.style.display = "none";
      btnEnviarEvidencia.style.display = "inline-block";
      btnSairProjeto.style.display = "inline-block";

      btnSairProjeto.onclick = () => {
        projeto.participantes = projeto.participantes.filter(p => p.nome !== usuario.nome);
        localStorage.setItem("projetos", JSON.stringify(projetos));
        alert("Você saiu do projeto.");
        location.reload();
      };

    } else {
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

  // Se professor
  if (usuario?.role === "professor") {
    acoesProfessor.style.display = "block";

    btnFinalizar.onclick = () => {
      const dataFinal = prompt("Data de término (ex: 2025-05-30):");
      if (!dataFinal) return;
      projeto.status = "finalizado";
      projeto.dataFim = dataFinal;
      localStorage.setItem("projetos", JSON.stringify(projetos));
      alert("Projeto finalizado!");
      location.reload();
    };
  }

});
