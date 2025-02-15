export const getQuery = (serie: string, nro: string) => `
  select docvntsunat_cod,docvntsunat_femision,docvntsunat_usrcreacion from sch_clinica.tbl_docvntsunat td
  where docvntsunat_serie='${serie}' and docvntsunat_nro='${nro}';
`;


export const getQueryProceHema = (fecha_ini: string, fecha_fin: string) => `
--proced
select
    date(hp.hstconsulta_procmed_fsolicitud) as "FECHA ATENCION",
    p.persona_nrodoc as "DNI PACIENTE",
    p.persona_apep || ' ' || p.persona_apem || ' ' || p.persona_nmb1 || ' ' || p.persona_nmb2 as "PACIENTE",
    sch_clinica.sp_edad_porfecha(
        p.persona_fecnac,
        hp.hstconsulta_procmed_fsolicitud
    ) as "EDAD",
    p.persona_sexo as "SEXO",
    tp.tppaciente_dsc as "TIPO DE PACIENTE",
    case
        when tp.tppaciente_cod = 2 then np.negociacionprecio_dsc
        else tp.tppaciente_dsc
    end as "DESCRIPCION TIPO PACIENTE",
    'PROCEDIMIENTOS MEDICOS' || COALESCE(' ' || TA.tpatencion_idigital, ' AMB') AS "SERVICIO",
    em.espprofatencion_dsc AS "ESPECIALIDAD",
    vm.vw_persona_nombres as "MEDICO",
    case
        when dvsd.docvntsunatdet_preciouniventa < 0 then dvsd.docvntsunatdet_totneto
        else dvsd.docvntsunatdet_cantidad * dvsd.docvntsunatdet_preciouniventa
    end as "VALOR VENTA",
    hp.hstconsulta_procmed_cantidad as "CANT",
    coalesce(oa.ordatencion_cod, 0) AS "OA",
    sd.segus_det_dsc AS "PROCEDIMIENTO",
    '' AS "AREA",
    '' AS "TIPO SERVICIO",
    pro.provincia_dsc AS "PROVINCIA",
    ciu.ciudad_dsc AS "CIUDAD",
    dis.distrito_dsc AS "DISTRITO",
    '' AS "CONDICION ESTABLECIMIENTO",
    '' AS "CONDICION SERVICIO",
    CASE
        WHEN sch_clinica.sp_edad_porfecha(
            p.persona_fecnac,
            hp.hstconsulta_procmed_fsolicitud
        ) >= 0
        AND sch_clinica.sp_edad_porfecha(
            p.persona_fecnac,
            hp.hstconsulta_procmed_fsolicitud
        ) <= 11 THEN 'NIÑO DE 0 -11 AÑOS'
        WHEN sch_clinica.sp_edad_porfecha(
            p.persona_fecnac,
            hp.hstconsulta_procmed_fsolicitud
        ) >= 12
        AND sch_clinica.sp_edad_porfecha(
            p.persona_fecnac,
            hp.hstconsulta_procmed_fsolicitud
        ) <= 17 THEN 'ADOLESCENTES 12-17 AÑOS'
        WHEN sch_clinica.sp_edad_porfecha(
            p.persona_fecnac,
            hp.hstconsulta_procmed_fsolicitud
        ) >= 18
        AND sch_clinica.sp_edad_porfecha(
            p.persona_fecnac,
            hp.hstconsulta_procmed_fsolicitud
        ) <= 29 THEN 'JOVEN 18 -29 AÑOS'
        WHEN sch_clinica.sp_edad_porfecha(
            p.persona_fecnac,
            hp.hstconsulta_procmed_fsolicitud
        ) >= 30
        AND sch_clinica.sp_edad_porfecha(
            p.persona_fecnac,
            hp.hstconsulta_procmed_fsolicitud
        ) <= 59 THEN 'ADULTO 30-59 AÑOS'
        WHEN sch_clinica.sp_edad_porfecha(
            p.persona_fecnac,
            hp.hstconsulta_procmed_fsolicitud
        ) >= 60 THEN 'ADULTO MAYOR 60 +'
        ELSE ''
    END AS "GRUPO ETARIO",
    coalesce(cg.catgenerico_dsc, 'PARTICULAR') AS "TP. FINANCIADOR",
    EMP.empresa_ruc AS "RUC",
    EMP.empresa_rznsocial AS "Empresa",
    DVS.docvntsunat_serie AS "SERIE",
    DVS.docvntsunat_nro AS "NUMERO",
    concat(DVS.docvntsunat_serie, CAST(DVS.docvntsunat_nro AS INTEGER), sd.segus_det_identificador) AS "concatena"
from
    sch_clinica.tbl_hstconsulta_procmed hp
    inner join sch_clinica.tbl_hcprocmed_prvnt hpv on (
        hp.hstconsulta_procmed_cod = hpv.hcprocmed_prvnt_pmcod
    )
    inner join sch_clinica.tbl_docvntsunat dvs on (
        hpv.hcprocmed_prvnt_prvntcod = dvs.docvntsunat_predocvnt_cod
        and dvs.docvntsunat_anulado = 0
        and coalesce(dvs.docvntsunat_tpref, 0) = 0
    )
    inner join sch_clinica.tbl_docvntsunatdet dvsd on dvs.docvntsunat_cod = dvsd.docvntsunatdet_cod
    left join sch_clinica.tbl_predocvnt pv on (dvs.docvntsunat_predocvnt_cod = pv.predocvnt_cod)
    left join sch_clinica.tbl_ordatencion oa on (
        hp.hstconsulta_procmed_oacod_creador = oa.ordatencion_cod
    )
    LEFT JOIN sch_clinica.tbl_tpatencion TA ON (
        oa.ordatencion_tpatencion_cod = TA.tpatencion_cod
    )
    left join sch_clinica.tbl_persona p on (
        coalesce(
            case
                when dvs.docvntsunat_tpcliente != 3 then dvs.docvntsunat_cliente_cod
            end,
            oa.ordatencion_paciente_cod,
            pv.predocvnt_paciente_cod
        ) = p.persona_cod
    )
    LEFT JOIN sch_clinica.tbl_distrito DIS ON (DIS.distrito_cod = p.persona_ubigeo)
    LEFT JOIN sch_clinica.tbl_provincia PRO ON (
        PRO.provincia_cod = DIS.distrito_provincia_cod
        AND PRO.provincia_ciudad_cod = DIS.distrito_ciudad_cod
        and pro.provincia_pais_cod = dis.distrito_pais_cod
    )
    LEFT JOIN sch_clinica.tbl_ciudad CIU ON (CIU.ciudad_cod = pro.provincia_ciudad_cod)
    AND (CIU.ciudad_pais_cod = pro.provincia_pais_cod)
    left join sch_clinica.tbl_tppaciente tp on (
        coalesce(oa.ordatencion_tpaciente_cod, 1) = tp.tppaciente_cod
    )
    left join sch_clinica.tbl_negociacionprecio np on (
        oa.ordatencion_negprc_emp_aseg_ncod = np.negociacionprecio_cod
    )
    LEFT JOIN sch_clinica.tbl_catgenerico CG ON NP.negociacionprecio_tpfinanciador = CG.catgenerico_cod
    left join sch_clinica.tbl_segus_det sd on (
        hp.hstconsulta_procmed_detsegus_cod = sd.segus_det_cod
    )
    left join sch_clinica.vw_persona vm on (
        hp.hstconsulta_procmed_pacod_ejecucion = vm.vw_persona_cod
    )
    left join sch_clinica.tbl_espprofatencion em on hp.hstconsulta_procmed_emcod_ejecucion = em.espprofatencion_cod
    LEFT JOIN sch_clinica.tbl_empresa EMP ON (
        oa.ordatencion_negprc_emp_aseg_ecod = EMP.empresa_cod
    )
where
    date(hp.hstconsulta_procmed_fsolicitud) >= '${fecha_ini}'
    and date(hp.hstconsulta_procmed_fsolicitud) <= '${fecha_fin}'
    and sd.segus_det_dsc not in (
        'ALMUERZO',
        'COMIDA',
        'DESAYUNO',
        'INFORME MEDICO'
    )
union
all
select
    cons."FECHA ATENCION",
    cons."DNI PACIENTE",
    cons."PACIENTE",
    cons."EDAD",
    cons."SEXO",
    cons."TIPO DE PACIENTE",
    cons."DESCRIPCION TIPO PACIENTE",
    cons."SERVICIO",
    cons.area_dsc as "ESPECIALIDAD",
    cons."MEDICO",
    SUM(cons."VALOR VENTA") AS "VALOR VENTA",
    SUM(cons."CANTIDAD") AS "CANTIDAD",
    cons."COD EXAMEN/ORDEN DE ATENCION",
    cons.tarifariodet_dsc as "procedimiento",
    '' AS "AREA",
    '' AS "TIPO SERVICIO",
    cons.provincia_dsc AS "PROVINCIA",
    cons.ciudad_dsc AS "CIUDAD",
    cons.distrito_dsc AS "DISTRITO",
    cons.condicion_establecimiento AS "CONDICION ESTABLECIMIENTO",
    cons.condicion_servicio AS "CONDICION SERVICIO",
    CASE
        WHEN cons."EDAD" >= 0
        AND cons."EDAD" <= 11 THEN 'NIÑO DE 0 -11 AÑOS'
        WHEN cons."EDAD" >= 12
        AND cons."EDAD" <= 17 THEN 'ADOLESCENTES 12-17 AÑOS'
        WHEN cons."EDAD" >= 18
        AND cons."EDAD" <= 29 THEN 'JOVEN 18 -29 AÑOS'
        WHEN cons."EDAD" >= 30
        AND cons."EDAD" <= 59 THEN 'ADULTO 30-59 AÑOS'
        WHEN cons."EDAD" >= 60 THEN 'ADULTO MAYOR 60 +'
        ELSE ''
    END AS "GRUPO ETARIO",
    cons.tp_financiador AS "TP. FINANCIADOR",
    CONS.ruc AS "RUC",
    CONS.empresa AS "Empresa",
    CONS.serie AS "SERIE",
    CONS.numero AS "NUMERO",
    concat(CONS.serie, CAST(CONS.numero AS INTEGER), CONS.segus) AS "concatena"
from
    (
        SELECT
            DISTINCT sch_clinica.sp_mes_letras(date(DVS.docvntsunat_femision)) as "MES",
            date(DVS.docvntsunat_femision) AS "FECHA ATENCION",
            coalesce(per1.persona_nrodoc, per2.persona_nrodoc) AS "DNI PACIENTE",
            coalesce(
                per1.persona_apep || ' ' || per1.persona_apem || ' ' || per1.persona_nmb1 || ' ' || per1.persona_nmb2,
                per2.persona_apep || ' ' || per2.persona_apem || ' ' || per2.persona_nmb1 || ' ' || per2.persona_nmb2
            ) AS "PACIENTE",
            (
                SELECT
                    ANIO
                FROM
                    sch_clinica.sp_util_diferencia_fecha(
                        coalesce(per1.persona_fecnac, per2.persona_fecnac),
                        DATE(DVS.docvntsunat_femision) - 1
                    ) AS consulta(ANIO INTEGER, MES INTEGER, DIA INTEGER)
            ) AS "EDAD",
            COALESCE(per1.persona_sexo, per2.persona_sexo) as "SEXO",
            'PROCEDIMIENTOS MEDICOS' || COALESCE(' ' || TA.tpatencion_idigital, ' AMB') as "SERVICIO",
            COALESCE(TP.tppaciente_dsc, 'EVENTUAL') AS "TIPO DE PACIENTE",
            coalesce(negp.negociacionprecio_dsc, 'PARTICULAR') as "DESCRIPCION TIPO PACIENTE",
            COALESCE(TA.tpatencion_dsc, 'ATENCION EVENTUAL') AS "LINEA DE NEGOCIO",
            med.vw_persona_nombres AS "MEDICO",
            OA.ordatencion_cod AS "COD EXAMEN/ORDEN DE ATENCION",
            COALESCE(
                NEG_PREC.prec_neg * coalesce(DET.cantidad, DVSD.docvntsunatdet_cantidad),
                (
                    coalesce(
                        DET.valor_neto,
                        DVSD.docvntsunatdet_cantidad * DVSD.docvntsunatdet_preciounineto
                    )
                )
            ) as "VALOR VENTA",
            coalesce(DET.cantidad, DVSD.docvntsunatdet_cantidad) AS "CANTIDAD",
            td.tarifariodet_dsc,
            ar.area_dsc,
            coalesce(
                oaas.ordatencionaseg_estado,
                oaaut.ordenatencionautoseg_estado,
                0
            ) as estado,
            coalesce(cg.catgenerico_dsc, 'PARTICULAR') as tp_financiador,
            pro.provincia_dsc AS provincia_dsc,
            ciu.ciudad_dsc AS ciudad_dsc,
            dis.distrito_dsc AS distrito_dsc,
            CASE
                WHEN OAD.ordatenciondet_tpcondpaciente_est = 1 THEN 'NUEVO'
                WHEN OAD.ordatenciondet_tpcondpaciente_est = 2 THEN 'CONTINUADOR'
                WHEN OAD.ordatenciondet_tpcondpaciente_est = 3 THEN 'REINGRESANTE'
                ELSE ''
            END as condicion_establecimiento,
            CASE
                WHEN OAD.ordatenciondet_tpcondpaciente_serv = 1 THEN 'NUEVO'
                WHEN OAD.ordatenciondet_tpcondpaciente_serv = 2 THEN 'CONTINUADOR'
                WHEN OAD.ordatenciondet_tpcondpaciente_serv = 3 THEN 'REINGRESANTE'
                ELSE ''
            END as condicion_servicio,
            EMP.empresa_ruc AS ruc,
            EMP.empresa_rznsocial AS empresa,
            DVS.docvntsunat_serie AS serie,
            DVS.docvntsunat_nro AS numero,
            S.segus_codsegus as segus
        FROM
            sch_clinica.tbl_docvntsunat DVS
            INNER JOIN sch_clinica.tbl_docvntsunatdet DVSD ON (
                DVS.docvntsunat_cod = DVSD.docvntsunatdet_cod
                AND DVSD.docvntsunatdet_tpelemento = 0
            )
            INNER JOIN sch_clinica.tbl_segus S ON (
                DVSD.docvntsunatdet_elemento_cod = S.segus_tarifariodet_cod
                AND DVSD.docvntsunatdet_elemento_item = S.segus_tarifariodet_item
                AND (
                    S.segus_area_cod = 54
                    OR S.segus_area_cod = 55
                    OR S.segus_area_cod = 59
                    or S.segus_area_cod = 60
                    or S.segus_area_cod = 139
                    OR S.segus_area_cod = 62
                )
            )
            LEFT JOIN sch_clinica.tbl_tarifariodet TD ON (
                S.segus_tarifariodet_cod = TD.tarifariodet_cod
                AND S.segus_tarifariodet_item = TD.tarifariodet_item
            )
            LEFT JOIN sch_clinica.tbl_rmsegus_prvnt RSP ON (
                DVS.docvntsunat_predocvnt_cod = RSP.rmsegus_prvnt_prvntcod
            )
            LEFT JOIN sch_clinica.tbl_recetamedsegus RMS ON (RSP.rmsegus_prvnt_rscod = RMS.recetamedsegus_cod)
            LEFT JOIN sch_clinica.tbl_recetamed RM ON (RMS.recetamedsegus_rmcod = RM.recetamed_cod)
            LEFT JOIN sch_clinica.tbl_ordatencion OA ON (
                RM.recetamed_ordatenciondet_cod = OA.ordatencion_cod
            )
            LEFT JOIN sch_clinica.tbl_tpatencion TA ON (
                OA.ordatencion_tpatencion_cod = TA.tpatencion_cod
            )
            LEFT JOIN sch_clinica.tbl_tppaciente TP ON (OA.ordatencion_tpaciente_cod = TP.tppaciente_cod)
            LEFT JOIN sch_clinica.tbl_ordatencion_factura_historial OAFH ON (
                RM.recetamed_ordatenciondet_cod = OAFH.ordatencion_factura_historial_oacod
                AND OAFH.ordatencion_factura_historial_estado = 1
                and OAFH.ordatencion_factura_historial_tipo = 1
            )
            left join sch_clinica.tbl_empresa aseg on (
                oa.ordatencion_negprc_emp_aseg_acod = aseg.empresa_cod
            )
            LEFT JOIN sch_clinica.tbl_docvntsunat DVS2 ON (
                OAFH.ordatencion_factura_historial_docvntsunatcod = DVS2.docvntsunat_cod
                and dvs2.docvntsunat_anulado = 0
            )
            LEFT JOIN sch_clinica.tbl_area ar on s.segus_area_cod = ar.area_cod
            LEFT JOIN (
                SELECT
                    sch_clinica.tbl_recetamed.recetamed_ordatenciondet_cod as oa_cod,
                    sch_clinica.tbl_segus_det.segus_det_dsc AS concepto,
                    CASE
                        WHEN sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_ejecucion_auditoria = 1 THEN CASE
                            WHEN sch_clinica.tbl_segus.segus_tpejecucion = 1 THEN sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_cantidad
                            ELSE SUM(1)
                        END
                    END AS cantidad,
                    CASE
                        WHEN sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_ejecucion_auditoria = 1 THEN (
                            CASE
                                WHEN sch_clinica.tbl_segus.segus_tpejecucion = 1 THEN sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_cantidad
                                ELSE SUM(1)
                            END
                        ) * sch_clinica.tbl_docvntsunatdet.docvntsunatdet_preciouniventa
                    END AS valor_neto,
                    sch_clinica.tbl_segus_det.segus_det_tdcod AS elemento_cod,
                    sch_clinica.tbl_segus_det.segus_det_tditem AS elemento_item,
                    sch_clinica.tbl_docvntsunat.docvntsunat_cod as documento
                FROM
                    sch_clinica.tbl_recetamed
                    INNER JOIN sch_clinica.tbl_recetamedsegus ON (
                        sch_clinica.tbl_recetamed.recetamed_cod = sch_clinica.tbl_recetamedsegus.recetamedsegus_rmcod
                    )
                    INNER JOIN sch_clinica.tbl_segus_det ON (
                        sch_clinica.tbl_recetamedsegus.recetamedsegus_segusdet_cod = sch_clinica.tbl_segus_det.segus_det_cod
                    )
                    INNER JOIN sch_clinica.tbl_segus ON (
                        sch_clinica.tbl_segus_det.segus_det_tdcod = sch_clinica.tbl_segus.segus_tarifariodet_cod
                    )
                    AND (
                        sch_clinica.tbl_segus_det.segus_det_tditem = sch_clinica.tbl_segus.segus_tarifariodet_item
                    )
                    INNER JOIN sch_clinica.tbl_servicio_ejecucion ON (
                        sch_clinica.tbl_recetamedsegus.recetamedsegus_cod = sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_atencion_cod
                    )
                    INNER JOIN sch_clinica.tbl_area ON (
                        sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_area_cod = sch_clinica.tbl_area.area_cod
                    )
                    INNER JOIN sch_clinica.tbl_docvntsunatdet ON (
                        sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_docvntsunatdet_cod = sch_clinica.tbl_docvntsunatdet.docvntsunatdet_cod
                    )
                    AND (
                        sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_docvntsunatdet_item = sch_clinica.tbl_docvntsunatdet.docvntsunatdet_item
                    )
                    INNER JOIN sch_clinica.tbl_docvntsunat ON (
                        sch_clinica.tbl_docvntsunatdet.docvntsunatdet_cod = sch_clinica.tbl_docvntsunat.docvntsunat_cod
                    )
                    INNER JOIN sch_clinica.tbl_ordatencionasegdet ON (
                        sch_clinica.tbl_recetamed.recetamed_ordatenciondet_cod = sch_clinica.tbl_ordatencionasegdet.ordatencionasegdet_ordatencion_cod
                    )
                    AND (
                        sch_clinica.tbl_recetamed.recetamed_ordatenciondet_item = sch_clinica.tbl_ordatencionasegdet.ordatencionasegdet_item
                    )
                    LEFT JOIN sch_clinica.tbl_oaexcepcion ON (
                        sch_clinica.tbl_ordatencionasegdet.ordatencionasegdet_ordatencion_cod = sch_clinica.tbl_oaexcepcion.oaexcepcion_cod
                    )
                    AND (
                        sch_clinica.tbl_ordatencionasegdet.ordatencionasegdet_grupo_cod = sch_clinica.tbl_oaexcepcion.oaexcepcion_area
                    )
                WHERE
                    sch_clinica.tbl_recetamed.recetamed_tprecetamed = 1
                    AND sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_ejecucion_auditoria = 1
                    AND NOT EXISTS (
                        SELECT
                            sch_clinica.tbl_profatencion_prehonorario.profatencion_prehonorario_codserv_ejecucion
                        FROM
                            sch_clinica.tbl_profatencion_prehonorario
                        WHERE
                            sch_clinica.tbl_profatencion_prehonorario.profatencion_prehonorario_codserv_ejecucion = sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_cod
                    )
                GROUP BY
                    sch_clinica.tbl_recetamed.recetamed_ordatenciondet_cod,
                    sch_clinica.tbl_segus_det.segus_det_dsc,
                    sch_clinica.tbl_docvntsunatdet.docvntsunatdet_preciouniventa,
                    sch_clinica.tbl_segus_det.segus_det_tdcod,
                    sch_clinica.tbl_segus_det.segus_det_tditem,
                    sch_clinica.tbl_docvntsunatdet.docvntsunatdet_preciounineto,
                    sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_ejecucion_auditoria,
                    sch_clinica.tbl_segus.segus_tpejecucion,
                    sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_cantidad,
                    documento
            ) as DET ON (
                DET.oa_cod = OA.ordatencion_cod
                AND DET.elemento_cod = TD.tarifariodet_cod
                AND DET.elemento_item = TD.tarifariodet_item
                and DVS.docvntsunat_cod = DET.documento
            )
            left join sch_clinica.tbl_negociacionprecio negp on oa.ordatencion_negprc_emp_aseg_ncod = negp.negociacionprecio_cod
            LEFT JOIN sch_clinica.tbl_catgenerico CG ON negp.negociacionprecio_tpfinanciador = CG.catgenerico_cod
            left join (
                SELECT
                    np.negociacionprecio_cod,
                    SVN.td_cod,
                    SVN.td_item,
                    CASE
                        WHEN COALESCE(NPD.negociacionpreciodet_tpmov, NPD2.tipo, 1) = 1
                        AND SVN.unidades > 0 THEN (
                            (
                                FC.factor_valor * (
                                    1 - (
                                        COALESCE(
                                            NPD.negociacionpreciodet_dscto,
                                            NPD2.descuento,
                                            NP.negociacionprecio_descuento
                                        ) / 100
                                    )
                                )
                            ) * SVN.unidades
                        )
                        WHEN (
                            COALESCE(NPD.negociacionpreciodet_tpmov, NPD2.tipo, 0) = 0
                            OR SVN.td_cod = 2
                        )
                        AND SVN.precio > 0 THEN SVN.precio * (
                            1 - (
                                COALESCE(
                                    NPD.negociacionpreciodet_dscto,
                                    NPD2.descuento,
                                    NPT.descuento_precio,
                                    0
                                ) / 100
                            )
                        )
                        ELSE 0
                    END AS prec_neg
                FROM
                    sch_clinica.tbl_negociacionprecio NP
                    LEFT JOIN sch_clinica.tbl_empresa EM ON (
                        NP.negociacionprecio_aseguradora_cod = EM.empresa_cod
                    )
                    LEFT JOIN sch_clinica.tbl_factor FC ON (NP.negociacionprecio_factor_cod = FC.factor_cod)
                    INNER JOIN sch_clinica.vw_servicios_vs_negociaciones SVN ON (NP.negociacionprecio_cod = SVN.negociacion_cod)
                    LEFT JOIN sch_clinica.vw_servicios_vs_negociaciones_tarifarios NPT ON (
                        NP.negociacionprecio_cod = NPT.negociacion_cod
                        AND SVN.td_cod = NPT.tarifario_cod
                    )
                    LEFT JOIN sch_clinica.tbl_negociacionpreciodet NPD ON (
                        SVN.negociacion_cod = NPD.negociacionpreciodet_ncod
                        AND SVN.td_cod = NPD.negociacionpreciodet_tcod
                        AND SVN.td_item = NPD.negociacionpreciodet_tditem
                        AND CASE
                            WHEN NPD.negociacionpreciodet_tpmov = 0 THEN SVN.precio > 0
                            WHEN NPD.negociacionpreciodet_tpmov = 1 THEN SVN.unidades > 0
                        END
                    )
                    LEFT JOIN sch_clinica.vw_servicios_vs_negociaciones_padres NPD2 ON (
                        SVN.negociacion_cod = NPD2.negociacion_cod
                        AND SVN.td_cod = NPD2.td_cod
                        AND SVN.td_item = NPD2.td_item
                        AND NPD2.item = 1
                    )
                WHERE
                    NP.negociacionprecio_estado = 1
                    AND (
                        LENGTH(SVN.segus_cod) > 0
                        OR SVN.td_cod = 2
                    )
            ) AS NEG_PREC ON (
                COALESCE(negp.negociacionprecio_cod, 1) = NEG_PREC.negociacionprecio_cod
                AND TD.tarifariodet_cod = NEG_PREC.td_cod
                AND TD.tarifariodet_item = NEG_PREC.td_item
            )
            left join sch_clinica.tbl_paciente pac on (oa.ordatencion_paciente_cod = pac.paciente_cod)
            left join sch_clinica.tbl_persona per1 on (oa.ordatencion_paciente_cod = per1.persona_cod)
            left join sch_clinica.tbl_persona per2 on (
                dvs.docvntsunat_cliente_cod = per2.persona_cod
                and dvs.docvntsunat_tpcliente <> 3
            )
            LEFT JOIN sch_clinica.tbl_distrito DIS ON (DIS.distrito_cod = per1.persona_ubigeo)
            LEFT JOIN sch_clinica.tbl_provincia PRO ON (
                PRO.provincia_cod = DIS.distrito_provincia_cod
                AND PRO.provincia_ciudad_cod = DIS.distrito_ciudad_cod
                and pro.provincia_pais_cod = dis.distrito_pais_cod
            )
            LEFT JOIN sch_clinica.tbl_ciudad CIU ON (CIU.ciudad_cod = pro.provincia_ciudad_cod)
            AND (CIU.ciudad_pais_cod = pro.provincia_pais_cod)
            left join sch_clinica.tbl_servicio_ejecucion se on (
                dvs.docvntsunat_cod = se.servicio_ejecucion_docvntsunatdet_cod
                and dvsd.docvntsunatdet_item = se.servicio_ejecucion_docvntsunatdet_item
            )
            left join sch_clinica.tbl_ordenatencionautoseg oaaut on (
                oa.ordatencion_cod = oaaut.ordenatencionautoseg_cod
            )
            left join sch_clinica.tbl_ordatencionaseg oaas on (oa.ordatencion_cod = oaas.ordatencionaseg_cod)
            left join sch_clinica.tbl_ordatencionamb oaa on oa.ordatencion_cod = oaa.ordatencionamb_ordatenciondet_cod
            LEFT JOIN sch_clinica.tbl_ordatenciondet OAD ON oaa.ordatencionamb_ordatenciondet_cod = OAD.ordatenciondet_ordatencion_cod
            AND OAD.ordatenciondet_item = oaa.ordatencionamb_ordatenciondet_item
            left join sch_clinica.tbl_citamedica cm on oaa.ordatencionamb_citamedica_cod = cm.citamedica_cod
            LEFT JOIN sch_clinica.vw_persona med on coalesce(se.servicio_ejecucion_pacod, cm.citamedica_pacod) = med.vw_persona_cod
            LEFT JOIN sch_clinica.tbl_empresa EMP ON (
                OA.ordatencion_negprc_emp_aseg_ecod = EMP.empresa_cod
            )
        WHERE
            DATE(DVS.docvntsunat_femision) >= '${fecha_ini}'
            AND DATE(DVS.docvntsunat_femision) <= '${fecha_fin}'
            and dvs.docvntsunat_anulado = 0
            and dvs.docvntsunat_tpref = 0
        UNION
        ALL
        SELECT
            sch_clinica.sp_mes_letras(date(OID.ordinternamientodet_fregistro)) as "MES",
            date(OID.ordinternamientodet_fregistro) AS fecha_emision,
            per1.persona_nrodoc,
            per1.persona_apep || ' ' || per1.persona_apem || ' ' || per1.persona_nmb1 || ' ' || per1.persona_nmb2,
            (
                SELECT
                    ANIO
                FROM
                    sch_clinica.sp_util_diferencia_fecha(
                        per1.persona_fecnac,
                        DATE(OID.ordinternamientodet_fregistro) - 1
                    ) AS consulta(ANIO INTEGER, MES INTEGER, DIA INTEGER)
            ) AS "EDAD",
            per1.persona_sexo as "SEXO",
            'IMAGENOLOGIA' || COALESCE(' ' || TA.tpatencion_idigital, ' AMB') as "SERVICIO",
            TP.tppaciente_dsc AS tp_paciente,
            negp.negociacionprecio_dsc as "NEGOCIACION",
            TA.tpatencion_dsc AS tp_atencion,
            med.vw_persona_nombres,
            OI.ordinternamiento_oacod AS oa_codigo,
            COALESCE(
                NEG_PREC.prec_neg * OID.ordinternamientodet_cantidad,
                ROUND(
                    CAST(
                        OID.ordinternamientodet_cantidad * OID.ordinternamientodet_preciouniventa AS NUMERIC
                    ),
                    2
                )
            ),
            OID.ordinternamientodet_cantidad AS cantidad,
            oiss.descripcion,
            ar.area_dsc,
            OI.ordinternamiento_estado_facturacion,
            cg.catgenerico_dsc AS "TP. FINANCIADOR",
            pro.provincia_dsc AS provincia_dsc,
            ciu.ciudad_dsc AS ciudad_dsc,
            dis.distrito_dsc AS distrito_dsc,
            '' as condicion_establecimiento,
            '' as condicion_servicio,
            EMP.empresa_ruc AS ruc,
            EMP.empresa_rznsocial AS empresa,
            DVS2.docvntsunat_serie AS "SERIE",
            DVS2.docvntsunat_nro AS "NUMERO",
            oiss.cod_segus as segus
        FROM
            sch_clinica.vw_oi_servicios_segus OISS
            inner join sch_clinica.tbl_ordinternamientodet oid on (oid.ordinternamientodet_cod = OISS.codigo_oid)
            LEFT JOIN sch_clinica.tbl_ordeninternamiento OI ON (
                oid.ordinternamientodet_oicod = OI.ordinternamiento_cod
            )
            LEFT JOIN sch_clinica.tbl_ordatencion OA ON (OI.ordinternamiento_oacod = OA.ordatencion_cod)
            LEFT JOIN sch_clinica.tbl_tpatencion TA ON (
                OA.ordatencion_tpatencion_cod = TA.tpatencion_cod
            )
            LEFT JOIN sch_clinica.tbl_tppaciente TP ON (
                OI.ordinternamiento_tppaciente = TP.tppaciente_cod
            )
            LEFT JOIN sch_clinica.tbl_ordatencion_factura_historial OAFH ON (
                OI.ordinternamiento_cod = OAFH.ordatencion_factura_historial_oicod
                AND OAFH.ordatencion_factura_historial_estado = 1
                AND (
                    OAFH.ordatencion_factura_historial_tipo = 1
                    OR OAFH.ordatencion_factura_historial_tipo = 2
                )
                AND OAFH.ordatencion_factura_historial_tporigen = 0
            )
            LEFT JOIN sch_clinica.tbl_docvntsunat DVS2 ON (
                OAFH.ordatencion_factura_historial_docvntsunatcod = DVS2.docvntsunat_cod
                and dvs2.docvntsunat_anulado = 0
                /*and dvs2.docvntsunat_tpref = 0*/
            )
            left join sch_clinica.tbl_empresa aseg on (
                oa.ordatencion_negprc_emp_aseg_acod = aseg.empresa_cod
            )
            left join sch_clinica.tbl_negociacionprecio negp on oa.ordatencion_negprc_emp_aseg_ncod = negp.negociacionprecio_cod
            LEFT JOIN sch_clinica.tbl_catgenerico CG ON negp.negociacionprecio_tpfinanciador = CG.catgenerico_cod
            LEFT JOIN sch_clinica.tbl_area ar on oiss.cod_area = ar.area_cod
            left join (
                SELECT
                    np.negociacionprecio_cod,
                    SVN.td_cod,
                    SVN.td_item,
                    CASE
                        WHEN COALESCE(NPD.negociacionpreciodet_tpmov, NPD2.tipo, 1) = 1
                        AND SVN.unidades > 0 THEN (
                            (
                                FC.factor_valor * (
                                    1 - (
                                        COALESCE(
                                            NPD.negociacionpreciodet_dscto,
                                            NPD2.descuento,
                                            NP.negociacionprecio_descuento
                                        ) / 100
                                    )
                                )
                            ) * SVN.unidades
                        )
                        WHEN (
                            COALESCE(NPD.negociacionpreciodet_tpmov, NPD2.tipo, 0) = 0
                            OR SVN.td_cod = 2
                        )
                        AND SVN.precio > 0 THEN SVN.precio * (
                            1 - (
                                COALESCE(
                                    NPD.negociacionpreciodet_dscto,
                                    NPD2.descuento,
                                    NPT.descuento_precio,
                                    0
                                ) / 100
                            )
                        )
                        ELSE 0
                    END AS prec_neg
                FROM
                    sch_clinica.tbl_negociacionprecio NP
                    LEFT JOIN sch_clinica.tbl_empresa EM ON (
                        NP.negociacionprecio_aseguradora_cod = EM.empresa_cod
                    )
                    LEFT JOIN sch_clinica.tbl_factor FC ON (NP.negociacionprecio_factor_cod = FC.factor_cod)
                    INNER JOIN sch_clinica.vw_servicios_vs_negociaciones SVN ON (NP.negociacionprecio_cod = SVN.negociacion_cod)
                    LEFT JOIN sch_clinica.vw_servicios_vs_negociaciones_tarifarios NPT ON (
                        NP.negociacionprecio_cod = NPT.negociacion_cod
                        AND SVN.td_cod = NPT.tarifario_cod
                    )
                    LEFT JOIN sch_clinica.tbl_negociacionpreciodet NPD ON (
                        SVN.negociacion_cod = NPD.negociacionpreciodet_ncod
                        AND SVN.td_cod = NPD.negociacionpreciodet_tcod
                        AND SVN.td_item = NPD.negociacionpreciodet_tditem
                        AND CASE
                            WHEN NPD.negociacionpreciodet_tpmov = 0 THEN SVN.precio > 0
                            WHEN NPD.negociacionpreciodet_tpmov = 1 THEN SVN.unidades > 0
                        END
                    )
                    LEFT JOIN sch_clinica.vw_servicios_vs_negociaciones_padres NPD2 ON (
                        SVN.negociacion_cod = NPD2.negociacion_cod
                        AND SVN.td_cod = NPD2.td_cod
                        AND SVN.td_item = NPD2.td_item
                        AND NPD2.item = 1
                    )
                WHERE
                    NP.negociacionprecio_estado = 1
                    AND (
                        LENGTH(SVN.segus_cod) > 0
                        OR SVN.td_cod = 2
                    )
            ) AS NEG_PREC ON (
                negp.negociacionprecio_cod = NEG_PREC.negociacionprecio_cod
                AND OISS.tdcod = NEG_PREC.td_cod
                AND OISS.tditem = NEG_PREC.td_item
            )
            left join sch_clinica.tbl_paciente pac on (oa.ordatencion_paciente_cod = pac.paciente_cod)
            left join sch_clinica.tbl_persona per1 on (oa.ordatencion_paciente_cod = per1.persona_cod)
            LEFT JOIN sch_clinica.tbl_distrito DIS ON (DIS.distrito_cod = per1.persona_ubigeo)
            LEFT JOIN sch_clinica.tbl_provincia PRO ON (
                PRO.provincia_cod = DIS.distrito_provincia_cod
                AND PRO.provincia_ciudad_cod = DIS.distrito_ciudad_cod
                and pro.provincia_pais_cod = dis.distrito_pais_cod
            )
            LEFT JOIN sch_clinica.tbl_ciudad CIU ON (CIU.ciudad_cod = pro.provincia_ciudad_cod)
            AND (CIU.ciudad_pais_cod = pro.provincia_pais_cod)
            left join sch_clinica.tbl_hospitalizacion h on oa.ordatencion_cod = h.hospitalizacion_oacod
            left join (
                select
                    *
                from
                    (
                        select
                            distinct q.quirofano_oacod,
                            q.quirofano_oicod,
                            qpa.quirofano_profatencion_pacod,
                            RANK () OVER (
                                PARTITION BY q.quirofano_oacod,
                                q.quirofano_oicod
                                ORDER BY
                                    qpa.quirofano_profatencion_cod DESC
                            ) AS item
                        from
                            sch_clinica.tbl_quirofano q
                            inner join sch_clinica.tbl_quirofano_profatencion qpa on q.quirofano_cod = qpa.quirofano_profatencion_cod
                        where
                            qpa.quirofano_profatencion_principal = 1
                            and qpa.quirofano_profatencion_reghabilitado = 1
                    ) cons
                where
                    cons.item = 1
            ) AS QUI ON (oi.ordinternamiento_cod = QUI.quirofano_oicod)
            left join sch_clinica.vw_persona med on coalesce(
                h.hospitalizacion_pacod,
                qui.quirofano_profatencion_pacod
            ) = med.vw_persona_cod
            LEFT JOIN sch_clinica.tbl_empresa EMP ON (
                OA.ordatencion_negprc_emp_aseg_ecod = EMP.empresa_cod
            )
        WHERE
            (
                OISS.cod_area = 54
                OR OISS.cod_area = 55
                OR OISS.cod_area = 59
                OR OISS.cod_area = 60
                OR OISS.cod_area = 139
                OR OISS.cod_area = 62 --OISS.cod_area = 69 OR
                --OISS.cod_area = 132 OR
                --OISS.cod_area = 32
            )
            AND OID.ordinternamientodet_ejecucion_auditoria = 1
            AND DATE(OID.ordinternamientodet_fregistro) >= '${fecha_ini}'
            AND DATE(OID.ordinternamientodet_fregistro) <= '${fecha_fin}'
    ) as cons
WHERE
    cons.estado <> 4
GROUP BY
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    13,
    14,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28
order by
    1,
    2,
    3;
`;

export const getQueryProce = (fecha_ini: string, fecha_fin: string) => `
SELECT DISTINCT
	MAX(to_char(dvs.docvntsunat_femision, 'dd/MM/yyyy')) as "FECHA ATENCION",
    MAX(per.persona_nrodoc) as "DNI PACIENTE",
    MAX(per.persona_nmb1 || ' '  || per.persona_nmb2 || ' '  || PER.persona_apep || ' ' || per.persona_apem) as "PACIENTE",
    MAX(DATE_PART('year', AGE(per.persona_fecnac))) AS "EDAD",
    MAX(per.persona_sexo) as "SEXO",
    MAX(CASE WHEN tpp.tppaciente_dsc IS NULL THEN 'EVENTUAL' ELSE tpp.tppaciente_dsc END) AS "TIPO PACIENTE",
    MAX(CASE WHEN np.negociacionprecio_dsc IS NULL THEN 'PARTICULAR' ELSE np.negociacionprecio_dsc END) AS "DESCRIPCION PACIENTE",
    'PROCEDIMIENTOS MEDICOS' AS "SERVICIO",
    MAX(em.espprofatencion_dsc) AS "ESPECIALIDAD",
    MAX(med.vw_persona_nombres) AS "MEDICO",
    --CASE WHEN
    CASE
        WHEN CASE WHEN np.negociacionprecio_dsc IS NULL THEN 'PARTICULAR' ELSE np.negociacionprecio_dsc END IN (
            'PARTICULAR',
            'AFILIADOS SAN JUAN DE DIOS CUSCO',
            'CAMPAÑA MÉDICA JUANDEDIANA',
            'COLABORADOR JUANDEDIANO'
        )
        THEN ROUND(CAST(dvsd.docvntsunatdet_totneto * (1 + dvs.docvntsunat_igv) AS NUMERIC), 2) / 1.18
        ELSE COALESCE(
            NEG_PREC.prec_neg * COALESCE(DET.cantidad, DVSD.docvntsunatdet_cantidad),
            COALESCE(
                DET.valor_neto,
                DVSD.docvntsunatdet_cantidad * DVSD.docvntsunatdet_preciounineto
            )
        )
    END AS "VALOR VENTA",
    dvsd.docvntsunatdet_cantidad AS "CANT",
   	MAX(dvs.docvntsunat_oa_codigo) AS "OA ",
    MAX(sd.segus_det_dsc) as "PROCEDIMIENTO",
    MAX(ta.area_dsc) "AREA", '' AS "TIPO SERVICIO",
    MAX(pro.provincia_dsc) AS "PROVINCIA",
  	MAX(ciu.ciudad_dsc) AS "CIUDAD",
  	MAX(dis.distrito_dsc) AS "DISTRITO",
    '' AS "CONDICION ESTABLECIMIENTO",
  	'' AS "CONDICION SERVICIO",
    MAX(CASE
        WHEN sch_clinica.sp_edad_porfecha(per.persona_fecnac, hp.hstconsulta_procmed_fsolicitud) BETWEEN 0 AND 11 THEN 'NIÑO DE 0 -11 AÑOS'
        WHEN sch_clinica.sp_edad_porfecha(per.persona_fecnac, hp.hstconsulta_procmed_fsolicitud) BETWEEN 12 AND 17 THEN 'ADOLESCENTES 12-17 AÑOS'
        WHEN sch_clinica.sp_edad_porfecha(per.persona_fecnac, hp.hstconsulta_procmed_fsolicitud) BETWEEN 18 AND 29 THEN 'JOVEN 18 -29 AÑOS'
        WHEN sch_clinica.sp_edad_porfecha(per.persona_fecnac, hp.hstconsulta_procmed_fsolicitud) BETWEEN 30 AND 59 THEN 'ADULTO 30-59 AÑOS'
        WHEN sch_clinica.sp_edad_porfecha(per.persona_fecnac, hp.hstconsulta_procmed_fsolicitud) >= 60 THEN 'ADULTO MAYOR 60 +'
        ELSE ''
    END) AS "GRUPO ETARIO",
  	'AMBULATORIO' AS "LINEA DE NEGOCIO",
  	'PRESENCIAL' AS "MODALIDAD",
  	'Procedimientos' AS "LN INICIAL",
    MAX(s.segus_area_cod) AS cod_area,
    MAX(ta.area_dsc) AS area,
    MAX(DVS.docvntsunat_serie) AS "SERIE",
    MAX(DVS.docvntsunat_nro) AS "NUMERO",
    MAX(DVS.docvntsunat_usrcreacion) AS "Usuario",
    concat(DVS.docvntsunat_serie, CAST(DVS.docvntsunat_nro AS INTEGER), sd.segus_det_identificador) AS "concatena",
    MAX(ROUND(CAST(dvsd.docvntsunatdet_totneto * (1 + dvs.docvntsunat_igv) AS NUMERIC), 2)/1.18) as monto_cobrado,'' AS BUSCAR
FROM
    sch_clinica.tbl_docvntsunat dvs
    LEFT JOIN sch_clinica.tbl_docvntsunatdet dvsd ON dvs.docvntsunat_cod = dvsd.docvntsunatdet_cod
    INNER JOIN sch_clinica.tbl_segus_det sd ON (
        dvsd.docvntsunatdet_elemento_cod = sd.segus_det_tdcod
        AND dvsd.docvntsunatdet_elemento_item = sd.segus_det_tditem
        AND dvsd.docvntsunatdet_tpelemento = 0
    )
    LEFT JOIN sch_clinica.tbl_segus s ON sd.segus_det_tdcod = s.segus_tarifariodet_cod AND sd.segus_det_tditem = s.segus_tarifariodet_item
    LEFT JOIN sch_clinica.tbl_ordatencion oa ON dvs.docvntsunat_oa_codigo = oa.ordatencion_cod
    LEFT JOIN sch_clinica.tbl_tppaciente tpp ON oa.ordatencion_tpaciente_cod = tpp.tppaciente_cod
    LEFT JOIN sch_clinica.tbl_persona per ON dvs.docvntsunat_cliente_cod = per.persona_cod
    LEFT JOIN sch_clinica.tbl_negociacionprecio np ON oa.ordatencion_negprc_emp_aseg_ncod = np.negociacionprecio_cod
    LEFT join sch_clinica.tbl_area ta on ta.area_cod = s.segus_area_cod
	left join sch_clinica.tbl_negociacionprecio negp on oa.ordatencion_negprc_emp_aseg_ncod = negp.negociacionprecio_cod
    LEFT JOIN sch_clinica.tbl_tarifariodet TD ON (
        S.segus_tarifariodet_cod = TD.tarifariodet_cod
        AND S.segus_tarifariodet_item = TD.tarifariodet_item
      )
	left join sch_clinica.tbl_servicio_ejecucion se on dvs.docvntsunat_cod = se.servicio_ejecucion_docvntsunatdet_cod
    and dvsd.docvntsunatdet_item = se.servicio_ejecucion_docvntsunatdet_item
    left join sch_clinica.tbl_ordatencionamb oaa on oa.ordatencion_cod = oaa.ordatencionamb_ordatenciondet_cod
    left join sch_clinica.tbl_citamedica cm on oaa.ordatencionamb_citamedica_cod = cm.citamedica_cod
    left join sch_clinica.tbl_hcprocmed_prvnt hpv on hpv.hcprocmed_prvnt_prvntcod=dvs.docvntsunat_predocvnt_cod
    left join sch_clinica.tbl_hstconsulta_procmed hp on hp.hstconsulta_procmed_cod=hpv.hcprocmed_prvnt_pmcod
    left join sch_clinica.tbl_espprofatencion em on coalesce(cm.citamedica_emcod, hp.hstconsulta_procmed_emcod_ejecucion)= em.espprofatencion_cod
    LEFT JOIN sch_clinica.vw_persona med on coalesce(hp.hstconsulta_procmed_pacod_ejecucion, se.servicio_ejecucion_pacod, cm.citamedica_pacod) = med.vw_persona_cod
    LEFT JOIN sch_clinica.tbl_distrito DIS ON (DIS.distrito_cod = per.persona_ubigeo)
  	LEFT JOIN sch_clinica.tbl_provincia PRO ON (PRO.provincia_cod = DIS.distrito_provincia_cod AND PRO.provincia_ciudad_cod = DIS.distrito_ciudad_cod and pro.provincia_pais_cod = dis.distrito_pais_cod)
	LEFT JOIN sch_clinica.tbl_ciudad CIU ON (CIU.ciudad_cod = pro.provincia_ciudad_cod)
  AND (CIU.ciudad_pais_cod = pro.provincia_pais_cod)
    left join (
        SELECT
          np.negociacionprecio_cod,
          SVN.td_cod,
          SVN.td_item,
          CASE
            WHEN COALESCE(NPD.negociacionpreciodet_tpmov, NPD2.tipo, 1) = 1
            AND SVN.unidades > 0 THEN (
              (
                FC.factor_valor * (
                  1 - (
                    COALESCE(
                      NPD.negociacionpreciodet_dscto,
                      NPD2.descuento,
                      NP.negociacionprecio_descuento
                    ) / 100
                  )
                )
              ) * SVN.unidades
            )
            WHEN (
              COALESCE(NPD.negociacionpreciodet_tpmov, NPD2.tipo, 0) = 0
              OR SVN.td_cod = 2
            )
            AND SVN.precio > 0 THEN SVN.precio * (
              1 - (
                COALESCE(
                  NPD.negociacionpreciodet_dscto,
                  NPD2.descuento,
                  NPT.descuento_precio,
                  0
                ) / 100
              )
            )
            ELSE 0
          END AS prec_neg
        FROM
          sch_clinica.tbl_negociacionprecio NP
          LEFT JOIN sch_clinica.tbl_empresa EM ON (
            NP.negociacionprecio_aseguradora_cod = EM.empresa_cod
          )
          LEFT JOIN sch_clinica.tbl_factor FC ON (NP.negociacionprecio_factor_cod = FC.factor_cod)
          INNER JOIN sch_clinica.vw_servicios_vs_negociaciones SVN ON (NP.negociacionprecio_cod = SVN.negociacion_cod)
          LEFT JOIN sch_clinica.vw_servicios_vs_negociaciones_tarifarios NPT ON (
            NP.negociacionprecio_cod = NPT.negociacion_cod
            AND SVN.td_cod = NPT.tarifario_cod
          )
          LEFT JOIN sch_clinica.tbl_negociacionpreciodet NPD ON (
            SVN.negociacion_cod = NPD.negociacionpreciodet_ncod
            AND SVN.td_cod = NPD.negociacionpreciodet_tcod
            AND SVN.td_item = NPD.negociacionpreciodet_tditem
            AND CASE
              WHEN NPD.negociacionpreciodet_tpmov = 0 THEN SVN.precio > 0
              WHEN NPD.negociacionpreciodet_tpmov = 1 THEN SVN.unidades > 0
            END
          )
          LEFT JOIN sch_clinica.vw_servicios_vs_negociaciones_padres NPD2 ON (
            SVN.negociacion_cod = NPD2.negociacion_cod
            AND SVN.td_cod = NPD2.td_cod
            AND SVN.td_item = NPD2.td_item
            AND NPD2.item = 1
          )
        WHERE
          NP.negociacionprecio_estado = 1
          AND (
            LENGTH(SVN.segus_cod) > 0
            OR SVN.td_cod = 2
          )
      ) AS NEG_PREC ON (
        COALESCE(negp.negociacionprecio_cod, 1) = NEG_PREC.negociacionprecio_cod
        AND TD.tarifariodet_cod = NEG_PREC.td_cod
        AND TD.tarifariodet_item = NEG_PREC.td_item
      )
	LEFT JOIN (
        SELECT DISTINCT
          sch_clinica.tbl_recetamed.recetamed_ordatenciondet_cod as oa_cod,
          sch_clinica.tbl_segus_det.segus_det_dsc AS concepto,
          CASE
            WHEN sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_ejecucion_auditoria = 1 THEN CASE
              WHEN sch_clinica.tbl_segus.segus_tpejecucion = 1 THEN sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_cantidad
              ELSE SUM(1)
            END
          END AS cantidad,
          CASE
            WHEN sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_ejecucion_auditoria = 1 THEN (
              CASE
                WHEN sch_clinica.tbl_segus.segus_tpejecucion = 1 THEN sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_cantidad
                ELSE SUM(1)
              END
            ) * sch_clinica.tbl_docvntsunatdet.docvntsunatdet_preciouniventa
          END AS valor_neto,
          sch_clinica.tbl_segus_det.segus_det_tdcod AS elemento_cod,
          sch_clinica.tbl_segus_det.segus_det_tditem AS elemento_item,
          sch_clinica.tbl_docvntsunat.docvntsunat_cod as documento
        FROM
          sch_clinica.tbl_recetamed
          INNER JOIN sch_clinica.tbl_recetamedsegus ON (
            sch_clinica.tbl_recetamed.recetamed_cod = sch_clinica.tbl_recetamedsegus.recetamedsegus_rmcod
          )
          INNER JOIN sch_clinica.tbl_segus_det ON (
            sch_clinica.tbl_recetamedsegus.recetamedsegus_segusdet_cod = sch_clinica.tbl_segus_det.segus_det_cod
          )
          INNER JOIN sch_clinica.tbl_segus ON (
            sch_clinica.tbl_segus_det.segus_det_tdcod = sch_clinica.tbl_segus.segus_tarifariodet_cod
          )
          AND (
            sch_clinica.tbl_segus_det.segus_det_tditem = sch_clinica.tbl_segus.segus_tarifariodet_item
          )
          INNER JOIN sch_clinica.tbl_servicio_ejecucion ON (
            sch_clinica.tbl_recetamedsegus.recetamedsegus_cod = sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_atencion_cod
          )
          INNER JOIN sch_clinica.tbl_area ON (
            sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_area_cod = sch_clinica.tbl_area.area_cod
          )
          INNER JOIN sch_clinica.tbl_docvntsunatdet ON (
            sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_docvntsunatdet_cod = sch_clinica.tbl_docvntsunatdet.docvntsunatdet_cod
          )
          AND (
            sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_docvntsunatdet_item = sch_clinica.tbl_docvntsunatdet.docvntsunatdet_item
          )
          INNER JOIN sch_clinica.tbl_docvntsunat ON (
            sch_clinica.tbl_docvntsunatdet.docvntsunatdet_cod = sch_clinica.tbl_docvntsunat.docvntsunat_cod
          )
          INNER JOIN sch_clinica.tbl_ordatencionasegdet ON (
            sch_clinica.tbl_recetamed.recetamed_ordatenciondet_cod = sch_clinica.tbl_ordatencionasegdet.ordatencionasegdet_ordatencion_cod
          )
          AND (
            sch_clinica.tbl_recetamed.recetamed_ordatenciondet_item = sch_clinica.tbl_ordatencionasegdet.ordatencionasegdet_item
          )
          LEFT JOIN sch_clinica.tbl_oaexcepcion ON (
            sch_clinica.tbl_ordatencionasegdet.ordatencionasegdet_ordatencion_cod = sch_clinica.tbl_oaexcepcion.oaexcepcion_cod
          )
          AND (
            sch_clinica.tbl_ordatencionasegdet.ordatencionasegdet_grupo_cod = sch_clinica.tbl_oaexcepcion.oaexcepcion_area
          )
        WHERE
          sch_clinica.tbl_recetamed.recetamed_tprecetamed = 1
          AND sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_ejecucion_auditoria = 1
          AND NOT EXISTS (
            SELECT
              sch_clinica.tbl_profatencion_prehonorario.profatencion_prehonorario_codserv_ejecucion
            FROM
              sch_clinica.tbl_profatencion_prehonorario
            WHERE
              sch_clinica.tbl_profatencion_prehonorario.profatencion_prehonorario_codserv_ejecucion = sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_cod
          )
        GROUP BY
          sch_clinica.tbl_segus_det.segus_det_identificador,
          sch_clinica.tbl_recetamed.recetamed_ordatenciondet_cod,
          sch_clinica.tbl_segus_det.segus_det_dsc,
          sch_clinica.tbl_docvntsunatdet.docvntsunatdet_preciouniventa,
          sch_clinica.tbl_segus_det.segus_det_tdcod,
          sch_clinica.tbl_segus_det.segus_det_tditem,
          sch_clinica.tbl_docvntsunatdet.docvntsunatdet_preciounineto,
          sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_ejecucion_auditoria,
          sch_clinica.tbl_segus.segus_tpejecucion,
          sch_clinica.tbl_servicio_ejecucion.servicio_ejecucion_cantidad,
          documento
      ) as DET ON (
        DET.oa_cod = OA.ordatencion_cod
        AND DET.elemento_cod = TD.tarifariodet_cod
        AND DET.elemento_item = TD.tarifariodet_item
        and DVS.docvntsunat_cod = DET.documento
      )
WHERE
    dvs.docvntsunat_anulado = 0
    AND dvs.docvntsunat_tpref = 0
    AND date(dvs.docvntsunat_femision) BETWEEN '${fecha_ini}' AND '${fecha_fin}'
GROUP BY "VALOR VENTA","CANT","concatena";
`;
