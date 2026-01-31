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
      
      const systemPrompt = `You are a friendly peer and a close friend of the user. 
The user speaks "${conversation.nativeLanguage}" (Native) and wants to practice "${conversation.targetLanguage}" (Target) with you.

Your task is to:
1. Translate the user's message to the Target language.
2. Reply naturally as a friend would in the Target language. 
   - DO NOT act like a teacher, tutor, or assistant.
   - DO NOT correct their grammar or explain rules unless they specifically ask.
   - Just keep the conversation going naturally.
   - Keep it very short (1-2 sentences).
3. Provide a transliteration (phonetic reading) of the Target language reply using English characters (Romanization). 
   - Example for Telugu "Mīru elā unnāru".
   - This applies to all non-English target languages.
4. Translate your reply back to the Native language.

Output JSON only:
{
  "userTarget": "Translation of user message to target language",
  "aiTarget": "Your natural friend-to-friend reply in target language",
  "aiTransliteration": "Phonetic reading of aiTarget in English characters",
  "aiNative": "Translation of your reply to native language"
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

      // Combine target content with transliteration if available
      const assistantTargetWithPhonetic = result.aiTransliteration 
        ? `${result.aiTarget}\n(${result.aiTransliteration})` 
        : result.aiTarget;

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
        targetContent: assistantTargetWithPhonetic
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
