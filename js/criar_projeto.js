document.addEventListener("DOMContentLoaded", () => {

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || usuario.role !== "professor") {
        alert("Apenas professores podem criar projetos.");
        window.location.href = "index.html";
        return;
    }
    document.getElementById("nomeUsuario").textContent = usuario.nome;

    const listaProjetos = JSON.parse(localStorage.getItem("projetos") || "[]");
    const profsResponsaveis = [];

    const listaProfs = document.getElementById("listaProfs");

    function renderProfs() {
        listaProfs.innerHTML = "";
        profsResponsaveis.forEach((p, index) => {
            listaProfs.innerHTML += `
                <div class="item-projeto">
                    <div><strong>${p.nome}</strong><br><small>${p.disciplina}</small></div>
                    <button onclick="removerProf(${index})" class="botao-rejeitar">remover</button>
                </div>
            `;
        });
    }

    document.getElementById("btnAddProf").onclick = () => {
        const nome = document.getElementById("profNome").value.trim();
        const disciplina = document.getElementById("profDisciplina").value.trim();
        if (!nome || !disciplina) return;

        profsResponsaveis.push({ nome, disciplina });
        document.getElementById("profNome").value = "";
        document.getElementById("profDisciplina").value = "";
        renderProfs();
    };

    window.removerProf = (i) => {
        profsResponsaveis.splice(i, 1);
        renderProfs();
    };

    document.getElementById("btnSalvarProjeto").onclick = async () => {

        const titulo = document.getElementById("tituloProjeto").value.trim();
        const tematica = document.getElementById("tematicaProjeto").value.trim();
        const descricao = document.getElementById("descricaoProjeto").value.trim();
        const curso = document.getElementById("cursoProjeto").value;
        const dataInicio = document.getElementById("dataInicio").value;
        const dataFim = document.getElementById("dataFim").value;

        if (!titulo || !tematica || !descricao) {
            alert("Preencha título, temática e descrição.");
            return;
        }

        // Lê arquivo e converte p/ Base64
        const arquivoInput = document.getElementById("arquivoProjeto");
        let arquivoBase64 = null;
        if (arquivoInput.files.length > 0) {
            arquivoBase64 = await converterArquivoBase64(arquivoInput.files[0]);
        }

        const novoProjeto = {
            id: Date.now(),
            titulo,
            tematica,
            descricao,
            curso,
            dataInicio,
            dataFim,
            status: "aberto",
            etapas: [],
            iniciativas: [],
            participantes: [],
            profsResponsaveis,
            arquivo: arquivoBase64  // <-- Armazena o arquivo
        };

        listaProjetos.push(novoProjeto);
        localStorage.setItem("projetos", JSON.stringify(listaProjetos));

        alert("Projeto criado com sucesso!");
        window.location.href = "projetos.html";
    };

    // Função auxiliar converter arquivo → base64
    function converterArquivoBase64(arquivo) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(arquivo);
        });
    }

});
