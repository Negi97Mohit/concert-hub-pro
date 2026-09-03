import { createServerFn } from "@tanstack/react-start";
import { getRequestUrl, useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

type AdminSession = { admin?: boolean };

function sessionConfig() {
  const password =
    process.env["ADMIN_SESSION_SECRET"] ||
    process.env["ADMIN_COOKIE_SECRET"] ||
    "dovgan-concert-hub-super-secret-session-key-32chars";
  // Secure cookies are required in production, but browsers do not send them
  // over the HTTP localhost origin used by the local preview.
  const secure = getRequestUrl().protocol === "https:";
  return {
    password,
    name: "site-admin",
    maxAge: 60 * 60 * 12,
    cookie: { httpOnly: true, secure, sameSite: "lax" as const, path: "/" },
  };
}

function matches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

async function requireAdmin() {
  const session = await useSession<AdminSession>(sessionConfig());
  if (!session.data.admin) throw new Error("Unauthorized");
  return session;
}

export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  return { authed: session.data.admin === true };
});

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    const user = process.env["ADMIN_USERNAME"] || "SicMundus";
    const pass = process.env["ADMIN_PASSWORD"] || "ILovaRamen";

    if (!matches(data.username ?? "", user) || !matches(data.password ?? "", pass)) {
      return { ok: false as const };
    }

    const session = await useSession<AdminSession>(sessionConfig());
    await session.update({ admin: true });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<AdminSession>(sessionConfig());
  await session.clear();
  return { ok: true as const };
});

export const loadSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("site_content")
    .select("data")
    .eq("id", "singleton")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return { json: JSON.stringify(data?.data ?? {}) };
});

export const saveSiteContent = createServerFn({ method: "POST" })
  .inputValidator((data: { content: Record<string, unknown> }) => {
    if (!data || typeof data.content !== "object" || data.content === null) {
      throw new Error("Invalid content payload");
    }
    return data;
  })
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("site_content")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert({ id: "singleton", data: data.content as any, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const uploadSiteImage = createServerFn({ method: "POST" })
  .inputValidator((data: { fileName: string; dataUrl: string }) => {
    if (!data?.dataUrl?.startsWith("data:")) throw new Error("Invalid image payload");
    return data;
  })
  .handler(async ({ data }) => {
    await requireAdmin();
    const [meta, base64] = data.dataUrl.split(",", 2);
    const contentType = meta?.slice(5).split(";")[0] || "application/octet-stream";
    if (!base64) throw new Error("Invalid image payload");
    const bytes = Buffer.from(base64, "base64");
    if (bytes.byteLength > 15 * 1024 * 1024) throw new Error("Image is larger than 15 MB");

    const safe = data.fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80);
    const path = `${Date.now()}-${safe}`;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.storage
      .from("site-images")
      .upload(path, bytes, { contentType, upsert: false });
    if (error) throw new Error(error.message);

    return { url: `/api/public/media/${path}` };
  });
