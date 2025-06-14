import { supabase } from "/api.client.js";

document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('Login error:', error);
        alert('Błąd logowania. Sprawdź konsolę.');
        return;
    }

    window.location.href = '/vite-multipage-starter/';
});