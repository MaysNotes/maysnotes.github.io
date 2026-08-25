<?php

$articlesDir = __DIR__ . '/articles';
$outputFile = __DIR__ . '/search.json';

$index = [];


/*
|--------------------------------------------------------------------------
| Normalize text
|--------------------------------------------------------------------------
|
| Mengubah teks artikel menjadi bentuk yang cocok untuk pencarian.
|
*/

function normalizeText(string $text): string
{
    // Lowercase
    $text = mb_strtolower($text, 'UTF-8');

    // Normalisasi transliterasi Latin
    $replacements = [
        'ā' => 'a',
        'ī' => 'i',
        'ū' => 'u',

        'ṣ' => 's',
        'ḥ' => 'h',
        'ṭ' => 't',
        'ẓ' => 'z',
        'ḍ' => 'd',

        'š' => 's',
        'ġ' => 'g',
        'ḫ' => 'kh',
        'ʿ' => '',
        'ʾ' => '',
    ];

    $text = strtr($text, $replacements);

    /*
     * Arabic, Cyrillic, Greek, dan karakter non-Latin lainnya
     * dibuang.
     *
     * Yang dipertahankan hanya:
     * a-z
     * angka
     * whitespace
     * hyphen
     * apostrophe
     */
    $text = preg_replace('/[^a-z0-9\s\'’-]/u', ' ', $text);

    /*
     * Hyphen / apostrophe dianggap sebagai pemisah kata.
     *
     * Contoh:
     *
     * A'adda      → A adda
     * Fi'il       → Fi il
     * Al-Baqarah  → Al Baqarah
     */
    $text=str_replace(["'","’","ʼ","-","–","—"],'',$text);

    // Normalisasi whitespace
    $text = preg_replace('/\s+/', ' ', $text);

    return trim($text);
}


/*
|--------------------------------------------------------------------------
| Get article files
|--------------------------------------------------------------------------
*/

$files = glob($articlesDir . '/*.md');

foreach ($files as $file) {

    $content = file_get_contents($file);

    /*
     * ---------------------------------------------------------------
     * Frontmatter
     * ---------------------------------------------------------------
     */

    if (
        !preg_match(
            '/^---\s*\n(.*?)\n---\s*/s',
            $content,
            $matches
        )
    ) {
        echo "Skipping: " . basename($file) . " (invalid frontmatter)\n";
        continue;
    }

    $frontmatter = $matches[1];


    /*
     * ---------------------------------------------------------------
     * Article ID
     * ---------------------------------------------------------------
     */

    if (
        !preg_match(
            '/^id:\s*(\d+)/m',
            $frontmatter,
            $matches
        )
    ) {
        echo "Skipping: " . basename($file) . " (ID not found)\n";
        continue;
    }

    $articleId = (int) $matches[1];


    /*
     * ---------------------------------------------------------------
     * Title
     * ---------------------------------------------------------------
     */

    $title = '';

    if (
        preg_match(
            '/^title:\s*(.+)$/m',
            $frontmatter,
            $matches
        )
    ) {
        $title = trim($matches[1]);

        // Hilangkan quote pembungkus
        $title = trim($title, "\"'");
    }


    /*
     * ---------------------------------------------------------------
     * Article body
     * ---------------------------------------------------------------
     */

    $articleBody = preg_replace(
        '/^---\s*\n.*?\n---\s*/s',
        '',
        $content,
        1
    );


    /*
     * ---------------------------------------------------------------
     * Gabungkan title + body
     * ---------------------------------------------------------------
     */

    $searchableText = $title . ' ' . $articleBody;


    /*
     * ---------------------------------------------------------------
     * Normalize
     * ---------------------------------------------------------------
     */

    $searchableText = normalizeText($searchableText);


    /*
     * ---------------------------------------------------------------
     * Tokenize
     * ---------------------------------------------------------------
     */

    $words = preg_split(
        '/\s+/',
        $searchableText,
        -1,
        PREG_SPLIT_NO_EMPTY
    );


    /*
     * ---------------------------------------------------------------
     * Hilangkan kata berulang
     * ---------------------------------------------------------------
     */

    $words = array_unique($words);


    /*
     * ---------------------------------------------------------------
     * Masukkan ke inverted index
     * ---------------------------------------------------------------
     */

    foreach ($words as $word) {

        // Jangan index angka murni
        if (preg_match('/^\d+$/', $word)) {
            continue;
        }

        if (!isset($index[$word])) {
            $index[$word] = [];
        }

        if (!in_array($articleId, $index[$word])) {
            $index[$word][] = $articleId;
        }
    }
}


/*
|--------------------------------------------------------------------------
| Sort
|--------------------------------------------------------------------------
*/

ksort($index);


/*
|--------------------------------------------------------------------------
| Generate JSON
|--------------------------------------------------------------------------
*/

$json = json_encode(
    $index,
    JSON_PRETTY_PRINT |
    JSON_UNESCAPED_UNICODE |
    JSON_UNESCAPED_SLASHES
);


file_put_contents(
    $outputFile,
    $json
);


/*
|--------------------------------------------------------------------------
| Result
|--------------------------------------------------------------------------
*/

echo "Search index updated successfully.\n";
echo "Articles processed: " . count($files) . "\n";
echo "Unique words: " . count($index) . "\n";