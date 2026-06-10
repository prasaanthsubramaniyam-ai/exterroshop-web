"use client";

import * as React from "react";
import { designationService, Designation } from "@/services/designation.service";

export default function DesignationsPage() {
  const [designations, setDesignations] = React.useState<Designation[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadDesignations = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await designationService.getAllDesignations();
      setDesignations(data);
    } catch (error) {
      console.error("Failed to load designations", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadDesignations();
  }, [loadDesignations]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Designations</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {designations.map((desig) => (
          <div key={desig.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{desig.designationName}</h3>
                <p className="text-sm text-gray-500">{desig.designationCode}</p>
              </div>
              {desig.level && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {desig.level}
                </span>
              )}
            </div>
            {desig.levelName && (
              <p className="text-sm text-gray-600 mt-1">{desig.levelName}</p>
            )}
            {desig.departmentName && (
              <p className="text-sm text-gray-600 mt-1">Dept: {desig.departmentName}</p>
            )}
            {desig.description && (
              <p className="text-sm mt-2 text-gray-700">{desig.description}</p>
            )}
            <div className="mt-4 text-sm text-gray-500">
              {desig.employeeCount} employees
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
