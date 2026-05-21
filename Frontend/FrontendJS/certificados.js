const certificadosLista = document.getElementById('certificados-lista');
const nombrePerfil = document.querySelector('.nombre-perfil');
const linksAdmin = document.querySelectorAll('.link-admin');

const btnPerfil = document.getElementById('btn-abrir-perfil');
const profileCard = document.getElementById('profile-card');
const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');

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

async function cargarEventosInscritos() {
    try {
        const respuesta = await fetch('http://localhost:3000/api/inscripciones/mis-inscripciones', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const inscripciones = await respuesta.json();

        certificadosLista.innerHTML = '';

        if (inscripciones.length === 0) {
            certificadosLista.innerHTML = '<p>No tienes eventos inscritos.</p>';
            return;
        }

        inscripciones.forEach(item => {
            const fecha = new Date(item.fecha_inicio).toLocaleDateString();

            const card = document.createElement('article');
            card.classList.add('card');

            card.innerHTML = `
                <h2>${item.titulo}</h2>
                <p class="card-meta">Fecha: ${fecha}</p>
                <p class="card-meta">Inscripción: ${item.estado_inscripcion}</p>
                <p class="card-meta">Estado del evento: ${item.estado_evento}</p>
                <p>${item.descripcion}</p>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="generarCertificado(${item.id_evento})">
                        Generar certificado
                    </button>
                </div>
            `;

            certificadosLista.appendChild(card);
        });

    } catch (error) {
        certificadosLista.innerHTML = '<p>Error al cargar certificados.</p>';
        console.error(error);
    }
}

async function descargarPDF(urlCertificado) {
    try {
        const respuesta = await fetch(`http://localhost:3000${urlCertificado}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!respuesta.ok) {
            alert('No se pudo descargar el certificado');
            return;
        }

        const archivo = await respuesta.blob();
        const url = window.URL.createObjectURL(archivo);

        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = 'certificado.pdf';
        document.body.appendChild(enlace);
        enlace.click();

        document.body.removeChild(enlace);
        window.URL.revokeObjectURL(url);

    } catch (error) {
        alert('Error al descargar el certificado');
        console.error(error);
    }
}

async function generarCertificado(idEvento) {
    try {
        const respuesta = await fetch(`http://localhost:3000/api/certificados/${idEvento}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            if (datos.url_certificado) {
                alert(`Certificado generado correctamente. Código: ${datos.codigo_certificado}`);
                descargarPDF(datos.url_certificado);
            } else if (datos.certificado && datos.certificado.url_certificado) {
                alert(`Certificado ya generado. Código: ${datos.certificado.codigo_certificado}`);
                descargarPDF(datos.certificado.url_certificado);
            } else {
                alert(datos.mensaje);
            }
        } else {
            alert(datos.mensaje);
        }

    } catch (error) {
        alert('Error al generar certificado');
        console.error(error);
    }
}

cargarEventosInscritos();