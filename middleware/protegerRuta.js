import jwt from 'jsonwebtoken';
import {Usiario} from '../models/index.js'



const protegerRuta = async (req, res,next) => {

    //VERIFICAR SI HAY UN TOKEN 
    const {_token} = req.cookies
    if(!_token){
        return res.redirect('/auth/login')
    }
    // COMPROBAR EL TOKEN
    try {
        
        const decoded = jwt.verify(_token, process.env.JWT_SECRET)
        const usuario = await Usiario.scope('eliminarPassword').findByPk(decoded.id)
        //almacenar al usuario al req
        if(usuario){
            req.usuario = usuario
        }else{
            return res.redirect('/auth/login')
        }
        return next();
    } catch (error) {
        return res.clearCookie('_token').redirect('/auth/login')
    }
    next();
}

export default protegerRuta;