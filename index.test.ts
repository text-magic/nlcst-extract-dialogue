import { describe, it, expect } from "bun:test";

import { type Dialogue, extractDialogues } from "./index";

describe("extractDialogues", () => {
  it("should not extract dialogues from plain text", () => {
    const text = "Hello world";
    const dialogues = extractDialogues(text);
    expect(dialogues).toEqual([]);
  });

  it("should extract dialogues from text", () => {
    const text =
      "“Yes, yes. Bank the takings, and lock up the shop,” she said. “Get going or you’ll miss your train.”";
    const dialogues = extractDialogues(text);
    expect(dialogues).toMatchObject([
      {
        dialogueId: "d1",
        nodes: "“Yes, yes. Bank the takings, and lock up the shop,” she said.",
        speakerHint: "she said",
      },
      {
        dialogueId: "d2",
        nodes: "“Get going or you’ll miss your train.”",
      },
    ]);
  });
});
