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

        projeto.etapas = projeto.etapas || [];

        projeto.etapas.forEach((etapa, index) => {

            // renderização visual da lista
            listaEtapas.innerHTML += `
            <div class="detalhes-projeto card_n_hov" draggable="true" data-index="${index}">
                <div>
                    <strong>${etapa.nome}</strong> <small>(${etapa.status})</small><br>
                    <small>${etapa.inicio || "–"} → ${etapa.fim || "–"}</small>
                </div>
                <div>
                    <button class="botao-secundario" onclick="editarEtapa(${index})">Editar</button>
                    <button class="botao-rejeitar" onclick="removerEtapa(${index})">Remover</button>
                </div>
            </div>
        `;

            // ✅ preencher o SELECT corretamente
            const opt = document.createElement("option");
            opt.value = etapa.nome;
            opt.textContent = etapa.nome;
            selectEtapaRef.appendChild(opt);
        });

        ativarDragDrop();
    }




    document.getElementById("btnAddEtapa").onclick = () => {
        const nome = document.getElementById("novaEtapaNome").value.trim();
        const inicio = document.getElementById("novaEtapaInicio").value;
        const fim = document.getElementById("novaEtapaFim").value;
        const status = document.getElementById("novaEtapaStatus").value;

        if (!nome) return alert("Digite o nome da etapa.");

        projeto.etapas.push({ nome, inicio, fim, status });
        salvar();
        renderEtapas();
    };


    window.removerEtapa = (i) => {
        if (!confirm("Excluir esta etapa?")) return;
        projeto.etapas.splice(i, 1);
        salvar();
        renderEtapas();
        renderIniciativas();
    };

    window.editarEtapa = (i) => {
        const e = projeto.etapas[i];

        abrirModal({
            titulo: "Editar Etapa",
            nome: e.nome,
            descricao: e.descricao || "",
            opcoes: ["planejada", "em andamento", "concluída"],
            valorSelect: e.status,
            salvar: () => {
                e.nome = document.getElementById("modalNome").value.trim();
                e.status = document.getElementById("modalSelect").value;
                e.descricao = document.getElementById("modalDescricao").value.trim();
                salvar();
                renderEtapas();
                document.getElementById("modalEditar").style.display = "none";
            }
        });
    };




    function renderIniciativas() {
        const listaIniciativas = document.getElementById("listaIniciativas");
        listaIniciativas.innerHTML = "";

        projeto.iniciativas = projeto.iniciativas || [];

        projeto.iniciativas.forEach((i, index) => {
            listaIniciativas.innerHTML += `
        <div class="detalhes-projeto card_n_hov"" data-index="${index}">
            <div>
                <strong>${i.nome}</strong> <small>(${i.status})</small><br>
                <small>Etapa: ${i.etapa}</small><br>
                ${i.responsavel ? `<small>Responsável: ${i.responsavel}</small><br>` : ""}
                ${i.descricao ? `<small>${i.descricao}</small>` : ""}
            </div>

            <div>
                <button class="botao-secundario" onclick="editarIniciativa(${index})">Editar</button>
                <button class="botao-rejeitar" onclick="removerIniciativa(${index})">Remover</button>
            </div>
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



    document.getElementById("btnAddIniciativa").onclick = () => {
        const nome = document.getElementById("novaIniciativaNome").value.trim();
        const etapa = document.getElementById("selectEtapaRef").value;
        const responsavel = document.getElementById("novaIniciativaResp").value.trim();
        const descricao = document.getElementById("novaIniciativaDesc").value.trim();
        const status = document.getElementById("novaIniciativaStatus").value;

        if (!nome || !etapa) return alert("Preencha pelo menos nome e etapa.");

        projeto.iniciativas.push({ nome, etapa, responsavel, descricao, status });

        document.getElementById("novaIniciativaNome").value = "";
        document.getElementById("novaIniciativaResp").value = "";
        document.getElementById("novaIniciativaDesc").value = "";

        salvar();
        renderIniciativas();
    };

    window.editarIniciativa = (i) => {
        const x = projeto.iniciativas[i];

        abrirModal({
            titulo: "Editar Iniciativa",
            nome: x.nome,
            descricao: x.descricao || "",
            opcoes: projeto.etapas.map(e => e.nome), // etapas no select
            valorSelect: x.etapa,
            salvar: () => {
                x.nome = document.getElementById("modalNome").value.trim();
                x.etapa = document.getElementById("modalSelect").value;
                x.descricao = document.getElementById("modalDescricao").value.trim();
                salvar();
                renderIniciativas();
                document.getElementById("modalEditar").style.display = "none";
            }
        });
    };



    window.removerIniciativa = (i) => {
        if (!confirm("Remover esta iniciativa?")) return;
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

    function abrirModal(config) {
        const overlay = document.getElementById("modalEditar");
        document.getElementById("modalTitulo").textContent = config.titulo;
        document.getElementById("modalNome").value = config.nome || "";
        document.getElementById("modalDescricao").value = config.descricao || "";

        const select = document.getElementById("modalSelect");
        select.innerHTML = "";
        config.opcoes.forEach(o => {
            const opt = document.createElement("option");
            opt.value = o;
            opt.textContent = o;
            select.appendChild(opt);
        });
        select.value = config.valorSelect || "";

        overlay.style.display = "flex";

        document.getElementById("modalSalvar").onclick = () => {
            config.salvar();
            overlay.style.display = "none";
        };

        document.getElementById("modalCancelar").onclick = () => {
            overlay.style.display = "none";
        };


    }


    // Inicializa telas
    renderEtapas();
    renderIniciativas();
    renderParticipantes();
});
