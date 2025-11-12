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

    // ===== Renderizar professores =====
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

    // ===== Pré-visualização de múltiplos arquivos =====
    const inputArquivo = document.getElementById("arquivoProjeto");
    const previewContainer = document.createElement("div");
    previewContainer.id = "previewArquivos";
    previewContainer.style = "display:flex;flex-wrap:wrap;gap:10px;margin-top:10px;";
    inputArquivo.insertAdjacentElement("afterend", previewContainer);

    inputArquivo.onchange = () => {
        const arquivos = Array.from(inputArquivo.files);
        previewContainer.innerHTML = "";

        arquivos.forEach(arq => {
            const item = document.createElement("div");
            item.style.textAlign = "center";
            item.style.maxWidth = "120px";

            if (arq.type.startsWith("image/")) {
                const img = document.createElement("img");
                img.src = URL.createObjectURL(arq);
                img.style.maxWidth = "100px";
                img.style.borderRadius = "6px";
                item.appendChild(img);
            } else {
                item.innerHTML = `<p style="font-size:0.9em;">📄 ${arq.name}</p>`;
            }
            previewContainer.appendChild(item);
        });
    };

    // ===== Salvar projeto =====
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

        // Pega todos os arquivos e converte pra base64
        const arquivos = Array.from(inputArquivo.files);
        const arquivosBase64 = await Promise.all(
            arquivos.map(arq => converterArquivoBase64(arq).then(base64 => ({
                nome: arq.name,
                tipo: arq.type,
                base64
            })))
        );

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
            arquivos: arquivosBase64  // ⬅️ agora é um array
        };

        listaProjetos.push(novoProjeto);
        localStorage.setItem("projetos", JSON.stringify(listaProjetos));

        alert("Projeto criado com sucesso!");
        window.location.href = "projetos.html";
    };

    // ===== Conversão arquivo → base64 =====
    function converterArquivoBase64(arquivo) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(arquivo);
        });
    }

});
