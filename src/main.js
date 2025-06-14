import { supabase } from "./api.client.js";

main();

///
let addArticleButton = null;
const navbar = document.querySelector('nav');

async function main() {
  const { data, error } = await supabase.auth.getSession();
  noButtons();
  if (data.session) {
    setupLogoutButton();
    setupAddArticleButton();
  } else {
    setupLoginButton();
  }
  
  await fetchArticles();

  if (error) {
    console.error('Error getting session:', error);
    alert('Błąd podczas pobierania sesji. Sprawdź konsolę');
    return;
  }
}

async function fetchArticles() {
  const { data, error } = await supabase.from('articles').select("*").eq("is_published", true).order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error?.message ?? error);
    alert('Błąd podczas pobierania artykułów. Sprawdź konsolę.');
    return
  }

  const articleList = data.map((article, i) => {
    return `
      ${i > 0 ? '<hr class="h-px mx-auto bg-pink-100 border-0"/>' : ''}
      <article class="article bg-pink-50 rounded-lg p-5" data-article-id="${article.id}">
        <h2 class="font-bold text-base sm:text-xl md:text-2xl lg:text-3xl text-pink-600 mb-1">${article.title}</h2>
        <h3 class="text-sm sm:text-s md:text-base lg:text-xl font-semibold text-pink-900 mb-2">${article.subtitle}</h3>
        <div class="flex flex-wrap gap-2 text-xs sm:text-xs md:text-sm lg:text-m mb-4">
          <address rel="author" class="not-italic">${article.author}</address>
          <time datetime="${article.created_at}">${new Date(article.created_at).toLocaleDateString()}</time>
        </div>
        <p class="leading-relaxed text-sm sm:text-s md:text-m lg:text-base">${article.content}</p>
      </article>
    `;
}).join('');

    document.getElementById("articles").innerHTML = articleList;

    document.querySelectorAll('.changer').forEach(btn => btn.remove());

    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      setupDeleteButton();
      setupEditButton();
    }
}

function setupLoginButton() {
  const loginButton = document.createElement('a');
  loginButton.textContent = 'Zaloguj się';
  loginButton.href = "/vite-multipage-starter/login/index.html";
  loginButton.className = 'sm:w-auto text-xs text-sm sm:text-s md:text-base lg:text-l bg-pink-300 text-white font-semibold px-3 py-1 rounded-full transition duration-500 ease-in-out hover:bg-blue-300 cursor-pointer';

  navbar.appendChild(loginButton);
}

function setupLogoutButton() {
  const logoutButton = document.createElement('a');
  logoutButton.textContent = 'Wyloguj się';
  logoutButton.type = "button";
  logoutButton.className = 'sm:w-auto text-xs text-sm sm:text-s md:text-base lg:text-l bg-pink-300 text-white font-semibold px-3 py-1 rounded-full transition duration-500 ease-in-out hover:bg-blue-300 cursor-pointer';

  logoutButton.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      alert('Błąd podczas wylogowywania. Sprawdź konsolę');
      return;
    }
    main();
  });

  navbar.appendChild(logoutButton);
}

function setupAddArticleButton () {
  if (addArticleButton) return;

  addArticleButton = document.createElement('button');
  addArticleButton.textContent = 'Dodaj artykuł';
  addArticleButton.className = 'sm:w-auto text-xs text-sm sm:text-s md:text-base lg:text-l text-l hover:bg-pink-400 text-white font-semibold px-3 py-1 rounded-full transition duration-500 ease-in-out bg-blue-300 cursor-pointer';
  addArticleButton.type = "button";

  addArticleButton.addEventListener('click', () => {
    const dialog = document.createElement('dialog');
    dialog.className = 'bg-pink-100';
    dialog.innerHTML = `
      <section class="fixed inset-0 z-10 overflow-y-auto flex justify-center items-center text-pink-800 align-text-bottom">
        <form id="add-article-form" class="bg-pink-100 rounded-xl p-5 inline-grid gap-2 align-baseline max-w-lg sm:p-6 sm:max-w-lg sm:mt-8 text-sm sm:text-s md:text-base lg:text-xl w-full">
          <h2 class="text-l font-bold col-span-4 sm:text-xl md:text-2xl lg:text-3xl font-bold col-span-4">Dodaj nowy artykuł</h2>
          <label for="title" class="mt-2 col-span-4">Tytuł: </label>
            <input type="text" id="title" class="bg-white col-span-4 rounded p-1 focus:outline-pink-800" required/>
          <label for="subtitle" class="mt-2 col-span-4">Podtytuł: </label>
            <input type="text" id="subtitle" class="bg-white col-span-4 rounded p-1 focus:outline-pink-800" required/>
          <label for="title" class="mt-2 col-span-4">Autor: </label>
            <input type="text" id="author" class="bg-white col-span-4 mt-2 rounded p-1 focus:outline-pink-800" required/>
          <label for="content" class="mt-2">Treść: </label>
            <textarea id="content" class="bg-white col-span-4 rounded p-1 focus:outline-pink-800" required></textarea>
          <button type="submit" id="submit" class="sm:w-auto cursor-pointer bg-pink-300 p-2 mt-2 w-auto justify-self-center rounded-full text-white font-semibold col-span-4 hover:bg-blue-300 transition duration-500 ease-in-out">Dodaj na stronę</button>
          <button type="button" id="close" class="sm:w-auto cursor-pointer hover:bg-pink-400 p-1 mt-1 w-auto justify-self-center rounded-full text-white font-semibold text-xs col-span-4 bg-blue-300 transition duration-500 ease-in-out" formnovalidate>Anuluj</button>
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
          created_at: new Date().toISOString(),
          content: form.content.value,
          is_published: true
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

    if (single_article.querySelector('button.changer.delete')) return;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = "Usuń";
    deleteButton.type = "button";
    deleteButton.className = "changer cursor-pointer hover:bg-pink-400 p-1 mt-1 w-auto justify-self-center rounded-full text-white font-semibold text-xs col-span-4 bg-blue-300 transition duration-500 ease-in-out mr-1";

    deleteButton.addEventListener('click', async () => {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleID)

      if (error) {
        console.error('Wystąpił błąd podczas usuwania: ', error);
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
    const articleID = single_article.dataset.articleId;

    if (single_article.querySelector('button.changer.edit')) return;

    const editButton = document.createElement('button');
    editButton.textContent = "Edytuj";
    editButton.type = "button";
    editButton.className = "changer cursor-pointer hover:bg-pink-400 p-1 mt-1 w-auto justify-self-center rounded-full text-white font-semibold text-xs col-span-4 bg-blue-300 transition duration-500 ease-in-out";

    editButton.addEventListener('click', async () => {
      const { data: article, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleID)
        .single();

      if (error) {
        console.error('Wystąpił błąd podczas edycji: ', error);
        alert('Edycja nie powiodła się.')
        return;
      }

      const dialog = document.createElement('dialog');
      dialog.className = "bg-pink-100";
      dialog.innerHTML = `
        <section class="fixed inset-0 z-10 overflow-y-auto flex justify-center items-center text-pink-800 align-text-bottom rounded">
        <form id="edit-article-form" class="bg-pink-100 rounded-xl p-5 inline-grid gap-2 align-baseline max-w-lg sm:p-6 sm:max-w-lg sm:mt-8 text-sm sm:text-s md:text-base lg:text-xl w-full">
          <h2 class="text-2xl font-bold col-span-4">Edytuj artykuł</h2>
          <label for="title" class="mt-2 col-span-4">Tytuł: </label>
            <input type="text" id="title" value="${article.title}" class="bg-white col-span-4 rounded p-1 focus:outline-pink-800" required/>
          <label for="subtitle" class="mt-2 col-span-4">Podtytuł: </label>
            <input type="text" id="subtitle" value="${article.subtitle}" class="bg-white col-span-4 rounded p-1 focus:outline-pink-800" required/>
          <label for="title" class="mt-2 col-span-4">Autor: </label>
            <input type="text" id="author" value="${article.author}" class="bg-white col-span-4 mt-2 rounded p-1 focus:outline-pink-800" required/>
          <label for="content" class="mt-2">Treść: </label>
            <textarea id="content" class="bg-white col-span-4 rounded p-1 focus:outline-pink-800" required>${article.content}</textarea>
          <button type="submit" id="save_changes" class="sm:w-auto cursor-pointer bg-pink-300 p-2 mt-2 w-auto justify-self-center rounded-full text-white font-semibold col-span-4 hover:bg-blue-300 transition duration-500 ease-in-out">Zapisz zmiany</button>
          <button type="button" id="cancel" aria-label="close" class="sm:w-auto cursor-pointer hover:bg-pink-400 p-1 mt-1 w-auto justify-self-center rounded-full text-white font-semibold text-xs col-span-4 bg-blue-300 transition duration-500 ease-in-out" formnovalidate>Anuluj</button>
        </form>
      </section>
      `;

      document.body.appendChild(dialog);
      dialog.showModal();

      dialog.querySelector('#cancel').addEventListener('click', () => {
        dialog.close();
        dialog.remove();
      });

      dialog.querySelector('#edit-article-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = dialog.querySelector('#edit-article-form');
        const newArticleData = {
            title: form.title.value,
            subtitle: form.subtitle.value,
            created_at: new Date().toISOString(),
            author: form.author.value,
            content: form.content.value
          };

        const { error } = await supabase.from('articles').update(newArticleData).eq('id', articleID);

        if (error) {
          console.error('Error adding article:', error);
          alert('Błąd podczas dodawania artykułów. Sprawdź konsolę.');
          return;
        }

        dialog.close();
        dialog.remove();
        await fetchArticles();
      });
        });
      single_article.appendChild(editButton);
    });
  };

  function noButtons() {
    navbar.innerHTML = "";

    document.querySelectorAll('.changer').forEach(btn => {
      btn.remove();
    });
  }