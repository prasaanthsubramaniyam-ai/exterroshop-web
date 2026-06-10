"use client";

import * as React from "react";
import { departmentService, Department } from "@/services/department.service";

export default function DepartmentsPage() {
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadDepartments = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await departmentService.getAllDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Failed to load departments", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Departments</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div key={dept.id} className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg">{dept.departmentName}</h3>
            <p className="text-sm text-gray-500">{dept.departmentCode}</p>
            {dept.description && (
              <p className="text-sm mt-2">{dept.description}</p>
            )}
            <div className="mt-4 flex gap-4 text-sm">
              <span>{dept.employeeCount} employees</span>
              <span>{dept.teamCount} teams</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
