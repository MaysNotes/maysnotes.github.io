<?php
// Tentukan jumlah file yang ingin dibuat
$n = 100; // misalnya 10 file, bisa diganti sesuai kebutuhan

// Isi konten yang sama untuk setiap file
$contentTemplate = <<<EOT
---
id: %d
title: 'Refleksi Surah Az-Zukhruf: Ketika Hiasan Dunia Menipu Mata'
slug: "refleksi-surah-az-zukhruf-ketika-hiasan-dunia-menipu-mata"
date: "2026-04-21"
tags:
  - Refleksi Al-Qur'an
---

Surah Az-Zukhruf diawali dengan penegasan agung tentang Al-Qur'an sebagai petunjuk yang jelas. Setelah itu, narasi surah ini perlahan mengajak kita melihat satu jebakan manusia yang paling sering berulang: **keindahan dunia yang tampak sangat memikat, padahal tidak bernilai di sisi Allah.**
EOT;

// Loop untuk membuat file 1.md sampai n.md
for ($i = 1; $i <= $n; $i++) {
    $filename = 'C:\lanterium\najma-web\article_dummy\\'. $i . ".md";
    $content = sprintf($contentTemplate, $i); // ganti %d dengan id sesuai nama file
    file_put_contents($filename, $content);
    echo "File $filename berhasil dibuat.\n";
}