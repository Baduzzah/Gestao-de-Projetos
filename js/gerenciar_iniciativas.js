document.addEventListener("DOMContentLoaded", () => {

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || usuario.role !== "professor") {
        alert("Apenas professores podem gerenciar projetos.");
        window.location.href = "index.html";
        return;
    }
    document.getElementById("nomeUsuario").textContent = usuario.nome;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const listaProjetos = JSON.parse(localStorage.getItem("projetos") || "[]");
    const listaDiv = document.getElementById("listaProjetosGerenciar");

    // ---- SE NÃO TIVER ID → MOSTRA LISTA DE PROJETOS PARA ESCOLHER ----
    if (!id) {
        document.getElementById("nomeProjeto").textContent = "Selecione um Projeto";
        document.querySelectorAll(".tab").forEach(t => t.style.display = "none");

        listaDiv.style.display = "flex";
        listaDiv.innerHTML = "";

        if (listaProjetos.length === 0) {
            listaDiv.innerHTML = `<p>Nenhum projeto cadastrado ainda.</p>`;
            return;
        }

        listaProjetos.forEach(p => {
            const item = document.createElement("div");
            item.className = "item-projeto";
            item.innerHTML = `
        <div class="status status-aberto"></div>
        <div><strong>${p.titulo}</strong><br><small>${p.tematica || ""}</small></div>
        <a href="gerenciar_iniciativas.html?id=${p.id}" style="color: var(--concluido);">gerenciar</a>
      `;
            listaDiv.appendChild(item);
        });

        return; // <--- (não carrega o modo com abas)
    }


    // ID → modo gerenciamento de um projeto específico

    // busca o projeto correto
    const lista = listaProjetos;
    const projeto = lista.find(p => p.id == id);

    if (!projeto) {
        alert("Projeto não encontrado.");
        window.location.href = "gerenciar_iniciativas.html";
        return;
    }

    // mostra nome do projeto
    document.getElementById("nomeProjeto").textContent = projeto.titulo;

    /* --- Função de salvar --- */
    function salvar() {
        localStorage.setItem("projetos", JSON.stringify(lista));
    }

    /* --- RENDERIZAÇÃO --- */
    function renderEtapas() {
        const listaEtapas = document.getElementById("listaEtapas");
        const selectEtapaRef = document.getElementById("selectEtapaRef");
        listaEtapas.innerHTML = "";
        selectEtapaRef.innerHTML = "";

        projeto.etapas?.forEach((etapa, i) => {
            listaEtapas.innerHTML += `
            <div class="item-projeto">
                <div class="status status-aberto"></div>
                <div>${etapa}</div>
                <button onclick="removerEtapa(${i})" class="botao-rejeitar">remover</button>
            </div>
            `;

            const opt = document.createElement("option");
            opt.value = etapa;
            opt.textContent = etapa;
            selectEtapaRef.appendChild(opt);
        });
    }

    function renderIniciativas() {
        const listaIniciativas = document.getElementById("listaIniciativas");
        listaIniciativas.innerHTML = "";

        projeto.iniciativas?.forEach((i, index) => {
            listaIniciativas.innerHTML += `
            <div class="item-projeto">
                <div class="status status-aberto"></div>
                <div><strong>${i.nome}</strong><br><small>${i.etapa}</small></div>
                <button onclick="removerIniciativa(${index})">remover</button>
            </div>
            `;
        });
    }

    function renderParticipantes() {
        const listaParticipantes = document.getElementById("listaParticipantes");
        listaParticipantes.innerHTML = "";

        if (!projeto.participantes || projeto.participantes.length === 0) {
            listaParticipantes.innerHTML = `<p>Nenhum participante ainda.</p>`;
            return;
        }

        projeto.participantes.forEach(p => {
            listaParticipantes.innerHTML += `
            <div class="item-projeto">
                <div class="status status-aberto"></div>
                <div>${p.nome} (${p.ra})</div>
            </div>
            `;
        });
    }

    /* --- AÇÕES --- */
    document.getElementById("btnAddEtapa").onclick = () => {
        const nome = document.getElementById("novaEtapaNome").value.trim();
        if (!nome) return;
        projeto.etapas = projeto.etapas || [];
        projeto.etapas.push(nome);
        document.getElementById("novaEtapaNome").value = "";
        salvar();
        renderEtapas();
    };

    window.removerEtapa = (i) => {
        projeto.etapas.splice(i, 1);
        salvar();
        renderEtapas();
    };

    document.getElementById("btnAddIniciativa").onclick = () => {
        const nome = document.getElementById("novaIniciativaNome").value.trim();
        const etapa = document.getElementById("selectEtapaRef").value;
        if (!nome || !etapa) return;
        projeto.iniciativas = projeto.iniciativas || [];
        projeto.iniciativas.push({ nome, etapa });
        document.getElementById("novaIniciativaNome").value = "";
        salvar();
        renderIniciativas();
    };

    window.removerIniciativa = (i) => {
        projeto.iniciativas.splice(i, 1);
        salvar();
        renderIniciativas();
    };

    /* --- TABS --- */
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
            btn.classList.add("active");
            document.getElementById(btn.dataset.tab).classList.add("active");
        });
    });

    // Preenche campos ao abrir aba
    document.getElementById("editTitulo").value = projeto.titulo;
    document.getElementById("editTematica").value = projeto.tematica;
    document.getElementById("editDescricao").value = projeto.descricao;
    document.getElementById("editCurso").value = projeto.curso || "";
    document.getElementById("editInicioReal").value = projeto.inicioReal || "";
    document.getElementById("editFimReal").value = projeto.fimReal || "";

    document.getElementById("btnSalvarConfig").onclick = () => {
        projeto.titulo = document.getElementById("editTitulo").value.trim();
        projeto.tematica = document.getElementById("editTematica").value.trim();
        projeto.descricao = document.getElementById("editDescricao").value.trim();
        projeto.curso = document.getElementById("editCurso").value;
        projeto.inicioReal = document.getElementById("editInicioReal").value;
        projeto.fimReal = document.getElementById("editFimReal").value;

        salvar();
        alert("Alterações salvas!");
        document.getElementById("nomeProjeto").textContent = projeto.titulo;
    };

    document.getElementById("btnFinalizarProjeto").onclick = () => {
        if (!confirm("Finalizar o projeto? Isso impedirá novas inscrições.")) return;

        projeto.status = "finalizado";
        salvar();
        alert("Projeto finalizado!");
    };


    // Inicializa telas
    renderEtapas();
    renderIniciativas();
    renderParticipantes();
});
