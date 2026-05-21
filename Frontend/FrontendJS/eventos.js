const listaEventos = document.getElementById('eventos-lista');
const nombrePerfil = document.querySelector('.nombre-perfil');

const token = localStorage.getItem('token');
const usuarioGuardado = localStorage.getItem('usuario');

if (usuarioGuardado) {
    const usuario = JSON.parse(usuarioGuardado);
    nombrePerfil.textContent = usuario.nombre;
}

async function cargarEventos() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/eventos');
        const eventos = await respuesta.json();

        listaEventos.innerHTML = '';

        if (eventos.length === 0) {
            listaEventos.innerHTML = '<p>No hay eventos disponibles por ahora.</p>';
            return;
        }

        eventos.forEach(evento => {
            const fecha = new Date(evento.fecha_inicio).toLocaleDateString();

            const card = document.createElement('article');
            card.classList.add('card');

            card.innerHTML = `
                <h2>${evento.titulo}</h2>
                <p class="card-meta">Fecha: ${fecha}</p>
                <p class="card-meta">Lugar: ${evento.lugar}</p>
                <p class="card-meta">Cupos: ${evento.cupos}</p>
                <p>${evento.descripcion}</p>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="inscribirse(${evento.id_evento})">
                        Inscribirse
                    </button>
                </div>
            `;

            listaEventos.appendChild(card);
        });

    } catch (error) {
        listaEventos.innerHTML = '<p>Error al cargar los eventos.</p>';
        console.error(error);
    }
}

async function inscribirse(idEvento) {
    if (!token) {
        alert('Debes iniciar sesión para inscribirte');
        window.location.href = 'login.html';
        return;
    }

    try {
        const respuesta = await fetch(`http://localhost:3000/api/inscripciones/${idEvento}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const datos = await respuesta.json();
        alert(datos.mensaje);

    } catch (error) {
        alert('Error al inscribirse al evento');
        console.error(error);
    }
}

cargarEventos();