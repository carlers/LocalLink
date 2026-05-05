import { ProfileOverview } from "@/components/features/profile-overview";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProfileRow = {
  id: string;
  owner_name: string;
  business_name: string;
  location: string;
  trust_score: number;
  connections: number;
};

export default async function ProfilePage() {
  let profileData = null;

  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { data: userData } = await supabase.auth.getUser();

    if (userData.user) {
      const { data } = await supabase
        .from("profiles")
        .select("id, owner_name, business_name, location, trust_score, connections")
        .eq("id", userData.user.id)
        .maybeSingle();

      const profileRow = data as ProfileRow | null;

      if (profileRow) {
        profileData = {
          id: profileRow.id,
          ownerName: profileRow.owner_name ?? "",
          businessName: profileRow.business_name ?? "",
          location: profileRow.location ?? "",
          trustScore: profileRow.trust_score ?? 0,
          connections: profileRow.connections ?? 0,
          inventory: [],
        };
      } else {
        const metadata = userData.user.user_metadata as {
          full_name?: string;
          business_name?: string;
          location?: string;
        } | null;

        profileData = {
          id: userData.user.id,
          ownerName: metadata?.full_name ?? userData.user.email ?? "",
          businessName: metadata?.business_name ?? "",
          location: metadata?.location ?? "",
          trustScore: 0,
          connections: 0,
          inventory: [],
        };
      }
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">Profile</h1>
      <p className="text-text-muted text-sm">Business identity, trust indicators, and inventory placeholders.</p>
      <ProfileOverview profile={profileData} />
    </div>
  );
}