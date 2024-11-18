import axios from "axios"
import { MyResponseType } from '@/type/index'

axios.defaults.baseURL = 'http://localhost:9123'

export const get = <T = any>(url: string, params = {}): Promise<MyResponseType<T>> => {
  return new Promise((resolve, reject) => {
    axios.get(url, params).then((res) => {
      resolve(res.data)
    }).catch((err) => {
      reject(err)
    })
  })
}

export const post = <T = any>(url: string, params = {}): Promise<MyResponseType<T>> => {
  return new Promise((resolve, reject) => {
    axios.post(url, params).then((res) => {
      resolve(res.data)
    }).catch((err) => {
      reject(err)
    })
  })
}

axios.interceptors.request.use(req => {
  return req
})

axios.interceptors.response.use(res => {
  return res
})