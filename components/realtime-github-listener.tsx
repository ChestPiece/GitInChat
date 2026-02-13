'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function RealtimeGithubListener() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Listen for inserts into the 'github_events' table (which we still need to create in DB)
    // OR we can listen to a broadcast channel if we implement that in the route.
    // For now, let's assume we are broadcasting on a channel named 'github-updates'.
    
    const channel = supabase.channel('github-updates')
      .on(
        'broadcast',
        { event: 'event' },
        (payload) => {
          console.log('Realtime Event:', payload);
          const data = payload.payload;
          
          toast(data.title, {
            description: data.description,
            action: {
              label: 'Refresh',
              onClick: () => router.refresh()
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  return null; // This component is invisible
}
