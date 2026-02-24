
import { Message } from '@/lib/services/messages.client'
import { UIMessage } from 'ai'

export function mapDatabaseMessageToUIMessage(dbMessage: Message): UIMessage {
  return {
    id: dbMessage.id,
    role: dbMessage.role,
    content: dbMessage.content,
    createdAt: new Date(dbMessage.created_at),
    parts: [{ type: 'text', text: dbMessage.content }],
    // Initialize required properties for UIMessage that might be missing in DB message
    // Adjust based on actual UIMessage type definition if needed
  } as unknown as UIMessage // Casting to UIMessage to satisfy the type if exact match isn't possible directly
}

export function mapDatabaseMessagesToUIMessages(dbMessages: Message[]): UIMessage[] {
  return dbMessages.map(mapDatabaseMessageToUIMessage)
}
