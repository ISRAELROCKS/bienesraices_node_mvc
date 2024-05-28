//const express = require('express');//version common java scrip impotacion de antes
import  express  from 'express';//dependecias no requieren la extension js
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import usuarioRoutes from './routes/usuarioRoutes.js';  //archivos creados requieren la extencion js 
import propiedadesRoutes from './routes/propiedadesRoutes.js';  //archivos creados requieren la extencion js de los controladores
import appRoutes from './routes/appRoutes.js'
import apiRoutes from './routes/apiRoutes.js'
import db from './config/db.js';


//crear la app
const app = express()

//habilitar lectura de datos de formularios
app.use(express.urlencoded({extended: true}));

//habilitar cookie parser
app.use(cookieParser());

//habilitar csrf
app.use(csrf({cookie:true}));//al configurarlo asi estara de forma global en la aplicacion

//conexion a la bd
try {
    await db.authenticate();
    db.sync()//lo que hace sync es insertar la tabla o crearla
    console.log('coneccion exitosa a la bd');
} catch (error) {
    console.log(error)
}

//habilitar pug
app.set('view engine', 'pug')
app.set('views', './views')

//carpeta publica
app.use(express.static('public'))

//routing 
app.use('/', appRoutes);
app.use('/auth', usuarioRoutes);
app.use('/', propiedadesRoutes);
app.use('/api', apiRoutes);



//definir un puerto y arrancar el proyecto
const port = process.env.PORT || 3000; 

app.listen(port, () => {
    console.log(`El servidor esta corriendo en el puerto ${port}`)
})