const token = localStorage.getItem('token');
const usuarioGuardado = localStorage.getItem('usuario');

const nombrePerfil = document.querySelector('.nombre-perfil');
const linksAdmin = document.querySelectorAll('.link-admin');

const btnPerfil = document.getElementById('btn-abrir-perfil');
const profileCard = document.getElementById('profile-card');
const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');

if (!token || !usuarioGuardado) {
    window.location.href = 'login.html';
}

const usuario = JSON.parse(usuarioGuardado);

if (nombrePerfil) {
    nombrePerfil.textContent = usuario.nombre;
}

if (usuario.rol !== 'admin') {
    linksAdmin.forEach(link => {
        link.style.display = 'none';
    });
}

if (btnPerfil && profileCard) {
    btnPerfil.addEventListener('click', () => {
        profileCard.classList.toggle('profile-card-visible');
    });
}

if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        window.location.href = 'login.html';
    });
}