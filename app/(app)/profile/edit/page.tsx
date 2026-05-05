"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { SectionCard } from "@/components/ui/section-card";
import type { BusinessCategory } from "@/lib/types/business";

type FormState = {
  ownerName: string;
  businessName: string;
  location: string;
  category: BusinessCategory;
  shortDescription: string;
  isDtiRegistered: boolean;
  isBarterFriendly: boolean;
  hasUrgentNeed: boolean;
};

export default function EditProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<FormState>({
    ownerName: "",
    businessName: "",
    location: "",
    category: "Other",
    shortDescription: "",
    isDtiRegistered: false,
    isBarterFriendly: false,
    hasUrgentNeed: false,
  });

  // Image state
  const profileBucketName =
    process.env.NEXT_PUBLIC_PROFILE_IMAGES_BUCKET ?? "profile-images";
  const businessBucketName =
    process.env.NEXT_PUBLIC_BUSINESS_IMAGES_BUCKET ?? "business-images";

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    null
  );
  const [currentProfileImageUrl, setCurrentProfileImageUrl] = useState<
    string | null
  >(null);

  const [businessImageFile, setBusinessImageFile] = useState<File | null>(null);
  const [businessImagePreview, setBusinessImagePreview] = useState<
    string | null
  >(null);
  const [currentBusinessImageUrl, setCurrentBusinessImageUrl] = useState<
    string | null
  >(null);

  // Delete confirmation state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  // Load current profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError || !userData.user) {
          router.push("/login");
          return;
        }

        setUserId(userData.user.id);

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userData.user.id)
          .single();

        if (profileError) throw profileError;

        // Fetch business
        const { data: businessData, error: businessError } = await supabase
          .from("businesses")
          .select("*")
          .eq("owner_id", userData.user.id)
          .single();

        if (businessError && businessError.code !== "PGRST116") throw businessError;

        // Populate form
        if (profileData) {
          setFormData((prev) => ({
            ...prev,
            ownerName: profileData.owner_name || "",
            location: profileData.location || "",
          }));
          if (profileData.profile_image_url) {
            setCurrentProfileImageUrl(profileData.profile_image_url);
            setProfileImagePreview(profileData.profile_image_url);
          }
        }

        if (businessData) {
          setFormData((prev) => ({
            ...prev,
            businessName: businessData.name || "",
            category: (businessData.category as BusinessCategory) || "Other",
            shortDescription: businessData.short_description || "",
            isDtiRegistered: businessData.is_dti_registered || false,
            isBarterFriendly: businessData.is_barter_friendly || false,
            hasUrgentNeed: businessData.has_urgent_need || false,
          }));
          if (businessData.image_url) {
            setCurrentBusinessImageUrl(businessData.image_url);
            setBusinessImagePreview(businessData.image_url);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load profile."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, [router]);

  // Handle profile image selection
  const handleProfileImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Profile picture must be an image file");
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError("Profile picture must be smaller than 2MB");
      return;
    }

    setProfileImageFile(file);
    setError(null);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle business image selection
  const handleBusinessImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Business photo must be an image file");
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError("Business photo must be smaller than 2MB");
      return;
    }

    setBusinessImageFile(file);
    setError(null);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setBusinessImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload image to Supabase Storage
  const ensureBucketExists = async (bucketName: string) => {
    const response = await fetch("/api/storage/ensure", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bucket: bucketName }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(
        body?.error || "Could not ensure storage bucket exists."
      );
    }
  };

  const getBucketName = (bucket: "profile-images" | "business-images") =>
    bucket === "profile-images" ? profileBucketName : businessBucketName;

  const uploadImage = async (
    file: File,
    bucket: "profile-images" | "business-images",
    userId: string
  ): Promise<string> => {
    const supabase = createSupabaseBrowserClient();
    const ext = file.name.split(".").pop() || "jpg";
    const fileName =
      bucket === "profile-images"
        ? `avatar.${ext}`
        : `hero.${ext}`;
    const filePath = `${userId}/${fileName}`;
    const uploadBucket = getBucketName(bucket);

    const tryUpload = async () => {
      const { error: uploadError } = await supabase.storage
        .from(uploadBucket)
        .upload(filePath, file, { upsert: true });

      return uploadError;
    };

    let uploadError = await tryUpload();
    if (
      uploadError &&
      uploadError.message?.toLowerCase().includes("bucket not found")
    ) {
      await ensureBucketExists(uploadBucket);
      uploadError = await tryUpload();
    }

    if (uploadError) throw uploadError;

    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publicUrl = `${baseUrl}/storage/v1/object/public/${uploadBucket}/${filePath}`;
    return publicUrl;
  };

  // Save profile
  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId) {
      setError("User ID not found");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      let profileImageUrl = currentProfileImageUrl;
      let businessImageUrl = currentBusinessImageUrl;

      // Upload images if changed
      if (profileImageFile) {
        profileImageUrl = await uploadImage(
          profileImageFile,
          "profile-images",
          userId
        );
      }

      if (businessImageFile) {
        businessImageUrl = await uploadImage(
          businessImageFile,
          "business-images",
          userId
        );
      }

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          owner_name: formData.ownerName,
          business_name: formData.businessName,
          location: formData.location,
          profile_image_url: profileImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      const { error: businessError } = await supabase
        .from("businesses")
        .upsert(
          {
            owner_id: userId,
            name: formData.businessName,
            location: formData.location,
            category: formData.category,
            short_description: formData.shortDescription,
            is_dti_registered: formData.isDtiRegistered,
            is_barter_friendly: formData.isBarterFriendly,
            has_urgent_need: formData.hasUrgentNeed,
            image_url: businessImageUrl,
          },
          { onConflict: "owner_id" }
        );

      if (businessError) throw businessError;

      setSuccessMessage("Profile saved successfully!");
      setProfileImageFile(null);
      setBusinessImageFile(null);
      setCurrentProfileImageUrl(profileImageUrl);
      setCurrentBusinessImageUrl(businessImageUrl);

      // Redirect after 1.5 seconds
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm delete profile
  const handleConfirmDelete = async () => {
    if (!userId || !deletePassword) {
      setError("Password is required");
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user?.email) {
        throw new Error("Could not retrieve user email");
      }

      // Re-authenticate user
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: deletePassword,
      });

      if (authError) {
        setError("Invalid password. Account not deleted.");
        setIsDeleting(false);
        return;
      }

      // Delete profile images from storage
      if (currentProfileImageUrl) {
        await supabase.storage
          .from(profileBucketName)
          .remove([`${userId}/avatar.jpg`]);
      }

      // Delete business images from storage
      if (currentBusinessImageUrl) {
        await supabase.storage
          .from(businessBucketName)
          .remove([`${userId}/hero.jpg`]);
      }

      // Delete profile record (cascades to related data)
      const { error: profileDeleteError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (profileDeleteError) throw profileDeleteError;

      // Delete business record
      const { error: businessDeleteError } = await supabase
        .from("businesses")
        .delete()
        .eq("owner_id", userId);

      if (businessDeleteError && businessDeleteError.code !== "PGRST116") {
        throw businessDeleteError;
      }

      // Sign out user
      await supabase.auth.signOut();

      // Redirect to login
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account.");
      setIsDeleting(false);
    }
  };

  // Cancel delete confirmation
  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDeletePassword("");
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <p className="text-text-muted">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Edit Profile</h1>
        <Link
          href="/profile"
          className="rounded-chip border border-border-subtle bg-surface-muted px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface"
        >
          Back to Profile
        </Link>
      </div>

      {error && (
        <div className="rounded-panel border-border-subtle bg-status-error-bg border border-status-error-fg p-4 text-sm text-status-error-fg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-panel border-border-subtle bg-status-success-bg border border-status-success-fg p-4 text-sm text-status-success-fg">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Your Profile Section */}
        <SectionCard title="Your Profile">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="ownerName"
                className="text-sm font-medium"
              >
                Full name
              </label>
              <input
                id="ownerName"
                type="text"
                className="rounded-chip border-border-subtle mt-1 w-full border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                value={formData.ownerName}
                onChange={(e) =>
                  setFormData({ ...formData, ownerName: e.target.value })
                }
                required
              />
            </div>
          </div>
        </SectionCard>

        {/* Business Details Section */}
        <SectionCard title="Business Details">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="businessName"
                className="text-sm font-medium"
              >
                Business name
              </label>
              <input
                id="businessName"
                type="text"
                className="rounded-chip border-border-subtle mt-1 w-full border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="text-sm font-medium"
              >
                Location
              </label>
              <input
                id="location"
                type="text"
                className="rounded-chip border-border-subtle mt-1 w-full border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="text-sm font-medium"
              >
                Category
              </label>
              <select
                id="category"
                className="rounded-chip border-border-subtle mt-1 w-full border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as BusinessCategory,
                  })
                }
              >
                <option value="Retail">Retail</option>
                <option value="Food">Food</option>
                <option value="Services">Services</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="shortDescription"
                className="text-sm font-medium"
              >
                Description
              </label>
              <textarea
                id="shortDescription"
                className="rounded-chip border-border-subtle mt-1 min-h-24 w-full border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shortDescription: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>
        </SectionCard>

        {/* Business Preferences Section */}
        <SectionCard title="Business Preferences">
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border-subtle text-brand focus:ring-brand"
                checked={formData.isDtiRegistered}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isDtiRegistered: e.target.checked,
                  })
                }
              />
              DTI registered
            </label>

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border-subtle text-brand focus:ring-brand"
                checked={formData.isBarterFriendly}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isBarterFriendly: e.target.checked,
                  })
                }
              />
              Barter friendly
            </label>

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border-subtle text-brand focus:ring-brand"
                checked={formData.hasUrgentNeed}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hasUrgentNeed: e.target.checked,
                  })
                }
              />
              Has urgent need
            </label>
          </div>
        </SectionCard>

        {/* Profile Picture Section */}
        <SectionCard title="Profile Picture">
          <div className="space-y-4">
            {profileImagePreview && (
              <div className="flex flex-col gap-3">
                <div className="relative h-32 w-32 overflow-hidden rounded-full">
                  <Image
                    src={profileImagePreview}
                    alt="Profile preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProfileImageFile(null);
                    setProfileImagePreview(null);
                    setCurrentProfileImageUrl(null);
                  }}
                  className="w-fit text-sm text-brand underline hover:no-underline"
                >
                  Remove photo
                </button>
              </div>
            )}

            <div>
              <label
                htmlFor="profileImage"
                className="text-sm font-medium"
              >
                {profileImagePreview ? "Change photo" : "Upload photo"}
              </label>
              <input
                id="profileImage"
                type="file"
                accept="image/*"
                className="rounded-chip border-border-subtle mt-1 w-full border px-3 py-2"
                onChange={handleProfileImageChange}
              />
              <p className="mt-2 text-xs text-text-muted">
                JPG or PNG, max 2MB
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Business Photo Section */}
        <SectionCard title="Business Photo">
          <div className="space-y-4">
            {businessImagePreview && (
              <div className="flex flex-col gap-3">
                <div className="relative h-40 w-full overflow-hidden rounded-panel">
                  <Image
                    src={businessImagePreview}
                    alt="Business preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBusinessImageFile(null);
                    setBusinessImagePreview(null);
                    setCurrentBusinessImageUrl(null);
                  }}
                  className="w-fit text-sm text-brand underline hover:no-underline"
                >
                  Remove photo
                </button>
              </div>
            )}

            <div>
              <label
                htmlFor="businessImage"
                className="text-sm font-medium"
              >
                {businessImagePreview ? "Change photo" : "Upload photo"}
              </label>
              <input
                id="businessImage"
                type="file"
                accept="image/*"
                className="rounded-chip border-border-subtle mt-1 w-full border px-3 py-2"
                onChange={handleBusinessImageChange}
              />
              <p className="mt-2 text-xs text-text-muted">
                JPG or PNG, max 2MB
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Danger Zone Section */}
        <SectionCard title="Danger Zone" description="Permanently delete your account and all associated data.">
          <div className="space-y-3">
            {!showDeleteConfirmation ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirmation(true)}
                className="rounded-chip border border-red-600 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                Delete account
              </button>
            ) : (
              <div className="space-y-4 rounded-panel border-border-subtle bg-surface-muted border p-4">
                <p className="text-sm font-semibold">
                  Enter your password to confirm deletion. This action cannot be
                  undone.
                </p>

                <input
                  type="password"
                  placeholder="Your password"
                  className="rounded-chip border-border-subtle w-full border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                />

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="rounded-chip border border-red-600 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Confirm delete"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelDelete}
                    className="rounded-chip border border-border-subtle bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-muted"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Submit Section */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-chip bg-brand px-6 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
          <Link
            href="/profile"
            className="rounded-chip border border-border-subtle bg-surface-muted px-6 py-2 text-sm font-medium text-foreground transition hover:bg-surface"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
