import { PrismaClient } from '@prisma/client'
import { leerExcelSegus } from './src/query/utils';
import path from 'path';
const prisma = new PrismaClient()

interface IcuentaCont {
    cont_cuenta_cod: number,
    cont_cuenta_numero: string,
}

interface excelDataSegus {
    COD_SEGUS: string,
    SEGUS_DESC: string,
    PRECIO_SIN_IGV: number,
    coracle17: string,
    s8oracle: string,
    area: number,
    segus_intquirurgica: number,
    cuenta: string
}

async function obtenerUltimoCorrelativo() {
    const ultimoCorrelativo = await prisma.tbl_tarifariodet.findFirst({
        select: {
            tarifariodet_item: true
        },
        orderBy: {
            tarifariodet_item: 'desc'
        }
    })
    return (ultimoCorrelativo?.tarifariodet_item ?? 0) + 1;
}

async function obtenerCuentaContable(cuenta: string): Promise<IcuentaCont> {
    const cuentaCont = await prisma.tbl_cont_cuenta.findMany({
        where: {
            cont_cuenta_numero: cuenta
        }
    })
    if (cuentaCont.length > 0) {
        const { cont_cuenta_cod, cont_cuenta_numero } = cuentaCont[0]
        return { cont_cuenta_cod, cont_cuenta_numero }
    }
    return { cont_cuenta_cod: 0, cont_cuenta_numero: '' }
}

async function procesarDatos(jsonData: excelDataSegus[], correlativo: number, cuentacod: IcuentaCont) {
    await prisma.$transaction(async (prisma) => {
        for (const data of jsonData) {
            await prisma.tbl_tarifariodet.create({
                data: {
                    tarifariodet_cod: 1,
                    tarifariodet_item: correlativo,
                    tarifariodet_dsc: data.SEGUS_DESC,
                    tarifariodet_prc: data.PRECIO_SIN_IGV,
                    tarifariodet_estado: 1, // 1 = Activo || 0 = Inactivo
                    tarifariodet_fcreacion: new Date(),
                    tarifariodet_usrcreacion: 'sysadmin',
                    tarifariodet_ipcreacion: '192.168.1.112',
                    tarifariodet_uni: 0,
                    tarifariodet_afectoigv: 1, // 1 = Afecto a IGV || 0 = No afecto a IGV
                    tarifariodet_coracle17: data.coracle17,
                    tarifariodet_s8oracle: data.s8oracle,
                }
            })

            await prisma.tbl_segus.create({
                data: {
                    segus_tarifariodet_cod: 1,
                    segus_tarifariodet_item: correlativo,
                    segus_cod: data.COD_SEGUS ?? '',// 3.7.2
                    segus_codsegus: data.COD_SEGUS ?? '',
                    segus_ayu: '',
                    segus_ins: '',
                    segus_dhos: '',
                    segus_fcreacion: new Date(),
                    segus_usrcreacion: 'sysadmin',
                    segus_ipcreacion: '192.168.1.112',
                    segus_area_cod: data.area ?? 0,
                    segus_intquirurgica: data.segus_intquirurgica ?? 0,
                    segus_empresa_cod: 14, // 14 = Hogar Clinica San Juan de Dios
                    segus_original: 0,
                    segus_genera_prehonorario: 0,
                    segus_incluye_consulta: 0,
                    segus_convenio_default: null,
                    segus_tpejecucion: 0,
                    segus_incluye_porcentaje: 0,
                    segus_tpequipo: 0,
                    segus_no_incluir_cierre: 0,
                    segus_equivalencia: null,
                }
            })

            await prisma.tbl_segus_det.create({
                data: {
                    segus_det_tdcod: 1,
                    segus_det_tditem: correlativo,
                    segus_det_dsc: data.SEGUS_DESC,
                    segus_det_identificador: data.COD_SEGUS ?? '',
                    segus_det_fcreacion: new Date(),
                    segus_det_usrcreacion: 'sysadmin',
                    segus_det_ipcreacion: '192.168.1.112',
                    segus_det_estado: 0, // 0 = Activo || 1 = Inactivo
                    segus_det_coracle17: data.coracle17,
                    segus_det_cpt: '',
                    segus_det_upss: '',
                },
                select: {
                    segus_det_tdcod: true,
                    segus_det_tditem: true
                }
            })

            if (cuentacod.cont_cuenta_numero !== data.cuenta) {
                cuentacod = await obtenerCuentaContable(data.cuenta);
            }

            await prisma.tbl_cont_cuenta_procedimiento.create({
                data: {
                    cont_cuenta_procedimiento_tdcod: 1,
                    cont_cuenta_procedimiento_tditem: correlativo,
                    cont_cuenta_procedimiento_cuentacod: cuentacod.cont_cuenta_cod,
                    cont_cuenta_procedimiento_tipo1: null,
                    cont_cuenta_procedimiento_tplibro: 1,
                    cont_cuenta_procedimiento_fcreacion: new Date(),
                    cont_cuenta_procedimiento_usrcreacion: 'sysadmin',
                    cont_cuenta_procedimiento_ipcreacion: '192.168.1.112',
                }
            })

            await prisma.tbl_tarifario_cont_cuenta.create({
                data: {
                    tarifario_cont_cuenta_elemento_cod: 1,
                    tarifario_cont_cuenta_elemento_item: correlativo,
                    tarifario_cont_cuenta_tpelemento: 1, // 1 ventas-segus 2 ventas-producto 4 ventas-consultas medicas 5 ventas-garantias 7 ventas-forma de pago....elemento_cod y elemento_item depende de este tipo
                    tarifario_cont_cuenta_plancod: 1, // codigo del plan de cuentas
                    tarifario_cont_cuenta_cod_cuenta: cuentacod.cont_cuenta_cod,
                    tarifario_cont_cuenta_fcreacion: new Date(),
                    tarifario_cont_cuenta_usrcreacion: 'sysadmin',
                    tarifario_cont_cuenta_ipcreacion: '192.168.1.112',
                }
            })

            console.log('Insertado:', correlativo)
            console.table(data)

            correlativo++;
        }
    });
}

async function main() {
    const fileName = `carga_segus.xlsx`;
    const filePath = path.join(__dirname, 'excel', fileName)
    const sheetName = 'ECO'

    let jsonData: excelDataSegus[] = [];

    try {
        jsonData = await leerExcelSegus(filePath, sheetName) as excelDataSegus[];
        jsonData = jsonData.map(data => ({
            ...data,
            COD_SEGUS: String(data.COD_SEGUS),
            SEGUS_DESC: String(data.SEGUS_DESC),
            coracle17: String(data.coracle17),
            s8oracle: String(data.s8oracle),
            cuenta: String(data.cuenta)
        }));
        console.log('Datos convertidos a JSON:', jsonData.length)
        // console.table(jsonData)
    } catch (error) {
        console.error('Error en la función principal:', error)
    }

    try {
        const correlativo = await obtenerUltimoCorrelativo();
        let cuentacod: IcuentaCont = { cont_cuenta_cod: 0, cont_cuenta_numero: '' };
        await procesarDatos(jsonData, correlativo, cuentacod);
    } catch (error) {
        console.error('Error in main function:', error);
    } finally {
        await prisma.$disconnect();
    }
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
