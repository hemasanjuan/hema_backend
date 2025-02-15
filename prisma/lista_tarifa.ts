import { PrismaClient } from '@prisma/client'
import { join } from 'path';
import { logTxt, modificarExcelTarifario } from './src/query/utils';

const prisma = new PrismaClient()

interface DetalleTarifario {
    item_tarifario: number;
    cod_tarifario: number;
    desc_tarifario: string;
    preciodet_dscto: number;
    precio_final: number;
    tpmov: number;
    inafecto_coaseguro: number;
    pfijo: string;
    precio_virtual: string;
}

interface Negociacion {
    cod_negociacion: number;
    desc_negociacion: string;
    detalle_Tarifario: DetalleTarifario[];
}

const listaNegociaciones = (id?: number) => {
    const where = id ? { negociacionprecio_cod: id, negociacionprecio_estado: 1 } : { negociacionprecio_estado: 1 };
    const lista = prisma.tbl_negociacionprecio.findMany({
        where,
        select: {
            negociacionprecio_cod: true,
            negociacionprecio_dsc: true
        },
        orderBy: {
            negociacionprecio_cod: 'asc'
        }
    })
    return lista
}

const listaTarifasSegus = (id_negociacion: number) => {
    const listaTarifa = prisma.tbl_negociacionpreciodet.findMany({
        where: {
            negociacionpreciodet_ncod: id_negociacion
        },
        select: {
            negociacionpreciodet_tcod: true,
            negociacionpreciodet_tditem: true,
            negociacionpreciodet_dscto: true,
            negociacionpreciodet_tpmov: true,
            negociacionpreciodet_inafecto_coaseguro: true,
            negociacionpreciodet_pfijo: true,
            negociacionpreciodet_precio_virtual: true,
            tbl_tarifariodet: {
                select: {
                    tarifariodet_dsc: true,
                    tarifariodet_prc: true,
                    tbl_segus: {
                        select: {
                            segus_area_cod: true,
                            tbl_area: {
                                select: {
                                    area_dsc: true
                                }
                            }
                        }
                    }
                }
            }
        },
        orderBy: {
            negociacionpreciodet_tcod: 'asc'
        }
    })
    return listaTarifa
}

const obtenerDatosCompletos = async (id_negociacion?: number) => {
    const negociaciones = await listaNegociaciones(id_negociacion);

    const datosCompletos: Negociacion[] = [];

    for (const negociacion of negociaciones) {
        const tarifas = await listaTarifasSegus(negociacion.negociacionprecio_cod);
        const detalle_Tarifario = tarifas.map(tarifa => ({
            item_tarifario: tarifa.negociacionpreciodet_tcod,
            cod_tarifario: tarifa.negociacionpreciodet_tditem,
            desc_tarifario: tarifa.tbl_tarifariodet.tarifariodet_dsc,
            preciodet_dscto: tarifa.negociacionpreciodet_dscto,
            precio_final: tarifa.tbl_tarifariodet.tarifariodet_prc, // Asignar precio final correspondiente
            tpmov: tarifa.negociacionpreciodet_tpmov,
            inafecto_coaseguro: tarifa.negociacionpreciodet_inafecto_coaseguro || 0,
            pfijo: tarifa.negociacionpreciodet_pfijo?.toString() || '',
            precio_virtual: tarifa.negociacionpreciodet_precio_virtual?.toString() || ''
        }));

        datosCompletos.push({
            cod_negociacion: negociacion.negociacionprecio_cod,
            desc_negociacion: negociacion.negociacionprecio_dsc,
            detalle_Tarifario
        });
    }

    return datosCompletos;
}

async function main() {
    const fileName = `Tarifario_Negociaciones_2025.xlsx`;
    const filePath = join(__dirname, 'excel', fileName);
    const sheetName = ''; // Dejar vacío para leer todas las hojas || Escribir el nombre de la hoja a leer

    const datosCompletos = await obtenerDatosCompletos();

    await modificarExcelTarifario(filePath, datosCompletos);

    // const segus = await listaTarifasSegus(1)

    logTxt({
        cantidad: datosCompletos.length,
        lista: datosCompletos

        // cantidad: segus.length,
        // segus
    });
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