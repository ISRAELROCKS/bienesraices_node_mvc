import {unlink} from 'node:fs/promises'
import { validationResult } from "express-validator"
import {Precio, 
        Categoria, 
        Propiedad,
        Mensaje,    
} from '../models/index.js'
import {esVendedor, formatearFecha} from '../helpers/index.js'
import Usuario from '../models/Usiario.js'

const admin = async (req, res) => {

    //leer query string
    const {pagina: paginaActual} = req.query

    const expresion = /^[1-9]$/

    if(!expresion.test(paginaActual)){
        return res.redirect('/mis-propiedades?pagina=1')
    }

    try {
        const  {id } = req.usuario

        //limites y offset para el paginador
        const limit = 5 
        const offset = ((paginaActual * limit)-limit)
    
        const [propiedades, total] = await Promise.all([
            await Propiedad.findAll({
                limit,
                offset,
                where:{
                    usuarioId: id
                },
                include: [
                    {model: Categoria, as: 'categoria'},
                    {model: Precio, as: 'Precio'},
                    {model: Mensaje, as: 'mensajes'}
                ]
        
            }),
            Propiedad.count({
                where:{
                    usuarioId: id
                }
            })
        ])
        
        res.render('propiedades/admin',{
            pagina:'Mis propiedades',
            propiedades,
            csrfToken : req.csrfToken(),
            paginas: Math.ceil(total/limit),
            paginaActual: Number(paginaActual),
            total,
            offset,
            limit
          
        })
    
    } catch (error) {
        console.log(error)
    }

  
}

//formulario para crear una nueva propiedad
const crear = async (req, res) => {
    //consultar modelo de precio y categorias
const [categorias, precios ] = await Promise.all([
    Categoria.findAll(),
    Precio.findAll()
])
    res.render('propiedades/crear',{
        pagina:'Crear propiedad',
      
        csrfToken : req.csrfToken(),
        categorias,
        precios,
        datos:{}
    })
}

const guardar = async (req, res) => {

    //VALIDACION
    let resultado = validationResult(req)

    if (!resultado.isEmpty()){
         //consultar modelo de precio y categorias
        const [categorias, precios ] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])
        return res.render('propiedades/crear',{
            pagina:'Crear propiedad',
            csrfToken : req.csrfToken(),
            errores: resultado.array(),
            categorias,
            precios,
            datos: req.body
            
        })
    }
    //CREAR UN REGISTRO
    
    const {titulo, descripcion, habitaciones, estacionamiento, wc, calle , lat , lng, precio, categoria} = req.body

    const {id: usuarioId} = req.usuario
    try {
        const propiedadGuardada = await Propiedad.create({
            titulo: titulo,
            descripcion: descripcion,
            habitaciones: habitaciones,
            estacionamiento: estacionamiento,
            wc: wc,
            calle: calle,
            lat: lat,
            lng: lng,
            precioId: precio,
            categoriaId: categoria,
            usuarioId,
            imagen:'',
        })

        const {id} = propiedadGuardada
        res.redirect(`/propiedades/agregar-imagen/${id}`)
        
    } catch (error) {
        console.log(error)
    }
}

const agregarImagen = async (req,res) => {

    const {id} = req.params 
    //validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)
        if(!propiedad) {
            return res.redirect('/mis-propiedades')
        }
    //validar que la propiedad no este publicada
        if(propiedad.publicado)
            return res.redirect('/mis-propiedades')
    // validar que la propiedad pertenece a quien visita esta pagina
        if(req.usuario.id.toString() !== propiedad.usuarioId.toString()){
            return res.redirect('/mis-propiedades')
        }

        res.render('propiedades/agregar-imagen',{
        pagina: `Agregar Imagen: ${propiedad.titulo}`,
        csrfToken : req.csrfToken(),
        propiedad
    })
}

const almacenarImagen = async (req,res, next) => {
    const {id} = req.params 
    //validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)
        if(!propiedad) {
            return res.redirect('/mis-propiedades')
        }
    //validar que la propiedad no este publicada
        if(propiedad.publicado)
            return res.redirect('/mis-propiedades')
    // validar que la propiedad pertenece a quien visita esta pagina
        if(req.usuario.id.toString() !== propiedad.usuarioId.toString()){
            return res.redirect('/mis-propiedades')
        }
    try {
       
        //almacenar la imagen y publicar propiedad
        propiedad.imagen = req.file.filename
        propiedad.publicado = 1
        await propiedad.save()
        next()
    } catch (error) {
        console.log(error)
    }
}

const editar = async (req,res) => {
    
    const {id} = req.params;
    //validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)
    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }
    //revisiar que quien visite la url es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    //consultar modelo de precio y categorias
    const [categorias, precios ] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])
        res.render('propiedades/editar',{
            pagina:`Editar propiedad: ${propiedad.titulo}`,
            csrfToken : req.csrfToken(),
            categorias,
            precios,
            datos:propiedad
        })
}
const guardarCambios = async (req,res) =>{
    //verificar la validacion
    //VALIDACION
    let resultado = validationResult(req)

    if (!resultado.isEmpty()){
         //consultar modelo de precio y categorias
        const [categorias, precios ] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])
        res.render('propiedades/editar',{
            pagina:'Editar propiedad',
            csrfToken : req.csrfToken(),
            categorias,
            precios,
            errores:resultado.array(),
            datos: req.body
        })
    }
    const {id} = req.params;
    //validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)
    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }
    //revisiar que quien visite la url es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }
    //reescribir el objeto y actualizarlo
    try {
        const {titulo, descripcion, habitaciones, estacionamiento, wc, calle , lat , lng, precio, categoria} = req.body
        propiedad.set({
            titulo: titulo,
            descripcion: descripcion,
            habitaciones: habitaciones,
            estacionamiento: estacionamiento,
            wc: wc,
            calle: calle,
            lat: lat,
            lng: lng,
            precioId: precio,
            categoriaId: categoria,
        })
        await propiedad.save()
        res.redirect('/mis-propiedades')
    } catch (error) {
        console.log(error)
    }
}

const eliminar = async (req,res) => {
    const {id} = req.params;
    //validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)
    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }
    //revisiar que quien visite la url es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    //eliminar imagen
    await unlink(`public/subidas/${propiedad.imagen}`)
    //eliminar la propiedad
    await propiedad.destroy()
    res.redirect('/mis-propiedades')
}
//modifica el estado de la propiedad

const cambiarEstado = async (req,res) => {
    const {id} = req.params;
    //validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)
    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }
    //revisiar que quien visite la url es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }
    //actualizar
    propiedad.publicado = !propiedad.publicado
    await propiedad.save()
    res.json({
        resultado:'ok'
    })
}

//muestra una propiedad
const mostrarPropiedad = async (req,res) => {
    const {id} = req.params;
    
   
    //validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id,{
        include:[
            {model: Precio, as: 'Precio'},
            {model: Categoria, as: 'categoria'},
        ]
    })
    if(!propiedad || !propiedad.publicado){
        return res.redirect('/404')
    }
    
    
    res.render('propiedades/mostrar',{
        propiedad,
        pagina: propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId)
    })
    console.log(req.usuario)
}

const enviarMensaje = async (req,res,next) => {
    const {id} = req.params;
    
  
    //validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id,{
        include:[
            {model: Precio, as: 'Precio'},
            {model: Categoria, as: 'categoria'},
        ]
    })
    if(!propiedad){
        return res.redirect('/404')
    }
    //renderizar los errores
     //VALIDACION
     let resultado = validationResult(req)

     if (!resultado.isEmpty()){
        return res.render('propiedades/mostrar',{
            propiedad,
            pagina: propiedad.titulo,
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
            errores: resultado.array()
        })
     }

    const {mensaje} = req.body
    const {id: propiedadId} = req.params
    const {id: usuarioId} = req.usuario

    //almacenar el mensaje

    await Mensaje.create({
        mensaje,
        propiedadId,
        usuarioId
    })

    
    // return res.render('propiedades/mostrar',{
    //     propiedad,
    //     pagina: propiedad.titulo,
    //     csrfToken: req.csrfToken(),
    //     usuario: req.usuario,
    //     esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId),
        
    //     enviado: true
    // })
    res.redirect('/')   
}

//LEER MENSAJES

const verMensajes = async (req,res) => {

    const {id} = req.params;
    //validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id,{
        include: [
            {model: Mensaje, as: 'mensajes',
                include:[
                    {model: Usuario.scope('eliminarPassword'), as: 'usuario'} //scope se utiliza para borrar datos que no necesitamos
                ]
            }
        ],
    })
    if(!propiedad){
        return res.redirect('/mis-propiedades')
    }
    //revisiar que quien visite la url es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()){
        return res.redirect('/mis-propiedades')
    }
    res.render('propiedades/mensajes', {
        pagina:'Mensajes',
        mensajes: propiedad.mensajes,
        formatearFecha
    })
}

export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar,
    cambiarEstado,
    mostrarPropiedad,
    enviarMensaje,
    verMensajes
}