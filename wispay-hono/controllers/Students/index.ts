import { type  Context } from "hono"
import { addStudentCreditData, getStudentsData, getStudentTransactionHistoryData } from "../../data/Students.js";


export function getStudentController(c: Context) {
    return getStudentsData(c);
  }

export function getStudentTransactionHistoryController(c: Context) {
    return getStudentTransactionHistoryData(c);
  }

export function addStudentCreditController(c: Context) {
    return addStudentCreditData(c);
  }