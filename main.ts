import { assertEquals } from "https://deno.land/std@0.161.0/testing/asserts.ts";

// type TokenType =
//   | "CurlyBracket"
//   | "SquareBracket"
//   | "AngleBracket"
//   | "Command"
//   | "Comma"
//   | "LiteralArgument";
// type TokenValue = "{" | "}" | "[" | "]" | "," | string;
// type Token = {
//   type: TokenType;
//   value: TokenValue;
// };

export type Token = string;

export function tokenizer(input: string): Token[] {
  // immutable array
  const tokens: Token[] = [];

  let current = 0;
  let tmpToken = "";
  let escaping = false;
  let searchingCommandName = false;

  let angleBracketNestCount = 0;
  let squareBracketNestCount = 0;
  let curlyBracketNestCount = 0;

  while (current < input.length) {
    const targetChar = input[current];

    if (escaping) {
      escaping = false;
      tmpToken += targetChar;
      current++;
    } else if (targetChar === "\\") {
      escaping = true;
      current++;
    } else if (targetChar === "<") {
      angleBracketNestCount++;
      if (tmpToken !== "") {
        tokens.push(tmpToken.trim());
        tmpToken = "";
      }
      tokens.push(targetChar);
      current++;
      searchingCommandName = true;
    } else if (targetChar == ">" && angleBracketNestCount > 0) {
      angleBracketNestCount--;
      if (tmpToken !== "") {
        tokens.push(tmpToken.trim());
        tmpToken = "";
      }
      tokens.push(targetChar);
      current++;
    } else if (targetChar === "[") {
      squareBracketNestCount++;
      if (tmpToken !== "") {
        tokens.push(tmpToken.trim());
        tmpToken = "";
      }
      tokens.push(targetChar);
      current++;
      searchingCommandName = true;
    } else if (targetChar == "]" && squareBracketNestCount > 0) {
      squareBracketNestCount--;
      if (tmpToken !== "") {
        tokens.push(tmpToken.trim());
        tmpToken = "";
      }
      tokens.push(targetChar);
      current++;
    } else if (targetChar === "{") {
      curlyBracketNestCount++;
      if (tmpToken !== "") {
        tokens.push(tmpToken.trim());
        tmpToken = "";
      }
      tokens.push(targetChar);
      current++;
      searchingCommandName = true;
    } else if (targetChar == "}" && curlyBracketNestCount > 0) {
      curlyBracketNestCount--;
      if (tmpToken !== "") {
        tokens.push(tmpToken.trim());
        tmpToken = "";
      }
      tokens.push(targetChar);
      current++;
    } else if (
      targetChar === "," &&
      (squareBracketNestCount > 0 || curlyBracketNestCount > 0 ||
        angleBracketNestCount > 0)
    ) {
      tokens.push(tmpToken.trim());
      tmpToken = "";
      tokens.push(targetChar);
      current++;
    } else if (targetChar === " " && searchingCommandName) {
      if (tmpToken !== "") {
        tokens.push(tmpToken.trim());
        tmpToken = "";
        current++;
      }
      searchingCommandName = false;
    } else {
      tmpToken += targetChar;
      current++;
    }
  }
  if (tmpToken !== "") {
    tokens.push(tmpToken.trim());
  }
  return tokens;
}

Deno.test("ex", () => {
  const text = "{list {* strong text is here}}";
  const expected = ["{", "list", "{", "*", "strong text is here", "}", "}"];
  assertEquals(tokenizer(text), expected);
});

Deno.test("including new line", () => {
  const text = "{list\n {* strong text is here]]]}}";
  const expected = ["{", "list", "{", "*", "strong text is here]]]", "}", "}"];
  assertEquals(tokenizer(text), expected);
});

Deno.test("escaped bracket", () => {
  const tokens = tokenizer("\<");
  assertEquals(tokens, ["\<"]);
});

Deno.test("opening bracket", () => {
  const tokens = tokenizer("<");
  assertEquals(tokens, ["<"]);
});

Deno.test("a angle bracket pair", () => {
  const tokens = tokenizer("<>");
  assertEquals(tokens, ["<", ">"]);
});

Deno.test("nested angle bracket pair", () => {
  const tokens = tokenizer("{{}}");
  assertEquals(tokens, ["{", "{", "}", "}"]);
});

Deno.test("a square bracket pair", () => {
  const tokens = tokenizer("[]");
  assertEquals(tokens, ["[", "]"]);
});

Deno.test("a curly bracket pair", () => {
  const tokens = tokenizer("{}");
  assertEquals(tokens, ["{", "}"]);
});

Deno.test("nested bracket pair", () => {
  const tokens = tokenizer("{[]}");
  assertEquals(tokens, ["{", "[", "]", "}"]);
});

Deno.test("example", () => {
  const tokens = tokenizer("{li arg1, arg2}");
  assertEquals(tokens, ["{", "li", "arg1", ",", "arg2", "}"]);
});

Deno.test("example", () => {
  const tokens = tokenizer("{li arg1, arg2 }");
  assertEquals(tokens, ["{", "li", "arg1", ",", "arg2", "}"]);
});

Deno.test("example", () => {
  const tokens = tokenizer("{* 文字列}");
  assertEquals(tokens, ["{", "*", "文字列", "}"]);
});

Deno.test("example", () => {
  const tokens = tokenizer("[* [/ 文字列 ]]");
  assertEquals(tokens, ["[", "*", "[", "/", "文字列", "]", "]"]);
});

Deno.test("escaped bracket", () => {
  const tokens = tokenizer("\\[aaa\\]");
  assertEquals(tokens, ["\[aaa\]"]);
});

Deno.test("escaped bracket", () => {
  const tokens = tokenizer("\\<enh>");
  assertEquals(tokens, ["\<enh>"]);
});

Deno.test("escaped bracket", () => {
  const tokens = tokenizer("\\[enh][]");
  assertEquals(tokens, ["\[enh]", "[", "]"]);
});

Deno.test("example a", () => {
  const tokens = tokenizer(
    "{li this is whitespace , hi\\,i'm here , your *bracket* is nice!! }",
  );
  assertEquals(tokens, [
    "{",
    "li",
    "this is whitespace",
    ",",
    "hi,i'm here",
    ",",
    "your *bracket* is nice!!",
    "}",
  ]);
});
