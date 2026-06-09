import { formatDistanceToNowStrict, format } from "date-fns";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const formatPrice = (price: number): string => INR.format(price);

/** "2 hours ago" / "3 days ago" */
export const formatTimeAgo = (date: string | Date): string => {
  try {
    return formatDistanceToNowStrict(new Date(date), { addSuffix: true });
  } catch {
    return "";
  }
};

/** "12 Jan 2025" */
export const formatDate = (date: string | Date): string => {
  try {
    return format(new Date(date), "d MMM yyyy");
  } catch {
    return "";
  }
};

export const truncate = (text: string, max = 60): string =>
  text.length <= max ? text : `${text.slice(0, max).trimEnd()}…`;

export const formatKm = (km?: number): string =>
  km != null ? `${new Intl.NumberFormat("en-IN").format(km)} km` : "—";

export const initials = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
