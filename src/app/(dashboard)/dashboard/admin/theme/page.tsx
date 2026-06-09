"use client";

import * as React from "react";
import { Palette, Save, RotateCcw, Check, X } from "lucide-react";
import { cmsService, type CmsSetting } from "@/services/cms.service";
import { useCms } from "@/context/CmsContext";
import { cn } from "@/lib/utils";
import { RoleGuard } from "@/components/auth/RoleGuard";

// Friendly display names used when the DB setting is missing (migration pending)
const KEY_LABELS: Record<string, string> = {
  "app.logo.url":  "Logo Icon",
  "app.logo.name": "Logo Wordmark",
};

// ── Token groups we render in the theme editor ───────────────────────────────

type RowType = "color" | "image_url" | "text";

interface TokenGroup {
  title: string;
  description: string;
  keys: string[];
  /** Per-key row type override — takes precedence over the valueType from the DB. */
  rowTypes?: Record<string, RowType>;
}

const TOKEN_GROUPS: TokenGroup[] = [
  {
    title: "Brand Colors",
    description: "Primary palette used across buttons, links, and highlights.",
    keys: ["theme.color.primary", "theme.color.primary-dark", "theme.color.primary-light"],
  },
  {
    title: "Typography",
    description: "Font family and scale settings.",
    keys: ["theme.font.family"],
  },
  {
    title: "Shape",
    description: "Border radius used on cards, inputs, and buttons.",
    keys: ["theme.border-radius.base"],
  },
  {
    title: "Card Shadow",
    description: "Box-shadow applied to product cards. Accepts any valid CSS box-shadow value.",
    keys: ["theme.card-shadow"],
  },
  {
    title: "Button Shadow",
    description: "Box-shadow applied to primary action buttons. Accepts any valid CSS box-shadow value.",
    keys: ["theme.button-shadow"],
  },
  {
    title: "Branding",
    description: "Logo icon and wordmark images shown in the sidebar and header.",
    keys: ["app.logo.url", "app.logo.name"],
    // Both branding fields are image uploads regardless of what value_type the DB stored
    rowTypes: { "app.logo.url": "image_url", "app.logo.name": "image_url" },
  },
];

// ── Components ────────────────────────────────────────────────────────────────

interface ColorRowProps {
  setting: CmsSetting;
  draft: string;
  onChange: (key: string, value: string) => void;
}

function ColorRow({ setting, draft, onChange }: ColorRowProps) {
  return (
    <div className="flex items-center gap-4">
      <input
        type="color"
        value={draft}
        onChange={(e) => onChange(setting.settingKey, e.target.value)}
        className="h-10 w-14 cursor-pointer rounded-lg border border-border p-0.5"
        title={setting.label ?? setting.settingKey}
      />
      <div className="flex-1">
        <p className="text-sm font-medium">{setting.label ?? setting.settingKey}</p>
        <p className="text-xs text-muted-foreground">{setting.description}</p>
      </div>
      <input
        value={draft}
        onChange={(e) => onChange(setting.settingKey, e.target.value)}
        className="w-28 rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

interface TextRowProps {
  setting: CmsSetting;
  draft: string;
  onChange: (key: string, value: string) => void;
}

function TextRow({ setting, draft, onChange }: TextRowProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium">{setting.label ?? setting.settingKey}</p>
        <p className="text-xs text-muted-foreground">{setting.description}</p>
      </div>
      <input
        value={draft}
        onChange={(e) => onChange(setting.settingKey, e.target.value)}
        className="w-52 rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

interface ImageUploadRowProps {
  setting: CmsSetting;
  draft: string;
  onChange: (key: string, value: string) => void;
}

function ImageUploadRow({ setting, draft, onChange }: ImageUploadRowProps) {
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      onChange(setting.settingKey, reader.result as string);
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.onerror = () => {
      setUploadError("Could not read the file. Try again.");
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  // Preview: show thumbnail above the input when a value is set
  const hasImage = draft.startsWith("data:") || draft.startsWith("http");

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="mb-1.5 text-sm font-medium">{setting.label ?? setting.settingKey}</p>

          {/* Input row: text field + Upload button inside */}
          <div className="flex items-center overflow-hidden rounded-lg border border-border bg-background focus-within:ring-2 focus-within:ring-primary/30">
            {/* Thumbnail pill inside the input when image is set */}
            {hasImage && (
              <div className="flex shrink-0 items-center gap-1.5 border-r border-border pl-2 pr-2 py-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={draft} alt="" className="h-6 w-6 rounded object-contain" />
                <button
                  type="button"
                  onClick={() => onChange(setting.settingKey, "")}
                  className="text-muted-foreground hover:text-destructive"
                  title="Remove"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            <span className="flex-1 px-3 py-2 text-sm text-muted-foreground select-none truncate">
              {hasImage ? "Image uploaded" : "Add file URL"}
            </span>

            {/* Upload button — right side of the input */}
            <label
              className={cn(
                "flex shrink-0 cursor-pointer items-center gap-1.5 border-l border-border bg-muted px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/80",
                uploading && "pointer-events-none opacity-60"
              )}
            >
              {uploading ? "Reading…" : "Upload"}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/svg+xml,image/jpeg"
                className="sr-only"
                onChange={handleFile}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </div>

      {uploadError && (
        <p className="text-xs text-destructive">{uploadError}</p>
      )}
    </div>
  );
}

// ── Preview panel ─────────────────────────────────────────────────────────────

function LivePreview({ drafts }: { drafts: Record<string, string> }) {
  const primary      = drafts["theme.color.primary"]      ?? "#FF2F01";
  const primaryLight = drafts["theme.color.primary-light"] ?? "#FF8866";
  const radius       = `${drafts["theme.border-radius.base"] ?? "12"}px`;
  const font         = drafts["theme.font.family"]         ?? "DM Sans";
  const cardShadow   = drafts["theme.card-shadow"]         ?? "0 2px 8px rgba(0,0,0,0.08)";
  const btnShadow    = drafts["theme.button-shadow"]       ?? "0 8px 24px -4px #ffa591";
  const logoUrl      = drafts["app.logo.url"]  ?? "";
  const wordmarkUrl  = drafts["app.logo.name"] ?? "";

  return (
    <div
      className="rounded-2xl border border-border bg-muted/30 p-6"
      style={{ fontFamily: font }}
    >
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Live Preview
      </p>

      {/* Logo / Branding */}
      <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-border bg-background px-3 py-2">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} className="size-7 object-contain" alt="Logo icon" />
        ) : (
          <div
            className="flex size-7 items-center justify-center rounded-md text-xs font-bold text-white"
            style={{ backgroundColor: primary }}
          >
            E
          </div>
        )}
        {wordmarkUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={wordmarkUrl} className="h-6 w-auto object-contain" alt="Wordmark" />
        ) : (
          <span className="text-sm font-bold tracking-tight text-foreground">ExterroShop</span>
        )}
      </div>

      {/* Button */}
      <div className="mb-4 flex gap-3">
        <button
          className="px-4 py-2 text-sm font-medium text-white transition-transform active:scale-95"
          style={{ backgroundColor: primary, borderRadius: radius, boxShadow: btnShadow }}
        >
          Primary Button
        </button>
        <button
          className="px-4 py-2 text-sm font-medium transition-colors"
          style={{
            backgroundColor: `${primary}18`,
            color: primary,
            borderRadius: radius,
          }}
        >
          Outline Button
        </button>
      </div>

      {/* Card */}
      <div
        className="border border-border bg-background p-4"
        style={{ borderRadius: radius, boxShadow: cardShadow }}
      >
        <div
          className="mb-2 inline-block px-2 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: primaryLight, borderRadius: "9999px" }}
        >
          Badge
        </div>
        <p className="text-sm font-semibold">Card Title</p>
        <p className="text-xs text-muted-foreground">
          This is a sample card using your current theme tokens.
        </p>
      </div>

      {/* Input */}
      <input
        readOnly
        value="Sample input"
        className="mt-4 w-full border bg-background px-3 py-2 text-sm focus:outline-none"
        style={{
          borderColor: primary,
          borderRadius: radius,
          boxShadow: `0 0 0 2px ${primary}22`,
        }}
      />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ThemeEditorPage() {
  const { reload: reloadCms } = useCms();
  const [settings, setSettings] = React.useState<CmsSetting[]>([]);
  const [drafts, setDrafts] = React.useState<Record<string, string>>({});
  const [original, setOriginal] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Load both theme tokens and branding settings in one pass
    Promise.all([
      cmsService.getByCategory("theme"),
      cmsService.getByCategory("branding"),
    ])
      .then(([themeData, brandingData]) => {
        const data = [...themeData, ...brandingData];
        setSettings(data);
        const map: Record<string, string> = {};
        data.forEach((s) => (map[s.settingKey] = s.settingValue ?? ""));
        setDrafts(map);
        setOriginal(map);
      })
      .catch(() => setError("Failed to load theme settings"))
      .finally(() => setLoading(false));
  }, []);

  const onChange = (key: string, value: string) =>
    setDrafts((p) => ({ ...p, [key]: value }));

  const isDirty = React.useMemo(
    () => Object.keys(drafts).some((k) => drafts[k] !== original[k]),
    [drafts, original]
  );

  const handleSave = async () => {
    const changed: Record<string, string> = {};
    Object.keys(drafts).forEach((k) => {
      if (drafts[k] !== original[k]) changed[k] = drafts[k];
    });
    if (!Object.keys(changed).length) return;
    setSaving(true);
    try {
      await cmsService.bulkUpdate(changed);
      setOriginal({ ...drafts });
      await reloadCms();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => setDrafts({ ...original });

  const byKey = React.useMemo(() => {
    const m: Record<string, CmsSetting> = {};
    settings.forEach((s) => (m[s.settingKey] = s));
    return m;
  }, [settings]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center p-6 text-muted-foreground">
        Loading theme settings…
      </div>
    );
  }

  return (
    <RoleGuard roles={["SUPER_ADMIN"]}>
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Palette className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Theme Editor</h1>
            <p className="text-sm text-muted-foreground">
              Live-edit brand tokens — changes are reflected immediately in the preview.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isDirty && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!isDirty || saving}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              isDirty
                ? "bg-primary text-white hover:bg-primary/90"
                : "cursor-not-allowed bg-muted text-muted-foreground",
              "disabled:opacity-60"
            )}
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" /> Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save Changes"}
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Token groups */}
        <div className="space-y-6">
          {TOKEN_GROUPS.map((group) => (
            <div key={group.title} className="rounded-2xl border border-border bg-background p-6">
              <h2 className="mb-1 text-base font-semibold">{group.title}</h2>
              <p className="mb-5 text-sm text-muted-foreground">{group.description}</p>
              <div className="space-y-4">
                {group.keys.map((key) => {
                  // Fallback synthetic setting so the row always renders even if the
                  // DB migration hasn't run yet or returned an unexpected valueType.
                  const setting: CmsSetting = byKey[key] ?? {
                    id: 0,
                    settingKey: key,
                    settingValue: "",
                    category: "",
                    label: KEY_LABELS[key] ?? key,
                    description: null,
                    valueType: "string",
                    isPublic: true,
                    updatedById: null,
                    updatedByName: null,
                    createdAt: "",
                    updatedAt: "",
                  };
                  const draft = drafts[key] ?? "";

                  // rowTypes override takes precedence over what the DB stored
                  const rowType: RowType =
                    group.rowTypes?.[key] ??
                    (setting.valueType === "color"     ? "color"
                    : setting.valueType === "image_url" ? "image_url"
                    : "text");

                  if (rowType === "color") {
                    return (
                      <ColorRow key={key} setting={setting} draft={draft} onChange={onChange} />
                    );
                  }
                  if (rowType === "image_url") {
                    return (
                      <ImageUploadRow key={key} setting={setting} draft={draft} onChange={onChange} />
                    );
                  }
                  return (
                    <TextRow key={key} setting={setting} draft={draft} onChange={onChange} />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Live preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <LivePreview drafts={drafts} />
        </div>
      </div>
    </div>
    </RoleGuard>
  );
}
