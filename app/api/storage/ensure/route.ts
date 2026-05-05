import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const bucket = body?.bucket;

  if (!bucket || typeof bucket !== "string") {
    return NextResponse.json({ error: "Bucket name is required." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Missing Supabase service role configuration." },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: existingBucket, error: getError } = await supabase.storage.getBucket(bucket);
  if (getError && !existingBucket) {
    const { error: createError } = await supabase.storage.createBucket(bucket, {
      public: true,
    });

    if (createError && !createError.message?.includes("already exists")) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
