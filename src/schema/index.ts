
//system
import { sysAccesoResolv, sysAccesoTipeDef } from "./system/sys_acceso";
import { sysControlResolv, sysControlTipeDef } from "./system/sys_control";
import { sysDperfilResolv, sysDperfilTipeDef } from "./system/sys_dperfil";
import { sysMenuResolv, sysMenuTipeDef } from "./system/sys_menu";
import { sysPerfilResolv, sysPerfilTipeDef } from "./system/sys_perfil";
import { sysSubMenuResolv, sysSubMenuTipeDef } from "./system/sys_submenu";
//codigo verde
import { detalleEmpresaResolv, detalleEmpresaTipeDef } from "./codigo_verde/detalle_entidad";
import { empresaResolv, empresaTipeDef } from "./codigo_verde/empresa";
import { contactoResolv, contactoTipeDef } from "./codigo_verde/contacto";
import { sucursalResolv, sucursalTipeDef } from "./codigo_verde/TabSucursal";
import { tabEntidadResolv, tabEntidadTipeDef } from "./codigo_verde/TabEntidad";
import { tipoContactoResolv, tipoContactoTipeDef } from "./codigo_verde/tipo_contacto";
import { personaResolv, personaTipeDef } from "./codigo_verde/persona";
import { solicitudAtencionResolv, solicitudAtencionTipeDef } from "./codigo_verde/solicitud_atencion";
import { tabCanalResolv, tabCanalTipeDef } from "./codigo_verde/TabCanal";
import { tabTipoSolicitudResolv, tabTipoSolicitudTipeDef } from "./codigo_verde/TabTipoSolicitud";
import { tabEstadoResolv, tabEstadoTipeDef } from "./codigo_verde/TabEstado";
import { tabTipoEntidadResolv, tabTipoEntidadTipeDef } from "./codigo_verde/TabTipoEntidad";
import { tabZonaResolv, tabZonaTipeDef } from "./codigo_verde/TabZona";
import { visitaVentasResolv, visitaVentasTipeDef } from "./codigo_verde/visita_ventas";
import { visitaCompetenciaResolv, visitaCompetenciaTipeDef } from "./codigo_verde/visita_competencia";
import { ADM_ORDEN_SERVICIOResolv, ADM_ORDEN_SERVICIOTipeDef } from "./laboratorio/ADM_ORDEN_SERVICIO";
import { ADM_ORDEN_SERVICIO_DETALLEResolv, ADM_ORDEN_SERVICIO_DETALLETipeDef } from "./laboratorio/ADM_ORDEN_SERVICIO_DETALLE";
import { d_examen_labResolv, d_examen_labTipeDef } from "./laboratorio/d_examen_lab";
import { resultado_labResolv, resultado_labTipeDef } from "./laboratorio/resultado_lab";
import { atencionResolv, atencionTipeDef } from "./atencion/atencion";
import { PACIENTEResolv, PACIENTETipeDef } from "./atencion/paciente";
import { tipo_pacienteResolv, tipo_pacienteTipeDef } from "./atencion/tipo_paciente";
import { tipo_atencionResolv, tipo_atencionTipeDef } from "./atencion/tipo_atencion";
import { CVN_CATEGORIA_PAGO_PRECIOResolv, CVN_CATEGORIA_PAGO_PRECIOTipeDef } from "./precios/CVN_CATEGORIA_PAGO_PRECIO";
import { FAC_ORDEN_SERVICIO_DETALLEResolv, FAC_ORDEN_SERVICIO_DETALLETipeDef } from "./liquidacion/FAC_ORDEN_SERVICIO_DETALLE";
import { FAC_ORDEN_SERVICIOResolv, FAC_ORDEN_SERVICIOTipeDef } from "./liquidacion/FAC_ORDEN_SERVICIO";
//laboratorio

const rootTypeDefs = `#graphql
    type Query {
        _: String
    }
    
    type Mutation {
        _: String
    }
`
const resolvers = [
    tipoContactoResolv,
    personaResolv,
    contactoResolv,
    sysAccesoResolv,
    sysControlResolv,
    sysMenuResolv,
    sucursalResolv,
    sysSubMenuResolv,
    sysPerfilResolv,
    sysDperfilResolv,
    empresaResolv,
    tabEntidadResolv,
    detalleEmpresaResolv,
    tabCanalResolv,
    tabTipoSolicitudResolv,
    tabEstadoResolv,
    solicitudAtencionResolv,
    tabTipoEntidadResolv,
    tabZonaResolv,
    visitaVentasResolv,
    visitaCompetenciaResolv,
    ADM_ORDEN_SERVICIOResolv,
    ADM_ORDEN_SERVICIO_DETALLEResolv,
    d_examen_labResolv,
    resultado_labResolv,
    atencionResolv,
    PACIENTEResolv,
    tipo_pacienteResolv,
    tipo_atencionResolv,
    CVN_CATEGORIA_PAGO_PRECIOResolv,
    FAC_ORDEN_SERVICIO_DETALLEResolv,
    FAC_ORDEN_SERVICIOResolv,
]
const typeDefs = [
    rootTypeDefs,
    tipoContactoTipeDef,
    personaTipeDef,
    contactoTipeDef,
    sysAccesoTipeDef,
    sysControlTipeDef,
    sysMenuTipeDef,
    sucursalTipeDef,
    sysSubMenuTipeDef,
    sysPerfilTipeDef,
    sysDperfilTipeDef,
    empresaTipeDef,
    tabEntidadTipeDef,
    detalleEmpresaTipeDef,
    tabCanalTipeDef,
    tabTipoSolicitudTipeDef,
    tabEstadoTipeDef,
    solicitudAtencionTipeDef,
    tabTipoEntidadTipeDef,
    tabZonaTipeDef,
    visitaVentasTipeDef,
    visitaCompetenciaTipeDef,
    ADM_ORDEN_SERVICIOTipeDef,
    ADM_ORDEN_SERVICIO_DETALLETipeDef,
    d_examen_labTipeDef,
    resultado_labTipeDef,
    atencionTipeDef,
    PACIENTETipeDef,
    tipo_pacienteTipeDef,
    tipo_atencionTipeDef,
    CVN_CATEGORIA_PAGO_PRECIOTipeDef,
    FAC_ORDEN_SERVICIO_DETALLETipeDef,
    FAC_ORDEN_SERVICIOTipeDef,
]

export { typeDefs, resolvers }