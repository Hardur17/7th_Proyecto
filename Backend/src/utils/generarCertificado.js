const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generarCertificadoPDF(datos) {
    return new Promise((resolve, reject) => {
        const carpetaCertificados = path.join(__dirname, '../../certificados');

        if (!fs.existsSync(carpetaCertificados)) {
            fs.mkdirSync(carpetaCertificados);
        }

        const nombreArchivo = `certificado-${datos.codigo_certificado}.pdf`;
        const rutaArchivo = path.join(carpetaCertificados, nombreArchivo);

        const doc = new PDFDocument({
            size: 'A4',
            layout: 'landscape',
            margin: 50
        });

        const stream = fs.createWriteStream(rutaArchivo);

        doc.pipe(stream);

        // Borde decorativo
        doc
            .lineWidth(4)
            .rect(30, 30, 780, 535)
            .stroke();

        doc
            .lineWidth(1)
            .rect(45, 45, 750, 505)
            .stroke();

        // Título
        doc
            .fontSize(34)
            .font('Helvetica-Bold')
            .text('CERTIFICADO DE PARTICIPACIÓN', 0, 90, {
                align: 'center'
            });

        // Texto principal
        doc
            .fontSize(18)
            .font('Helvetica')
            .text('Se certifica que:', 0, 165, {
                align: 'center'
            });

        // Nombre participante
        doc
            .fontSize(30)
            .font('Helvetica-Bold')
            .text(`${datos.nombre} ${datos.apellido}`, 0, 205, {
                align: 'center'
            });

        doc
            .fontSize(18)
            .font('Helvetica')
            .text('participó satisfactoriamente en el evento:', 0, 265, {
                align: 'center'
            });

        // Evento
        doc
            .fontSize(26)
            .font('Helvetica-Bold')
            .text(datos.titulo_evento, 0, 305, {
                align: 'center'
            });

        // Datos evento
        doc
            .fontSize(15)
            .font('Helvetica')
            .text(`Fecha del evento: ${datos.fecha_evento}`, 0, 370, {
                align: 'center'
            });

        doc
            .fontSize(15)
            .font('Helvetica')
            .text(`Lugar: ${datos.lugar}`, 0, 395, {
                align: 'center'
            });

        // Código
        doc
            .fontSize(12)
            .font('Helvetica')
            .text(`Código de certificado: ${datos.codigo_certificado}`, 0, 470, {
                align: 'center'
            });

        doc
            .fontSize(12)
            .text(`Fecha de generación: ${datos.fecha_generacion}`, 0, 495, {
                align: 'center'
            });

        doc.end();

        stream.on('finish', () => {
            resolve({
                nombreArchivo,
                rutaArchivo
            });
        });

        stream.on('error', reject);
    });
}

module.exports = generarCertificadoPDF;