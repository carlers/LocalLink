import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const PASSWORD = "123456";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const DATA_PATH = path.join(ROOT_DIR, "scripts", "seed-data", "businesses.json");

// Load .env.local first, then .env
dotenv.config({ path: path.join(ROOT_DIR, ".env.local") });
dotenv.config({ path: path.join(ROOT_DIR, ".env") });

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");

function readSeedData() {
  const raw = fs.readFileSync(DATA_PATH, "utf8");
  return JSON.parse(raw);
}

function toImageUrl(seed, kind) {
  const size = kind === "profile" ? "320/320" : "960/640";
  return `https://picsum.photos/seed/${encodeURIComponent(`${seed}-${kind}`)}/${size}`;
}

async function listAllUsers(client) {
  const { data, error } = await client.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (error) {
    throw error;
  }

  return data.users ?? [];
}

async function main() {
  const dataset = readSeedData();
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const users = await listAllUsers(supabase);
  const usersByEmail = new Map(users.map((user) => [user.email?.toLowerCase(), user]));

  console.log(`${dryRun ? "Dry run: " : ""}processing ${dataset.length} businesses`);

  for (const entry of dataset) {
    const emailKey = entry.email.toLowerCase();
    const profileImageUrl = toImageUrl(entry.seed, "profile");
    const businessImageUrl = toImageUrl(entry.seed, "business");
    const metadata = {
      full_name: entry.fullName,
      business_name: entry.businessName,
      location: entry.location,
      city: entry.city,
      barangay: entry.barangay,
      business_category: entry.category,
      short_description: entry.shortDescription,
      business_is_dti_registered: String(entry.isDtiRegistered),
      business_is_barter_friendly: String(entry.isBarterFriendly),
      business_has_urgent_need: String(entry.hasUrgentNeed),
    };

    let user = usersByEmail.get(emailKey);

    if (!user) {
      if (dryRun) {
        console.log(`[create] ${entry.email}`);
      } else {
        const { data, error } = await supabase.auth.admin.createUser({
          email: entry.email,
          password: PASSWORD,
          email_confirm: true,
          user_metadata: metadata,
        });

        if (error) {
          throw new Error(`Failed to create ${entry.email}: ${error.message}`);
        }

        user = data.user;
        if (!user) {
          throw new Error(`No user returned for ${entry.email}`);
        }

        usersByEmail.set(emailKey, user);
      }
    } else if (!dryRun) {
      const { error } = await supabase.auth.admin.updateUserById(user.id, {
        password: PASSWORD,
        user_metadata: metadata,
      });

      if (error) {
        throw new Error(`Failed to update auth user ${entry.email}: ${error.message}`);
      }
    }

    const userId = user?.id;
    if (!userId) {
      continue;
    }

    const profileRow = {
      id: userId,
      owner_name: entry.fullName,
      business_name: entry.businessName,
      location: entry.location,
      city: entry.city,
      barangay: entry.barangay,
      profile_image_url: profileImageUrl,
      updated_at: new Date().toISOString(),
    };

    const businessRow = {
      owner_id: userId,
      name: entry.businessName,
      location: entry.location,
      city: entry.city,
      barangay: entry.barangay,
      category: entry.category,
      is_dti_registered: entry.isDtiRegistered,
      is_barter_friendly: entry.isBarterFriendly,
      has_urgent_need: entry.hasUrgentNeed,
      short_description: entry.shortDescription,
      image_url: businessImageUrl,
    };

    if (dryRun) {
      console.log(`[upsert] ${entry.businessName} -> ${entry.email}`);
      continue;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(profileRow, { onConflict: "id" });

    if (profileError) {
      throw new Error(`Failed to upsert profile for ${entry.email}: ${profileError.message}`);
    }

    const { error: businessError } = await supabase
      .from("businesses")
      .upsert(businessRow, { onConflict: "owner_id" });

    if (businessError) {
      throw new Error(`Failed to upsert business for ${entry.email}: ${businessError.message}`);
    }

    console.log(`Seeded ${entry.businessName} (${entry.email})`);
  }

  console.log(dryRun ? "Dry run complete." : "Seed complete.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});