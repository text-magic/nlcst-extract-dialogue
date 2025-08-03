import { describe, it, expect } from "bun:test";

import { type Dialogue, extractDialogues } from "./index";

describe("extractDialogues", () => {
  it("should not extract dialogues from plain sentences", () => {
    const text = "Hello world, how are you?";
    const dialogues = extractDialogues(text);
    expect(dialogues).toEqual([]);
  });

  it("should extract dialogues from a dialogue are one whole sentence.", () => {
    const text = `"Yes, peace and love."`;
    const dialogues = extractDialogues(text);
    expect(dialogues).toMatchObject([
      {
        dialogueId: "d1",
        text: `"Yes, peace and love."`,
      },
    ]);
  });

  it.only("should extract dialogues from a dialogue including multiple sentences", () => {
    const text = `"Yes, peace and love. We are the children of the universe."`;
    const dialogues = extractDialogues(text);
    expect(dialogues).toMatchObject([
      {
        dialogueId: "d1",
        text: `"Yes, peace and love. We are the children of the universe."`,
      },
    ]);
  });

  it("should extract dialogues from a sentences including multiple dialogues", () => {
    const text = `"Yes, peace and love. We are the children of the universe." and "We need to keep it secret, keep it safe."`;
    const dialogues = extractDialogues(text);
    expect(dialogues).toMatchObject([
      {
        dialogueId: "d1",
        text: `"Yes, peace and love. We are the children of the universe."`,
      },
      {
        dialogueId: "d2",
        text: `"We need to keep it secret, keep it safe."`,
      },
    ]);
  });

  it("should extract dialogues from a sentences which not begin with a quote", () => {
    const text = `She said, "Yes, peace and love."`;
    const dialogues = extractDialogues(text);
    expect(dialogues).toMatchObject([
      {
        dialogueId: "d1",
        text: `"Yes, peace and love."`,
        speakerHint: "She said, ",
      },
    ]);
  });

  it("should extract dialogues from a sentences which with extra text after end quote", () => {
    const text = `"Yes, peace and love," she said.`;
    const dialogues = extractDialogues(text);
    expect(dialogues).toMatchObject([
      {
        dialogueId: "d1",
        text: `"Yes, peace and love."`,
        speakerHint: " She said.",
      },
    ]);
  });
});
