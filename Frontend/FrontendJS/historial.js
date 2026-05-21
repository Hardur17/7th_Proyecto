const historialLista = document.getElementById('historial-lista');
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
    alert('Debes iniciar sesión');
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