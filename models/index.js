import Propiedad from './Propiedad.js';
import Categoria from './Categoria.js';
import Precio from './Precio.js';
import Usiario from './Usiario.js';
import Mensaje from './Mensaje.js';

//relaciones en en los modelos de precio catagoria e usuario
// Precio.hasOne(Propiedad)
Propiedad.belongsTo(Precio,{foreignKey:'precioId'})
Propiedad.belongsTo(Categoria,{foreignKey:'categoriaId'})
Propiedad.belongsTo(Usiario,{foreignKey:'usuarioId'})
Propiedad.hasMany(Mensaje, {foreignKey: 'propiedadId'})

//relaciones en la tabla o modelo de mesnajes

Mensaje.belongsTo(Propiedad ,{foreignKey:'propiedadId'})
Mensaje.belongsTo(Usiario ,{foreignKey:'usuarioId'})

export {
    Propiedad,
    Precio,
    Categoria,
    Usiario,
    Mensaje,
}
