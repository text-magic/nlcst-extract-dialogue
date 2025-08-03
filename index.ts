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

  let fullText = sentences.map((s) => toString(s)).join(" ");

  // Split text by dialogues
  const regex = new RegExp(
    `([${startQuotes.join("")}][^${startQuotes.join("")}]*?[${Object.values(quotePairs).join(
      ""
    )}])`,
    "g"
  );
  const parts = fullText.split(regex).filter((part) => part);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const isDialogue = startQuotes.some((q) => part?.startsWith(q));

    if (isDialogue) {
      let speakerHint = "";
      // Check for hint before
      if (i > 0 && !startQuotes.some((q) => parts[i - 1]?.startsWith(q))) {
        speakerHint += parts[i - 1];
      }
      // Check for hint after
      if (i + 1 < parts.length && !startQuotes.some((q) => parts[i + 1]?.startsWith(q))) {
        speakerHint = (speakerHint ? speakerHint : "") + parts[i + 1];
      }

      const dialogue: Dialogue = {
        dialogueId: `d${++dialogueId}`,
        text: part ?? "",
      };

      if (speakerHint) {
        dialogue.speakerHint = speakerHint;
      }

      dialogues.push(dialogue);
    }
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
