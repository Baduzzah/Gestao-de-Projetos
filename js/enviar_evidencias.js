document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || usuario.role !== "aluno") {
        alert("Apenas alunos podem enviar evidências.");
        window.location.href = "index.html";
        return;
    }

    document.getElementById("nomeUsuario").textContent = usuario.nome;

    let projetos = JSON.parse(localStorage.getItem("projetos") || "[]");
    const params = new URLSearchParams(window.location.search);
    let idProjeto = params.get("id");

    const selectProjetoBox = document.getElementById("selectProjetoBox");
    const selectProjeto = document.getElementById("selectProjeto");

    // ✅ cria os elementos de seleção de iniciativa se ainda não existem
    let selectIniciativaBox = document.getElementById("selectIniciativaBox");
    let selectIniciativa = document.getElementById("selectIniciativa");
    let iniciativaPreview = document.getElementById("iniciativaPreview");

    if (!selectIniciativaBox) {
        const box = document.createElement("div");
        box.id = "selectIniciativaBox";
        box.className = "card_n_hov";
        box.style = "padding:20px; margin-top:20px; display:none;";
        box.innerHTML = `
      <label><strong>Selecione a Iniciativa</strong></label>
      <select id="selectIniciativa"><option value="">Selecione...</option></select>
      <div id="iniciativaPreview" style="margin-top:10px;"></div>
    `;
        document.querySelector("main").insertBefore(box, document.getElementById("inputArquivo").closest(".card_n_hov"));
        selectIniciativaBox = box;
        selectIniciativa = box.querySelector("#selectIniciativa");
        iniciativaPreview = box.querySelector("#iniciativaPreview");
    }

    const projetosAluno = projetos.filter(p =>
        (p.participantes || []).some(a => a.nome === usuario.nome)
    );

    // === 1️⃣ Seleção de projeto ===
    if (!idProjeto) {
        selectProjetoBox.style.display = "block";
        projetosAluno.forEach(p => {
            selectProjeto.innerHTML += `<option value="${p.id}">${p.titulo}</option>`;
        });

        selectProjeto.addEventListener("change", () => {
            idProjeto = selectProjeto.value;
            console.log("🟢 Projeto selecionado:", idProjeto);
            carregarIniciativas();
        });
    } else {
        carregarIniciativas();
    }

    // === 2️⃣ Carregar iniciativas ===
    function carregarIniciativas() {
        console.log("🔵 Carregando iniciativas do projeto:", idProjeto);
        const projeto = projetos.find(p => p.id == idProjeto);
        if (!projeto) {
            console.error("❌ Projeto não encontrado!");
            return;
        }

        const iniciativas = projeto.iniciativas || [];
        selectIniciativa.innerHTML = "";

        if (iniciativas.length === 0) {
            selectIniciativaBox.style.display = "none";
            return;
        }

        selectIniciativaBox.style.display = "block";
        selectIniciativa.innerHTML = `<option value="">Selecione...</option>`;
        iniciativas.forEach(i => {
            selectIniciativa.innerHTML += `<option value="${i.nome}">${i.nome}</option>`;
        });

        selectIniciativa.addEventListener("change", () => {
            const selecionada = iniciativas.find(i => i.nome === selectIniciativa.value);
            if (selecionada) {
                iniciativaPreview.style.display = "block";
                iniciativaPreview.innerHTML = `
          <h4 style="margin-bottom:6px;">${selecionada.nome}</h4>
          <p><strong>Etapa:</strong> ${selecionada.etapa || "—"}</p>
          ${selecionada.descricao ? `<p>${selecionada.descricao}</p>` : ""}
        `;
            } else {
                iniciativaPreview.style.display = "none";
            }
        });
    }

    // === 3️⃣ Preview dos arquivos ===
    const inputArquivo = document.getElementById("inputArquivo");
    const preview = document.getElementById("preview");
    const previewContainer = document.getElementById("previewContainer");
    const comentarioAluno = document.getElementById("comentarioAluno");

    inputArquivo.onchange = () => {
        const arquivos = Array.from(inputArquivo.files);
        if (!arquivos.length) return;
        preview.style.display = "block";
        previewContainer.innerHTML = "";

        arquivos.forEach(arquivo => {
            const item = document.createElement("div");
            item.style.textAlign = "center";
            item.style.maxWidth = "150px";

            if (arquivo.type.startsWith("image/")) {
                const img = document.createElement("img");
                img.src = URL.createObjectURL(arquivo);
                img.style.maxWidth = "120px";
                img.style.borderRadius = "6px";
                item.appendChild(img);
            } else {
                item.innerHTML = `<p style="font-size:0.9em;">📄 ${arquivo.name}</p>`;
            }
            previewContainer.appendChild(item);
        });
    };

    // === 4️⃣ Envio da evidência ===
    document.getElementById("btnEnviarEvidencia").onclick = async () => {
        try {
            console.log("🚀 Iniciando envio de evidência...");
            if (!idProjeto) throw new Error("Projeto não selecionado");
            const iniciativaSelecionada = selectIniciativa.value;
            if (!iniciativaSelecionada) throw new Error("Iniciativa não selecionada");
            const arquivos = Array.from(inputArquivo.files);
            if (!arquivos.length) throw new Error("Nenhum arquivo selecionado");

            const projeto = projetos.find(p => p.id == idProjeto);
            if (!projeto) throw new Error("Projeto não encontrado");

            const listaArquivos = await Promise.all(
                arquivos.map(arquivo =>
                    new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve({
                            nome: arquivo.name,
                            tipo: arquivo.type,
                            base64: reader.result
                        });
                        reader.onerror = () => reject(`Erro ao ler ${arquivo.name}`);
                        reader.readAsDataURL(arquivo);
                    })
                )
            );

            projeto.evidencias = projeto.evidencias || [];
            projeto.evidencias.push({
                id: Date.now(),
                alunoNome: usuario.nome,
                alunoRa: usuario.ra || "",
                iniciativa: iniciativaSelecionada,
                comentario: comentarioAluno.value.trim(),
                arquivos: listaArquivos,
                status: "pendente",
                feedbackProfessor: ""
            });

            localStorage.setItem("projetos", JSON.stringify(projetos));
            console.log("✅ Evidência salva com sucesso:", projeto.evidencias);
            alert("Evidência enviada com sucesso!");
            window.location.href = "aluno_evidencias.html";
        } catch (err) {
            console.error("❌ ERRO AO ENVIAR EVIDÊNCIA:", err);
            alert("Erro ao processar os arquivos: " + err.message);
        }
    };
});
