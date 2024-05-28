import multer from 'multer'
import path from 'path'
import { generarId } from '../helpers/tokens.js'
 
//* Configuración de multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    // Se llama cuando se subió correctamente la imagen
        //Primer argumento un error,
        //segundo argumento es la ruta a guardar
        cb(null, 'public/subidas')// Carpeta donde se guardan los archivos
  },
  //Nombre del archivo
  filename: function (req, file, cb) {
    if (file) {
      cb(null, generarId() + path.extname(file.originalname))//Se generaId para evitar duplicidad en el nombre de la imagen, extname - extrae la extensión del archivo para concatenarlo al nombre de la imagen
    }
  }
})
 
//* Pasando la configuración
const upload = multer({ storage: storage })
// const upload = multer({ dest: 'public/a' })
 
export default upload