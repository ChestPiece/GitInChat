'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { Sparkles, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MessageMetadata } from '@/lib/types/message-metadata';

interface MessageMetadataProps {
  metadata?: MessageMetadata;
  createdAt?: Date | number | string;
  model?: string;
  className?: string;
}

export function MessageMetadataDisplay({ 
  metadata, 
  createdAt, 
  model = 'gpt-4o-mini',
  className 
}: MessageMetadataProps) {
  
  // Format the timestamp
  const timestamp = useMemo(() => {
    if (!createdAt) return null;
    const date = new Date(createdAt);
    return isNaN(date.getTime()) ? null : format(date, 'h:mm a');
  }, [createdAt]);

  // Calculate execution time if available
  const executionTime = metadata?.generationTime 
    ? `${(metadata.generationTime / 1000).toFixed(2)}s` 
    : null;

  // Format token usage if available
  const tokenUsage = metadata?.totalTokens 
    ? `${metadata.totalTokens} tokens` 
    : null;

  return (
    <div className={cn("flex items-center gap-3 text-xs text-muted-foreground mt-1 select-none", className)}>
      {/* Model Name */}
      <div className="flex items-center gap-1" title="Model used">
        <Sparkles className="w-3 h-3" />
        <span>{model}</span>
      </div>

      {/* Timestamp */}
      {timestamp && (
        <>
          <span className="text-muted-foreground/30">•</span>
          <span title={`Created at ${timestamp}`}>{timestamp}</span>
        </>
      )}

      {/* Execution Time */}
      {executionTime && (
        <>
          <span className="text-muted-foreground/30">•</span>
          <div className="flex items-center gap-1" title="Generation time">
            <Clock className="w-3 h-3" />
            <span>{executionTime}</span>
          </div>
        </>
      )}

      {/* Token Usage */}
      {tokenUsage && (
        <>
          <span className="text-muted-foreground/30">•</span>
          <div className="flex items-center gap-1" title="Token usage">
            <Zap className="w-3 h-3" />
            <span>{tokenUsage}</span>
          </div>
        </>
      )}
    </div>
  );
}
