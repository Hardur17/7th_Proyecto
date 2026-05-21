const historialLista = document.getElementById('historial-lista');
const nombrePerfil = document.querySelector('.nombre-perfil');
const linksAdmin = document.querySelectorAll('.link-admin');

const token = localStorage.getItem('token');
const usuarioGuardado = localStorage.getItem('usuario');

if (usuarioGuardado) {
    const usuario = JSON.parse(usuarioGuardado);
    nombrePerfil.textContent = usuario.nombre;

    if (usuario.rol !== 'admin') {
        linksAdmin.forEach(link => {
            link.style.display = 'none';
        });
    }
}

if (!token) {
    alert('Debes iniciar sesión');
    window.location.href = 'login.html';
}

function crearEstado(texto) {
    if (texto === 'inscrito' || texto === 'finalizado') {
        return `<span class="status-pill status-completado">${texto}</span>`;
    }

    if (texto === 'pendiente' || texto === 'activo') {
        return `<span class="status-pill status-pendiente">${texto}</span>`;
    }

    return `<span class="status-pill">${texto}</span>`;
}

async function cargarHistorial() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/inscripciones/mis-inscripciones', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const inscripciones = await respuesta.json();

        historialLista.innerHTML = '';

        if (inscripciones.length === 0) {
            historialLista.innerHTML = `
                <tr>
                    <td colspan="5">No tienes inscripciones registradas.</td>
                </tr>
            `;
            return;
        }

        inscripciones.forEach(item => {
            const fecha = new Date(item.fecha_inicio).toLocaleDateString();

            const fila = document.createElement('tr');

            fila.innerHTML = `
                <td>${item.titulo}</td>
                <td>${fecha}</td>
                <td>${item.lugar}</td>
                <td>${crearEstado(item.estado_inscripcion)}</td>
                <td>${crearEstado(item.estado_evento)}</td>
            `;

            historialLista.appendChild(fila);
        });

    } catch (error) {
        historialLista.innerHTML = `
            <tr>
                <td colspan="5">Error al cargar el historial.</td>
            </tr>
        `;
        console.error(error);
    }
}

cargarHistorial();