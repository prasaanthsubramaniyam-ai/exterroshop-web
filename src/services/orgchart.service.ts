import client, { unwrap } from "./api";

export interface OrgChartNode {
  id: number;
  name: string;
  avatarUrl?: string;
  employeeCode?: string;
  jobTitle?: string;
  designationTitle?: string;
  designationLevel?: number;
  departmentName?: string;
  departmentCode?: string;
  location?: string;
  userStatus?: string;
  employmentType?: string;
  children?: OrgChartNode[];
}

export const orgChartService = {
  getTree(departmentId?: number): Promise<OrgChartNode[]> {
    const params = departmentId ? { departmentId } : undefined;
    return client.get("/org-chart", { params }).then(unwrap);
  },

  getSubtree(rootId: number): Promise<OrgChartNode> {
    return client.get(`/org-chart/${rootId}/subtree`).then(unwrap);
  },
};
