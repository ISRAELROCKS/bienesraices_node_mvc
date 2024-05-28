(function () {
    const lat = 19.3714344;
    const lng = -99.1809418;
    const mapa = L.map('mapa-inicio').setView([lat, lng ], 13);

    let markers =  new L.FeatureGroup().addTo(mapa)

    let propiedades = []
    
    //filtros
    const filtros = {
        categoria: '',
        precio: ''
    }

    const categoriasSelect = document.querySelector('#categorias');
    const preciosSelect = document.querySelector('#precios');

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    //filtrado de ctegorias y precios 
    categoriasSelect.addEventListener('change', e => {
        filtros.categoria = +e.target.value
        filtrarPropiedades()
    })
    preciosSelect.addEventListener('change', e => {
        filtros.precio = +e.target.value
        filtrarPropiedades()
    })


    const obtenerPropiedades = async () =>{
        try {
            const url = '/api/propiedades'
            const respuesta = await fetch(url)//sirve para ver si la conexion es correcta
            propiedades = await respuesta.json() //si todo esta bien trae la respuesta

            mostrarPropiedades(propiedades)

        } catch (error) {
            console.log(error)
        }
    }
    const mostrarPropiedades = propiedades => {

        //limpiar los markers previos 
        markers.clearLayers()
        
        propiedades.forEach(propiedad => {
            //agregar los pines 
            const marker = L.marker ([propiedad?.lat, propiedad?.lng],{
                autoPan: true ,
            })
            .addTo(mapa)
            .bindPopup(`
                <p class="text-indigo-600 font-bold"> ${propiedad.categoria.nombre} </p>
                <h1 class="text-xl font-extrabold  uppercase my-2 ">${propiedad?.titulo}</h1>
                <img src="/subidas/${propiedad.imagen}" alt="Imagen de la propiedad ${propiedad.titulo}">
                <p class="text-gray-600 font-bold"> ${propiedad.Precio.nombre} </p>
                <a href="/propiedad/${propiedad.id}" class="bg-indigo-600 block p-2 text-center font-bold uppercase"> Ver Propiedad </a>
            `)

            markers.addLayer(marker)
        });
    }

    const filtrarPropiedades = () => {
        const resultado = propiedades.filter(filtrarCategorias).filter(filtrarPrecios)
        mostrarPropiedades(resultado)
    }

    const filtrarCategorias = propiedad => filtros.categoria ? propiedad.categoriaId === filtros.categoria : propiedad
    const filtrarPrecios = propiedad => filtros.precio ? propiedad.precioId === filtros.precio : propiedad

    

    obtenerPropiedades()
})()