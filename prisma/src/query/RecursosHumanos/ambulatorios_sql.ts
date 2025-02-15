interface IQueryAmbu {
    IQueryAmbu(fecha_ini: string, fecha_fin: string): string;
}

export const getQueryAmbu: IQueryAmbu['IQueryAmbu'] = (fecha_ini, fecha_fin) => `
SELECT
    cons."FECHA ATENCION",
    cons."DNI PACIENTE",
    cons."PACIENTE",
    cons."EDAD",
    cons."SEXO",
    cons."TIPO DE PACIENTE",
    cons."DESCRIPCION TIPO PACIENTE",
    COALESCE(cons."MODALIDAD", cons."SERVICIO") AS "SERVICIO",
    cons."ESPECIALIDAD",
    cons."MEDICO",
    SUM(
        CASE
            WHEN cons."VALOR VENTA" <> 0 THEN cons."VALOR VENTA"
            ELSE cons.precio_negociado
        END
    ) AS "VALOR VENTA",
    cons."CANT",
    cons."OA",
    '' AS "PROCEDIMIENTO",
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
    'Ambulatorio' AS "LINEA_NEGOCIO",
    'PRESENCIAL' AS "MODALIDAD",
    'Ambulatorio' AS "LN_INICIAL",
    cons."SERIE",
    cons."NUMERO",
    cons."USER"
FROM
    (
        SELECT
            DISTINCT sch_clinica.sp_mes_letras(DATE(CM.citamedica_fhcita)) AS "MES",
            TO_CHAR(CM.citamedica_fhcita, 'dd/MM/yyyy') AS "FECHA ATENCION",
            PPER.persona_nrodoc AS "DNI PACIENTE",
            COALESCE(PPER.persona_apep, '') || ' ' || COALESCE(PPER.persona_apem, '') || ' ' || COALESCE(PPER.persona_nmb1, '') || ' ' || COALESCE(PPER.persona_nmb2, '') AS "PACIENTE",
            (
                SELECT
                    ANIO
                FROM
                    sch_clinica.sp_util_diferencia_fecha(
                        PPER.persona_fecnac,
                        DATE(CM.citamedica_fhcita) - 1
                    ) AS consulta(ANIO INTEGER, MES INTEGER, DIA INTEGER)
            ) AS "EDAD",
            PPER.persona_sexo AS "SEXO",
            TPAC.tppaciente_dsc AS "TIPO DE PACIENTE",
            NP.negociacionprecio_dsc AS "DESCRIPCION TIPO PACIENTE",
            'CONSULTA AMBULATORIA' AS "SERVICIO",
            ESP.espprofatencion_dsc AS "ESPECIALIDAD",
            COALESCE(PMED.persona_apep, '') || ' ' || COALESCE(PMED.persona_apem, '') || ' ' || COALESCE(PMED.persona_nmb1, '') || ' ' || COALESCE(PMED.persona_nmb2, '') AS "MEDICO",
            CASE
                WHEN OA.ordatencion_negprc_emp_aseg_ncod = 117
                AND OASD.ordatencionasegdet_coaseguro = 100
                AND OASD.ordatencionasegdet_deducible = 0 THEN 0
                ELSE ROUND(
                    CAST(
                        CASE
                            WHEN (
                                PDV.predocvntdet_preciouniventa - PDV.predocvntdet_preciounineto
                            ) <= 0 THEN PDV.predocvntdet_preciounineto
                            ELSE PDV.predocvntdet_preciouniventa
                        END * PDV.predocvntdet_cantidad AS NUMERIC
                    ),
                    2
                )
            END AS "VALOR VENTA",
            1 AS "CANT",
            CASE
                WHEN OA.ordatencion_negprc_emp_aseg_ncod = 117
                AND OASD.ordatencionasegdet_coaseguro = 100
                AND OASD.ordatencionasegdet_deducible = 0 THEN 0
                ELSE neg_prec.prec_neg
            END AS precio_negociado,
            CASE
                WHEN COALESCE(CM.citamedica_modalidad_cons, 0) = 0 THEN NULL
                ELSE 'TELECONSULTA AMBULATORIA'
            END AS "MODALIDAD",
            OA.ordatencion_cod AS "OA",
            CASE
                WHEN OA.ordatencion_negprc_emp_aseg_ncod = 117
                AND OASD.ordatencionasegdet_coaseguro = 100
                AND OASD.ordatencionasegdet_deducible = 0 THEN 'ATC COLABORADOR'
                ELSE ''
            END AS "TP ATC",
            CASE
                WHEN OAD.ordatenciondet_tpcondpaciente_est = 1 THEN 'NUEVO'
                WHEN OAD.ordatenciondet_tpcondpaciente_est = 2 THEN 'CONTINUADOR'
                WHEN OAD.ordatenciondet_tpcondpaciente_est = 3 THEN 'REINGRESANTE'
                ELSE ''
            END AS condicion_establecimiento,
            CASE
                WHEN OAD.ordatenciondet_tpcondpaciente_serv = 1 THEN 'NUEVO'
                WHEN OAD.ordatenciondet_tpcondpaciente_serv = 2 THEN 'CONTINUADOR'
                WHEN OAD.ordatenciondet_tpcondpaciente_serv = 3 THEN 'REINGRESANTE'
                ELSE ''
            END AS condicion_servicio,
            PRO.provincia_dsc AS provincia_dsc,
            CIU.ciudad_dsc AS ciudad_dsc,
            DIS.distrito_dsc AS distrito_dsc,
            V.docvntsunat_serie AS "SERIE",
            V.docvntsunat_nro AS "NUMERO",
            V.docvntsunat_usrcreacion AS "USER"
        FROM
            sch_clinica.tbl_citamedica CM
            INNER JOIN sch_clinica.tbl_ordatencionamb OAMB ON CM.citamedica_cod = OAMB.ordatencionamb_citamedica_cod
            INNER JOIN sch_clinica.tbl_ordatencion OA ON OA.ordatencion_cod = OAMB.ordatencionamb_ordatenciondet_cod
            INNER JOIN sch_clinica.tbl_tppaciente TPAC ON TPAC.tppaciente_cod = OA.ordatencion_tpaciente_cod
            INNER JOIN sch_clinica.tbl_negociacionprecio NP ON NP.negociacionprecio_cod = OA.ordatencion_negprc_emp_aseg_ncod
            LEFT JOIN sch_clinica.tbl_catgenerico CG ON NP.negociacionprecio_tpfinanciador = CG.catgenerico_cod
            INNER JOIN sch_clinica.tbl_paciente PAC ON PAC.paciente_cod = OA.ordatencion_paciente_cod
            INNER JOIN sch_clinica.tbl_persona PPER ON PPER.persona_cod = OA.ordatencion_paciente_cod
            LEFT JOIN sch_clinica.tbl_distrito DIS ON DIS.distrito_cod = PPER.persona_ubigeo
            LEFT JOIN sch_clinica.tbl_provincia PRO ON PRO.provincia_cod = DIS.distrito_provincia_cod
            AND PRO.provincia_ciudad_cod = DIS.distrito_ciudad_cod
            AND PRO.provincia_pais_cod = DIS.distrito_pais_cod
            LEFT JOIN sch_clinica.tbl_ciudad CIU ON CIU.ciudad_cod = PRO.provincia_ciudad_cod
            AND CIU.ciudad_pais_cod = PRO.provincia_pais_cod
            LEFT JOIN sch_clinica.tbl_tpidensunat TPIDEN ON PPER.persona_tpidentidad = TPIDEN.tpidensunat_cod
            INNER JOIN sch_clinica.tbl_ordatenciondet OAD ON OAMB.ordatencionamb_ordatenciondet_cod = OAD.ordatenciondet_ordatencion_cod
            AND OAMB.ordatencionamb_ordatenciondet_item = OAD.ordatenciondet_item
            LEFT JOIN sch_clinica.tbl_ordatencionasegdet OASD ON OAD.ordatenciondet_ordatencion_cod = OASD.ordatencionasegdet_ordatencion_cod
            AND OAD.ordatenciondet_item = OASD.ordatencionasegdet_item
            INNER JOIN sch_clinica.tbl_espprofatencion ESP ON ESP.espprofatencion_cod = CM.citamedica_emcod
            INNER JOIN sch_clinica.tbl_persona PMED ON PMED.persona_cod = CM.citamedica_pacod
            INNER JOIN sch_clinica.tbl_predocvnt PV ON OAD.ordatenciondet_predocvnt_cod = PV.predocvnt_cod
            INNER JOIN sch_clinica.tbl_predocvntdet PDV ON PV.predocvnt_cod = PDV.predocvntdet_cod
            LEFT JOIN sch_clinica.tbl_docvntsunat v ON v.docvntsunat_predocvnt_cod = pv.predocvnt_cod
            LEFT JOIN sch_clinica.tbl_hstclinica_consulta HCC ON OAMB.ordatencionamb_ordatenciondet_cod = HCC.hstclinica_consulta_oadet_cod
            AND OAMB.ordatencionamb_ordatenciondet_item = HCC.hstclinica_consulta_oadet_item
            LEFT JOIN (
                SELECT
                    NP.negociacionprecio_cod,
                    SVN.td_cod,
                    SVN.td_item,
                    CASE
                        WHEN COALESCE(NPD.negociacionpreciodet_tpmov, NPD2.tipo, 1) = 1
                        AND SVN.unidades > 0 THEN (
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
                    LEFT JOIN sch_clinica.tbl_empresa EM ON NP.negociacionprecio_aseguradora_cod = EM.empresa_cod
                    LEFT JOIN sch_clinica.tbl_factor FC ON NP.negociacionprecio_factor_cod = FC.factor_cod
                    INNER JOIN sch_clinica.vw_servicios_vs_negociaciones SVN ON NP.negociacionprecio_cod = SVN.negociacion_cod
                    LEFT JOIN sch_clinica.vw_servicios_vs_negociaciones_tarifarios NPT ON NP.negociacionprecio_cod = NPT.negociacion_cod
                    AND SVN.td_cod = NPT.tarifario_cod
                    LEFT JOIN sch_clinica.tbl_negociacionpreciodet NPD ON SVN.negociacion_cod = NPD.negociacionpreciodet_ncod
                    AND SVN.td_cod = NPD.negociacionpreciodet_tcod
                    AND SVN.td_item = NPD.negociacionpreciodet_tditem
                    AND CASE
                        WHEN NPD.negociacionpreciodet_tpmov = 0 THEN SVN.precio > 0
                        WHEN NPD.negociacionpreciodet_tpmov = 1 THEN SVN.unidades > 0
                    END
                    LEFT JOIN sch_clinica.vw_servicios_vs_negociaciones_padres NPD2 ON SVN.negociacion_cod = NPD2.negociacion_cod
                    AND SVN.td_cod = NPD2.td_cod
                    AND SVN.td_item = NPD2.td_item
                    AND NPD2.item = 1
                WHERE
                    NP.negociacionprecio_estado = 1
                    AND (
                        LENGTH(SVN.segus_cod) > 0
                        OR SVN.td_cod = 2
                    )
            ) AS NEG_PREC ON NP.negociacionprecio_cod = NEG_PREC.negociacionprecio_cod
            AND PDV.predocvntdet_elemento_cod = NEG_PREC.td_cod
            AND PDV.predocvntdet_elemento_item = NEG_PREC.td_item
        WHERE
            CM.citamedica_estado = 1
            AND PV.predocvnt_estado = 1
            AND DATE(CM.citamedica_fhcita) >= '${fecha_ini}'
            AND DATE(CM.citamedica_fhcita) <= '${fecha_fin}'
        ORDER BY
            2 ASC,
            10,
            11
    ) AS cons
WHERE
    cons."ESPECIALIDAD" NOT IN (
        'MEDICINA GENERAL',
        'MEDICINA DE EMERGENCIA Y URGENCIAS'
    )
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
    12,
    13,
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
    27,28
`;