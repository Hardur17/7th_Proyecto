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