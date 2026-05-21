const token = localStorage.getItem('token');
const usuarioGuardado = localStorage.getItem('usuario');

if (!token || !usuarioGuardado) {
    alert('Debes iniciar sesión');
    window.location.href = 'login.html';
}

const usuario = JSON.parse(usuarioGuardado);

if (usuario.rol !== 'admin') {
    alert('No tienes permisos para ver esta página');
    window.location.href = 'eventos.html';
}

const btnPerfil = document.getElementById('btn-abrir-perfil');
const profileCard = document.getElementById('profile-card');
const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');

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

async function cargarEstadisticas() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/estadisticas', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            alert(datos.mensaje);
            window.location.href = 'eventos.html';
            return;
        }

        document.getElementById('totalEventos').textContent = datos.total_eventos;
        document.getElementById('eventosActivos').textContent = datos.eventos_activos;
        document.getElementById('totalInscripciones').textContent = datos.total_inscripciones;
        document.getElementById('certificadosGenerados').textContent = datos.certificados_generados;

        document.getElementById('resumenEventos').textContent = datos.total_eventos;
        document.getElementById('resumenInscripciones').textContent = datos.total_inscripciones;
        document.getElementById('resumenCertificados').textContent = datos.certificados_generados;

    } catch (error) {
        alert('Error al cargar estadísticas');
        console.error(error);
    }
}

cargarEstadisticas();