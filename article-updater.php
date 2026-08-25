<?php

$articlesDir = __DIR__ . '/articles';
$outputFile = __DIR__ . '/articles.json';

$articles = [];


/*
|--------------------------------------------------------------------------
| Helper: Remove Markdown formatting
|--------------------------------------------------------------------------
*/

function markdownToPlainText(string $text): string
{
    // Images
    $text = preg_replace('/!\[([^\]]*)\]\([^)]+\)/', '$1', $text);

    // Links
    $text = preg_replace('/\[([^\]]+)\]\([^)]+\)/', '$1', $text);

    // Bold / italic / strikethrough
    $text = preg_replace('/(\*\*|__|\*|_|~~)/', '', $text);

    // Inline code
    $text = preg_replace('/`([^`]*)`/', '$1', $text);

    // Markdown headings
    $text = preg_replace('/^\s*#+\s*/m', '', $text);

    // Blockquotes
    $text = preg_replace('/^\s*>\s?/m', '', $text);

    // Horizontal rules
    $text = preg_replace('/^\s*([-*_]){3,}\s*$/m', '', $text);

    // Normalize whitespace
    $text = preg_replace('/\s+/', ' ', $text);

    return trim($text);
}


/*
|--------------------------------------------------------------------------
| Helper: Extract first paragraph
|--------------------------------------------------------------------------
*/

function getFirstParagraph(string $content): string
{
    /*
     * Pisahkan frontmatter terlebih dahulu.
     */

    $content = preg_replace(
        '/^---\s*\n.*?\n---\s*/s',
        '',
        $content,
        1
    );

    /*
     * Cari paragraf pertama yang benar-benar
     * memiliki isi.
     */

    $paragraphs = preg_split(
        '/\n\s*\n/',
        trim($content)
    );

    $foundTitle = false;

    // UTK AMBIL PARAGRAF PERTAMA
    foreach ($paragraphs as $paragraph) {
        $paragraph = trim($paragraph);
        if ($paragraph !== '') {
            return $paragraph;
        }
    }

    // UTK AMBIL PARAGRAF KEDUA
    // foreach ($paragraphs as $paragraph) {

    //     $paragraph = trim($paragraph);

    //     if ($paragraph === '') {
    //         continue;
    //     }

    //     // Paragraf pertama setelah frontmatter dianggap sebagai judul
    //     if (!$foundTitle) {
    //         $foundTitle = true;
    //         continue;
    //     }

    //     return $paragraph;
    // }

    return '';
}


/*
|--------------------------------------------------------------------------
| Helper: Create excerpt
|--------------------------------------------------------------------------
*/

function createExcerpt(string $content, int $maxLength = 140): string
{
    $paragraph = getFirstParagraph($content);

    $paragraph = markdownToPlainText($paragraph);

    if ($paragraph === '') {
        return '';
    }

    /*
     * Kalau masih di bawah batas,
     * tidak perlu dipotong.
     */

    if (mb_strlen($paragraph, 'UTF-8') <= $maxLength) {
        return $paragraph;
    }

    /*
     * Potong berdasarkan karakter.
     */

    $excerpt = mb_substr(
        $paragraph,
        0,
        $maxLength,
        'UTF-8'
    );

    /*
     * Jangan potong di tengah kata.
     */

    $lastSpace = mb_strrpos(
        $excerpt,
        ' ',
        0,
        'UTF-8'
    );

    if ($lastSpace !== false) {
        $excerpt = mb_substr(
            $excerpt,
            0,
            $lastSpace,
            'UTF-8'
        );
    }

    return trim($excerpt) . '...';
}


/*
|--------------------------------------------------------------------------
| Read article files
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
     * ID
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

    $id = (int) $matches[1];


    /*
     * ---------------------------------------------------------------
     * Title
     * ---------------------------------------------------------------
     */

    if (
        preg_match(
            '/^title:\s*(.+)$/m',
            $frontmatter,
            $matches
        )
    ) {
        $title = trim($matches[1]);

        // cek apakah judul diawali & diakhiri kutip yang sama
        if (
            (str_starts_with($title, '"') && str_ends_with($title, '"')) ||
            (str_starts_with($title, "'") && str_ends_with($title, "'"))
        ) {
            $title = substr($title, 1, -1);
        }
    } else {
        $title = '';
    }


    /*
     * ---------------------------------------------------------------
     * Slug
     * ---------------------------------------------------------------
     */

    if (
        preg_match(
            '/^slug:\s*(.+)$/m',
            $frontmatter,
            $matches
        )
    ) {
        $slug = trim($matches[1]);
        $slug = trim($slug, "\"'");
    } else {
        $slug = '';
    }


    /*
     * ---------------------------------------------------------------
     * Date
     * ---------------------------------------------------------------
     */

    if (
        preg_match(
            '/^date:\s*(.+)$/m',
            $frontmatter,
            $matches
        )
    ) {
        $date = trim($matches[1]);
        $date = trim($date, "\"'");
    } else {
        $date = '';
    }


    /*
     * ---------------------------------------------------------------
     * Tags
     * ---------------------------------------------------------------
     */

    $tags = [];

    if (
        preg_match(
            '/^tags:\s*\n((?:\s*-\s*.+\n?)+)/m',
            $frontmatter,
            $matches
        )
    ) {

        preg_match_all(
            '/^\s*-\s*(.+)$/m',
            $matches[1],
            $tagMatches
        );

        foreach ($tagMatches[1] as $tag) {
            $tags[] = trim($tag, "\"'");
        }
    }


    /*
     * ---------------------------------------------------------------
     * Excerpt
     * ---------------------------------------------------------------
     */

    $excerpt = createExcerpt($content, 140);


    /*
     * ---------------------------------------------------------------
     * Store article
     * ---------------------------------------------------------------
 */

    $articles[] = [
        'id' => $id,
        'title' => $title,
        'slug' => $slug,
        'date' => $date,
        'tags' => $tags,
        'excerpt' => $excerpt
    ];
}


/*
|--------------------------------------------------------------------------
| Sort by date (newest first)
|--------------------------------------------------------------------------
*/

usort($articles, function ($a, $b) {

    return strcmp(
        $b['date'],
        $a['date']
    );
});


/*
|--------------------------------------------------------------------------
| Generate JSON
|--------------------------------------------------------------------------
*/

$json = json_encode(
    $articles,
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

echo "Article metadata updated successfully.\n";
echo "Articles processed: " . count($articles) . "\n";