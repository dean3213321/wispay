import { Hono } from "hono"
import { addStudentCreditController, getStudentController, getStudentTransactionHistoryController } from "./index.js"


const router = new Hono()
  .get('/api/students', getStudentController)
  .get('/api/studentsTransactions', getStudentTransactionHistoryController)
  .post('/api/studentsCredits', addStudentCreditController)
  
export default router 