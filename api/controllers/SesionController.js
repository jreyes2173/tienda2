/**
 * SesionController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  registro: async (peticion, respuesta) => {
    respuesta.view('pages/registro')
  },
  
  
  procesarRegistro: async (peticion, respuesta) => {
    let hora=peticion.body.hora;

    console.log(hora)
    let cliente = await Cliente.findOne({ email: peticion.body.email });  
    
   if (cliente) {
      peticion.addFlash('mensaje', 'Email duplicado')
      return respuesta.redirect("/registro");
    }
    else {
      let cliente = await Cliente.create({
        email: peticion.body.email,
        nombre: peticion.body.nombre,
        contrasena: peticion.body.contrasena
      })
      peticion.session.cliente = cliente;
      peticion.addFlash('mensaje', 'Cliente registrado')
      return respuesta.redirect("/");
    }
  },

  procesarFicha: async (peticion, respuesta) => {
   // let hora=peticion.body.hora;    

    //console.log(hora)
      
    let ficha = await Ficha.findOne({ capataz: peticion.body.capataz });    
    
   if (ficha) {
      peticion.addFlash('mensaje', 'Email duplicado')
      return respuesta.redirect("/fichas");
    }
    else {
      let ficha = await Ficha.create({
        hora: peticion.body.hora,
        fecha: peticion.body.fecha,
        region: peticion.body.region,
        supervisor: peticion.body.supervisor,
        programa: peticion.body.programa,
        capataz: peticion.body.capataz,
        ubicacion: peticion.body.ubicacion,
        cant_jornalero: peticion.body.cant_jornalero,
        cliente_id: peticion.body.cliente_id
      })
      //peticion.session.cliente = cliente;
      peticion.addFlash('mensaje', 'Cliente registrado')
      return respuesta.redirect("/");
    }
  },

  inicioSesion: async (peticion, respuesta) => {
    respuesta.view('pages/inicio_sesion')
  },


  inicioSesion: async (peticion, respuesta) => {
    respuesta.view('pages/inicio_sesion')
  },

  procesarInicioSesion: async (peticion, respuesta) => {    
    let cliente = await Cliente.findOne({ email: peticion.body.email, contrasena: peticion.body.contrasena });  
      
    if (cliente) {
      if (cliente.activa==false ){
        peticion.addFlash('mensaje', 'Usuario Desactivado')
        return respuesta.redirect("/inicio-sesion");
      }
      peticion.session.cliente = cliente
      let carroCompra = await CarroCompra.find({cliente: cliente.id})
      peticion.session.carroCompra = carroCompra
      peticion.addFlash('mensaje', 'Sesión iniciada')
      return respuesta.redirect("/")
    } 
    else {
      peticion.addFlash('mensaje', 'Email o contraseña invalidos')
      return respuesta.redirect("/inicio-sesion");
    } 
    
  },

  cerrarSesion: async (peticion, respuesta) => {
    peticion.session.cliente = undefined;
    peticion.addFlash('mensaje', 'Sesión finalizada')
    return respuesta.redirect("/");
  },

};

