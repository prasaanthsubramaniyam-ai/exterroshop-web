"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, MapPin, Phone, Briefcase, Camera, Loader2, CalendarDays, Building2, UserCircle2 } from "lucide-react";

import { OFFICE_LOCATIONS } from "@/constants";
import type { OfficeLocation, User } from "@/types";
import { authService } from "@/services/auth.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import { setUser, fetchProfileThunk } from "@/store/slices/authSlice";
import { initials, formatDate } from "@/utils/format";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().optional(),
  department: z.string().optional(),
  location: z.enum(OFFICE_LOCATIONS as [OfficeLocation, ...OfficeLocation[]]),
});

type FormValues = z.infer<typeof schema>;

export function ProfileView() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      department: user?.department ?? "",
      location: user?.location ?? "Chennai",
    },
  });

  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        phone: user.phone ?? "",
        department: user.department ?? "",
        location: user.location,
      });
    }
  }, [user, form]);

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      dispatch(pushToast({ title: "Please choose an image file", variant: "destructive" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      dispatch(pushToast({ title: "Image is too large (max 5 MB)", variant: "destructive" }));
      return;
    }
    setUploadingAvatar(true);
    try {
      // Step 1: upload to Cloudinary via backend and save to DB
      const updated = await authService.uploadAvatar(file);
      // Step 2: optimistically update Redux so the UI reflects the new photo immediately
      dispatch(setUser(updated));
      // Step 3: re-fetch from DB to confirm the save actually persisted.
      // This is the source-of-truth check — if avatar_url wasn't committed to
      // the database (e.g. the column doesn't exist or the transaction rolled back),
      // the profile fetch will return null and the Redux state will reflect reality.
      dispatch(fetchProfileThunk());
      dispatch(pushToast({ title: "Photo updated", variant: "success" }));
    } catch (err) {
      dispatch(pushToast({
        title: "Upload failed",
        description: (err as Error).message,
        variant: "destructive",
      }));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const updated = await authService.updateProfile(values as Partial<User>);
      dispatch(setUser(updated));
      dispatch(
        pushToast({ title: "Profile updated", variant: "success" })
      );
    } catch (err) {
      dispatch(
        pushToast({
          title: "Couldn't save profile",
          description: (err as Error).message,
          variant: "destructive",
        })
      );
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Profile" description="Manage your public information." />

      <div className="rounded-lg border border-border/60 bg-card p-6 shadow-card">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar className="size-20">
              {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
              <AvatarFallback className="text-xl">{initials(user.name)}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 inline-flex size-8 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
              aria-label="Change profile photo"
              title="Change profile photo"
            >
              {uploadingAvatar ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarChange}
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Joined {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InfoChip icon={<MapPin className="size-4" />} label={user.location} />
          {user.department ? (
            <InfoChip icon={<Briefcase className="size-4" />} label={user.department} />
          ) : null}
          {user.phone ? (
            <InfoChip icon={<Phone className="size-4" />} label={user.phone} />
          ) : null}
          <InfoChip icon={<Mail className="size-4" />} label={user.email} />
        </div>
      </div>

      {/* EMS Profile — read-only employment details */}
      {(user.jobTitle || user.managerName || user.dateOfJoining || user.workLocation) && (
        <div className="rounded-lg border border-border/60 bg-card p-6 shadow-card">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Employment Details
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {user.jobTitle && (
              <EmsField icon={<Briefcase className="size-4" />} label="Job Title" value={user.jobTitle} />
            )}
            {user.workLocation && (
              <EmsField icon={<Building2 className="size-4" />} label="Work Location" value={user.workLocation} />
            )}
            {user.managerName && (
              <EmsField icon={<UserCircle2 className="size-4" />} label="Reporting Manager" value={user.managerName} />
            )}
            {user.dateOfJoining && (
              <EmsField icon={<CalendarDays className="size-4" />} label="Date of Joining"
                value={new Date(user.dateOfJoining).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} />
            )}
            {user.dateOfBirth && (
              <EmsField icon={<CalendarDays className="size-4" />} label="Date of Birth"
                value={new Date(user.dateOfBirth).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} />
            )}
          </div>
        </div>
      )}

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 rounded-lg border border-border/60 bg-card p-6 shadow-card"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" placeholder="+91 …" {...form.register("phone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input id="department" {...form.register("department")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select id="location" {...form.register("location")}>
              {OFFICE_LOCATIONS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex justify-end border-t border-border pt-5">
          <Button type="submit" loading={form.formState.isSubmitting}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}

function InfoChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border/60 bg-surface/50 px-3 py-2 text-sm">
      <span className="text-muted-foreground">{icon}</span>
      <span className="truncate text-foreground">{label}</span>
    </div>
  );
}

function EmsField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="mt-0.5 text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
