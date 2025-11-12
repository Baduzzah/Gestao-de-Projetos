document.addEventListener('DOMContentLoaded', () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario || usuario.role !== "professor") {
    alert("Apenas professores podem validar evidências.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("nomeUsuario").textContent = usuario.nome;

  const projetos = JSON.parse(localStorage.getItem("projetos") || "[]");
  const lista = document.getElementById("listaValidar");

  // --- Filtros ---
  const filtroTexto = document.getElementById("filtroTexto");
  const filtroProjeto = document.getElementById("filtroProjeto");
  const filtroIniciativa = document.getElementById("filtroIniciativa");
  const filtroAluno = document.getElementById("filtroAluno");
  const filtroStatus = document.getElementById("filtroStatus");

  // monta listas únicas
  const alunosSet = new Set();
  const iniciativasSet = new Set();
  const projetosComEvidencias = projetos.filter(p => (p.evidencias || []).length > 0);

  projetosComEvidencias.forEach(p => {
    (p.evidencias || []).forEach(ev => {
      alunosSet.add(ev.alunoNome);
      if (ev.iniciativa) iniciativasSet.add(ev.iniciativa);
    });
  });

  // preenche selects
  projetosComEvidencias.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.titulo;
    filtroProjeto.appendChild(opt);
  });

  [...iniciativasSet].forEach(nome => {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = nome;
    filtroIniciativa.appendChild(opt);
  });

  [...alunosSet].forEach(nome => {
    const opt = document.createElement("option");
    opt.value = nome;
    opt.textContent = nome;
    filtroAluno.appendChild(opt);
  });

  // cor por status
  function getStatusColor(status) {
    switch (status) {
      case "aprovado": return "var(--aberto)";
      case "rejeitado": return "var(--rejeitado)";
      case "pendente": return "var(--pendente)";
      case "andamento": return "var(--andamento)";
      default: return "var(--concluido)";
    }
  }

  // render principal
  function renderLista() {
    lista.innerHTML = "";
    let evidencias = [];

    projetos.forEach(p => {
      (p.evidencias || []).forEach(ev => evidencias.push({ projeto: p, evidencia: ev }));
    });

    const texto = filtroTexto.value.toLowerCase().trim();

    evidencias = evidencias.filter(obj => {
      const { projeto, evidencia } = obj;

      const textoCombina =
        !texto ||
        projeto.titulo.toLowerCase().includes(texto) ||
        (evidencia.alunoNome || "").toLowerCase().includes(texto) ||
        (evidencia.iniciativa || "").toLowerCase().includes(texto);

      return (
        textoCombina &&
        (!filtroProjeto.value || projeto.id == filtroProjeto.value) &&
        (!filtroIniciativa.value || evidencia.iniciativa === filtroIniciativa.value) &&
        (!filtroAluno.value || evidencia.alunoNome === filtroAluno.value) &&
        (!filtroStatus.value || evidencia.status === filtroStatus.value)
      );
    });

    if (evidencias.length === 0) {
      lista.innerHTML = `<p style="opacity:.7; margin-top:20px;">Nenhuma evidência encontrada com esses filtros.</p>`;
      return;
    }

    evidencias.forEach(obj => {
      const { projeto, evidencia } = obj;
      const card = document.createElement("div");
      card.className = "card_n_hov";
      card.style.cssText = `
        padding: 15px;
        margin: 10px;
        display: inline-block;
        vertical-align: top;
        width: 300px;
      `;

      const corStatus = getStatusColor(evidencia.status);

      // --- Renderização dos arquivos da evidência ---
      if (evidencia.arquivos && evidencia.arquivos.length > 0) {
        const arquivosContainer = document.createElement("div");
        arquivosContainer.classList.add("grid-arquivos");
        arquivosContainer.style.marginTop = "8px";

        evidencia.arquivos.forEach(arq => {
          const div = document.createElement("div");
          div.className = "arquivo-card";

          if (arq.tipo && arq.tipo.startsWith("image/")) {
            div.innerHTML = `
              <img src="${arq.base64}" alt="${arq.nome}">
              <p style="font-size:0.9em;">${arq.nome}</p>
              <a href="${arq.base64}" download="${arq.nome}">
                <i class="fa-solid fa-download"></i> Baixar
              </a>
            `;
          } else if (arq.tipo === "application/pdf") {
            div.innerHTML = `
              <i class="fa-solid fa-file-pdf" style="font-size:2em; color:#d32f2f;"></i>
              <p style="margin:6px 0;">${arq.nome}</p>
              <a href="${arq.base64}" target="_blank">
                <i class="fa-solid fa-download"></i> Abrir PDF
              </a>
            `;
          } else {
            div.innerHTML = `
              <i class="fa-solid fa-file" style="font-size:2em; color:var(--andamento);"></i>
              <p style="margin:6px 0;">${arq.nome}</p>
              <a href="${arq.base64}" download="${arq.nome}">
                <i class="fa-solid fa-download"></i> Baixar
              </a>
            `;
          }

          arquivosContainer.appendChild(div);
        });

        card.appendChild(arquivosContainer);
      }
      // Compatibilidade com evidências antigas (um único arquivo)
      else if (evidencia.arquivo) {
        const unico = document.createElement("div");
        unico.className = "arquivo-card";

        if (evidencia.arquivo.startsWith("data:image")) {
          unico.innerHTML = `
            <img src="${evidencia.arquivo}" alt="Evidência">
            <a href="${evidencia.arquivo}" download="evidencia">
              <i class="fa-solid fa-download"></i> Baixar
            </a>
          `;
        } else if (evidencia.arquivo.startsWith("data:application/pdf")) {
          unico.innerHTML = `
            <i class="fa-solid fa-file-pdf" style="font-size:2em; color:#d32f2f;"></i>
            <a href="${evidencia.arquivo}" target="_blank">
              <i class="fa-solid fa-download"></i> Abrir PDF
            </a>
          `;
        }

        card.appendChild(unico);
      }

      // --- Informações da evidência ---
      const infoHTML = `
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
          <div style="width:18px; height:18px; border-radius:50%; background:${corStatus};"></div>
          <h3 style="margin:0; font-size:1.05em;">${projeto.titulo}</h3>
        </div>

        <p><strong>Iniciativa:</strong> ${evidencia.iniciativa || "—"}</p>
        <p><strong>Aluno:</strong> ${evidencia.alunoNome}</p>
        <p><strong>Status:</strong> ${evidencia.status.charAt(0).toUpperCase() + evidencia.status.slice(1)}</p>
        ${evidencia.comentario ? `<p><em>"${evidencia.comentario}"</em></p>` : ""}
      `;

      card.insertAdjacentHTML("afterbegin", infoHTML);

      // --- Feedback e botões ---
      const feedbackBox = document.createElement("div");
      feedbackBox.innerHTML = `
        <textarea id="feedback_${evidencia.id}" placeholder="Comentário do professor (opcional)" rows="2" style="width:100%; margin-top:6px;">${evidencia.feedbackProfessor || ""}</textarea>

        <div style="margin-top:10px; display:flex; gap:8px;">
          <button onclick="validar(${projeto.id}, ${evidencia.id}, true)" class="botao-primario">Aprovar</button>
          <button onclick="validar(${projeto.id}, ${evidencia.id}, false)" class="botao-rejeitar">Rejeitar</button>
        </div>
      `;
      card.appendChild(feedbackBox);

      lista.appendChild(card);
    });
  }

  renderLista();
  [filtroTexto, filtroProjeto, filtroIniciativa, filtroAluno, filtroStatus].forEach(el =>
    el.addEventListener("input", renderLista)
  );
});

function validar(idProjeto, idEvidencia, aprovado) {
  const projetos = JSON.parse(localStorage.getItem("projetos") || "[]");
  const projeto = projetos.find(p => p.id == idProjeto);
  const evidencia = projeto.evidencias.find(e => e.id == idEvidencia);

  const feedback = document.getElementById(`feedback_${idEvidencia}`).value.trim();

  evidencia.status = aprovado ? "aprovado" : "rejeitado";
  evidencia.feedbackProfessor = feedback;

  localStorage.setItem("projetos", JSON.stringify(projetos));
  alert("Evidência atualizada!");
  location.reload();
}
