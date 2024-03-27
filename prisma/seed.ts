import { PrismaClient } from '@prisma/client'
import { accesoList, controlList, detallePerfilList, entidadList, menusList, perfilList, personaList, subMenusList, tabCanalList, tabEstadoList, tipoContactoList, tipoEntidadList, tipoSolicitudList, zonaList } from './array'
const prisma = new PrismaClient()

async function main() {

    const empresa = await prisma.empresa.createMany({
        data: [
            {
                c_codigo: "OX",
                t_descripcion: "OXIGEN MEDICAL NETWORK EIRL",
                t_observacion: "Nueva Empresa",
                f_activo: true,
            }, {
                c_codigo: "RS",
                t_descripcion: "ROMSOFT SOLUTIONS",
                t_observacion: "Nueva Empresa",
                f_activo: false,
            }, {
                c_codigo: "PC",
                t_descripcion: "ENTERPRISE PABLO CAYLLAHUA",
                t_observacion: "Nueva Empresa",
                f_activo: false,
            }, {
                c_codigo: "DC",
                t_descripcion: "GENESIS RESCUE SRL",
                t_observacion: "Nueva Empresa",
                f_activo: true,
            }, {
                c_codigo: "NM",
                t_descripcion: "MOUNTAIN HEALTH EIRL",
                t_observacion: "",
                f_activo: true,
            }
        ]
    })

    const sucursal = await prisma.tabSucursal.createMany({
        data: [
            {
                IdEmpresa: 1,
                Descripcion: "HUANCARO",
                Activo: true,
            }, {
                IdEmpresa: 1,
                Descripcion: "DIAGNOS",
                Activo: true,
            }, {
                IdEmpresa: 4,
                Descripcion: "YANAHUARA",
                Activo: true,
            }, {
                IdEmpresa: 1,
                Descripcion: "AEROPUERTO",
                Activo: false,
            }, {
                IdEmpresa: 5,
                Descripcion: "MACHUPICCHU",
                Activo: true,
            }, {
                IdEmpresa: 1,
                Descripcion: "PROGRESO",
                Activo: false,
            }, {
                IdEmpresa: 5,
                Descripcion: "NEW MEDICAL",
                Activo: false,
            }, {
                IdEmpresa: 5,
                Descripcion: "SALKANTAY",
                Activo: true,
            }
        ]
    })

    const menu = await prisma.sys_menu.createMany({
        data: menusList,
    })

    const submenu = await prisma.sys_submenu.createMany({
        data: subMenusList,
    })

    const perfil = await prisma.sys_perfil.createMany({
        data: perfilList
    })

    const detallePerfil = await prisma.sys_dperfil.createMany({
        data: detallePerfilList
    })

    const persona = await prisma.persona.createMany({
        data: personaList
    })

    const acceso = await prisma.sys_acceso.createMany({
        data: accesoList
    })

    const control = await prisma.sys_control.createMany({
        data: controlList
    })

    const tipoContacto = await prisma.tipo_contacto.createMany({
        data: tipoContactoList
    })

    const zona = await prisma.tabZona.createMany({
        data: zonaList
    })

    const tipoEntidad = await prisma.tabTipoEntidad.createMany({
        data: tipoEntidadList
    })

    const entidad = await prisma.tabEntidad.createMany({
        data: entidadList
    })
    
    const tipoSolicitud = await prisma.tabTipoSolicitud.createMany({
        data: tipoSolicitudList
    })
    const tabCanal = await prisma.tabCanal.createMany({
        data: tabCanalList
    })

    const estado = await prisma.tabEstado.createMany({
        data: tabEstadoList
    })

}
main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })