const path = require('path')
const fs = require('fs');
const { count } = require('console');

/**
 * SesionController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  inicioSesion: async (peticion, respuesta) => {
    respuesta.view('pages/admin/inicio_sesion')
  },

  procesarInicioSesion: async (peticion, respuesta) => {
    let admin = await Admin.findOne({ email: peticion.body.email, contrasena: peticion.body.contrasena })

    if (admin) {
      if (admin.activa == false) {
        peticion.addFlash('mensaje', 'Usuario Desactivado')
        return respuesta.redirect("/admin/inicio-sesion");
      }
      peticion.session.admin = admin
      peticion.session.cliente = undefined
      peticion.addFlash('mensaje', 'Sesión de admin iniciada')
      return respuesta.redirect("/admin/principal")
    }
    else {
      peticion.addFlash('mensaje', 'Email o contraseña invalidos')
      return respuesta.redirect("/admin/inicio-sesion");
    }
  },

  principal: async (peticion, respuesta) => {
    if (!peticion.session || !peticion.session.admin) {
      peticion.addFlash('mensaje', 'Sesión inválida')
      return respuesta.redirect("/admin/inicio-sesion")
    }
    let fotos = await Foto.find().sort("id")
    respuesta.view('pages/admin/principal', { fotos })
  },

  cliente: async (peticion, respuesta) => {
    if (!peticion.session || !peticion.session.admin) {
      peticion.addFlash('mensaje', 'Sesión inválida')
      return respuesta.redirect("/admin/inicio-sesion")
    }
    let cliente = await Cliente.find().sort("id")
    respuesta.view('pages/admin/cliente', { cliente })
  },

  administradores: async (peticion, respuesta) => {
    if (!peticion.session || !peticion.session.admin) {
      peticion.addFlash('mensaje', 'Sesión inválida')
      return respuesta.redirect("/admin/inicio-sesion")
    }
    let admin = await Admin.find().sort("id")
    console.log(`${admin.nombre}`)
    respuesta.view('pages/admin/administradores', { admin })
  },

  cerrarSesion: async (peticion, respuesta) => {
    peticion.session.admin = undefined
    peticion.addFlash('mensaje', 'Sesión finalizada')
    return respuesta.redirect("/");
  },

  agregarFoto: async (peticion, respuesta) => {
    respuesta.view('pages/admin/agregar_foto')
  },

  procesarAgregarFoto: async (peticion, respuesta) => {
    let foto = await Foto.create({
      titulo: peticion.body.titulo,
      activa: true
    }).fetch()
    peticion.file('foto').upload({}, async (error, archivos) => {
      if (archivos && archivos[0]) {
        let upload_path = archivos[0].fd
        let ext = path.extname(upload_path)

        await fs.createReadStream(upload_path).pipe(fs.createWriteStream(path.resolve(sails.config.appPath, `assets/images/fotos/${foto.id}${ext}`)))
        await Foto.update({ id: foto.id }, { contenido: `${foto.id}${ext}` })
        peticion.addFlash('mensaje', 'Foto agregada')
        return respuesta.redirect("/admin/principal")
      }
      peticion.addFlash('mensaje', 'No hay foto seleccionada')
      return respuesta.redirect("/admin/agregar-foto")
    })
  },

  desactivarFoto: async (peticion, respuesta) => {
    await Foto.update({ id: peticion.params.fotoId }, { activa: false })
    peticion.addFlash('mensaje', 'Foto desactivada')
    return respuesta.redirect("/admin/principal")
  },

  activarFoto: async (peticion, respuesta) => {
    await Foto.update({ id: peticion.params.fotoId }, { activa: true })
    peticion.addFlash('mensaje', 'Foto activada')
    return respuesta.redirect("/admin/principal")
  },

  desactivarCliente: async (peticion, respuesta) => {
    await Cliente.update({ id: peticion.params.clienteId }, { activa: false })
    peticion.addFlash('mensaje', 'Cliente desactivada')
    return respuesta.redirect("/admin/cliente")
  },

  activarCliente: async (peticion, respuesta) => {
    await Cliente.update({ id: peticion.params.clienteId }, { activa: true })
    peticion.addFlash('mensaje', 'Cliente activada')
    return respuesta.redirect("/admin/cliente")
  },

  desactivarAdmin: async (peticion, respuesta) => {
    let admin1 = peticion.session.admin.id;
    let admin2 = peticion.params.adminId;
    if (admin1 == admin2) {
      peticion.addFlash('mensaje', 'No puede, usuario en uso')
      return respuesta.redirect("/admin/administradores")
    }
    await Admin.update({ id: peticion.params.adminId }, { activa: false })
    peticion.addFlash('mensaje', 'Administrador desactivada')
    return respuesta.redirect("/admin/administradores")
  },

  activarAdmin: async (peticion, respuesta) => {
    await Admin.update({ id: peticion.params.adminId }, { activa: true })
    peticion.addFlash('mensaje', 'Adiministrador activada')
    return respuesta.redirect("/admin/administradores")
  },

  misOrdenescliente: async (peticion, respuesta) => {
    if (!peticion.session || !peticion.session.admin) {
      peticion.addFlash('mensaje', 'Sesión inválida')
      return respuesta.redirect("/admin/inicio-sesion")
    }

    let ordenes = await Orden.find({ cliente: peticion.params.clienteId }).sort('id desc')
    let cliente2 = peticion.params.clienteId;
    respuesta.view('pages/mis_ordenes2', { ordenes, cliente2 })
  },

  ordenDeCompra2: async (peticion, respuesta) => {
    if (!peticion.session || !peticion.session.admin) {
      peticion.addFlash('mensaje', 'Sesión inválida')
      return respuesta.redirect("/admin/inicio-sesion")
    }


    let orden = await Orden.findOne({ cliente: peticion.params.cliente2, id: peticion.params.ordenId }).populate('detalles')

    if (!orden) {
      return respuesta.redirect("pages/mis-ordenes")
    }

    if (orden && orden.detalles == 0) {
      return respuesta.view('pages/orden', { orden })
    }

    orden.detalles = await OrdenDetalle.find({ orden: orden.id }).populate('foto')
    return respuesta.view('pages/orden', { orden })
  },

  Dashboard: async (peticion, respuesta) => {
    if (!peticion.session || !peticion.session.admin) {
      peticion.addFlash('mensaje', 'Sesión inválida')
      return respuesta.redirect("/admin/inicio-sesion")
    }

    let cliente = await Cliente.find(count())
    let foto = await Foto.find(count())
    let admin = await Admin.find(count())
    let orden = await Orden.find(count())

    let tcliente = cliente.length
    let tfoto = foto.length
    let tadmin = admin.length
    let torden = orden.length

    respuesta.view('pages/Dashboard', { tcliente, tfoto, tadmin, torden })
  },

};

