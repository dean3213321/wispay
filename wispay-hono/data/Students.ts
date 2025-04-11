import { type Context } from "hono";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Add BigInt serialization support (place this at your application entry point)
(BigInt.prototype as any).toJSON = function() {
  return this.toString();
};

export async function getStudentsData(c: Context) {
    try {
      // Fetch all active students from the "user" table
      const students = await prisma.user.findMany({
        where: {
          position: 'Student',
          isactive: 1,
        },
        select: {
          id: true,
          fname: true,
          lname: true,
          position: true,
          rfid: true,
        },
      });

      // Process students with their balances
      const studentsWithBalance = await Promise.all(
        students.map(async (student) => {
          try {
            // Convert BigInt rfid to string for safer handling
            const rfidString = student.rfid.toString();
            
            // Fetch transactions for the student
            const transactions = await prisma.wispay.findMany({
              where: {
                rfid: student.rfid,
              },
              select: {
                debit: true,
                credit: true,
              },
            });

            // Calculate balance with proper decimal handling
            const totalDebit = transactions.reduce(
              (sum, tx) => sum + parseFloat(tx.debit.toString()),
              0
            );
            const totalCredit = transactions.reduce(
              (sum, tx) => sum + parseFloat(tx.credit.toString()),
              0
            );

            const balance = (totalCredit - totalDebit).toFixed(2);

            return {
              id: student.id,
              fname: student.fname,
              lname: student.lname,
              position: student.position,
              rfid: rfidString, // Return as string
              balance: parseFloat(balance), // Convert back to number
            };
          } catch (error) {
            console.error(`Error processing student ${student.id}:`, error);
            return {
              ...student,
              rfid: student.rfid.toString(),
              balance: 0,
              error: "Balance calculation failed"
            };
          }
        })
      );

      return c.json(studentsWithBalance);
    } catch (error) {
      console.error("Error in getStudentsData:", error);
      return c.json({
        error: "Failed to fetch student data",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 500);
    }
}

export async function getStudentTransactionHistoryData(c: Context) {
  try {
    // Get RFID from query parameters
    const rfid = c.req.query('rfid');
    if (!rfid) {
      return c.json({ error: "RFID parameter is required" }, 400);
    }

    // Convert RFID to BigInt
    const rfidBigInt = BigInt(rfid);

    // Fetch student details
    const student = await prisma.user.findFirst({
      where: {
        rfid: rfidBigInt,
        isactive: 1,
      },
      select: {
        fname: true,
        lname: true,
      },
    });

    if (!student) {
      return c.json({ error: "Student not found or inactive" }, 404);
    }

    // Fetch all transactions for the student
    const transactions = await prisma.wispay.findMany({
      where: {
        rfid: rfidBigInt,
      },
      orderBy: {
        transdate: 'desc', // Show most recent transactions first
      },
    });

    // Calculate current balance
    let balance = 0;
    transactions.forEach(tx => {
      balance += parseFloat(tx.credit.toString()) - parseFloat(tx.debit.toString());
    });

    // Format the response
    const response = {
      studentName: `${student.fname} ${student.lname}`,
      currentBalance: balance.toFixed(2),
      transactions: transactions.map(tx => ({
        name: tx.product_name,
        priceAndProduct: `${tx.product_type} - ${tx.product_name}`,
        quantity: tx.quantity,
        debit: tx.debit.toString(),
        credit: tx.credit.toString(),
        transactionDate: tx.transdate,
        processedBy: tx.processedby,
        referenceCode: tx.refcode,
      })),
    };

    return c.json(response);
  } catch (error) {
    console.error("Error in getStudentTransactionHistory:", error);
    return c.json({
      error: "Failed to fetch transaction history",
      details: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
}

export async function addStudentCreditData(c: Context) {
  try {
    // Parse request body
    const body = await c.req.json();
    const { rfid, amount, processedBy, productType = "Top-up", productName = "Account Credit" } = body;

    // Validate required fields
    if (!rfid || !amount || !processedBy) {
      return c.json({ error: "RFID, amount, and processedBy are required" }, 400);
    }

    // Convert amount to Decimal
    const creditAmount = parseFloat(amount);
    if (isNaN(creditAmount)) {
      return c.json({ error: "Amount must be a valid number" }, 400);
    }

    // Verify student exists
    const student = await prisma.user.findFirst({
      where: { rfid: BigInt(rfid), isactive: 1 },
      select: { 
        fname: true, 
        lname: true, 
        empno: true,  // Changed from empid to empno
        username: true 
      }
    });

    if (!student) {
      return c.json({ error: "Active student not found" }, 404);
    }

    // Create credit transaction
    const transaction = await prisma.wispay.create({
      data: {
        rfid: BigInt(rfid),
        empid: student.empno,  // Changed from empid to empno
        username: student.username,
        debit: 0,
        credit: creditAmount,
        processedby: processedBy,
        product_type: productType,
        product_name: productName,
        quantity: 1,
        refcode: `CREDIT-${Date.now()}`,
        transdate: new Date()
      }
    });

    // Get updated balance
    const transactions = await prisma.wispay.findMany({
      where: { rfid: BigInt(rfid) }
    });

    const balance = transactions.reduce((sum, tx) => {
      return sum + parseFloat(tx.credit.toString()) - parseFloat(tx.debit.toString());
    }, 0);

    return c.json({
      success: true,
      message: "Credit added successfully",
      studentName: `${student.fname} ${student.lname}`,
      newBalance: balance.toFixed(2),
      transaction: {
        id: transaction.id,
        amount: creditAmount,
        reference: transaction.refcode,
        date: transaction.transdate
      }
    });

  } catch (error) {
    console.error("Error in addStudentCredit:", error);
    return c.json({
      error: "Failed to add credit",
      details: error instanceof Error ? error.message : "Unknown error"
    }, 500);
  }
}