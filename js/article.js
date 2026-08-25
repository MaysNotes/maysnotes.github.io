const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');

const articleElement = document.getElementById('article');


async function loadArticle() {

    if (!slug) {
        articleElement.innerHTML = '<p>Artikel tidak ditemukan.</p>';
        return;
    }

    try {

        // Ambil metadata semua artikel
        const response = await fetch('articles.json');

        if (!response.ok) {
            throw new Error('Gagal memuat articles.json');
        }

        const articles = await response.json();

        // Cari artikel berdasarkan slug
        const article = articles.find(
            item => item.slug === slug
        );

        if (!article) {
            articleElement.innerHTML = '<p>Artikel tidak ditemukan.</p>';
            return;
        }

        console.log('Article found:', article);



    const markdownResponse = await fetch(
        `articles/${article.id}.md`
    );

    if (!markdownResponse.ok) {
        throw new Error('Gagal memuat file Markdown');
    }

    const markdown = await markdownResponse.text();

    const content = markdown.replace(
        /^---\s*\n[\s\S]*?\n---\s*\n?/,
        ''
    );


    const processedContent = content.replace(
        /\[ar\]([\s\S]*?)\[\/ar\]/g,
        '<span class="arabic" dir="rtl">$1</span>'
    );

    const html = marked.parse(processedContent);


    document.getElementById('article-title').textContent =
        article.title;

    document.getElementById('article-author').textContent = 'Najma Shira'
        // article.author;

    document.getElementById('article-date').textContent =
        article.date;

    document.getElementById('article-tags').textContent =
        article.tags.join(' · ');

    document.getElementById('article-content').innerHTML =
        html;

    } catch (error) {

        console.error(error);

        articleElement.innerHTML =
            '<p>Terjadi kesalahan saat memuat artikel.</p>';
    }
}


loadArticle();



const backToArticles =
    document.getElementById('article-back');

backToArticles.addEventListener('click', () => {

    const savedState =
        sessionStorage.getItem(
            'articleReturnState'
        );

    if (!savedState) {
        window.location.href = 'index.html';
        return;
    }

    window.location.href = 'index.html';
});