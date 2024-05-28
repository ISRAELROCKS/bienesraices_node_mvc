import  bcrypt from 'bcrypt';

const usuarios = [
    {
        nombre:'isarel',
        email: 'correo2@correo.com',
        confirmado: 1,
        password: bcrypt.hashSync('password', 10)
    }
]

export default usuarios;