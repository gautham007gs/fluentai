import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up auth first
  await setupAuth(app);
  registerAuthRoutes(app);

  // --- Conversations API ---

  app.get(api.conversations.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const userId = (req.user as any).claims.sub; // Replit auth ID
    const conversations = await storage.getConversations(userId);
    res.json(conversations);
  });

  app.post(api.conversations.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    try {
      const input = api.conversations.create.input.parse(req.body);
      const userId = (req.user as any).claims.sub;
      
      const conversation = await storage.createConversation({
        ...input,
        userId,
      });
      
      res.status(201).json(conversation);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.conversations.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const id = Number(req.params.id);
    const conversation = await storage.getConversation(id);
    
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    
    // Check ownership
    const userId = (req.user as any).claims.sub;
    if (conversation.userId !== userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const messages = await storage.getMessages(id);
    res.json({ conversation, messages });
  });

  app.delete(api.conversations.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const id = Number(req.params.id);
    const conversation = await storage.getConversation(id);
    
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    
    const userId = (req.user as any).claims.sub;
    if (conversation.userId !== userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await storage.deleteConversation(id);
    res.status(204).send();
  });

  // --- Messages API (The Core Logic) ---

  app.post(api.messages.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

    try {
      const conversationId = Number(req.params.id);
      const { content: nativeContent } = api.messages.create.input.parse(req.body);
      
      // Get conversation to know languages
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) return res.status(404).json({ message: "Conversation not found" });
      
      // Check ownership
      const userId = (req.user as any).claims.sub;
      if (conversation.userId !== userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // --- AI Processing ---
      // We need to:
      // 1. Translate user's message (Native -> Target)
      // 2. Generate AI response (Target)
      // 3. Translate AI response (Target -> Native)
      
      const systemPrompt = `You are a friendly and encouraging language learning assistant.
The user speaks "${conversation.nativeLanguage}" (Native) and wants to learn "${conversation.targetLanguage}" (Target).

Your task is to:
1. Translate the user's message to the Target language.
2. Generate a very short, friendly, and conversational response in the Target language. 
   - Keep it to 1-2 short sentences maximum.
   - Use warm, encouraging language.
3. Translate your response to the Native language.

Output JSON only:
{
  "userTarget": "Translation of user message to target language",
  "aiTarget": "Your short response in target language",
  "aiNative": "Translation of your response to native language"
}`;

      const aiResponse = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: nativeContent }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(aiResponse.choices[0].message.content || "{}");
      
      // Validate AI output
      if (!result.userTarget || !result.aiTarget || !result.aiNative) {
        throw new Error("Invalid AI response format");
      }

      // Save User Message (Native + Target)
      const userMessage = await storage.createMessage({
        conversationId,
        role: "user",
        nativeContent,
        targetContent: result.userTarget
      });

      // Save AI Message (Target + Native)
      const aiMessage = await storage.createMessage({
        conversationId,
        role: "assistant",
        nativeContent: result.aiNative,
        targetContent: result.aiTarget
      });

      // Return both
      res.status(201).json([userMessage, aiMessage]);

    } catch (err) {
      console.error("Chat error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  return httpServer;
}
