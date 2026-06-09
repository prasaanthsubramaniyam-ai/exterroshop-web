"use client";

import * as React from "react";
import { Upload, Download, FileText, CheckCircle2, XCircle } from "lucide-react";
import { bulkUploadService } from "@/services/wellness.service";
import type { BulkUploadResult } from "@/types/wellness";

export default function BulkUploadPage() {
  const [dragging, setDragging] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [result, setResult] = React.useState<BulkUploadResult | null>(null);
  const [history, setHistory] = React.useState<BulkUploadResult[]>([]);
  const [loadingHistory, setLoadingHistory] = React.useState(true);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    bulkUploadService
      .history()
      .then(setHistory)
      .catch(() => undefined)
      .finally(() => setLoadingHistory(false));
  }, []);

  const handleFile = (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls", "json"].includes(ext ?? "")) {
      alert("Only CSV, XLSX, XLS, or JSON files are supported.");
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await bulkUploadService.upload(file);
      setResult(res);
      setFile(null);
      bulkUploadService.history().then(setHistory).catch(() => undefined);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const res = await bulkUploadService.downloadTemplate();
      const blob = new Blob([res.data as BlobPart], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "user_upload_template.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download template");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bulk User Upload</h1>
          <p className="text-muted-foreground text-sm mt-1">Upload CSV, Excel, or JSON to create multiple users at once</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
        >
          <Download className="size-4" /> Download Template
        </button>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
          dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        <Upload className="mx-auto size-10 text-muted-foreground mb-4" />
        {file ? (
          <div>
            <p className="font-semibold text-primary">{file.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div>
            <p className="font-medium">Drop your file here or click to browse</p>
            <p className="text-sm text-muted-foreground mt-1">Supports CSV, XLSX, XLS, JSON</p>
          </div>
        )}
      </div>

      {file && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-white disabled:opacity-70 hover:bg-primary/90 transition-colors"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Uploading…
            </span>
          ) : (
            "Upload & Process"
          )}
        </button>
      )}

      {/* Result */}
      {result && (
        <div className={`rounded-xl border p-5 space-y-4 ${
          result.uploadStatus === "COMPLETED" ? "border-green-200 bg-green-50" :
          result.uploadStatus === "FAILED" ? "border-red-200 bg-red-50" :
          "border-yellow-200 bg-yellow-50"
        }`}>
          <div className="flex items-center gap-3">
            {result.failedRecords === 0 ? (
              <CheckCircle2 className="size-6 text-green-600" />
            ) : (
              <XCircle className="size-6 text-yellow-600" />
            )}
            <div>
              <p className="font-semibold">{result.uploadStatus.replace("_", " ")}</p>
              <p className="text-sm text-muted-foreground">{result.fileName}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <Stat label="Total" value={result.totalRecords} />
            <Stat label="Succeeded" value={result.successRecords} color="text-green-600" />
            <Stat label="Failed" value={result.failedRecords} color="text-red-600" />
          </div>
          {result.errors.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Errors:</p>
              <div className="max-h-40 overflow-y-auto rounded-lg bg-white/60 p-3 space-y-1">
                {result.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-700">{err}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="font-semibold text-lg mb-4">Upload History</h2>
        {loadingHistory ? (
          <div className="flex items-center justify-center py-8">
            <div className="size-6 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-10 text-muted-foreground">
            <FileText className="size-6 mr-2" /> No upload history
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <FileText className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{h.fileName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600">{h.successRecords} ok</span>
                  {h.failedRecords > 0 && <span className="text-red-500">{h.failedRecords} failed</span>}
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    h.uploadStatus === "COMPLETED" ? "bg-green-100 text-green-700" :
                    h.uploadStatus === "FAILED" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {h.uploadStatus.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="text-center">
      <p className={`text-xl font-bold ${color ?? ""}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
