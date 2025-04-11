import { useEffect, useState } from 'react';

// Import DataTable and DT from the utils folder
import { DataTable, DT } from "./utils/datatables-imports.js";

DataTable.use(DT);

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/students');
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        const data = await response.json();
        setStudents(data);
      } catch (err) {
        setError(err.message || 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const columns = [
    { title: "ID", data: "id" },
    { title: "First Name", data: "fname" },
    { title: "Last Name", data: "lname" },
    { title: "Position", data: "position" },
    { title: "RFID", data: "rfid" },
    { 
      title: "Balance", 
      data: "balance",
      render: function(data) {
        return parseFloat(data).toFixed(2);
      }
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Student Database</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <DataTable
          className="display cell-border"
          columns={columns}
          data={students}
          options={{
            responsive: true,
            select: true,
            dom: '<"d-flex justify-content-between"lf>rt<"d-flex justify-content-between"ip>B',
            buttons: ["copy", "csv", "excel", "pdf", "print", "colvis"],
          }}
        />
      </div>
    </div>
  );
};

export default Students;