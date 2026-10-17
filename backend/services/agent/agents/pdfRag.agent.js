import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfModule = require("pdf-parse");

// Compatibility check: agar default function hai to wo le, warna direct module ya sub-export
const parsePdf = typeof pdfModule === "function" 
  ? pdfModule 
  : (pdfModule.default || pdfModule.PDFParse);

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { vectorStore } from "../config/vectorDb.js";
import { getModel } from "../config/llmModels.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { deductCredits } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const pdfRag = async (state) => {
  try {
    await checkAgentLimit(state.userId, "pdf");

    let context = "";

    // File parse karna agar file provided hai
    if (state.file && state.file.path) {
      const buffer = fs.readFileSync(state.file.path);
      
      let parsedData;
      try {
        parsedData = await parsePdf(buffer);
      } catch (err) {
        // Fallback agar constructor call require karta ho
        const pdfInstance = new parsePdf({ data: buffer });
        parsedData = await pdfInstance.getText();
      }

      const text = parsedData?.text || "";

      if (text.length < 6000) {
        context = text;
      } else {
        const splitter = new RecursiveCharacterTextSplitter({
          chunkSize: 1000,
          chunkOverlap: 200,
        });
        const docs = await splitter.createDocuments([text]);
        const collectionName = `pdf-${Date.now()}`;
        const store = await vectorStore(docs, collectionName);
        const relevantDocs = await store.similaritySearch(state.prompt, 6);
        context = relevantDocs.map((d) => d.pageContent).join("\n\n");
      }
    }

    const llm = await getModel("pdf-rag");

    const messages = [
      new SystemMessage(`You are CortexAI Document & PDF Transformation Assistant.

CRITICAL RULES:
1. When asked to modify, rewrite, format, or style (e.g. changing text color, headers, layout):
   - Directly output the updated document in clean Markdown.
   - If user asks for color changes (e.g. "replace text color to all blue"), output formatted HTML or styled Markdown (e.g. <span style="color: blue">text</span> or Markdown blocks).
   - Do NOT provide software tutorials or procedural steps (e.g. do not say "Open Microsoft Word...").
2. If context is provided, base your answers on it.`),
      new HumanMessage(
        context
          ? `Context from PDF:\n${context}\n\nUser Request: ${state.prompt}`
          : state.prompt
      ),
    ];

    const response = await llm.invoke(messages);
    await deductCredits(state.userId, "pdf");

    return {
      ...state,
      aiResponse: response.content,
    };
  } catch (error) {
    console.error("PDF RAG Error Details:", error);
    return {
      ...state,
      aiResponse: error?.message || error?.data?.message || "failed to analyze pdf",
    };
  } finally {
    try {
      if (state.file && state.file.path && fs.existsSync(state.file.path)) {
        fs.unlinkSync(state.file.path);
      }
    } catch (cleanupError) {
      console.error("File cleanup error:", cleanupError);
    }
  }
};