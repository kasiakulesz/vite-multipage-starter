import { supabase } from "./api.client.js";

main();

///

async function main() {
  const { data, error } = await supabase.auth.getSession();
  if (data.session) {
    setupLogoutButton();
    setupAddArticleButton();
  } else {
    setupLoginButton();
  }

  if (error) {
    console.error('Error getting session:', error);
    alert('Błąd podczas pobierania sesji. Sprawdź konsolę');
    return;
  }

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

  logoutButton.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      alert('Błąd podczas wylogowywania. Sprawdź konsolę');
      return;
    }
    logoutButton.remove();
    setupLoginButton();
    await fetchArticles();
  });

  navbar.appendChild(logoutButton);
}

function setupAddArticleButton () {
  const navbar = document.querySelector('nav');

  const addArticleButton = document.createElement('button');
  addArticleButton.textContent = 'Dodaj artykuł';
  addArticleButton.className = 'text-l hover:bg-pink-400 text-white font-semibold px-3 py-1 rounded-full transition duration-500 ease-in-out bg-blue-300 cursor-pointer';
  addArticleButton.type = "button";

  addArticleButton.addEventListener('click', () => {
    const dialog = document.createElement('dialog');
    dialog.className = 'bg-pink-100';
    dialog.innerHTML = `
      <section class="m-auto w-fit bg-pink-100 text-pink-800 align-text-bottom rounded mb-50">
        <form id="add-article-form" class="p-5 inline-grid gap-2 align-baseline">
          <h2 class="text-2xl font-bold col-span-4">Dodaj nowy artykuł</h2>
          <label for="title" class="mt-2 col-span-4">Tytuł: </label>
            <input type="text" id="title" class="bg-white col-span-4 rounded p-1 focus:outline-pink-800" required/>
          <label for="subtitle" class="mt-2 col-span-4">Podtytuł: </label>
            <input type="text" id="subtitle" class="bg-white col-span-4 rounded p-1 focus:outline-pink-800" required/>
          <label for="title" class="mt-2 col-span-1">Autor: </label>
            <input type="text" id="author" class="bg-white col-span-1 mt-2 rounded p-1 focus:outline-pink-800" required/>
          <label for="date" class="mt-2 col-span-1">Data: </label>
            <input type="datetime-local" id="date" name="created_at" class="mt-2 bg-white col-span-1 p-1 rounded focus:outline-pink-800" required />
          <label for="content" class="mt-2">Treść: </label>
            <textarea id="content" class="bg-white col-span-4 rounded p-1 focus:outline-pink-800" required></textarea>
          <button type="submit" id="submit" class="cursor-pointer bg-pink-300 p-2 mt-2 w-auto justify-self-center rounded text-white font-semibold col-span-4 transition duration-500 ease-in-out">Dodaj na stronę</button>
        </form>
      </section>
      `;
    
    document.body.appendChild(dialog);
    dialog.showModal()

    const form = dialog.querySelector('#add-article-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = e.target.title.value;
      const content = e.target.content.value;

      const { error } = await supabase.from('articles').insert({ title, content });

      if (error) {
        console.error('Error adding article:', error);
        alert('Błąd podczas dodawania artykułów. Sprawdź konsolę.');
        return;
      }
    });
  });

  navbar.appendChild(addArticleButton);
}