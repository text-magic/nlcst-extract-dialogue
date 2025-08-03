import type { Sentence } from "nlcst";
import { ParseLatin } from "parse-latin";
import { toString } from "nlcst-to-string";
import { visit } from "unist-util-visit";

export type Dialogue = {
  dialogueId: string;
  text: string;
  speakerHint?: string;
  hintPosition?: "start" | "end";
};

type Options = {
  includeChildren?: boolean;
};

function mergeDialogueSentences(sentences: Sentence[], options?: Options) {
  const dialogues: Dialogue[] = [];
  let dialogueId = 0;

  const quotePairs: Record<string, string> = {
    '"': '"',
    "'": "'",
    "“": "”",
    "「": "」",
  };
  const startQuotes = Object.keys(quotePairs);

  let text = sentences.map((s) => toString(s)).join(" ");
  let currentIndex = 0;

  while (currentIndex < text.length) {
    let firstStartIndex = -1;
    let startQuote = '';

    // Find the next opening quote from the currentIndex
    for (const q of startQuotes) {
      const index = text.indexOf(q, currentIndex);
      if (index !== -1 && (firstStartIndex === -1 || index < firstStartIndex)) {
        firstStartIndex = index;
        startQuote = q;
      }
    }

    if (firstStartIndex === -1) {
      break; // No more dialogues
    }

    const endQuote = quotePairs[startQuote];
    if (!endQuote) {
      break; // Should not happen with current logic
    }

    const endIndex = text.indexOf(endQuote, firstStartIndex + 1);

    if (endIndex === -1) {
      break; // Unmatched quote, stop processing
    }

    const dialogueText = text.substring(firstStartIndex, endIndex + 1);
    dialogues.push({
      dialogueId: `d${++dialogueId}`,
      text: dialogueText,
    });

    // Move index to the position after the extracted dialogue
    currentIndex = endIndex + 1;
  }

  return dialogues;
}

export function extractDialogues(text: string): Dialogue[] {
  const parser = new ParseLatin();
  const tree = parser.parse(text);

  let sentences: Sentence[] = [];
  visit(tree, "SentenceNode", (node) => {
    sentences.push(node);
  });

  return mergeDialogueSentences(sentences);
}

if (import.meta.main) {
  console.log("Extracting dialogues...", import.meta.main);

  const text1 = `“Yes, yes. Bank the takings, and lock up the shop,” she said. “Get going or you’ll miss your train.”`;
  // const text2 = `She said, “Yes, yes. Bank the takings, and lock up the shop.” Then she added, “Get going or you’ll miss your train.”`;
  // const text3 = `丹怒瞪杏仁眼，指着蛋糕, “你说说，这怎么回事?”“我哪儿知道?”我对奶油上的英文感到莫名其妙。看丹的样子，她一定以为是我干的，一场争吵可能避免不了了。陈丹——`;
  // const dialogues = extractDialogues(text1);

  // console.log(dialogues);
}
