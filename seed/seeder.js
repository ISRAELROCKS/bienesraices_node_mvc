import {exit} from 'node:process'//terminar consultas o proceso a la base de datos
import categorias from "./categorias.js";
import precios from "./precios.js";
import usuarios from "./usuarios.js";
import db from "../config/db.js";
import {Categoria,Precio,Usiario} from '../models/index.js';

const importarDatos = async () => {
    try {
        //autenticar
        await db.authenticate()
        //generar las columnas
        await db.sync() //genera las columnas en la db 
        //insertar datos
        await Promise.all([
            Categoria.bulkCreate(categorias), //inserta los datos a la bd
            Precio.bulkCreate(precios), //inserta los datos a la bd
            Usiario.bulkCreate(usuarios) //inserta los datos a la bd
        ]);
        console.log('datos importados correctamente')
        exit()//finaliza el proceso correctamente
    } catch (error) {
        console.log(error)
        exit(1)//finaliza consultas o proceso a la base de datos el  quiere decir que hubo un error
    }
}

const eliminarDatos = async () => {
    try {
        // await Promise.all([
        //     Categoria.destroy({where: {}, truncate:true}), //inserta los datos a la bd
        //     Precio.destroy({where: {}, truncate:true}), //inserta los datos a la bd
        // ]);
        await db.sync({force:true})
        console.log('datos eliminados correctamente')
        exit()
    } catch (error) {
        console.log(error)
        exit(1)//finaliza consultas o proceso a la base de datos el  quiere decir que hubo un error
    }
}
if(process.argv[2] === "-i"){  //(-i) es de importar 
    importarDatos()
}
if(process.argv[2] === "-e"){    // (-e) de eliminar
    eliminarDatos()
}