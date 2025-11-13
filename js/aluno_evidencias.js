// js/aluno_evidencias.js
document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario || usuario.role !== "aluno") {
    alert("Apenas alunos podem visualizar suas evidências.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("nomeUsuario").textContent = usuario.nome;

  const projetos = JSON.parse(localStorage.getItem("projetos") || "[]");
  const lista = document.getElementById("listaEvidencias");

  // coleta todas as evidências do aluno
  let evidenciasAluno = [];
  projetos.forEach(p => {
    (p.evidencias || []).forEach(ev => {
      if (ev.alunoNome === usuario.nome) evidenciasAluno.push({ projeto: p, evidencia: ev });
    });
  });

  // --- FILTROS ---
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

  // preenche selects
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

  // cores de status
  function getStatusColor(status) {
    switch (status) {
      case "aprovado": return "var(--aberto)";
      case "rejeitado": return "var(--rejeitado)";
      case "pendente": return "var(--pendente)";
      default: return "var(--andamento)";
    }
  }

  // função principal de renderização
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
      const card = document.createElement("div");
      card.className = "card_n_hov";
      card.style.display = "flex";
      card.style.alignItems = "flex-start";
      card.style.justifyContent = "space-between";
      card.style.gap = "18px";
      card.style.padding = "16px 20px";
      card.style.margin = "10px 0";

      // coluna de informações principais
      const info = document.createElement("div");
      info.className = "info";
      info.style.flex = "1";

      const statusCor = getStatusColor(evidencia.status);

      const header = document.createElement("div");
      header.style.display = "flex";
      header.style.alignItems = "center";
      header.style.gap = "8px";
      header.style.marginBottom = "6px";

      const dot = document.createElement("div");
      dot.style.width = "16px";
      dot.style.height = "16px";
      dot.style.borderRadius = "50%";
      dot.style.background = statusCor;

      const titulo = document.createElement("h3");
      titulo.textContent = projeto.titulo;
      titulo.style.margin = "0";

      header.appendChild(dot);
      header.appendChild(titulo);
      info.appendChild(header);

      info.innerHTML += `
        <p><strong>Iniciativa:</strong> ${evidencia.iniciativa || "—"}</p>
        <p><strong>Status:</strong> ${evidencia.status.charAt(0).toUpperCase() + evidencia.status.slice(1)}</p>
      `;

      if (evidencia.comentario)
        info.innerHTML += `<p><em>"${evidencia.comentario}"</em></p>`;
      if (evidencia.feedbackProfessor)
        info.innerHTML += `<p><strong>Feedback:</strong> ${evidencia.feedbackProfessor}</p>`;

      // coluna de arquivos
      const arquivos = document.createElement("div");
      arquivos.style.display = "grid";
      arquivos.style.gridTemplateColumns = "repeat(auto-fit, minmax(120px, 1fr))";
      arquivos.style.gap = "8px";
      arquivos.style.maxWidth = "45%";
      arquivos.style.minWidth = "240px";

      function criarArquivoCard(arq) {
        const div = document.createElement("div");
        div.className = "arquivo-card";
        div.style.padding = "6px";
        div.style.border = "1px solid var(--muted)";
        div.style.borderRadius = "8px";
        div.style.background = "var(--surface)";
        div.style.textAlign = "center";
        div.style.display = "flex";
        div.style.flexDirection = "column";
        div.style.gap = "4px";
        div.style.alignItems = "center";

        if (arq.tipo.startsWith("image/")) {
          const img = document.createElement("img");
          img.src = arq.base64;
          img.alt = arq.nome;
          img.style.width = "100%";
          img.style.height = "80px";
          img.style.objectFit = "cover";
          img.style.borderRadius = "6px";
          div.appendChild(img);
        } else if (arq.tipo === "application/pdf") {
          const icon = document.createElement("i");
          icon.className = "fa-solid fa-file-pdf";
          icon.style.fontSize = "1.8em";
          icon.style.color = "#d32f2f";
          div.appendChild(icon);
        } else {
          const icon = document.createElement("i");
          icon.className = "fa-solid fa-file";
          icon.style.fontSize = "1.6em";
          icon.style.color = "var(--andamento)";
          div.appendChild(icon);
        }

        const nome = document.createElement("p");
        nome.style.fontSize = "0.85em";
        nome.textContent = arq.nome;
        div.appendChild(nome);

        const link = document.createElement("a");
        link.href = arq.base64;
        link.download = arq.nome;
        link.innerHTML = `<i class="fa-solid fa-download"></i> Baixar`;
        link.style.fontSize = "0.8rem";
        link.style.textDecoration = "none";
        link.style.color = "var(--primary-contrast)";
        link.style.background = "var(--light_prim)";
        link.style.padding = "5px 8px";
        link.style.borderRadius = "6px";
        div.appendChild(link);

        return div;
      }

      // múltiplos arquivos
      if (evidencia.arquivos && evidencia.arquivos.length > 0) {
        evidencia.arquivos.forEach(arq => arquivos.appendChild(criarArquivoCard(arq)));
      } else if (evidencia.arquivo) {
        // compatibilidade antiga
        arquivos.appendChild(
          criarArquivoCard({
            base64: evidencia.arquivo,
            nome: "Arquivo",
            tipo: evidencia.arquivo.startsWith("data:image") ? "image/*" : "application/pdf",
          })
        );
      }

      card.appendChild(info);
      card.appendChild(arquivos);

      lista.appendChild(card);
    });
  }

  renderLista();
  [filtroTexto, filtroProjeto, filtroIniciativa, filtroStatus].forEach(el =>
    el.addEventListener("input", renderLista)
  );

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

});
