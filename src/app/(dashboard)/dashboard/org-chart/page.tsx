"use client";

import * as React from "react";
import {
  Network,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  ChevronRight,
  Users,
} from "lucide-react";
import { orgChartService, type OrgChartNode } from "@/services/orgchart.service";
import { departmentService } from "@/services/department.service";
import type { Department } from "@/types";

// ── helpers ───────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function countNodes(node: OrgChartNode): number {
  return 1 + (node.children ?? []).reduce((s, c) => s + countNodes(c), 0);
}

function searchTree(node: OrgChartNode, q: string): boolean {
  const lq = q.toLowerCase();
  const match =
    node.name.toLowerCase().includes(lq) ||
    (node.jobTitle ?? "").toLowerCase().includes(lq) ||
    (node.designationTitle ?? "").toLowerCase().includes(lq) ||
    (node.departmentName ?? "").toLowerCase().includes(lq) ||
    (node.employeeCode ?? "").toLowerCase().includes(lq);
  return match || (node.children ?? []).some((c) => searchTree(c, q));
}

// ── OrgNode card ──────────────────────────────────────────────────────────────

const DEPT_COLORS: Record<string, string> = {
  Engineering: "bg-blue-500",
  UX: "bg-purple-500",
  Product: "bg-teal-500",
  QA: "bg-yellow-500",
  DevOps: "bg-orange-500",
  Sales: "bg-green-500",
  HR: "bg-pink-500",
  Finance: "bg-emerald-500",
  Operations: "bg-cyan-500",
  Support: "bg-sky-500",
  "AI/ML": "bg-violet-500",
  Security: "bg-red-500",
  Management: "bg-amber-500",
};

function deptColor(dept?: string): string {
  if (!dept) return "bg-gray-400";
  for (const [key, cls] of Object.entries(DEPT_COLORS)) {
    if (dept.toLowerCase().includes(key.toLowerCase())) return cls;
  }
  return "bg-primary";
}

function NodeCard({
  node,
  highlight,
  depth,
}: {
  node: OrgChartNode;
  highlight: string;
  depth: number;
}) {
  const [collapsed, setCollapsed] = React.useState(depth >= 3);
  const hasChildren = (node.children ?? []).length > 0;
  const isHighlighted =
    highlight &&
    (node.name.toLowerCase().includes(highlight.toLowerCase()) ||
      (node.jobTitle ?? "").toLowerCase().includes(highlight.toLowerCase()) ||
      (node.employeeCode ?? "").toLowerCase().includes(highlight.toLowerCase()));

  const colorBar = deptColor(node.departmentName);

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <div
        className={`relative w-48 rounded-xl border shadow-sm bg-background transition-all duration-200 ${
          isHighlighted
            ? "ring-2 ring-primary shadow-primary/20 shadow-lg"
            : "border-border hover:shadow-md hover:border-primary/30"
        }`}
      >
        {/* Department colour bar */}
        <div className={`${colorBar} h-1.5 rounded-t-xl`} />

        <div className="p-3">
          {/* Avatar */}
          <div className="flex items-start gap-2.5 mb-2">
            {node.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={node.avatarUrl}
                alt={node.name}
                className="size-10 rounded-full object-cover shrink-0 border-2 border-border"
              />
            ) : (
              <div
                className={`size-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${colorBar}`}
              >
                {initials(node.name)}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-xs leading-tight truncate" title={node.name}>
                {node.name}
              </p>
              {(node.jobTitle || node.designationTitle) && (
                <p className="text-[10px] text-muted-foreground truncate mt-0.5" title={node.jobTitle ?? node.designationTitle}>
                  {node.jobTitle ?? node.designationTitle}
                </p>
              )}
            </div>
          </div>

          {/* Meta */}
          {node.departmentName && (
            <p className="text-[10px] text-muted-foreground truncate">
              {node.departmentName}
            </p>
          )}
          {node.employeeCode && (
            <p className="text-[10px] font-mono text-muted-foreground/70 mt-0.5">
              {node.employeeCode}
            </p>
          )}

          {/* Report count + collapse toggle */}
          {hasChildren && (
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors w-full"
            >
              {collapsed ? (
                <ChevronRight className="size-3 shrink-0" />
              ) : (
                <ChevronDown className="size-3 shrink-0" />
              )}
              <span>{(node.children ?? []).length} report{(node.children ?? []).length !== 1 ? "s" : ""}</span>
            </button>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && !collapsed && (
        <div className="flex flex-col items-center">
          {/* Vertical connector from card to horizontal bar */}
          <div className="w-px h-6 bg-border" />

          {/* Horizontal spread */}
          <div className="relative flex gap-6 items-start">
            {/* Horizontal bar */}
            {(node.children ?? []).length > 1 && (
              <div
                className="absolute top-0 h-px bg-border"
                style={{
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: `calc(100% - 12rem)`,
                }}
              />
            )}

            {(node.children ?? []).map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Short vertical drop to child */}
                <div className="w-px h-6 bg-border" />
                <NodeCard node={child} highlight={highlight} depth={depth + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OrgChartPage() {
  const [tree, setTree] = React.useState<OrgChartNode[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filterDept, setFilterDept] = React.useState<string>("");
  const [zoom, setZoom] = React.useState(1);
  const canvasRef = React.useRef<HTMLDivElement>(null);

  // pan state
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [dragging, setDragging] = React.useState(false);
  const isDragging = React.useRef(false);
  const lastPos = React.useRef({ x: 0, y: 0 });

  const load = React.useCallback((deptId?: number) => {
    setLoading(true);
    orgChartService
      .getTree(deptId)
      .then(setTree)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    departmentService.getAll().then(setDepartments).catch(() => undefined);
    load();
  }, [load]);

  const handleDeptChange = (v: string) => {
    setFilterDept(v);
    load(v ? Number(v) : undefined);
  };

  // Filter tree by search (only show branches that match)
  const visibleTree = React.useMemo(() => {
    if (!search) return tree;
    return tree.filter((root) => searchTree(root, search));
  }, [tree, search]);

  const totalPeople = React.useMemo(
    () => tree.reduce((s, n) => s + countNodes(n), 0),
    [tree]
  );

  // Mouse pan handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    setDragging(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  };
  const onMouseUp = () => { isDragging.current = false; setDragging(false); };

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -m-6 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-2">
          <Network className="size-5 text-primary" />
          <div>
            <h1 className="text-lg font-bold leading-tight">Org Chart</h1>
            {!loading && (
              <p className="text-xs text-muted-foreground">
                {totalPeople} people
              </p>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-wrap gap-3 justify-end">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              className="rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Search name, title, code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Department filter */}
          <select
            value={filterDept}
            onChange={(e) => handleDeptChange(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
              className="p-1.5 hover:bg-muted rounded transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="size-3.5" />
            </button>
            <span className="text-xs font-medium w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
              className="p-1.5 hover:bg-muted rounded transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="size-3.5" />
            </button>
          </div>
          <button
            onClick={resetView}
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 hover:bg-muted transition-colors"
            title="Reset view"
          >
            <Maximize2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 overflow-hidden relative bg-muted/30 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* Dot-grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          </div>
        ) : visibleTree.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Users className="size-12 text-muted-foreground" />
            <p className="text-muted-foreground font-medium">
              {search ? "No results found" : "No org chart data yet"}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-sm text-primary hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div
            className="absolute inset-0 flex items-start justify-center pt-8 px-8"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center top",
              transition: dragging ? "none" : "transform 0.15s ease",
            }}
          >
            <div className="flex gap-16 items-start">
              {visibleTree.map((root) => (
                <NodeCard key={root.id} node={root} highlight={search} depth={0} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      {!loading && visibleTree.length > 0 && (
        <div className="shrink-0 border-t border-border bg-background px-6 py-2 overflow-x-auto">
          <div className="flex gap-4 text-[10px] text-muted-foreground whitespace-nowrap">
            <span className="font-medium text-foreground">Departments:</span>
            {Object.entries(DEPT_COLORS).map(([name, cls]) => (
              <span key={name} className="flex items-center gap-1">
                <span className={`inline-block size-2 rounded-full ${cls}`} />
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
