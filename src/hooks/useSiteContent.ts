import { useEffect, useState } from "react";
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_CONTENT, mergeContent, type SiteContent } from "@/lib/site-content";

export const SITE_CONTENT_KEY = ["site-content"] as const;
export const DRAFT_MESSAGE = "site-content-draft";

export async function fetchSiteContent(): Promise<SiteContent> {
  const { data, error } = await supabase
    .from("site_content")
    .select("data")
    .eq("id", "singleton")
    .maybeSingle();

  if (error) return DEFAULT_CONTENT;
  return mergeContent(data?.data);
}

/* -------------------------------------------------------------- */
/* Draft preview: the admin page posts unsaved content into the    */
/* preview iframe so the editor sees a live feed of every section. */
/* -------------------------------------------------------------- */

let draft: SiteContent | null = null;
const draftListeners = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("message", (event: MessageEvent) => {
    const payload = event.data as { type?: string; content?: unknown } | null;
    if (!payload || payload.type !== DRAFT_MESSAGE) return;
    draft = mergeContent(payload.content);
    draftListeners.forEach((fn) => fn());
  });
}

function useDraft(): SiteContent | null {
  const [value, setValue] = useState<SiteContent | null>(null);

  useEffect(() => {
    const listener = () => setValue(draft);
    draftListeners.add(listener);
    if (draft) setValue(draft);
    return () => {
      draftListeners.delete(listener);
    };
  }, []);

  return value;
}

let subscribed = false;

function ensureRealtime(queryClient: QueryClient) {
  if (subscribed || typeof window === "undefined") return;
  subscribed = true;
  supabase
    .channel("site-content-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "site_content" }, () => {
      void queryClient.invalidateQueries({ queryKey: SITE_CONTENT_KEY });
    })
    .subscribe();
}

/** Live website content: defaults first, then whatever the admin has saved. */
export function useSiteContent(): SiteContent {
  const queryClient = useQueryClient();
  const draftContent = useDraft();

  useEffect(() => {
    ensureRealtime(queryClient);
  }, [queryClient]);

  const { data } = useQuery({
    queryKey: SITE_CONTENT_KEY,
    queryFn: fetchSiteContent,
    initialData: DEFAULT_CONTENT,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });

  return draftContent ?? data ?? DEFAULT_CONTENT;
}
