"use client";

import * as React from "react";
import { teamService, Team } from "@/services/team.service";

export default function TeamsPage() {
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadTeams = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await teamService.getAllTeams();
      setTeams(data);
    } catch (error) {
      console.error("Failed to load teams", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Teams</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <div key={team.id} className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg">{team.teamName}</h3>
            <p className="text-sm text-gray-500">{team.teamCode}</p>
            <p className="text-sm text-gray-600 mt-1">{team.departmentName}</p>
            {team.description && (
              <p className="text-sm mt-2">{team.description}</p>
            )}
            <div className="mt-4 flex gap-4 text-sm">
              <span>{team.memberCount} members</span>
              <span className="text-gray-500">{team.teamType}</span>
            </div>
            {team.teamLead && (
              <div className="mt-2 text-sm text-gray-600">
                Lead: {team.teamLead.name}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
