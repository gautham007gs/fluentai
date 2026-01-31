import { conversations, messages, type Conversation, type InsertConversation, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversations(userId: string): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  deleteConversation(id: number): Promise<void>;
  
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(conversationId: number): Promise<Message[]>;
}

export class DatabaseStorage implements IStorage {
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const userId = (conversation as any).userId;
    const [newConversation] = await db.insert(conversations).values({
      title: conversation.title,
      nativeLanguage: conversation.nativeLanguage,
      targetLanguage: conversation.targetLanguage,
      userId: userId,
    }).returning();
    return newConversation;
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    return db.select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.createdAt));
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async deleteConversation(id: number): Promise<void> {
    await db.delete(messages).where(eq(messages.conversationId, id));
    await db.delete(conversations).where(eq(conversations.id, id));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const conversationId = (message as any).conversationId;
    const [newMessage] = await db.insert(messages).values({
      conversationId: conversationId,
      role: message.role,
      nativeContent: message.nativeContent,
      targetContent: message.targetContent,
    }).returning();
    return newMessage;
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return db.select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }
}

export const storage = new DatabaseStorage();
