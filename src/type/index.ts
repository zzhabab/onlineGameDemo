export interface MyResponseType<T = any> {
  code: number;
  message: string;
  data: T
}
export interface Http {
  [key: string]: <T>(data?: {} | undefined) => Promise<MyResponseType<T>>
}