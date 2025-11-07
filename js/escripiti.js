// Obtém usuário logado (de teste) ou redireciona para login futuramente
const usuario = JSON.parse(localStorage.getItem("usuario"));

// teste de usuarios: (uma linha por vez)  ou ctrl + ç nas paginas, pra abrir o debug
//localStorage.setItem("usuario", JSON.stringify({ nome: "Professor: Marcos", role: "professor" }))
//localStorage.setItem("usuario", JSON.stringify({ nome: "Aluno: Ana", role: "aluno" }))



function carregarDashboard() {
    if (!usuario) return; // depois trocamos pra redirecionar pro login

    document.getElementById("nomeUsuario").textContent = usuario.nome;

    if (usuario.role === "professor") {
        document.getElementById("sec-professor").style.display = "block";
    } else if (usuario.role === "aluno") {
        document.getElementById("sec-aluno").style.display = "block";
    }
}

function logout() {
    localStorage.removeItem("usuario");
    window.location.reload();
}

window.onload = carregarDashboard;

// Acordeão suave com apenas uma seção aberta por vez
document.querySelectorAll(".accordion-header").forEach(header => {
    header.addEventListener("click", () => {

        const item = header.parentElement;
        const openItem = document.querySelector(".accordion-item.active");

        if (openItem && openItem !== item) {
            openItem.classList.remove("active");
        }

        item.classList.toggle("active");
    });
});

// ---- TEMA ----
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
atualizarTemaAtual();

// ---- Alternar tema claro/escuro ----
function atualizarTemaAtual() {
    const tema = document.documentElement.getAttribute('data-theme');
    const span = document.getElementById('tema-atual');
    if (span) span.textContent = (tema === 'dark') ? 'Escuro ' : 'Claro ';
}

function toggleTheme() {
    const html = document.documentElement;
    const temaAtual = html.getAttribute('data-theme');
    const novoTema = temaAtual === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', novoTema);
    localStorage.setItem('theme', novoTema);

    const icon = document.querySelector('.theme-toggle i');
    icon.className = novoTema === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const menu = document.getElementById("menuProjetos");

    if (!menu || !usuario) return;

    // SEMPRE MOSTRA
    menu.innerHTML += `<a class="popup" href="projetos.html">Projetos Disponíveis</a>`;

    // ALUNO
    if (usuario.role === "aluno") {
        menu.innerHTML += `<a class="popup" href="meus_projetos.html">Meus Projetos</a>`;
        menu.innerHTML += `<a class="popup" href="aluno_evidencias.html">Minhas Evidências</a>`;
    }

    // PROFESSOR
    if (usuario.role === "professor") {
        menu.innerHTML += `<a class="popup" href="meus_projetos.html">Projetos Que Coordeno</a>`;
        menu.innerHTML += `<a class="popup" href="validar_evidencias.html">Validar Evidências</a>`;
    }

    // comportamento de abrir/fechar ao clicar
    const dropdown = document.querySelector(".dropdown .dropbtn");
    const parent = document.querySelector(".dropdown");

    dropdown.addEventListener("click", (event) => {
        event.stopPropagation();
        parent.classList.toggle("show");

        const rect = dropdown.getBoundingClientRect();
        const menu = parent.querySelector(".dropdown-content");

        // posiciona o menu bem embaixo do botão
        menu.style.left = rect.left + "px";
        menu.style.top = (rect.bottom + 5) + "px";
    });


    // fecha ao clicar fora
    document.addEventListener("click", (e) => {
        if (!parent.contains(e.target)) parent.classList.remove("show");
    });

    // === Atalho de Debug (Ctrl + D) ===
    // Abre debug.html sem interferir no uso normal
    document.addEventListener("keydown", function (e) {
        if (e.ctrlKey && e.key.toLowerCase() === "ç") {
            e.preventDefault();
            window.location.href = "debug.html";
        }
    });
});

