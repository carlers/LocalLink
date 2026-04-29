import { ProfileOverview } from "@/components/features/profile-overview";
import { mockProfile } from "@/lib/mocks/profile";

export default function ProfilePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <p className="text-text-muted text-sm">
        Business identity, trust indicators, and inventory placeholders.
      </p>
      <ProfileOverview profile={mockProfile} />
    </div>
  );
}