<?php

require 'vendor/autoload.php';

use League\HTMLToMarkdown\HtmlConverter;

// Tentukan folder sumber (HTML) dan folder tujuan (Markdown)
$sourceDir = 'C:\lanterium\maysnotes.com\medium-export-f1fe527fa285813effbc5af04e99bd00cccdc3341788b3aa8ab1fa661afc6e99\posts' ; // Ganti dengan folder sumber Anda
$targetDir = 'C:\lanterium\maysnotes.com\medium-export-f1fe527fa285813effbc5af04e99bd00cccdc3341788b3aa8ab1fa661afc6e99\posts_md';   // Ganti dengan folder tujuan Anda


if (!is_dir($sourceDir)) {
    die("Folder sumber '$sourceDir' tidak ditemukan.\n");
}

if (!is_dir($targetDir)) {
    mkdir($targetDir, 0777, true);
}

// ATUR OPSI CONVERTER AGAR BERSIH
$converter = new HtmlConverter([
    'strip_tags' => true,        // Menghapus semua tag HTML yang tidak bisa diubah ke Markdown
    'remove_nodes' => 'script style head link meta iframe noscript object', // Menghapus tag sampah
    'hard_break' => true,        // Mengubah <br> menjadi baris baru yang rapi
]);

$files = glob($sourceDir . '/*.html');

if (empty($files)) {
    echo "Tidak ada file .html di dalam folder '$sourceDir'.\n";
    exit;
}

$successCount = 0;

foreach ($files as $file) {
    $filename = basename($file, '.html');
    $htmlContent = file_get_contents($file);
    
    // MEMBERSIHKAN ELEMEN HTML SEBELUM DIKONVERSI
    // 1. Hapus komentar HTML <!-- comment -->
    $htmlContent = preg_replace('/<!--(.*?)-->/is', '', $htmlContent);
    
    // 2. Bersihkan spasi berlebih atau karakter aneh jika ada
    $htmlContent = trim($htmlContent);
    
    // Konversi ke Markdown
    $markdownContent = $converter->convert($htmlContent);
    
    // Tentukan path file output .md
    $outputFile = $targetDir . '/' . $filename . '.md';
    
    // Simpan ke file baru
    if (file_put_contents($outputFile, $markdownContent) !== false) {
        echo "Berhasil konversi bersih: $filename.html -> $filename.md\n";
        $successCount++;
    } else {
        echo "Gagal konversi: $filename.html\n";
    }
}

echo "\nSelesai! Total file yang berhasil dikonversi secara bersih: $successCount\n";