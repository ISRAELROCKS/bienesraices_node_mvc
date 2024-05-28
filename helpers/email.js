import nodemailer from 'nodemailer';

const emailRegistro = async(datos)=> { //se crea una funcion con toda la coxion al servidor de email
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });
    const {nombre,email,token} = datos;

    //enviar el email
    await transport.sendMail({
        from:'BienesRaices.com',
        to: email,
        subject:'confirma tu cuenta de BienesRaices.com',
        text: 'confirma tu cuenta de BienesRaices.com',
        html:
            `
                <p>Hola ${nombre}, comprueba tu cuenta en BienesRaices.com </p>
                <p>Tu cuenta ya esta lista solo debes confirmala en el sig enlace:
                    <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}"> Confirmar cuenta</a> 
                </p>
                <p>si tu no creaste esta cuenta puedes ignorar el mensaje</p>       
        `

    })
}
const emailOlvidePassword = async(datos)=> { //se crea una funcion con toda la coxion al servidor de email
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });
    const {nombre,email,token} = datos;

    //enviar el email
    await transport.sendMail({
        from:'BienesRaices.com',
        to: email,
        subject:'Restablece tu password en BienesRaices.com',
        text: 'Restablece tu password en BienesRaices.com',
        html:
            `
                <p>Hola ${nombre}, HAZ SOLICITADO RESTABLECER TU PASSWORD en BienesRaices.com </p>
                <p> Sigue el siguiente enlace para generar un password nuevo:
                    <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/olvide-password/${token}"> Restablecer password</a> 
                </p>
                <p>si tu no solicitaste el cambio de password puedes ignorar el mensaje</p>       
        `

    })
}


export {
    emailRegistro,
    emailOlvidePassword
}