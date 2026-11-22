import * as React from "react";
import { fetchChildAvatar } from "@/lib/children";

function useChildAvatarUrl(
  childId: number,
  avatarId: number | null,
): string | null {
  const [loaded, setLoaded] = React.useState<{
    avatarId: number;
    url: string;
  } | null>(null);

  React.useEffect(() => {
    if (avatarId == null) {
      return;
    }
    let ignored = false;
    let url: string | null = null;
    fetchChildAvatar(childId)
      .then((blob) => {
        if (ignored) {
          return;
        }
        url = URL.createObjectURL(blob);
        setLoaded({ avatarId, url });
      })
      .catch(() => {});
    return () => {
      ignored = true;
      if (url != null) {
        URL.revokeObjectURL(url);
      }
    };
  }, [childId, avatarId]);

  return avatarId != null && loaded?.avatarId === avatarId ? loaded.url : null;
}

export { useChildAvatarUrl };