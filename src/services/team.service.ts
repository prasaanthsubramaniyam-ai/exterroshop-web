import client, { unwrap } from "./api";

export interface TeamMember {
  id: number;
  teamId: number;
  employee: {
    id: number;
    name: string;
    email: string;
    avatarUrl?: string;
    department?: string;
    designation?: string;
  };
  roleInTeam?: string;
  joinedDate: string;
  isActive: boolean;
}

export interface Team {
  id: number;
  teamCode: string;
  teamName: string;
  departmentId: number;
  departmentName: string;
  teamLead?: {
    id: number;
    name: string;
    email: string;
  };
  description?: string;
  teamType: string;
  status: string;
  memberCount: number;
  members?: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamPayload {
  teamCode: string;
  teamName: string;
  departmentId: number;
  teamLeadId?: number;
  description?: string;
  teamType?: string;
  status?: string;
  memberIds?: number[];
}

export const teamService = {
  async getAllTeams(): Promise<Team[]> {
    const response = await client.get("/teams");
    return unwrap(response);
  },

  async getTeamById(id: number): Promise<Team> {
    const response = await client.get(`/teams/${id}`);
    return unwrap(response);
  },

  async getTeamsByDepartment(departmentId: number): Promise<Team[]> {
    const response = await client.get(`/teams/department/${departmentId}`);
    return unwrap(response);
  },

  async createTeam(payload: CreateTeamPayload): Promise<Team> {
    const response = await client.post("/teams", payload);
    return unwrap(response);
  },

  async updateTeam(id: number, payload: CreateTeamPayload): Promise<Team> {
    const response = await client.put(`/teams/${id}`, payload);
    return unwrap(response);
  },

  async deleteTeam(id: number): Promise<void> {
    await client.delete(`/teams/${id}`);
  },

  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    const response = await client.get(`/teams/${teamId}/members`);
    return unwrap(response);
  },

  async addTeamMember(teamId: number, employeeId: number): Promise<TeamMember> {
    const response = await client.post(`/teams/${teamId}/members/${employeeId}`);
    return unwrap(response);
  },

  async removeTeamMember(teamId: number, employeeId: number): Promise<void> {
    await client.delete(`/teams/${teamId}/members/${employeeId}`);
  },
};
