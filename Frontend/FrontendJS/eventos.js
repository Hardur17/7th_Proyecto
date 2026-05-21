const listaEventos = document.getElementById('eventos-lista');
const nombrePerfil = document.querySelector('.nombre-perfil');
const linksAdmin = document.querySelectorAll('.link-admin');

const btnPerfil = document.getElementById('btn-abrir-perfil');
const profileCard = document.getElementById('profile-card');
const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
const btnCambiarNombre = document.getElementById('btn-cambiar-nombre');
const btnCambiarContra = document.getElementById('btn-cambiar-contra');

const token = localStorage.getItem('token');
const usuarioGuardado = localStorage.getItem('usuario');

if (!token || !usuarioGuardado) {
    window.location.href = 'login.html';
}

if (usuarioGuardado) {
    const usuario = JSON.parse(usuarioGuardado);

    if (nombrePerfil) {
        nombrePerfil.textContent = usuario.nombre;
    }

    if (usuario.rol !== 'admin') {
        linksAdmin.forEach(link => {
            link.style.display = 'none';
        });
    }
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

if (btnCambiarNombre) {

    btnCambiarNombre.addEventListener('click', async () => {

        const nuevoNombre = prompt('Ingresa tu nuevo nombre');
        const nuevoApellido = prompt('Ingresa tu nuevo apellido');

        if (!nuevoNombre || !nuevoApellido) {

            alert('Todos los campos son obligatorios');
            return;
        }

        try {

            const respuesta = await fetch(
                'http://localhost:3000/api/auth/actualizar-nombre',
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        nombre: nuevoNombre,
                        apellido: nuevoApellido
                    })
                }
            );

            const datos = await respuesta.json();

            if (respuesta.ok) {

                const usuarioActualizado = JSON.parse(
                    localStorage.getItem('usuario')
                );

                usuarioActualizado.nombre = nuevoNombre;
                usuarioActualizado.apellido = nuevoApellido;

                localStorage.setItem(
                    'usuario',
                    JSON.stringify(usuarioActualizado)
                );

                alert(datos.mensaje);

                window.location.reload();

            } else {

                alert(datos.mensaje);
            }

        } catch (error) {

            alert('Error al actualizar nombre');
            console.error(error);
        }
    });
}

if (btnCambiarContra) {

    btnCambiarContra.addEventListener('click', async () => {

        const passwordActual = prompt('Ingresa tu contraseña actual');
        const passwordNueva = prompt('Ingresa tu nueva contraseña');

        if (!passwordActual || !passwordNueva) {

            alert('Todos los campos son obligatorios');
            return;
        }

        try {

            const respuesta = await fetch(
                'http://localhost:3000/api/auth/actualizar-password',
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        passwordActual,
                        passwordNueva
                    })
                }
            );

            const datos = await respuesta.json();

            alert(datos.mensaje);

        } catch (error) {

            alert('Error al actualizar contraseña');
            console.error(error);
        }
    });
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