const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const correo = document.getElementById('correo').value;
    const password = document.getElementById('password').value;

    try {
        const respuesta = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                correo,
                password
            })
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            localStorage.setItem('token', datos.token);
            localStorage.setItem('usuario', JSON.stringify(datos.usuario));

            alert('Inicio de sesión exitoso');

            if (datos.usuario.rol === 'admin') {
                window.location.href = 'estadisticas.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            alert(datos.mensaje);
        }

    } catch (error) {
        alert('Error al conectar con el servidor');
        console.error(error);
    }
});