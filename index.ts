import type { Sentence } from "nlcst";
import { ParseLatin } from "parse-latin";
import { toString } from "nlcst-to-string";
import { visit } from "unist-util-visit";

export type Dialogue = {
  dialogueId: string;
  children?: Sentence[];
  nodes: string;
  speakerHint?: string;
};

type MergeDialogueSentencesOptions = {
  hasChildren?: boolean;
};

function mergeDialogueSentences(
  sentences: Sentence[],
  options: MergeDialogueSentencesOptions = { hasChildren: false }
) {
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
            children: options.hasChildren ? buffer : undefined,
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
      children: options.hasChildren ? buffer : undefined,
      nodes: buffer.map((s) => toString(s)).join(" "),
    });
  }

  return dialogues;
}

export function extractDialogues(text: string): Dialogue[] {
  const parser = new ParseLatin();
  const tree = parser.parse(text);

  let sentences: Sentence[] = [];
  visit(tree, "SentenceNode", (node, index, parent) => {
    sentences.push(node);
  });

  return mergeDialogueSentences(sentences);
}

if (import.meta.main) {
  console.log("Extracting dialogues...", import.meta.main);

  const text1 = `“Yes, yes. Bank the takings, and lock up the shop,” she said. “Get going or you’ll miss your train.”`;
  const text2 = `She said, “Yes, yes. Bank the takings, and lock up the shop.” Then she added, “Get going or you’ll miss your train.”`;
  // const text3 = `丹怒瞪杏仁眼，指着蛋糕, “你说说，这怎么回事?”“我哪儿知道?”我对奶油上的英文感到莫名其妙。看丹的样子，她一定以为是我干的，一场争吵可能避免不了了。陈丹——`;
  const dialogues = extractDialogues(text2);

  console.log(dialogues);
}
