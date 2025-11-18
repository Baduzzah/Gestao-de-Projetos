<?php
require_once "../db.php";
header("Content-Type: application/json");

$aluno_id = $_GET["aluno_id"] ?? null;

if (!$aluno_id) {
    echo json_encode([]);
    exit;
}

$sql = "
    SELECT e.*, p.titulo AS projeto_titulo
    FROM evidencias e
    JOIN projetos p ON p.id = e.projeto_id
    WHERE e.aluno_id = :aluno_id
    ORDER BY e.dataEnvio DESC
";

$stmt = $pdo->prepare($sql);
$stmt->execute([":aluno_id" => $aluno_id]);
$evidencias = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Buscar arquivos de cada evidência
foreach ($evidencias as &$ev) {

    $sql2 = "SELECT nomeOriginal, tipoMIME, caminhoArquivo 
             FROM evidencia_arquivos WHERE evidencia_id = :id";

    $stmt2 = $pdo->prepare($sql2);
    $stmt2->execute([":id" => $ev["id"]]);

    $ev["arquivos"] = $stmt2->fetchAll(PDO::FETCH_ASSOC);
}

echo json_encode($evidencias);


//IMPORTANTE!!!
//vou explicar +/- oq tem q ser feito
// essa parte vcs tem q alterar pra carregar no JS:

// fetch(`backend/evidencias/listar_evidencias.php?aluno_id=${usuario.id}`)
//   .then(r => r.json())
//   .then(evidencias => {
//      renderLista(evidencias);
//   });

