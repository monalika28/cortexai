import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../config/llmModels.js";
import fs from "fs/promises";
import { deductCredits } from "../utils/deductCredits.js";
import { checkAgentLimit } from "../config/agentLimit.js";

export const imageAnalyzer = async (state) => {
  await checkAgentLimit(state.userId, "image");
  try {
    const llm = await getModel("imageAnalyzer");

    const imageBuffer = await fs.readFile(state.file.path);
    const base64Image = imageBuffer.toString("base64");

    const messages = [
      new SystemMessage(
        `You are CortexAI Image & Document Transformation Agent.

CRITICAL RULES:
1. When a user uploads an image/document and asks to "modify", "change format", "format this", "extract", or "reformat":
   - NEVER output external tutorial steps or procedural instructions (DO NOT say "Open Microsoft Word...", "Go to Styles gallery...", "Step 1...", etc.).
   - Directly extract all text/tables/data from the image and apply the requested modification or format change immediately.
   - Present the final reformatted/modified result cleanly in Markdown (using clear headings, bullet points, code blocks, or structured Markdown tables).
2. If the user explicitly asks a "how-to" question (e.g., "How do I do this in Word?"), only then provide step-by-step guidance.
3. If charts or tables exist, reproduce them in clean Markdown table format.
4. Do not hallucinate content that is not visible or implied by the image.
`
      ),
      new HumanMessage({
        content: [
          {
            type: "text",
            text: state.prompt || "Extract and modify the content as requested.",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${state.file.mimetype};base64,${base64Image}`,
            },
          },
        ],
      }),
    ];

    const response = await llm.invoke(messages);
    await deductCredits(state.userId, "vision");
    return {
      ...state,
      aiResponse: response.content,
    };
  } catch (error) {
    console.log(error);
    return {
      ...state,
      aiResponse: error?.data?.message || "failed to analyze image",
    };
  } finally {
    try {
      await fs.unlink(state.file.path);
    } catch (e) {
      // file already unlinked or does not exist
    }
  }
};