const token = localStorage.getItem('token');
const usuarioGuardado = localStorage.getItem('usuario');
const nombrePerfil = document.querySelector('.nombre-perfil');

if (!token || !usuarioGuardado) {
    alert('Debes iniciar sesión');
    window.location.href = 'login.html';
}

const usuario = JSON.parse(usuarioGuardado);
nombrePerfil.textContent = usuario.nombre;

if (usuario.rol !== 'admin') {
    alert('No tienes permisos para ver esta página');
    window.location.href = 'eventos.html';
} else {
    cargarEstadisticas();
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