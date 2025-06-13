import { supabase } from "./api.client.js";

main();

///

async function main() {
  
  setupLoginButton();
  setupLogoutButton();
  
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
      ${i > 0 ? '<hr class="w-50 h-px mx-auto my-8 bg-gray-300 border-0"/>' : ''}
      <article class="article" data-article-id="${article.id}">
        <h2 class="font-bold text-xl">${article.title}</h2>
        <h3 class="text-l font-semibold">${article.subtitle}</h4>
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

function setupLoginButton() {
  const navbar = document.querySelector('nav');

  const loginButton = document.createElement('a');
  loginButton.textContent = 'Login';
  loginButton.href = "/login/";
  loginButton.className = 'text-l bg-pink-300 text-white font-semibold px-3 py-1 rounded-full transition duration-500 ease-in-out hover:bg-blue-300 cursor-pointer';

  navbar.appendChild(loginButton);
}

function setupLogoutButton() {
  const navbar = document.querySelector('nav');

  const logoutButton = document.createElement('a');
  logoutButton.textContent = 'Logout';
  logoutButton.type = "button";
  logoutButton.className = 'text-l bg-pink-300 text-white font-semibold px-3 py-1 rounded-full transition duration-500 ease-in-out hover:bg-blue-300 cursor-pointer';

  navbar.appendChild(logoutButton);
}