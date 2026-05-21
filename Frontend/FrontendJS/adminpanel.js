const token = localStorage.getItem('token');
const usuarioGuardado = localStorage.getItem('usuario');

if (!token || !usuarioGuardado) {
    alert('Debes iniciar sesión');
    window.location.href = 'login.html';
}

const usuario = JSON.parse(usuarioGuardado);

if (usuario.rol !== 'admin') {
    alert('No tienes permisos para acceder al panel de administración');
    window.location.href = 'eventos.html';
}

const tablaEventos = document.getElementById('tabla-eventos');
const btnCrearEvento = document.getElementById('btn-crear-evento');
const btnCancelar = document.getElementById('btn-cancelar');
const formCard = document.getElementById('form-card');
const formEvento = document.getElementById('formEvento');

const btnPerfil = document.getElementById('btn-abrir-perfil');
const profileCard = document.getElementById('profile-card');
const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
const btnCambiarNombre = document.getElementById('btn-cambiar-nombre');
const btnCambiarContra = document.getElementById('btn-cambiar-contra');

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

btnCrearEvento.addEventListener('click', () => {
    formCard.classList.toggle('form-card-visible');
});

btnCancelar.addEventListener('click', () => {
    formCard.classList.remove('form-card-visible');
});

async function cargarEventosAdmin() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/eventos/admin/todos', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const eventos = await respuesta.json();

        tablaEventos.innerHTML = '';

        if (eventos.length === 0) {
            tablaEventos.innerHTML = `
                <tr>
                    <td colspan="7">No hay eventos registrados.</td>
                </tr>
            `;
            return;
        }

        eventos.forEach(evento => {
            const fechaInicio = new Date(evento.fecha_inicio).toLocaleDateString();
            const fechaFin = new Date(evento.fecha_fin).toLocaleDateString();

            const fila = document.createElement('tr');

            fila.innerHTML = `
                <td>${evento.titulo}</td>
                <td>${fechaInicio}</td>
                <td>${fechaFin}</td>
                <td>${evento.estado}</td>
                <td>${evento.lugar}</td>
                <td>${evento.cupos}</td>
                <td>
                    ${
                        evento.estado === 'cancelado'
                        ? 'Cancelado'
                        : evento.estado === 'finalizado'
                            ? ''
                            : `<button class="btn btn-secondary" onclick="cancelarEvento(${evento.id_evento})">Cancelar</button>`
                    }
                </td>
            `;

            tablaEventos.appendChild(fila);
        });

    } catch (error) {
        tablaEventos.innerHTML = `
            <tr>
                <td colspan="7">Error al cargar eventos.</td>
            </tr>
        `;
        console.error(error);
    }
}

formEvento.addEventListener('submit', async function (e) {
    e.preventDefault();

    const titulo = document.getElementById('titulo').value;
    const descripcion = document.getElementById('descripcion').value;
    const fecha_inicio = document.getElementById('fecha_inicio').value;
    const fecha_fin = document.getElementById('fecha_fin').value;
    const lugar = document.getElementById('lugar').value;
    const cupos = document.getElementById('cupos').value;

    try {
        const respuesta = await fetch('http://localhost:3000/api/eventos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                titulo,
                descripcion,
                fecha_inicio,
                fecha_fin,
                lugar,
                cupos,
                imagen: null
            })
        });

        const datos = await respuesta.json();

        alert(datos.mensaje);

        if (respuesta.ok) {
            formEvento.reset();
            formCard.classList.remove('form-card-visible');
            cargarEventosAdmin();
        }

    } catch (error) {
        alert('Error al crear evento');
        console.error(error);
    }
});

async function cancelarEvento(idEvento) {
    const confirmar = confirm('¿Seguro que deseas cancelar este evento?');

    if (!confirmar) {
        return;
    }

    try {
        const respuesta = await fetch(`http://localhost:3000/api/eventos/${idEvento}/cancelar`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const datos = await respuesta.json();

        alert(datos.mensaje);

        if (respuesta.ok) {
            cargarEventosAdmin();
        }

    } catch (error) {
        alert('Error al cancelar evento');
        console.error(error);
    }
}

cargarEventosAdmin();