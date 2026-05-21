const token = localStorage.getItem('token');
const usuarioGuardado = localStorage.getItem('usuario');
const nombrePerfil = document.querySelector('.nombre-perfil');
const linksAdmin = document.querySelectorAll('.link-admin');

if (!token || !usuarioGuardado) {
    window.location.href = 'login.html';
}

const usuario = JSON.parse(usuarioGuardado);
nombrePerfil.textContent = usuario.nombre;

if (usuario.rol !== 'admin') {
    linksAdmin.forEach(link => {
        link.style.display = 'none';
    });
}