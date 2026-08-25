let searchIndex = null;
let articles = [];

let currentPage = 1;
const ARTICLES_PER_PAGE = 6;

let currentSearchPage = 1;
const SEARCH_RESULTS_PER_PAGE = 6;

async function loadArticles() {

    const response = await fetch('articles.json');

    if (!response.ok) {
        throw new Error('Gagal memuat articles.json');
    }

    articles = await response.json();
}



function convertDate(dateString) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const [year, month, day] = dateString.split('-');
  
  // Parsed integers remove leading zeros from day numbers
  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
}

// Example usage:
// console.log(convertDate("2026-08-05")); 
// Output: "5 August 2026"

function adjustArabic(content) {
    const processedContent = content.replace(
        /\[ar\]([\s\S]*?)\[\/ar\]/g,'<span class="arabic" dir="rtl">$1</span>'
    );

    return processedContent;
    // return content
}



function renderLatestArticles(page = currentPage) {

    currentPage = page;

    const sortedArticles = [...articles].sort(
        (a, b) =>
            new Date(b.date) - new Date(a.date)
    );

    const totalPages = Math.ceil(
        sortedArticles.length / ARTICLES_PER_PAGE
    );

    const startIndex =
        (currentPage - 1) * ARTICLES_PER_PAGE;

    const latestArticles =
        sortedArticles.slice(
            startIndex,
            startIndex + ARTICLES_PER_PAGE
        );

    const container =
        document.getElementById('latest-articles');

    container.innerHTML =
        latestArticles
            .map(article => `
                <article class="latest-article">

                    <h3>
<a
    href="article.html?slug=${encodeURIComponent(article.slug)}"
    class="article-link"
>
    ${article.title}
</a>                        
                    </h3>

                    <div class="article-meta">
                        <span class="article-author">
                            Najma Shira
                        </span>
                        ·
                        ${convertDate(article.date)}
                        ·
                        ${article.tags.join(' · ')}
                    </div>

                    <p>
                        ${adjustArabic(article.excerpt)}
                    </p>

                </article>
            `)
            .join('');

    renderPagination(
        document.getElementById('latest-pagination'),
        currentPage,
        totalPages,
        page => renderLatestArticles(page)
    );
}

function renderPagination(
    container,
    currentPage,
    totalPages,
    onPageChange
) {
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';

    if (currentPage > 1) {
        html += `
            <button
                type="button"
                data-page="${currentPage - 1}"
                aria-label="Halaman sebelumnya"
            >
                ←
            </button>
        `;
    }

    const pages =
        getPaginationPages(
            currentPage,
            totalPages
        );

    for (const page of pages) {

        if (page === '...') {

            html += `
                <span class="pagination-ellipsis">
                    …
                </span>
            `;

            continue;
        }

        html += `
            <button
                type="button"
                data-page="${page}"
                class="${page === currentPage ? 'active' : ''}"
                ${page === currentPage
                    ? 'aria-current="page"'
                    : ''}
            >
                ${page}
            </button>
        `;
    }


    if (currentPage < totalPages) {
        html += `
            <button
                type="button"
                data-page="${currentPage + 1}"
                aria-label="Halaman berikutnya"
            >
                →
            </button>
        `;
    }

    container.innerHTML = html;

    container.onclick = event => {
        const button =
            event.target.closest('button[data-page]');

        if (!button) return;

        onPageChange(
            Number(button.dataset.page)
        );
    };
}

document
    .getElementById('latest-pagination')
    .addEventListener('click', event => {

        const button =
            event.target.closest(
                'button[data-page]'
            );

        if (!button) {
            return;
        }

        const page =
            Number(button.dataset.page);

        renderLatestArticles(page);

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const searchResultHeading =
    document.getElementById('search-result-heading');
const searchResultList =
    document.getElementById('search-result-list');
const latestSection =
    document.querySelector('.latest-section');
const searchPagination =
    document.getElementById('search-pagination');

const backToLatest =
    document.getElementById('back-to-latest');


function renderSearchResults(results, page = 1) {

    currentSearchPage = page;

    // ====================================
    // Tidak ada hasil
    // ====================================

    if (results.length === 0) {

        searchResultHeading.textContent =
            'Hasil Pencarian';

        searchResultList.innerHTML = `
            <div class="search-empty">
                <p>
                    Tidak ditemukan tulisan
                    untuk pencarian ini.
                </p>
            </div>
        `;

        searchPagination.innerHTML = '';

        return;
    }


    // ====================================
    // Pagination
    // ====================================

    const totalPages = Math.ceil(
        results.length / SEARCH_RESULTS_PER_PAGE
    );

    const startIndex =
        (currentSearchPage - 1) *
        SEARCH_RESULTS_PER_PAGE;

    const paginatedResults =
        results.slice(
            startIndex,
            startIndex + SEARCH_RESULTS_PER_PAGE
        );


    // ====================================
    // Heading
    // ====================================

    searchResultHeading.textContent =
        `Hasil Pencarian · ${results.length} tulisan`;


    // ====================================
    // Render hasil
    // ====================================

    searchResultList.innerHTML =
        paginatedResults
            .map(result => {

                const article =
                    articles.find(
                        item => item.id === result.id
                    );

                if (!article) {
                    return '';
                }

                return `
                    <article class="search-result">

                        <h3>
<a
    href="article.html?slug=${encodeURIComponent(article.slug)}"
    class="article-link"
>
    ${article.title}
</a>
                        </h3>

                        <div class="search-result-meta">
                            ${article.date}
                            ·
                            ${article.tags.join(' · ')}
                        </div>

                        <p class="search-result-excerpt">
                            ${adjustArabic(article.excerpt)}
                        </p>

                    </article>
                `;
            })
            .join('');


    // ====================================
    // Pagination
    // ====================================

    console.log('SEARCH RESULTS:', results);
    console.log('TOTAL:', results.length);

    renderPagination(
        searchPagination,
        currentSearchPage,
        totalPages,
        page => renderSearchResults(results, page)
    );
}

backToLatest.addEventListener(
    'click',
    showLatestArticles
);

  function enterSearchMode() {

    latestSection.hidden = true;
    searchResults.hidden = false;
    backToLatest.hidden = false;
}

function showLatestArticles() {

    searchInput.value = '';

    searchResultList.innerHTML = '';
    searchResultHeading.textContent =
        'Hasil Pencarian';

    searchResults.hidden = true;

    latestSection.hidden = false;
    backToLatest.hidden = true;
}

searchInput.addEventListener('keydown', event => {

    if (event.key === 'Escape') {

        showLatestArticles();

        return;
    }


    if (event.key !== 'Enter') {
        return;
    }


    const query = searchInput.value.trim();

    if (!query) {

        showLatestArticles();

        return;
    }


    const results = searchArticles(query);
    console.log('QUERY:', query);
    console.log('RESULT IDS:', results.map(result => result.id));
    console.log('TOTAL:', results.length);
    

    enterSearchMode();

    renderSearchResults(results);
});


// ========================================
// Normalize search text
// ========================================

function normalizeText(text) {

    text = text.toLowerCase();

    const replacements = {
        'ā': 'a',
        'ī': 'i',
        'ū': 'u',
        'ṣ': 's',
        'ḥ': 'h',
        'ṭ': 't',
        'ẓ': 'z',
        'ḍ': 'd',
        'š': 's',
        'ġ': 'g',
        'ḫ': 'kh',
        'ʿ': '',
        'ʾ': ''
    };

    text = text.replace(
        /[āīūṣḥṭẓḍšġḫʿʾ]/g,
        char => replacements[char]
    );

    // Hapus tanda hubung dan apostrof
    text = text.replace(
        /['’ʼ\-–—]/g,
        ''
    );

    // Karakter lain menjadi spasi
    text = text.replace(
        /[^a-z\s]/g,
        ' '
    );

    text = text.replace(
        /\s+/g,
        ' '
    ).trim();

    return text;
}

// ========================================
// Load search index
// ========================================

async function loadSearchIndex() {

    const response = await fetch('search.json');

    if (!response.ok) {
        throw new Error('Failed to load search.json');
    }

    searchIndex = await response.json();

    console.log('Search index loaded:', searchIndex);
}


// ========================================
// Search
// ========================================

function searchArticles(query) {

    if (!searchIndex) {
        return [];
    }

    query = normalizeText(query);

    if (!query) {
        return [];
    }

    const keywords = [
        ...new Set(
            normalizeText(query)
                .split(/\s+/)
                .filter(Boolean)
        )
    ];

    let matchingArticles = null;


    // ====================================
    // Cari setiap keyword
    // ====================================

    for (const keyword of keywords) {

        const articlesForKeyword = new Set();

        for (const indexedWord in searchIndex) {

            // Partial matching
            if (indexedWord.includes(keyword)) {

                const articleIds = searchIndex[indexedWord];

                for (const articleId of articleIds) {
                    articlesForKeyword.add(articleId);
                }
            }
        }


        // =================================
        // Tidak ada artikel untuk keyword
        // =================================

        if (articlesForKeyword.size === 0) {
            return [];
        }


        // =================================
        // Keyword pertama
        // =================================

        if (matchingArticles === null) {

            matchingArticles = articlesForKeyword;

        } else {

            // =============================
            // INTERSECTION / AND
            // =============================

            matchingArticles = new Set(
                [...matchingArticles].filter(
                    id => articlesForKeyword.has(id)
                )
            );
        }


        // Tidak ada artikel yang memenuhi
        // semua keyword sejauh ini

        if (matchingArticles.size === 0) {
            return [];
        }
    }


    // ====================================
    // Buat hasil + score
    // ====================================

    const results = [...matchingArticles].map(id => ({
        id: Number(id),
        score: keywords.length
    }));


    // ====================================
    // Ranking
    // ====================================

    results.sort((a, b) => {

        if (b.score !== a.score) {
            return b.score - a.score;
        }

        return a.id - b.id;
    });


    return results;
}
// ========================================
// Initialize
// ========================================




function saveArticleReturnState() {

    const state = {
        mode: searchResults.hidden ? 'latest' : 'search',
        page: searchResults.hidden
            ? currentPage
            : currentSearchPage,
        query: searchInput.value.trim()
    };

    sessionStorage.setItem(
        'articleReturnState',
        JSON.stringify(state)
    );
}


document.addEventListener('click', event => {

    const link =
        event.target.closest('.article-link');

    if (!link) {
        return;
    }

    saveArticleReturnState();
});

function restoreArticleReturnState() {

    const savedState =
        sessionStorage.getItem(
            'articleReturnState'
        );

    if (!savedState) {
        return;
    }

    const state =
        JSON.parse(savedState);

    sessionStorage.removeItem(
        'articleReturnState'
    );

    if (state.mode === 'latest') {

        showLatestArticles();

        renderLatestArticles(
            state.page
        );

        return;
    }

    if (state.mode === 'search') {

        searchInput.value =
            state.query;

        enterSearchMode();

        const results =
            searchArticles(state.query);

        renderSearchResults(
            results,
            state.page
        );
    }
}


Promise.all([
    loadArticles(),
    loadSearchIndex()
])
    .then(() => {

        const savedState =
            sessionStorage.getItem(
                'articleReturnState'
            );

        if (savedState) {
            restoreArticleReturnState();
        } else {
            renderLatestArticles();
        }

    })
    .catch(error => {

        console.error(
            'Initialization failed:',
            error
        );

    });


    function getPaginationPages(currentPage, totalPages) {

    if (totalPages <= 7) {
        return Array.from(
            { length: totalPages },
            (_, i) => i + 1
        );
    }

    const pages = [];

    pages.push(1);

    if (currentPage <= 4) {

        pages.push(2, 3, 4, 5);
        pages.push('...');

    } else if (currentPage >= totalPages - 3) {

        pages.push('...');

        for (
            let page = totalPages - 4;
            page <= totalPages - 1;
            page++
        ) {
            pages.push(page);
        }

    } else {

        pages.push('...');
        pages.push(
            currentPage - 1,
            currentPage,
            currentPage + 1
        );
        pages.push('...');
    }

    pages.push(totalPages);

    return pages;
}