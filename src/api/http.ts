import { get, post } from './index'
import { Http } from '@/type/index'

export const http: Http = {
  test: <T>(data?: {} | undefined) => post<T>("/test", data)
}