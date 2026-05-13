import { cookies } from "next/headers";
import { defaultLocale, resolveLocale, type Locale } from "@/lib/i18n/translations";

export async function getServerLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    return resolveLocale(cookieStore.get("locale")?.value ?? defaultLocale);
  } catch {
    return defaultLocale;
  }
}
