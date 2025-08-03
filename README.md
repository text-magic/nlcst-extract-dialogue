# @text-magic/nlcst-extract-dialogue

## Features

- Extract dialogues from sentences.

## Installation

TODO:

## Usage

```ts
import { extractDialogues } from "@text-magic/nlcst-extract-dialogue";

const text = `“Yes, yes. Bank the takings, and lock up the shop,” she said. “Get going or you’ll miss your train.”`;
const dialogues = extractDialogues(text);
console.log(dialogues);
```

Output:
```json
[
  {
    "dialogueId": "d1",
    "nodes": "“Yes, yes. Bank the takings, and lock up the shop,” she said.",
    "speakerHint": "she said"
  },
  {
    "dialogueId": "d2",
    "nodes": "“Get going or you’ll miss your train.”"
  }
]
```
