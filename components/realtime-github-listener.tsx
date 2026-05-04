'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function RealtimeGithubListener() {
  const supabase = createClient();
  const router = useRouter();

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
          console.log('Realtime Event:', payload);
          const data = payload.payload;

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
  }, [supabase, router]);

  return null; // This component is invisible
}
