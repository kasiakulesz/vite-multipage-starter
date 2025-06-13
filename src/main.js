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

    const { data: session } = await supabase.auth.getSession();
    if (session) {
      setupDeleteButton();
      setupEditButton();
    }
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
  logoutButton.textContent = 'Wyloguj się';
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
      <section class="fixed inset-0 z-10 overflow-y-auto flex justify-center items-center text-pink-800 align-text-bottom rounded">
        <form id="add-article-form" class="bg-pink-100 p-5 inline-grid gap-2 align-baseline">
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
          <button type="submit" id="submit" class="cursor-pointer bg-pink-300 p-2 mt-2 w-auto justify-self-center rounded text-white font-semibold col-span-4 hover:bg-blue-300 transition duration-500 ease-in-out">Dodaj na stronę</button>
          <button type="button" id="close" aria-label="close" class="cursor-pointer hover:bg-pink-400 p-1 mt-1 w-auto justify-self-center rounded text-white font-semibold text-xs col-span-4 bg-blue-300 transition duration-500 ease-in-out" formnovalidate>Anuluj</button>
        </form>
      </section>
      `;
    
    document.body.appendChild(dialog);
    dialog.showModal();

    const closeButton = dialog.querySelector('#close');
    closeButton.addEventListener('click', (e) => {
      e.preventDefault();
      dialog.close();
      dialog.remove();
    });

    const form = dialog.querySelector('#add-article-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
        const articleData = {
          title: form.title.value,
          subtitle: form.subtitle.value,
          author: form.author.value,
          created_at: form.created_at.value ? new Date(form.created_at.value).toISOString() : new Date().toISOString(),
          content: form.content.value
        };

      const { error } = await supabase.from('articles').insert(articleData);

      if (error) {
        console.error('Error adding article:', error);
        alert('Błąd podczas dodawania artykułów. Sprawdź konsolę.');
        return;
      }

      dialog.close();
      await fetchArticles();
    });
  });

  navbar.appendChild(addArticleButton);
}

function setupDeleteButton() {
  document.querySelectorAll(".article").forEach(single_article => {
    const articleID = single_article.dataset.articleId;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = "Usuń";
    deleteButton.type = "button";
    deleteButton.className = "cursor-pointer hover:bg-pink-400 p-1 mt-1 w-auto justify-self-center rounded text-white font-semibold text-xs col-span-4 bg-blue-300 transition duration-500 ease-in-out mr-1";

    deleteButton.addEventListener('click', async () => {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleID)

      if (error) {
        console.error('Wystąpił błąd podczas usuwania: ', erorr);
        alert('Usunięcie nie powiodło się.')
        return;
      }

    await fetchArticles();
    });

    single_article.appendChild(deleteButton);
  });
}

function setupEditButton() {
  document.querySelectorAll(".article").forEach(single_article => {
    const editButton = document.createElement('button');
    editButton.textContent = "Edytuj";
    editButton.type = "button";
    editButton.className = "cursor-pointer hover:bg-pink-400 p-1 mt-1 w-auto justify-self-center rounded text-white font-semibold text-xs col-span-4 bg-blue-300 transition duration-500 ease-in-out";

    single_article.appendChild(editButton);
  });
}