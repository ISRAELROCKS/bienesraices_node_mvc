import express from 'express';
import {body} from 'express-validator'
import {admin, 
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
        verMensajes,
        } 
from '../controllers/propiedadController.js';
import protegerRuta from '../middleware/protegerRuta.js';
import upload from '../middleware/subirImagen.js';
import identificarUsuario from '../middleware/identificarUsuario.js';


const router = express.Router()

router.get('/mis-propiedades',protegerRuta, admin);
router.get('/propiedades/crear', protegerRuta, crear);
router.post('/propiedades/crear', protegerRuta,
    body('titulo').notEmpty().withMessage('el titulo es obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('la descripcion es obligatoria')
        .isLength({max:200}).withMessage('la descripcion es muy larga'),
    body('categoria').isNumeric().withMessage('selecciona una categoria'),
    body('precio').isNumeric().withMessage('selecciona un rango de precios'),
    body('habitaciones').isNumeric().withMessage('selecciona la cantidad de habitaciones'),
    body('estacionamiento').isNumeric().withMessage('selecciona la cantidad de cajones de estacionamiento'),
    body('wc').isNumeric().withMessage('selecciona un numero de baños'),
    body('lat').notEmpty().withMessage('ubica la propiedad en el mapa'),
    guardar
);

router.get('/propiedades/agregar-imagen/:id', 
    protegerRuta, //middleware de proteger ruta
    agregarImagen
)

router.post('/propiedades/agregar-imagen/:id', 
    protegerRuta,
    upload.single('imagen'),
    almacenarImagen
)

router.get('/propiedades/editar/:id',
    protegerRuta,
    editar

)
router.post('/propiedades/editar/:id', protegerRuta,
    body('titulo').notEmpty().withMessage('el titulo es obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('la descripcion es obligatoria')
        .isLength({max:200}).withMessage('la descripcion es muy larga'),
    body('categoria').isNumeric().withMessage('selecciona una categoria'),
    body('precio').isNumeric().withMessage('selecciona un rango de precios'),
    body('habitaciones').isNumeric().withMessage('selecciona la cantidad de habitaciones'),
    body('estacionamiento').isNumeric().withMessage('selecciona la cantidad de cajones de estacionamiento'),
    body('wc').isNumeric().withMessage('selecciona un numero de baños'),
    body('lat').notEmpty().withMessage('ubica la propiedad en el mapa'),
    guardarCambios
);
//ruta eliminar propiedades
router.post('/propiedades/eliminar/:id',
    protegerRuta,
    eliminar
)
// ruta cambiar estado
router.put('/propiedades/:id',
    protegerRuta,
    cambiarEstado
)

//area publicar
router.get('/propiedad/:id',

    identificarUsuario,
    mostrarPropiedad
)

//almacenar los mensajes

router.post('/propiedad/:id',

    identificarUsuario,
    body('mensaje' ).isLength({min: 10}).withMessage('El menasaje no puede ir vacio o es muy corto'),
    enviarMensaje
)

router.get('/mensajes/:id',
    protegerRuta,
    verMensajes

)


export default router;