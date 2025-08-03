import type { Sentence } from "nlcst";
import { ParseLatin } from "parse-latin";
import { toString } from "nlcst-to-string";
import { visit } from "unist-util-visit";

const text = `She said, "Yes, yes. Bank the takings, and lock up the shop." Then she added, "Get going or you'll miss your train."`;

console.log('Input text:', text);

const parser = new ParseLatin();
const tree = parser.parse(text);

let sentences: Sentence[] = [];
visit(tree, "SentenceNode", (node, index, parent) => {
  sentences.push(node);
});

console.log('\nParsed sentences:');
sentences.forEach((sentence, i) => {
  const text = toString(sentence);
  console.log(`Sentence ${i + 1}: "${text}"`);
});

// Now let's debug the dialogue detection logic
const startQuoteRegex = /^['""]/;
const endQuoteRegex = /[""].*?$/;

console.log('\nDebugging dialogue detection:');
sentences.forEach((sentence, i) => {
  const text = toString(sentence);
  const startsWithQuote = startQuoteRegex.test(text);
  const endsWithQuote = endQuoteRegex.test(text);
  console.log(`Sentence ${i + 1}: starts with quote: ${startsWithQuote}, ends with quote: ${endsWithQuote}`);
});
