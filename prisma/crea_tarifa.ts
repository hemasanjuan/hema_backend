import { PrismaClient } from '@prisma/client'
import { join } from 'path';
import { datosPrueba, leerExcelTarifario, logTxt, Negociacion } from './src/query/utils';

const prisma = new PrismaClient()

const creaDetalleNegociacion = async (data: Negociacion[]) => {
    await prisma.$transaction(async (prisma) => {
        for (const item of data) {
            await prisma.tbl_negociacionpreciodet.deleteMany({
                where: {
                    negociacionpreciodet_ncod: item.cod_negociacion
                }
            })
            console.log(`Ingresando negociación: ${item.cod_negociacion} - ${item.desc_negociacion}`); // Log de la negociación

            const seen = new Set();
            const detDuplica: any[] = [];
            const detalles = item.detalle_Tarifario
                .filter(item2 => item2.item_tarifario && item2.cod_tarifario)
                .filter(item2 => {
                    const key = `${item2.item_tarifario}-${item2.cod_tarifario}`;
                    if (seen.has(key)) {
                        detDuplica.push(item2)
                        return false;
                    }
                    seen.add(key);
                    return true;
                })
                .map(item2 => ({
                    negociacionpreciodet_ncod: item.cod_negociacion,
                    negociacionpreciodet_tcod: item2.item_tarifario,
                    negociacionpreciodet_tditem: item2.cod_tarifario,
                    negociacionpreciodet_dscto: item2.preciodet_dscto,
                    negociacionpreciodet_tpmov: item2.tpmov,
                    negociacionpreciodet_fcreacion: new Date(),
                    negociacionpreciodet_usrcreacion: 'sysadmin',
                    negociacionpreciodet_ipcreacion: '192.168.1.112',
                    negociacionpreciodet_inafecto_coaseguro: item2.inafecto_coaseguro,
                    negociacionpreciodet_pfijo: null,
                    negociacionpreciodet_precio_virtual: null,
                }));

            // Ordenar detalles por negociacionpreciodet_tcod y negociacionpreciodet_tditem
            detalles.sort((a, b) => {
                if (a.negociacionpreciodet_tcod === b.negociacionpreciodet_tcod) {
                    return a.negociacionpreciodet_tditem - b.negociacionpreciodet_tditem;
                }
                return a.negociacionpreciodet_tcod - b.negociacionpreciodet_tcod;
            });

            // logTxt({
            //     cantidad: detalles.length,
            //     detalles
            // });

            for (let i = 0; i < detalles.length; i += 1) {
                const batch = detalles.slice(i, i + 1);
                logTxt({
                    // cantidad: detalles.length,
                    batch
                });
                await prisma.tbl_negociacionpreciodet.createMany({
                    data: batch
                });
            }

            // Log de duplicados
            if (detDuplica.length > 0) {
                console.log(`Registros duplicados en la negociación ${item.cod_negociacion}:`, detDuplica);
            }
        }
        return data
    }, { timeout: 60000 }) // Tiempo de espera de 60 segundos para la transacción
}

async function main() {
    const fileName = `Tarifario_Negociaciones_2025.xlsx`;
    const filePath = join(__dirname, 'excel', fileName);
    const sheetName = process.argv[2] || ''; // Dejar vacío para leer todas las hojas || Escribir el nombre de la hoja a leer

    const jsonData: Negociacion[] = await leerExcelTarifario(filePath, sheetName) as Negociacion[];

    await creaDetalleNegociacion(jsonData)

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