import {check,validationResult} from 'express-validator';
import bcrypt from 'bcrypt'

import Usuario from "../models/Usiario.js";
import{generarJWT, generarId} from '../helpers/tokens.js'
import {emailRegistro, emailOlvidePassword} from '../helpers/email.js'


const formularioLogin =  (req, res)  => {
    
    res.render('auth/login', {
       pagina:'Iniciar session',
       csrfToken:req.csrfToken()
    })
}

const autenticar = async (req,res) => {
   //validacion
    await check('email').isEmail().withMessage('El Email es obligatorio').run(req);
    await check('password').notEmpty().withMessage('El password es obligatorio').run(req);

    let resultado = validationResult(req);

    //verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //errores
        return res.render('auth/login', {
            pagina: 'Iniciar sesion',
            errores: resultado.array(),
            csrfToken:req.csrfToken(),
        })
    }

    const {email,password} = req.body;
    //comprobar si el usuario existe
    const usuario = await Usuario.findOne({where:{email}})
    if(!usuario){
        return res.render('auth/login', {
            pagina: 'Iniciar sesion',
            csrfToken:req.csrfToken(),
            errores: [{msg:'El usuario no existe'}]
        })
    }
    //comprobar si el usuario esta confirmado
    if(!usuario.confirmado){
        return res.render('auth/login', {
            pagina: 'Iniciar sesion',
            csrfToken:req.csrfToken(),
            errores: [{msg:'El usuario no esta confirmado'}]
        })
    }
    //revisar el password//la funcion viene del modelo para compara el password y la instacia del password de la bd7
    if(!usuario.verificarPassword(password)){
        return res.render('auth/login', {
            pagina: 'Iniciar sesion',
            csrfToken:req.csrfToken(),
            errores: [{msg:'El password es incorrecto'}]
        })
    }

    //autenticar al usuario
   const token = generarJWT({id:usuario.id,nombre:usuario.nombre})
   console.log(token)

   //almacenar en un cookie
   return res.cookie('_token', token , {
        httpOnly: true,
        // secure: true,
        //sameSite: true
   }).redirect('/mis-propiedades')
    
}

// cerrar sesion 
const cerrarSesion = async (req,res) => {
   return res.clearCookie('_token').status(200).redirect('/auth/login')
}

const formularioRegistro =  (req, res)  => {
    
    
    res.render('auth/registro', {
        pagina: 'Crear cuenta',
        csrfToken:req.csrfToken()
    })
}
const registrar = async  (req, res)  => {

    //validacion
    await check('nombre').notEmpty().withMessage('El nombre es obligatorio').run(req);
    await check('email').isEmail().withMessage('Coloca un Email valido').run(req);
    await check('password').isLength({min: 6}).withMessage('El password debe contener al menos 6 caracteres').run(req);
    await check('repetir_password').equals(req.body.password).withMessage('El password no coincide').run(req);
    
    let resultado = validationResult(req);

    //verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //errores
        return res.render('auth/registro', {
            pagina: 'Crear cuenta',
            errores: resultado.array(),
            csrfToken:req.csrfToken(),
            usuario:{
                nombre: req.body.nombre,
                email: req.body.email
               
                
            }
        })
    }
    //extraerdatos
    const {nombre,email,password} = req.body;

    //verificar que el usuario no exista
    const existeUsuario = await Usuario.findOne({where:{email}});
    if(existeUsuario){
        return res.render('auth/registro', {
            pagina: 'Crear cuenta',
            csrfToken:req.csrfToken(),
            errores: [{msg:'el usuario ya esta registrado'}],
            usuario:{
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
    }
    //almacenar usuario
   const usuario =  await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })
    //envia email de confirmacion
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    //mostrar mensaje de confirmacion
    res.render('templates/mensaje',{
        pagina:'Cuenta creada correctamente',
        mensaje:'Hemos enviado un email de confirmacion presiona en el enlace'
    })

}

//funcion que confirma un usuario
const confirmar = async (req,res) => {
   const {token} = req.params;
   
    //verificar si el token es valido
    const usuario = await Usuario.findOne({where:{token}})
    
    if(!usuario){
        return res.render('auth/confirmar-cuanta',{
            pagina:'Error al confirmar cuenta',
            mensaje:'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error: true
        })
    }
    //confirmar la cuenta
    usuario.token = null
    usuario.confirmado = true
    await usuario.save()
    res.render('auth/confirmar-cuanta',{
        pagina:'Cuenta confirmada',
        mensaje:'Tu cuenta ha sido confirmada correctamente'
       
    })
   
}

const formularioOlvidePassword =  (req, res)  => {
    
    res.render('auth/olvide-password', {
        pagina: 'Recupera tu acceso a Bienes Raices',
        csrfToken : req.csrfToken()
    })
}

const resetPassword = async (req,res) => {
     //validacion
     await check('email').isEmail().withMessage('Coloca un Email valido').run(req);
    
     let resultado = validationResult(req);
 
     //verificar que el resultado este vacio
     if(!resultado.isEmpty()){
         //errores
         return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken : req.csrfToken(),
            errores:resultado.array()
             
         })
     }
     //buscar el usuario
     const {email} = req.body;

     const usuario = await Usuario.findOne({where: {email}})
     if(!usuario){
        return res.render('auth/olvide-password', {
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken : req.csrfToken(),
            errores:[{msg:'el email no pertenece a ningun usuario'}]
             
        })
     }
     //generar un token y enviar un email
     usuario.token = generarId()
     await usuario.save()
     //enviar email
     emailOlvidePassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
     })
    //mostrar mensaje de confirmacion
    res.render('templates/mensaje',{
        pagina:'Restablece tu passwsord',
        mensaje:'Hemos enviado un email con las instruciones'
    })
}

const comprobarToken = async (req,res) => {
    const {token} = req.params;//paramas para buscar informacion en el url

    const usuario = await Usuario.findOne({where:{token}}) //traer el usuario 

    if(!usuario){
        return res.render('auth/confirmar-cuanta',{
            pagina:'Restablece tu password',
            mensaje:'Hubo un error al confirmar tu informacion, intenta de nuevo',
            error: true
        })
    }
    //mostrar formulario para editar password
    res.render('auth/reset-password', {
        pagina: 'Restablece tu password',
        csrfToken: req.csrfToken()
    })
}
const nuevoPassword = async (req,res) => {
    //validar el nuevo password
    await check('password').isLength({min: 6}).withMessage('El password debe contener al menos 6 caracteres').run(req);

    let resultado = validationResult(req);
    //verificar que el resultado este vacio
    if(!resultado.isEmpty()){
        //errores
        return res.render('auth/reset-password', {
            pagina: 'Restablece tu password',
            errores: resultado.array(),
            csrfToken:req.csrfToken()
        })
    }
    //extraer token y password

    const {token} = req.params;
    const{password} = req.body;
    //identificar quien hace el cambio

    const usuario = await Usuario.findOne({where:{token}})
    console.log(usuario)
    //hashear el nuevo password

    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt)
    usuario.token = null

    await usuario.save()

    res.render('auth/confirmar-cuanta',{
        pagina:'password restablecido',
        mensaje: 'el password se guardo correctamente'
    })
}



export {
    formularioLogin,
    autenticar,
    cerrarSesion,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword,
    
    
} 