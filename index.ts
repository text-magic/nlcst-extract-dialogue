import type { Sentence } from "nlcst";
import { ParseLatin } from "parse-latin";
import { toString } from "nlcst-to-string";
import { visit } from "unist-util-visit";

export type Dialogue = {
  dialogueId: string;
  children: Sentence[];
  nodes: string;
  speakerHint?: string;
};
function mergeDialogueSentences(sentences: Sentence[]) {
  const dialogues: Dialogue[] = [];
  let buffer: Sentence[] = [];
  let dialogueId = 0;
  let inDialogue = false;
  const startQuoteRegex = /^['"“]/;
  const endQuoteRegex = /[”"].*?$/;

  for (const sentence of sentences) {
    const text = toString(sentence);

    if (!inDialogue) {
      if (startQuoteRegex.test(text)) {
        // Start of a new dialogue
        inDialogue = true;
        buffer.push(sentence);
      }
    } else {
      // Already in a dialogue, keep appending
      buffer.push(sentence);
    }

    // Check if the current sentence ends the dialogue block
    if (inDialogue) {
      // A dialogue block ends if the last sentence has a closing quote,
      // and it's NOT immediately followed by an opening quote (as in "... she said. "New quote...").
      if (endQuoteRegex.test(text)) {
        // It has a closing quote. Does it also start a new one?
        const startsNewDialogue =
          /[”"],?\s*[a-zA-Z]+\s+[a-zA-Z]+\.\s*["“]/.test(text) || !text.match(/[”"].*?[a-zA-Z]/);

        const fullText = buffer.map((s) => toString(s)).join(" ");
        const speakerHintMatch = fullText.match(/[”"]([^”"]*)$/);
        let speakerHint = (speakerHintMatch?.[1] ?? "").trim();

        // Special case for hints like ", she said."
        if (speakerHint.startsWith(",")) {
          speakerHint = speakerHint.slice(1).trim();
        }
        if (speakerHint.endsWith(".") || speakerHint.endsWith(",")) {
          speakerHint = speakerHint.slice(0, -1);
        }

        // Heuristic to decide if we should finalize the dialogue
        // This is tricky. Let's finalize if there's a speaker hint or if the quote is self-contained.
        const selfContained = /^["“].*[”"]$/.test(text.trim());
        const hasHint = !!speakerHint;

        if (selfContained || hasHint) {
          dialogues.push({
            dialogueId: `d${++dialogueId}`,
            children: buffer,
            nodes: fullText,
            ...(speakerHint && { speakerHint }),
          });

          // Reset for next potential dialogue
          buffer = [];
          inDialogue = false;
        }
      }
    }
  }

  // What if the file ends mid-dialogue?
  if (buffer.length > 0) {
    dialogues.push({
      dialogueId: `d${++dialogueId}`,
      children: buffer,
      nodes: buffer.map((s) => toString(s)).join(" "),
    });
  }

  return dialogues;
}

export function extractDialogues(text: string) {
  const parser = new ParseLatin();
  const tree = parser.parse(text);

  let sentences: Sentence[] = [];
  visit(tree, "SentenceNode", (node, index, parent) => {
    sentences.push(node);
  });

  return mergeDialogueSentences(sentences);
}

if (import.meta.main) {
  const dialogues = extractDialogues(
    "“Yes, yes. Bank the takings, and lock up the shop,” she said. “Get going or you’ll miss your train.”"
  );

  console.log(dialogues);
}
