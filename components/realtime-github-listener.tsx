'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const ENABLED_EVENTS = ['push', 'pull_request', 'issues', 'release', 'watch', 'fork'];

export function RealtimeGithubListener() {
  const supabase = createClient();
  const router = useRouter();
  const lastToastTime = useRef(0);
  const DEBOUNCE_MS = 2000;

  const [enabledEvents, setEnabledEvents] = useState<string[]>([
    'push', 'pull_request', 'issues'
  ]);

  useEffect(() => {
    let activeChannel: ReturnType<typeof supabase.channel> | null = null;
    let disposed = false;

    const subscribe = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const githubOwner =
        user?.user_metadata?.user_name ??
        user?.user_metadata?.preferred_username ??
        null;

      if (!githubOwner || disposed) {
        return;
      }

      const userChannel = `github-updates:user`;

      activeChannel = supabase
        .channel(userChannel)
        .on('broadcast', { event: 'event' }, (payload) => {
          const data = payload.payload;

          // Filter: skip disabled event types
          if (!enabledEvents.includes(data.type)) {
            console.log('[Realtime] Event filtered:', data.type);
            return;
          }

          // Debounce to prevent toast flooding
          const now = Date.now();
          if (now - lastToastTime.current < DEBOUNCE_MS) {
            console.log('[Realtime] Toast debounced:', data.type);
            return;
          }
          lastToastTime.current = now;

          console.log('Realtime Event:', payload);

          toast(data.title, {
            description: data.description,
            action: {
              label: 'Refresh',
              onClick: () => router.refresh(),
            },
          });
        })
        .subscribe();
    };

    void subscribe();

    return () => {
      disposed = true;
      if (activeChannel) {
        supabase.removeChannel(activeChannel);
      }
    };
  }, [supabase, router, enabledEvents]);

  return null; // This component is invisible
}
