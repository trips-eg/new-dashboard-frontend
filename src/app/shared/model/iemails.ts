
export interface Iemails {
  success: boolean
  data: Data
  message: any
}

export interface Data {
  pageIndex: number
  pageSize: number
  count: number
  pagesCount: number
  itemsCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  data: Daum[]
}

export interface Daum {
  id: number
  name: string
  userId: number
  email: string
  purpose: number
  type: number
  template: string
  handlebars: string
  isSend: boolean
}
