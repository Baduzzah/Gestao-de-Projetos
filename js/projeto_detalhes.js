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

  if (!id) return (tituloEl.textContent = "Projeto não encontrado");

  const projetos = JSON.parse(localStorage.getItem("projetos") || "[]");
  const projeto = projetos.find(p => p.id == id);
  if (!projeto) return (tituloEl.textContent = "Projeto não encontrado");

  document.getElementById("linkEnviarEvidencia").href = `enviar_evidencias.html?id=${projeto.id}`;

  // --- Dados principais ---
  tituloEl.textContent = projeto.titulo;
  descEl.textContent = projeto.descricao || "(sem descrição)";
  cursoEl.textContent = projeto.curso || "Todos";

  document.getElementById("dataInicio").textContent = projeto.dataInicio || "(não informado)";
  document.getElementById("dataFim").textContent = projeto.dataFim || "(não informado)";

  // --- Arquivos do projeto ---
  const arquivoBox = document.getElementById("arquivoBox");
  const arquivoConteudo = document.getElementById("arquivoConteudo");

  const configurarGrid = () => {
    arquivoConteudo.style.display = "grid";
    arquivoConteudo.style.gridTemplateColumns = "repeat(auto-fit, minmax(180px, 1fr))";
    arquivoConteudo.style.gap = "12px";
    arquivoConteudo.style.marginTop = "10px";
    arquivoConteudo.style.alignItems = "start";
  };

  configurarGrid();

  // Função utilitária para baixar todos os arquivos
  async function baixarTodos(arquivos, nomeProjeto) {
    const zip = new JSZip();
    for (const arq of arquivos) {
      const base64 = arq.base64.split(",")[1];
      zip.file(arq.nome || "arquivo", base64, { base64: true });
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${nomeProjeto || "projeto"}_arquivos.zip`;
    a.click();
  }

  // Renderização dos arquivos (novo formato)
  if (projeto.arquivos && projeto.arquivos.length > 0) {
    arquivoBox.style.display = "block";
    arquivoConteudo.innerHTML = "";

    // botão “Baixar todos”
    const btnBaixarTodos = document.createElement("button");
    btnBaixarTodos.textContent = "⬇️ Baixar todos os arquivos";
    btnBaixarTodos.className = "botao-primario";
    btnBaixarTodos.style.marginBottom = "14px";
    btnBaixarTodos.onclick = () => baixarTodos(projeto.arquivos, projeto.titulo);
    arquivoBox.prepend(btnBaixarTodos);

    projeto.arquivos.forEach(arq => {
      const div = document.createElement("div");
      div.className = "arquivo-card";
      div.style.padding = "8px";
      div.style.border = "1px solid var(--muted)";
      div.style.borderRadius = "8px";
      div.style.background = "var(--surface)";
      div.style.textAlign = "center";
      div.style.wordBreak = "break-word";

      if (arq.tipo && arq.tipo.startsWith("image/")) {
        div.innerHTML = `
          <img src="${arq.base64}" alt="${arq.nome || "imagem"}"
               style="width:100%; border-radius:6px; margin-bottom:6px;">
          <p style="font-size:0.85em; opacity:.8;">${arq.nome || "imagem"}</p>
          <a href="${arq.base64}" download="${arq.nome}">
            <i class="fa-solid fa-download"></i> Baixar
          </a>
        `;
      } else if (arq.tipo === "application/pdf") {
        div.innerHTML = `
          <i class="fa-solid fa-file-pdf" style="font-size:2em; color:#d32f2f;"></i>
          <p style="margin:6px 0;"><a href="${arq.base64}" target="_blank">${arq.nome || "PDF"}</a></p>
        `;
      } else {
        div.innerHTML = `
          <i class="fa-solid fa-file" style="font-size:2em; color:#2980b9;"></i>
          <p style="margin:6px 0;"><a href="${arq.base64}" target="_blank">${arq.nome || "Arquivo"}</a></p>
        `;
      }

      arquivoConteudo.appendChild(div);
    });
  }
  // compatibilidade com formato antigo (um único arquivo)
  else if (projeto.arquivo) {
    arquivoBox.style.display = "block";
    arquivoConteudo.innerHTML = "";

    const div = document.createElement("div");
    div.className = "arquivo-card";
    div.style.textAlign = "center";

    if (projeto.arquivo.startsWith("data:image")) {
      div.innerHTML = `
        <img src="${projeto.arquivo}" alt="Imagem" style="width:100%; border-radius:6px;">
        <a href="${projeto.arquivo}" download="arquivo">
          <i class="fa-solid fa-download"></i> Baixar
        </a>
      `;
    } else if (projeto.arquivo.startsWith("data:application/pdf")) {
      div.innerHTML = `
        <i class="fa-solid fa-file-pdf" style="font-size:2em; color:#d32f2f;"></i>
        <a href="${projeto.arquivo}" target="_blank" class="botao-secundario">Abrir PDF</a>
      `;
    }

    arquivoConteudo.appendChild(div);
  }

  // --- Professores ---
  profsEl.innerHTML =
    projeto.profsResponsaveis?.length > 0
      ? projeto.profsResponsaveis.map(p => `<p>${p.nome} — ${p.disciplina}</p>`).join("")
      : "<p>(Nenhum professor cadastrado)</p>";

  // --- Etapas / Iniciativas ---
  const listaEtapas = document.getElementById("listaEtapas");
  const listaIniciativas = document.getElementById("listaIniciativas");

  listaEtapas.innerHTML = projeto.etapas?.length
    ? projeto.etapas
      .map(e => `
          <div style="margin-bottom:10px;">
            <p><strong>${e.nome}</strong></p>
            ${e.descricao ? `<p style="margin-left:10px; opacity:.8;">${e.descricao}</p>` : ""}
            ${(e.dataInicio || e.dataFim)
          ? `<small style="margin-left:10px; color:var(--muted);">
                  ${e.dataInicio ? `Início: ${e.dataInicio}` : ""} 
                  ${e.dataFim ? ` | Fim: ${e.dataFim}` : ""}
                </small>` : ""}
          </div>`)
      .join("")
    : "<p>(Nenhuma etapa cadastrada)</p>";

  listaIniciativas.innerHTML = projeto.iniciativas?.length
    ? projeto.iniciativas
      .map(i => `
          <div style="margin-bottom:10px;">
            <p><strong>${i.nome}</strong> ${i.etapa ? `<small>(${i.etapa})</small>` : ""}</p>
            ${i.descricao ? `<p style="margin-left:10px; opacity:.8;">${i.descricao}</p>` : ""}
            ${(i.dataInicio || i.dataFim)
          ? `<small style="margin-left:10px; color:var(--muted);">
                  ${i.dataInicio ? `Início: ${i.dataInicio}` : ""} 
                  ${i.dataFim ? ` | Fim: ${i.dataFim}` : ""}
                </small>` : ""}
          </div>`)
      .join("")
    : "<p>(Nenhuma iniciativa cadastrada)</p>";

  // --- Ações de aluno ---
  if (usuario?.role === "aluno") {
    acoesAluno.style.display = "block";

    const jaInscrito = projeto.participantes?.some(p => p.nome === usuario.nome);

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

  // --- Ações de professor ---
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
