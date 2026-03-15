
export interface INotification {
  id: number
  title: string
  body: string
  dateRead: any
  isRead: boolean
  userId: number
  imageUrl: string
  user: User
}

export interface User {
  deviceToken: string
  imageUrl: string
  iActive: boolean
  id: number
  name: string
  email: string
  userName: string
  phoneNumber: string
  nationality: any
}