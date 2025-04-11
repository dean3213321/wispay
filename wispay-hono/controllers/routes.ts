import studentRouter  from './Students/routes.js'

export const routes = [studentRouter] as const

export type AppRoutes = typeof routes[number];