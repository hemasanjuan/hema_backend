import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import fs from 'fs';
import path from 'path';
import { getQueryTarifa, getQueryTarifaSunat } from './src/query/teleton_sql';

async function main() {

    const fecha_ini = '2024-12-22';
    const fecha_fin = '2025-03-30';

    const queryTarifa = getQueryTarifa(fecha_ini, fecha_fin);

    const result = await prisma.$queryRawUnsafe<any[]>(queryTarifa);

    const filtraResult = result.filter(row => Number(row.precio_final) !== row.predocvntdet_preciouniventa);

    for (const row of filtraResult) {
        await prisma.tbl_predocvntdet.update({
            where: {
                predocvntdet_cod_predocvntdet_item: {
                    predocvntdet_cod: row.predocvntdet_cod,
                    predocvntdet_item: row.predocvntdet_item
                }
            },
            data: {
                predocvntdet_preciouniventa: Number(row.precio_final)
            }
        });
    }

    const logData = {
        result,
        filtraResult
    };
    fs.writeFileSync(path.join(__dirname, 'excel', 'prod.log'), JSON.stringify(logData, null, 2));

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




