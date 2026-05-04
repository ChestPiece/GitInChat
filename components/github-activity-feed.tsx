'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';

type EventType = 'push' | 'pull_request' | 'issues' | 'release' | 'watch' | 'fork' | 'all';

interface GithubEvent {
  id: number;
  type: string;
  repo_name: string;
  actor: string;
  created_at: string;
  payload: {
    title?: string;
    description?: string;
  };
}

export function GithubActivityFeed() {
  const [events, setEvents] = useState<GithubEvent[]>([]);
  const [filter, setFilter] = useState<EventType>('all');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase
        .from('github_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (data) setEvents(data);
      setLoading(false);
    }
    fetchEvents();
  }, [supabase]);

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.type === filter);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-2">
      {/* Filter Controls */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'push', 'pull_request', 'issues', 'release'] as EventType[]).map(type => (
          <Badge 
            key={type} 
            variant={filter === type ? 'default' : 'outline'}
            onClick={() => setFilter(type)}
            className="cursor-pointer"
          >
            {type === 'all' ? 'All' : type.replace('_', ' ')}
          </Badge>
        ))}
      </div>

      {/* Event List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredEvents.map(event => (
          <div key={event.id} className="p-3 border rounded-lg bg-background">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium">{event.actor}</span>
                <span className="text-muted-foreground"> {event.payload.title || event.type}</span>
              </div>
              <Badge variant="outline">{event.type}</Badge>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {event.repo_name} • {new Date(event.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}