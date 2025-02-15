import { PrismaClient } from '@prisma/client'
import { logTxt } from './src/query/utils'
const prisma = new PrismaClient()

async function main() {

    const segus_det = await prisma.tbl_segus_det.findMany({
        where: {
            segus_det_dsc: {
                contains: 'ECOGRA'
            }
        },
        take: 10,
    })
    console.log(segus_det)

    // todo: MODIFICAR SEGUS_DET filtando por segus_det_dsc RX
    const update_segus_det = await prisma.tbl_segus_det.updateMany({
        where: {
            tbl_segus: {
                segus_area_cod: 51
            },
        },
        data: {
            segus_det_estado: 1
        },
    })

    const update_tarifa_det = await prisma.tbl_tarifariodet.updateMany({
        where: {
            tbl_segus: {
                segus_area_cod: 51
            },
        },
        data: {
            tarifariodet_estado: 0,
        }
    })

    const update_negociacionDet = await prisma.tbl_negociacionpreciodet.deleteMany({
        where: {
            tbl_tarifariodet:{
                tbl_segus: {
                    segus_area_cod: 51
                }
            }
        },
    })

    // const updateSegusArea = await prisma.tbl_segus.update

    logTxt({
        conteo: update_segus_det.count,
        update_segus_det,
        conteo_tarifa: update_tarifa_det.count,
        update_tarifa_det,
        conteo_delete: update_negociacionDet.count
    })

    //todo: total de modificados log
    console.log(update_segus_det.count)

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




