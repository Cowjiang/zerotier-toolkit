export type InvokeResponse = {
  code: number
  message?: string
  data: any
}

export type HttpResponse<T> = {
  ok: boolean
  status: number
  data: T
}
