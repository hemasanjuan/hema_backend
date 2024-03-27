
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { Context } from '../context';

const JWT_SECRET = process.env.JWT_SECRET || 'minamanta';

type jwt = {
  userId: string
}


export const generateId = () => {
  const random = Math.random().toString(36).substr(2, 9);
  const date = Date.now().toString(36);
  return `${random}${date}`;
}

export const getUserId = (context: Context) => {
  const Authorization = context.req.headers.authorization

  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')
    const { user }: any = jwt.verify(token, JWT_SECRET) as jwt
    return user
  }

  throw new Error('No estas autenticado.')
}

export const exprEmail = (email: string) => {
  const exprEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
  if (!exprEmail.test(email)) {
    throw new Error('Email no valido.')
  }
  return email
}


export const newIdEmpresa = (ultimo_objeto: any) => {
  let nuevo_codigo: string
  const ultimo_codigo = ultimo_objeto[0].maximo

  if (ultimo_codigo == null) {
    nuevo_codigo = "E00001"
  }
  else {
    const ultimo_numero: number = parseInt((ultimo_codigo).slice(1))
    const siguiente: string = String(ultimo_numero + 1)
    nuevo_codigo = 'E' + ('0'.repeat(5 - siguiente.length)) + siguiente
  }
  return nuevo_codigo
}


export const newIdLlamada = (ultimo_objeto: any) => {
  let nuevo_codigo: string
  const ultimo_codigo = ultimo_objeto[0].maximo

  if (ultimo_codigo == null) {
    nuevo_codigo = "L000001"
  }
  else {
    const ultimo_numero: number = parseInt((ultimo_codigo).slice(1))
    const siguiente: string = String(ultimo_numero + 1)
    nuevo_codigo = 'L' + ('0'.repeat(6 - siguiente.length)) + siguiente
  }
  return nuevo_codigo
}


export const hashPassword = async (password: string) => {
  if (password.length < 8) {
    throw new Error('Password debe tener al menos 8 caracteres')
  }

  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

export const hashPin = async (pin: string) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(pin, salt)
}

export const validatePassword = async (requestPassword: string, password: string) => {
  return await bcrypt.compare(requestPassword, password);
}

export const generateToken = (user: number) => {
  return jwt.sign({ user }, JWT_SECRET, { expiresIn: '90 days' })
}

export const diferenciaFechasToHoras = (fecha_ini: any) => {
  let fecha_fin = new Date()
  let diff = fecha_fin.getTime() - fecha_ini.getTime()
  let horas = Math.floor(diff / 3600000)
  return horas
}


export const FormatDateTimeSQLServer = (date: any) => {
  //Todo: Formato de fecha para SQL Server "2022-10-06T20:10:40.433Z"
  let fecha = new Date(date)
  let dia = (String(fecha.getDate())).padStart(2, "0");
  let mes = (String(fecha.getMonth() + 1)).padStart(2, "0")
  let anio = fecha.getFullYear()
  let hora = (String(fecha.getHours())).padStart(2, "0")
  let minuto = (String(fecha.getMinutes())).padStart(2, "0")
  let segundo = (String(fecha.getSeconds())).padStart(2, "0")
  let milisegundo = (String(fecha.getMilliseconds())).padStart(3, "0")

  let fecha_formateada = `${anio}-${mes}-${dia}T${hora}:${minuto}:${segundo}.${milisegundo}Z`
  return fecha_formateada
}


export const convertDateTimeV1 = (date: any) => {
  //Todo: convert "2022-10-06T20:10:40.433Z" to "2022-10-06 20:10:40.433" datetime
  const date2 = date.replace("T", " ").replace("Z", "")
  let fecha = new Date(date2)
  let dia = (String(fecha.getDate())).padStart(2, "0");
  let mes = (String(fecha.getMonth() + 1)).padStart(2, "0")
  let anio = fecha.getFullYear()
  let hora = (String(fecha.getHours())).padStart(2, "0")
  let minuto = (String(fecha.getMinutes())).padStart(2, "0")
  let segundo = (String(fecha.getSeconds())).padStart(2, "0")
  let milisegundo = (String(fecha.getMilliseconds())).padStart(3, "0")

  let fecha_formateada = `${anio}-${mes}-${dia} ${hora}:${minuto}:${segundo}.${milisegundo}`
  return fecha_formateada
}


export const convertDateTimeV2 = (date: any) => {
  //Todo: convert "2022-10-06T20:10:40.433Z" to "2022-10-06 20:10:40.433" datetime
  const date2 = date.replace("T", " ").replace("Z", "")
  let fecha_formateada = new Date(date2)
  return fecha_formateada
}


// convertDateTime("2022-10-06T20:10:40.433Z")