// js/validar_evidencias.js
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

  // filtros (assume que existem nos HTMLs)
  const filtroTexto = document.getElementById("filtroTexto");
  const filtroProjeto = document.getElementById("filtroProjeto");
  const filtroIniciativa = document.getElementById("filtroIniciativa");
  const filtroAluno = document.getElementById("filtroAluno");
  const filtroStatus = document.getElementById("filtroStatus");

  // cria conjuntos para preencher selects
  const alunosSet = new Set();
  const iniciativasSet = new Set();
  const projetosComEvidencias = projetos.filter(p => (p.evidencias || []).length > 0);

  projetosComEvidencias.forEach(p => {
    (p.evidencias || []).forEach(ev => {
      if (ev.alunoNome) alunosSet.add(ev.alunoNome);
      if (ev.iniciativa) iniciativasSet.add(ev.iniciativa);
    });
  });

  // preenche select de projetos
  // primeiro garante opção "Todos"
  if (filtroProjeto) {
    filtroProjeto.innerHTML = `<option value="">Todos os projetos</option>`;
    projetosComEvidencias.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.titulo;
      filtroProjeto.appendChild(opt);
    });
  }

  if (filtroIniciativa) {
    filtroIniciativa.innerHTML = `<option value="">Todas as iniciativas</option>`;
    [...iniciativasSet].forEach(nome => {
      const opt = document.createElement("option");
      opt.value = nome;
      opt.textContent = nome;
      filtroIniciativa.appendChild(opt);
    });
  }

  if (filtroAluno) {
    filtroAluno.innerHTML = `<option value="">Todos os alunos</option>`;
    [...alunosSet].forEach(nome => {
      const opt = document.createElement("option");
      opt.value = nome;
      opt.textContent = nome;
      filtroAluno.appendChild(opt);
    });
  }

  if (filtroStatus) {
    // se já tem opções no HTML, não sobrescreve; caso contrário adiciona opções básicas
    if (!filtroStatus.querySelector("option")) {
      filtroStatus.innerHTML = `
        <option value="">Todos os status</option>
        <option value="pendente">Pendente</option>
        <option value="aprovado">Aprovado</option>
        <option value="rejeitado">Rejeitado</option>
      `;
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case "aprovado": return "var(--aberto)";
      case "rejeitado": return "var(--rejeitado)";
      case "pendente": return "var(--pendente)";
      case "andamento": return "var(--andamento)";
      default: return "var(--concluido)";
    }
  }

  // monta lista de evidências (obj: {projeto, evidencia})
  function collectEvidencias() {
    const arr = [];
    projetos.forEach(p => {
      (p.evidencias || []).forEach(ev => arr.push({ projeto: p, evidencia: ev }));
    });
    return arr;
  }

  function renderLista() {
    lista.innerHTML = "";

    let evidencias = collectEvidencias();

    const texto = (filtroTexto?.value || "").toLowerCase().trim();

    evidencias = evidencias.filter(obj => {
      const { projeto, evidencia } = obj;

      const textoCombina =
        !texto ||
        (projeto.titulo || "").toLowerCase().includes(texto) ||
        (evidencia.alunoNome || "").toLowerCase().includes(texto) ||
        (evidencia.iniciativa || "").toLowerCase().includes(texto);

      const projetMatch = !filtroProjeto?.value || projeto.id == filtroProjeto.value;
      const iniciativaMatch = !filtroIniciativa?.value || evidencia.iniciativa === filtroIniciativa.value;
      const alunoMatch = !filtroAluno?.value || evidencia.alunoNome === filtroAluno.value;
      const statusMatch = !filtroStatus?.value || evidencia.status === filtroStatus.value;

      return textoCombina && projetMatch && iniciativaMatch && alunoMatch && statusMatch;
    });

    if (evidencias.length === 0) {
      lista.innerHTML = `<p style="opacity:.7; margin-top:20px;">Nenhuma evidência encontrada com esses filtros.</p>`;
      return;
    }

    evidencias.forEach(obj => {
      const { projeto, evidencia } = obj;

      // card wrapper
      const card = document.createElement("div");
      card.className = "card_n_hov";
      // inline-style fallback layout (só para garantir consistência caso CSS não carregue)
      card.style.display = "flex";
      card.style.alignItems = "flex-start";
      card.style.justifyContent = "space-between";
      card.style.gap = "18px";
      card.style.padding = "16px";
      card.style.margin = "6px 0";

      // coluna info (projeto, iniciativa, aluno, status)
      const info = document.createElement("div");
      info.className = "info";
      info.style.flex = "1";

      const headerRow = document.createElement("div");
      headerRow.style.display = "flex";
      headerRow.style.alignItems = "center";
      headerRow.style.gap = "8px";
      headerRow.style.marginBottom = "6px";

      const statusDot = document.createElement("div");
      statusDot.className = "status-dot";
      statusDot.style.background = getStatusColor(evidencia.status);
      statusDot.style.width = "16px";
      statusDot.style.height = "16px";
      statusDot.style.borderRadius = "50%";

      const titulo = document.createElement("h3");
      titulo.textContent = projeto.titulo;
      titulo.style.margin = "0";
      titulo.style.fontSize = "1.05em";

      headerRow.appendChild(statusDot);
      headerRow.appendChild(titulo);

      info.appendChild(headerRow);

      const iniciativaP = document.createElement("p");
      iniciativaP.innerHTML = `<strong>Iniciativa:</strong> ${evidencia.iniciativa || "—"}`;
      info.appendChild(iniciativaP);

      const alunoP = document.createElement("p");
      alunoP.innerHTML = `<strong>Aluno:</strong> ${evidencia.alunoNome || "—"}`;
      info.appendChild(alunoP);

      const statusP = document.createElement("p");
      statusP.innerHTML = `<strong>Status:</strong> ${String(evidencia.status || "").charAt(0).toUpperCase() + String(evidencia.status || "").slice(1)}`;
      info.appendChild(statusP);

      if (evidencia.comentario) {
        const c = document.createElement("p");
        c.style.marginTop = "6px";
        c.style.fontStyle = "italic";
        c.textContent = `"${evidencia.comentario}"`;
        info.appendChild(c);
      }

      // arquivos container (mini-cards/grid)
      const arquivosWrapper = document.createElement("div");
      arquivosWrapper.style.minWidth = "220px";
      arquivosWrapper.style.maxWidth = "45%";
      arquivosWrapper.style.display = "grid";
      arquivosWrapper.style.gridTemplateColumns = "repeat(auto-fit, minmax(120px, 1fr))";
      arquivosWrapper.style.gap = "8px";

      // helper para criar mini-card de arquivo
      function criarArquivoCard(arq) {
        const ac = document.createElement("div");
        ac.className = "arquivo-card";
        ac.style.padding = "6px";
        ac.style.border = "1px solid var(--muted)";
        ac.style.borderRadius = "8px";
        ac.style.textAlign = "center";
        ac.style.background = "var(--surface)";
        ac.style.display = "flex";
        ac.style.flexDirection = "column";
        ac.style.alignItems = "center";
        ac.style.gap = "6px";

        if (arq && arq.tipo && arq.tipo.startsWith("image/")) {
          const img = document.createElement("img");
          img.src = arq.base64;
          img.alt = arq.nome || "imagem";
          img.style.maxWidth = "100%";
          img.style.height = "80px";
          img.style.objectFit = "cover";
          img.style.borderRadius = "6px";
          ac.appendChild(img);
        } else if (arq && arq.tipo === "application/pdf") {
          const icon = document.createElement("i");
          icon.className = "fa-solid fa-file-pdf";
          icon.style.fontSize = "1.6em";
          icon.style.color = "#c62828";
          ac.appendChild(icon);
        } else {
          const icon = document.createElement("i");
          icon.className = "fa-solid fa-file";
          icon.style.fontSize = "1.4em";
          icon.style.color = "var(--andamento)";
          ac.appendChild(icon);
        }

        const nomeEl = document.createElement("div");
        nomeEl.style.fontSize = "0.85em";
        nomeEl.style.opacity = "0.95";
        nomeEl.style.wordBreak = "break-word";
        nomeEl.textContent = arq.nome || "Arquivo";
        ac.appendChild(nomeEl);

        const actions = document.createElement("div");
        actions.style.display = "flex";
        actions.style.gap = "6px";

        const abrir = document.createElement("a");
        abrir.href = arq.base64;
        abrir.target = "_blank";
        abrir.textContent = arq.tipo === "application/pdf" ? "Abrir" : "Ver";
        abrir.style.fontSize = "0.82rem";
        abrir.style.padding = "6px 8px";
        abrir.style.borderRadius = "6px";
        abrir.style.background = "var(--light_prim)";
        abrir.style.color = "var(--primary-contrast)";
        abrir.style.textDecoration = "none";
        actions.appendChild(abrir);

        const baixar = document.createElement("a");
        baixar.href = arq.base64;
        baixar.download = arq.nome || "arquivo";
        baixar.textContent = "Baixar";
        baixar.style.fontSize = "0.82rem";
        baixar.style.padding = "6px 8px";
        baixar.style.borderRadius = "6px";
        baixar.style.background = "transparent";
        baixar.style.border = "1px solid var(--muted)";
        baixar.style.textDecoration = "none";
        baixar.style.color = "var(--text)";
        actions.appendChild(baixar);

        ac.appendChild(actions);
        return ac;
      }

      // popula arquivos (múltiplos)
      if (Array.isArray(evidencia.arquivos) && evidencia.arquivos.length > 0) {
        evidencia.arquivos.forEach(arq => {
          if (arq && arq.base64) {
            arquivosWrapper.appendChild(criarArquivoCard(arq));
          }
        });
      } else if (evidencia.arquivo) {
        // compat: evidência antiga com campo 'arquivo'
        arquivosWrapper.appendChild(criarArquivoCard({ base64: evidencia.arquivo, nome: "Arquivo", tipo: evidencia.arquivo.startsWith("data:image") ? "image/*" : "application/pdf" }));
      }

      // feedback textarea + buttons column
      const actionCol = document.createElement("div");
      actionCol.style.width = "260px";
      actionCol.style.display = "flex";
      actionCol.style.flexDirection = "column";
      actionCol.style.gap = "8px";
      actionCol.style.alignItems = "stretch";

      const textarea = document.createElement("textarea");
      textarea.id = `feedback_${evidencia.id}`;
      textarea.rows = 3;
      textarea.placeholder = "Comentário do professor (opcional)";
      textarea.value = evidencia.feedbackProfessor || "";
      textarea.style.resize = "vertical";
      textarea.style.minHeight = "60px";
      textarea.style.border = "1px solid var(--muted)";
      textarea.style.borderRadius = "6px";
      textarea.style.padding = "8px";
      actionCol.appendChild(textarea);

      const botoes = document.createElement("div");
      botoes.style.display = "flex";
      botoes.style.gap = "8px";
      botoes.style.justifyContent = "flex-end";

      const aprovar = document.createElement("button");
      aprovar.className = "botao-primario";
      aprovar.textContent = "Aprovar";
      aprovar.addEventListener("click", () => window.validar(projeto.id, evidencia.id, true));

      const rejeitar = document.createElement("button");
      rejeitar.className = "botao-rejeitar";
      rejeitar.textContent = "Rejeitar";
      rejeitar.addEventListener("click", () => window.validar(projeto.id, evidencia.id, false));

      botoes.appendChild(aprovar);
      botoes.appendChild(rejeitar);

      actionCol.appendChild(botoes);

      // monta tudo no card: info | arquivosWrapper | actionCol
      card.appendChild(info);
      card.appendChild(arquivosWrapper);
      card.appendChild(actionCol);

      lista.appendChild(card);
    });
  }

  // eventos nos filtros
  [filtroTexto, filtroProjeto, filtroIniciativa, filtroAluno, filtroStatus].forEach(el => {
    if (!el) return;
    el.addEventListener("input", renderLista);
    el.addEventListener("change", renderLista);
  });

  // render inicial
  renderLista();
});

// função global para validar (usada pelos botões)
window.validar = function (idProjeto, idEvidencia, aprovado) {
  try {
    const projetos = JSON.parse(localStorage.getItem("projetos") || "[]");
    const projeto = projetos.find(p => p.id == idProjeto);
    if (!projeto) throw new Error("Projeto não encontrado");

    const evidencia = (projeto.evidencias || []).find(e => e.id == idEvidencia);
    if (!evidencia) throw new Error("Evidência não encontrada");

    const feedbackEl = document.getElementById(`feedback_${idEvidencia}`);
    const feedback = feedbackEl ? feedbackEl.value.trim() : "";

    evidencia.status = aprovado ? "aprovado" : "rejeitado";
    evidencia.feedbackProfessor = feedback;

    localStorage.setItem("projetos", JSON.stringify(projetos));
    alert("Evidência atualizada!");
    // atualiza a tela sem forçar reload completo (re-render)
    // tenta chamar renderLista se existir no escopo
    if (typeof window.renderListaExtern === "function") {
      window.renderListaExtern();
    } else {
      location.reload();
    }
  } catch (err) {
    console.error(err);
    alert("Erro ao atualizar evidência: " + (err.message || err));
  }

  // === VISUALIZAR IMAGENS EM TAMANHO MAIOR ===
  document.addEventListener("click", e => {
    const img = e.target.closest(".arquivo-card img, .detalhes-projeto img");
    if (!img) return;

    // cria overlay
    const overlay = document.createElement("div");
    overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999;
    cursor: zoom-out;
  `;

    // imagem grande
    const bigImg = document.createElement("img");
    bigImg.src = img.src;
    bigImg.alt = "Visualização ampliada";
    bigImg.style.cssText = `
    max-width: 90%;
    max-height: 90vh;
    border-radius: 12px;
    box-shadow: 0 0 25px rgba(0,0,0,0.6);
    transition: transform 0.25s ease;
  `;

    overlay.appendChild(bigImg);
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    // fecha ao clicar fora
    overlay.addEventListener("click", () => {
      overlay.remove();
      document.body.style.overflow = "auto";
    });
  });

};
