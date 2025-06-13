import { supabase } from "./api.client.js";

main();

///

async function main() {
  
  await fetchArticles();
}

async function fetchArticles() {
  const { data, error } = await supabase.from('articles').select("*").eq("is_published", true).order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error?.message ?? error);
    alert('Błąd podczas pobierania artykułów. Sprawdź konsolę.');
    return
  }

  console.log('Fetched articles:', data);
  const articleList = data.map((article, i) => {
    return `
      ${i > 0 ? '<hr />' : ''}
      <article class="article" data-article-id="${article.id}">
        <h2 class="font-bold text-xl">${article.title}</h2>
        <div class="flex gap-2 text-sm">
          <address rel="author">${article.author}</address>
          <time datetime="${article.created_at}">${new Date(article.created_at).toLocaleDateString()}</time>
        </div>

        <p class="mt-2">${article.content}</p>
      </article>
    `;
}).join('');

    document.getElementById("articles").innerHTML = articleList;
}