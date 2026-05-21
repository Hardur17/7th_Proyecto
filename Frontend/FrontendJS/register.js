const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const correo = document.getElementById('correo').value;
    const password = document.getElementById('password').value;
    const confirmarPassword = document.getElementById('confirmarPassword').value;

    if (password !== confirmarPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    try {
        const respuesta = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre,
                apellido,
                correo,
                password
            })
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            alert(datos.mensaje);
            window.location.href = 'login.html';
        } else {
            alert(datos.mensaje);
        }

    } catch (error) {
        alert('Error al conectar con el servidor');
        console.error(error);
    }
});