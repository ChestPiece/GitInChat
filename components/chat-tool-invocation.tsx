'use client';

import { Loader2, Check, X, ChevronDown, ChevronRight, FileCode, Star, GitFork, Eye } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
// import { ToolInvocation } from 'ai'; // removing strict import that failed

interface ChatToolInvocationProps {
  toolInvocation: any; // Using any to avoid type check failure on ToolInvocation vs UIToolInvocation
}

export function ChatToolInvocation({ toolInvocation }: ChatToolInvocationProps) {
  const { toolName, toolCallId, state } = toolInvocation;
  const [isOpen, setIsOpen] = useState(false);

  const renderToolCall = () => {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 italic">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Calling {toolName}...</span>
      </div>
    );
  };

  const renderToolResult = (rawResult: any) => {
    // Handle ToolResult wrapper
    let result = rawResult;
    let error: string | undefined;

    if (rawResult && typeof rawResult === 'object' && 'success' in rawResult) {
        if (!rawResult.success) {
            error = rawResult.error || 'Unknown error';
        } else {
            result = rawResult.data;
        }
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950/20 p-2 rounded border border-red-900/50">
                <X className="w-4 h-4" />
                <span>Error: {error}</span>
            </div>
        )
    }

    if (toolName === 'listRepositories' || toolName === 'searchRepositories') {
      const repos = Array.isArray(result) ? result : (result?.repositories || []); // Handle different returns
      return (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-400">Found {repos.length} repositories</div>
          <ScrollArea className="h-[300px] w-full rounded-md border border-[var(--pr-border)] p-2 bg-[var(--pr-bg)]">
            <div className="space-y-2">
              {repos.map((repo: any, i: number) => (
                <div key={i} className="p-3 bg-[var(--pr-surface)] border border-[var(--pr-border)] rounded-md hover:border-blue-500 transition-colors">
                  <div className="flex justify-between items-start">
                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-medium">
                      {repo.full_name}
                    </a>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Star className="w-3 h-3" /> {repo.stars}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{repo.description}</p>
                  <div className="flex gap-2 mt-2">
                    {repo.language && <Badge variant="secondary" className="text-xs">{repo.language}</Badge>}
                    {repo.updated_at && <span className="text-xs text-gray-500">Updated {new Date(repo.updated_at).toLocaleDateString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      );
    }

    if (toolName === 'getRepositoryDetails') {
       const repo = result;
       if (!repo) return <div className="text-gray-500">No repository details</div>;

       return (
        <div className="p-4 bg-[var(--pr-surface)] border border-[var(--pr-border)] rounded-md">
            <div className="flex justify-between items-start">
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-xl text-blue-400 hover:underline font-bold">
                    {repo.full_name}
                </a>
                <Badge variant={repo.visibility === 'private' ? 'destructive' : 'outline'}>{repo.visibility}</Badge>
            </div>
            <p className="text-gray-300 mt-2">{repo.description}</p>
            <div className="flex gap-4 mt-4 text-sm text-gray-400">
                <div className="flex items-center gap-1"><Star className="w-4 h-4"/> {repo.stars} stars</div>
                <div className="flex items-center gap-1"><GitFork className="w-4 h-4"/> {repo.forks} forks</div>
                <div className="flex items-center gap-1"><Eye className="w-4 h-4"/> {repo.open_issues} issues</div>
            </div>
             <div className="flex gap-2 mt-4">
                {repo.language && <Badge variant="secondary">{repo.language}</Badge>}
                <span className="text-xs text-gray-500 self-center">Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
            </div>
        </div>
       )
    }

    if (toolName === 'getRepositoryFileContent') {
        const safeResult = result && typeof result === 'object' ? result : {};
        // Error handling is now done above via success check, but keep this for backward compat if tool returns { error } directly
        if (safeResult.error) {
            return <div className="text-red-400 text-sm">Error: {String(safeResult.error)}</div>
        }
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400 px-2">
                   <div className="flex items-center gap-1"><FileCode className="w-4 h-4"/> File Content</div>
                   {safeResult.truncated && <span className="text-yellow-500">(Truncated)</span>}
                </div>
                <div className="bg-[var(--pr-bg)] border border-[var(--pr-border)] rounded-md p-3 overflow-x-auto">
                    <pre className="text-xs font-mono text-gray-300">
                        {String(safeResult.content ?? '')}
                    </pre>
                </div>
            </div>
        )
    }



    if (toolName === 'searchCodebase') {
      const isString = typeof result === 'string';
      const content = isString ? result : JSON.stringify(result, null, 2);

      // If result is the "No results" message
      if (content.includes("No relevant code found")) {
         return (
             <div className="flex items-center gap-2 text-sm text-yellow-500 bg-yellow-950/20 p-2 rounded border border-yellow-900/50">
                 <span className="font-semibold">No results found.</span>
             </div>
         )
      }

      return (
        <div className="space-y-2">
           <div className="flex items-center gap-2 text-sm text-gray-400 px-2 pb-1 border-b border-[rgba(255,255,255,0.07)]">
               <FileCode className="w-4 h-4" />
               <span>Codebase Search Results</span>
           </div>
           <div className="bg-[var(--pr-bg)] border border-[var(--pr-border)] rounded-md p-3 overflow-x-auto text-xs font-mono text-gray-300 whitespace-pre-wrap max-h-[400px] overflow-y-auto custom-scrollbar">
              {content}
           </div>
        </div>
      )
    }

    if (toolName === 'readProjectFile') {
       const safeResult = result && typeof result === 'object' ? result : {};
       if (safeResult.error) {
           return <div className="text-red-400 text-sm">Error: {String(safeResult.error)}</div>
       }
       return (
           <div className="space-y-2">
               <div className="flex items-center justify-between text-xs text-gray-400 px-2">
                  <div className="flex items-center gap-1"><FileCode className="w-4 h-4"/> File Content: {toolInvocation.args.filePath}</div>
                  {safeResult.truncated && <span className="text-yellow-500">(Truncated)</span>}
               </div>
               <div className="bg-[var(--pr-bg)] border border-[var(--pr-border)] rounded-md p-3 overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
                   <pre className="text-xs font-mono text-gray-300">
                       {String(safeResult.content ?? '')}
                   </pre>
               </div>
           </div>
       )
    }

    if (toolName === 'starRepository') {
        return (
            <div className="flex items-center gap-2 text-sm text-green-400">
                <Check className="w-4 h-4" />
                <span>{result.message || 'Repository starred successfully'}</span>
            </div>
        )
    }

    return (
      <div className="bg-[var(--pr-bg)] p-2 rounded-md border border-[var(--pr-border)] text-xs font-mono text-gray-400 overflow-x-auto">
        {JSON.stringify(result, null, 2)}
      </div>
    );
  };

  if (state === 'call' || state === 'partial-call') {
    return renderToolCall();
  }

  // State is 'result'
  return (
    <div className="my-2">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <div className="flex items-center justify-between bg-white/[0.02] p-2 rounded-t-md border border-[var(--pr-border)] border-l-[3px] border-l-[var(--pr-accent)]">
             <div className="flex items-center gap-2">
                 <Badge variant="outline" className="text-xs border-[rgba(35,134,54,0.35)] text-[var(--pr-accent)] bg-[rgba(35,134,54,0.12)]">
                     Tool: {toolName}
                 </Badge>
             </div>
             <CollapsibleTrigger asChild>
                 <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-[var(--pr-surface)]/70">
                     {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                     <span className="sr-only">Toggle</span>
                 </Button>
             </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
             <div className="p-2 border-x border-b border-[var(--pr-border)] rounded-b-md bg-[var(--pr-bg)]/50 text-sm break-all space-y-2">
                <div className="mb-2 text-xs text-gray-500 font-mono">
                    Arguments: {JSON.stringify(toolInvocation.args)}
                </div>
                <div>{renderToolResult(toolInvocation.result)}</div>
             </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
