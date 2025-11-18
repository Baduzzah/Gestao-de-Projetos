<?php
require_once "../db.php";

header("Content-Type: application/json");

// Recebe o ID do aluno
$aluno_id = $_GET["aluno_id"] ?? null;

if (!$aluno_id) {
    echo json_encode(["erro" => "Aluno não informado"]);
    exit;
}

// TODO: ajustar nomes das tabelas e colunas reais
$sql = "SELECT p.id, p.titulo, p.tematica, p.status 
        FROM projetos p
        JOIN projeto_participantes pp ON pp.projeto_id = p.id
        WHERE pp.aluno_id = :aluno_id";

$stmt = $pdo->prepare($sql);
$stmt->execute([":aluno_id" => $aluno_id]);

$projetos = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($projetos);


//IMPORTANTE!!!
//vou explicar +/- oq tem q ser feito
//no JS vai ter algo tipo ' = JSON.parse(localStorage.getItem("projetos") || "[]"); '
// essa parte vcs tem q alterar pra algo tipo:
// fetch(`backend/projetos/listar_projetos.php?aluno_id=${usuario.id}`)
//   .then(r => r.json())
//   .then(projetos => {  });
