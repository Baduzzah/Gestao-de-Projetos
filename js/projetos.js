
document.addEventListener('DOMContentLoaded', () => {
  
  let usuario = null;
  try {
    usuario = JSON.parse(localStorage.getItem('usuario'));
  } catch (err) {
    usuario = null;
  }

  if (!usuario) {
    // comente as próximas linhas quando tiver login funcionando
    usuario = { nome: 'Usuário Teste', role: 'aluno' }; // role: 'aluno' ou 'professor'
    localStorage.setItem('usuario', JSON.stringify(usuario));
    console.info('usuario não encontrado — criando mock temporário:', usuario);
  }

  // dados de exemplo
  const projetos = [
    { id: 1, titulo: "Robótica Sustentável", publico: "Engenharia", status: "aberto" },
    { id: 2, titulo: "Feira de Jogos Educacionais", publico: "ADS / SI", status: "aberto" },
    { id: 3, titulo: "Banco de Alimentos Comunitário", publico: "Logística", status: "em andamento" }
  ];

  const lista = document.getElementById("listaProjetos");
  const descricao = document.getElementById("descricaoPagina");

  if (!lista) {
    console.error('Elemento #listaProjetos não encontrado no DOM. Verifique se o id existe no HTML.');
    return;
  }

  if (descricao) {
    if (usuario.role === "professor") {
      descricao.textContent = "Projetos que você coordena ou participa.";
    } else {
      descricao.textContent = "Projetos disponíveis para participação.";
    }
  } else {
    console.warn('Elemento #descricaoPagina ausente — pulando texto descritivo.');
  }

  // limpa antes de renderizar
  lista.innerHTML = "";

  // renderiza cards
  projetos.forEach(p => {
    const card = document.createElement("a");
    card.className = "card";
    card.href = `projeto_detalhes.html?id=${p.id}`;

    card.innerHTML = `
      <h3>${p.titulo}</h3>
      <p><strong>Público:</strong> ${p.publico}</p>
      <p><strong>Status:</strong> ${p.status}</p>
    `;

    lista.appendChild(card);
  });

  // mostra nome do usuário
  const nomeEl = document.getElementById('nomeUsuario');
  if (nomeEl) nomeEl.textContent = usuario.nome || 'Usuário';
});
