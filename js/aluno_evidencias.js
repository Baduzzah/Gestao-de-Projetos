document.addEventListener('DOMContentLoaded', () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario || usuario.role !== "aluno") {
    alert("Apenas alunos podem visualizar suas evidências.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("nomeUsuario").textContent = usuario.nome;

  const projetos = JSON.parse(localStorage.getItem("projetos") || "[]");
  const lista = document.getElementById("listaEvidencias");

  // --- Coleta evidências do aluno ---
  let evidenciasAluno = [];
  projetos.forEach(p => {
    (p.evidencias || []).forEach(ev => {
      if (ev.alunoNome === usuario.nome) evidenciasAluno.push({ projeto: p, evidencia: ev });
    });
  });

  // --- Filtros ---
  const filtrosHTML = `
    <div class="filtros-box">
      <input type="text" id="filtroTexto" placeholder="Pesquisar por projeto, iniciativa ou status...">

      <select id="filtroProjeto">
        <option value="">Todos os projetos</option>
      </select>

      <select id="filtroIniciativa">
        <option value="">Todas as iniciativas</option>
      </select>

      <select id="filtroStatus">
        <option value="">Todos os status</option>
        <option value="pendente">Pendente</option>
        <option value="aprovado">Aprovado</option>
        <option value="rejeitado">Rejeitado</option>
      </select>
    </div>
  `;
  lista.insertAdjacentHTML("beforebegin", filtrosHTML);

  const filtroTexto = document.getElementById("filtroTexto");
  const filtroProjeto = document.getElementById("filtroProjeto");
  const filtroIniciativa = document.getElementById("filtroIniciativa");
  const filtroStatus = document.getElementById("filtroStatus");

  // --- Preenche selects ---
  const projetosSet = new Set();
  const iniciativasSet = new Set();

  evidenciasAluno.forEach(({ projeto, evidencia }) => {
    projetosSet.add(projeto.titulo);
    if (evidencia.iniciativa) iniciativasSet.add(evidencia.iniciativa);
  });

  [...projetosSet].forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    filtroProjeto.appendChild(opt);
  });

  [...iniciativasSet].forEach(i => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = i;
    filtroIniciativa.appendChild(opt);
  });

  // --- Cores de status ---
  function getStatusColor(status) {
    switch (status) {
      case "aprovado": return "var(--aberto)";
      case "rejeitado": return "var(--rejeitado)";
      case "pendente": return "var(--pendente)";
      default: return "var(--andamento)";
    }
  }

  // --- Render principal ---
  function renderLista() {
    lista.innerHTML = "";

    let evidenciasFiltradas = evidenciasAluno.filter(({ projeto, evidencia }) => {
      const texto = filtroTexto.value.toLowerCase().trim();
      const matchTexto =
        !texto ||
        projeto.titulo.toLowerCase().includes(texto) ||
        (evidencia.iniciativa || "").toLowerCase().includes(texto) ||
        (evidencia.status || "").toLowerCase().includes(texto);

      return (
        matchTexto &&
        (!filtroProjeto.value || projeto.titulo === filtroProjeto.value) &&
        (!filtroIniciativa.value || evidencia.iniciativa === filtroIniciativa.value) &&
        (!filtroStatus.value || evidencia.status === filtroStatus.value)
      );
    });

    if (evidenciasFiltradas.length === 0) {
      lista.innerHTML = `<p style="opacity:.7; margin-top:20px;">Nenhuma evidência encontrada.</p>`;
      return;
    }

    evidenciasFiltradas.forEach(({ projeto, evidencia }) => {
      const corStatus = getStatusColor(evidencia.status);
      const card = document.createElement("div");
      card.className = "card_n_hov";
      card.style.cssText = `
        padding: 15px;
        margin: 10px;
        display: inline-block;
        vertical-align: top;
        width: 300px;
      `;

      // --- Arquivos enviados ---
      let arquivosHTML = "";
      if (evidencia.arquivos && evidencia.arquivos.length > 0) {
        arquivosHTML = `
    <div class="grid-arquivos">
      ${evidencia.arquivos.map(arq => `
        <div class="arquivo-card">
          ${arq.tipo.startsWith("image/")
            ? `<img src="${arq.base64}" alt="${arq.nome}">`
            : `<i class="fa-solid fa-file" style="font-size:2em; color:var(--andamento);"></i>`}
          <p style="font-size:0.9em;">${arq.nome}</p>
          <a href="${arq.base64}" download="${arq.nome}">
            <i class="fa-solid fa-download"></i> Baixar
          </a>
        </div>
      `).join("")}
    </div>
  `;
      }


      // --- Card HTML ---
      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
          <div style="width:18px; height:18px; border-radius:50%; background:${corStatus};"></div>
          <h3 style="margin:0; font-size:1.05em;">${projeto.titulo}</h3>
        </div>

        <p><strong>Iniciativa:</strong> ${evidencia.iniciativa || "—"}</p>
        <p><strong>Status:</strong> ${evidencia.status.charAt(0).toUpperCase() + evidencia.status.slice(1)}</p>

        <div style="margin:6px 0;">${arquivosHTML}</div>

        ${evidencia.comentario ? `<p><em>"${evidencia.comentario}"</em></p>` : ""}
        ${evidencia.feedbackProfessor ? `<p><strong>Feedback:</strong> ${evidencia.feedbackProfessor}</p>` : ""}
      `;

      lista.appendChild(card);
    });
  }

  renderLista();
  [filtroTexto, filtroProjeto, filtroIniciativa, filtroStatus].forEach(el =>
    el.addEventListener("input", renderLista)
  );
});
