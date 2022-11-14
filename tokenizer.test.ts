import { assertEquals } from "https://deno.land/std@0.161.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.164.0/testing/bdd.ts";

import { tokenize } from "./tokenizer.ts";
import { Token } from "./tokenTypes.ts";

// BDD からの逃避
const test = it;

describe("pairs of brackets", () => {
  test("a pair of curly brackets", () => {
    const tokens = tokenize("{}");
    const expected: Token[] = [
      { kind: "curlyBracket", value: "{" },
      { kind: "curlyBracket", value: "}" },
    ];
    assertEquals(tokens, expected);
  });

  test("a pair of square brackets", () => {
    const tokens = tokenize("[]");
    const expected: Token[] = [
      { kind: "squareBracket", value: "[" },
      { kind: "squareBracket", value: "]" },
    ];
    assertEquals(tokens, expected);
  });

  test("a pair of angle brackets", () => {
    const tokens = tokenize("<>");
    const expected: Token[] = [
      { kind: "angleBracket", value: "<" },
      { kind: "angleBracket", value: ">" },
    ];
    assertEquals(tokens, expected);
  });

  test("nested curly bracket pairs", () => {
    const tokens = tokenize("{{}}");
    const expected: Token[] = [
      { kind: "curlyBracket", value: "{" },
      { kind: "curlyBracket", value: "{" },
      { kind: "curlyBracket", value: "}" },
      { kind: "curlyBracket", value: "}" },
    ];
    assertEquals(tokens, expected);
  });

  test("nested bracket pairs", () => {
    const tokens = tokenize("{[]}");
    const expected: Token[] = [
      { kind: "curlyBracket", value: "{" },
      { kind: "squareBracket", value: "[" },
      { kind: "squareBracket", value: "]" },
      { kind: "curlyBracket", value: "}" },
    ];
    assertEquals(tokens, expected);
  });
});

describe("bracket が片方だけの場合", () => {
  test("開き括弧のとき、括弧のトークンになる", () => {
    const tokens = tokenize("<");
    const expected: Token[] = [
      { kind: "angleBracket", value: "<" },
    ];
    assertEquals(tokens, expected);
  });

  test("閉じ括弧のとき、単なるテキストになる", () => {
    const tokens = tokenize(">");
    const expected: Token[] = [
      { kind: "text", value: ">" },
    ];
    assertEquals(tokens, expected);
  });

  test("escaped bracket", () => {
    const tokens = tokenize("\\<");
    const expected: Token[] = [
      { kind: "text", value: "\<" },
    ];
    assertEquals(tokens, expected);
  });
});

describe("改行", () => {
  test("トークンの間に改行", () => {
    const text = "{list\n [* strong text is here]}";
    const expected: Token[] = [
      {
        kind: "curlyBracket",
        value: "{",
      },
      { kind: "command", value: "list" },
      {
        kind: "squareBracket",
        value: "[",
      },
      {
        kind: "command",
        value: "*",
      },
      {
        kind: "text",
        value: "strong text is here",
      },
      {
        kind: "squareBracket",
        value: "]",
      },
      {
        kind: "curlyBracket",
        value: "}",
      },
    ];
    assertEquals(tokenize(text), expected);
  });

  test("トークンの中に改行", () => {
    const text = "{list [* strong text\n is here]}";
    const expected: Token[] = [
      {
        kind: "curlyBracket",
        value: "{",
      },
      { kind: "command", value: "list" },
      {
        kind: "squareBracket",
        value: "[",
      },
      {
        kind: "command",
        value: "*",
      },
      {
        kind: "text",
        value: "strong text\n is here",
      },
      {
        kind: "squareBracket",
        value: "]",
      },
      {
        kind: "curlyBracket",
        value: "}",
      },
    ];
    assertEquals(tokenize(text), expected);
  });
});

describe("examples", () => {
  test("example 1", () => {
    const text = "{list [* strong text is here]not here, not here\\,too. }";
    const expected: Token[] = [
      {
        kind: "curlyBracket",
        value: "{",
      },
      { kind: "command", value: "list" },
      {
        kind: "squareBracket",
        value: "[",
      },
      {
        kind: "command",
        value: "*",
      },
      {
        kind: "text",
        value: "strong text is here",
      },
      {
        kind: "squareBracket",
        value: "]",
      },
      { kind: "text", value: "not here" },
      {
        kind: "comma",
        value: ",",
      },
      {
        kind: "text",
        value: "not here,too.",
      },
      {
        kind: "curlyBracket",
        value: "}",
      },
    ];
    assertEquals(tokenize(text), expected);
  });

  test("example 2", () => {
    const tokens = tokenize("{li arg1, arg2}");
    const expected: Token[] = [
      {
        kind: "curlyBracket",
        value: "{",
      },
      {
        kind: "command",
        value: "li",
      },
      {
        kind: "text",
        value: "arg1",
      },
      {
        kind: "comma",
        value: ",",
      },
      {
        kind: "text",
        value: "arg2",
      },
      {
        kind: "curlyBracket",
        value: "}",
      },
    ];
    assertEquals(tokens, expected);
  });

  test("example 3", () => {
    const tokens = tokenize("{* 文字列}");
    const expected: Token[] = [
      {
        kind: "curlyBracket",
        value: "{",
      },
      {
        kind: "command",
        value: "*",
      },
      {
        kind: "text",
        value: "文字列",
      },
      {
        kind: "curlyBracket",
        value: "}",
      },
    ];
    assertEquals(tokens, expected);
  });

  test("example 4", () => {
    const tokens = tokenize("[* [/ 文字列 ]]");
    const expected: Token[] = [
      {
        kind: "squareBracket",
        value: "[",
      },
      {
        kind: "command",
        value: "*",
      },
      {
        kind: "squareBracket",
        value: "[",
      },
      {
        kind: "command",
        value: "/",
      },
      {
        kind: "text",
        value: "文字列",
      },
      {
        kind: "squareBracket",
        value: "]",
      },
      {
        kind: "squareBracket",
        value: "]",
      },
    ];
    assertEquals(tokens, expected);
  });
});
