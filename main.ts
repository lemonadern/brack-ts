import { assertEquals } from "https://deno.land/std@0.161.0/testing/asserts.ts";

// type TokenKind =
//   | "CurlyBracket"
//   | "SquareBracket"
//   | "AngleBracket"
//   | "Command"
//   | "Comma"
//   | "Text";
// type TokenValue = "{" | "}" | "[" | "]" | "," | string;

type CurlyBracketToken = {
  kind: "curlyBracket";
  value: "{" | "}";
};

type SquareBracketToken = {
  kind: "squareBracket";
  value: "[" | "]";
};

type AngleBracketToken = {
  kind: "angleBracket";
  value: "<" | ">";
};

type CommaToken = {
  kind: "comma";
  value: ",";
};

type CommandToken = {
  kind: "command";
  value: string;
};

type TextToken = {
  kind: "text";
  value: string;
};

export type Token =
  | CurlyBracketToken
  | SquareBracketToken
  | AngleBracketToken
  | CommaToken
  | CommandToken
  | TextToken;

// export type Token = string;

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
        tokens.push({
          kind: "text",
          value: tmpToken.trim(),
        });
        tmpToken = "";
      }
      tokens.push({
        kind: "angleBracket",
        value: "<",
      });
      current++;
      searchingCommandName = true;
    } else if (targetChar == ">" && angleBracketNestCount > 0) {
      angleBracketNestCount--;
      if (tmpToken !== "") {
        tokens.push({
          kind: "text",
          value: tmpToken.trim(),
        });
        tmpToken = "";
      }
      tokens.push({
        kind: "angleBracket",
        value: ">",
      });
      current++;
    } else if (targetChar === "[") {
      squareBracketNestCount++;
      if (tmpToken !== "") {
        tokens.push({
          kind: "text",
          value: tmpToken.trim(),
        });
        tmpToken = "";
      }
      tokens.push({
        kind: "squareBracket",
        value: "[",
      });
      current++;
      searchingCommandName = true;
    } else if (targetChar == "]" && squareBracketNestCount > 0) {
      squareBracketNestCount--;
      if (tmpToken !== "") {
        tokens.push({
          kind: "text",
          value: tmpToken.trim(),
        });
        tmpToken = "";
      }
      tokens.push({
        kind: "squareBracket",
        value: "]",
      });
      current++;
    } else if (targetChar === "{") {
      curlyBracketNestCount++;
      if (tmpToken !== "") {
        tokens.push({
          kind: "text",
          value: tmpToken.trim(),
        });
        tmpToken = "";
      }
      tokens.push({
        kind: "curlyBracket",
        value: "{",
      });
      current++;
      searchingCommandName = true;
    } else if (targetChar == "}" && curlyBracketNestCount > 0) {
      curlyBracketNestCount--;
      if (tmpToken !== "") {
        tokens.push({
          kind: "text",
          value: tmpToken.trim(),
        });
        tmpToken = "";
      }
      tokens.push({
        kind: "curlyBracket",
        value: "}",
      });
      current++;
    } else if (
      targetChar === "," &&
      (squareBracketNestCount > 0 || curlyBracketNestCount > 0 ||
        angleBracketNestCount > 0)
    ) {
      tokens.push({
        kind: "text",
        value: tmpToken.trim(),
      });
      tmpToken = "";
      tokens.push({
        kind: "comma",
        value: ",",
      });
      current++;
    } else if (targetChar === " " && searchingCommandName) {
      if (tmpToken !== "") {
        tokens.push({
          kind: "command",
          value: tmpToken.trim(),
        });
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
    tokens.push({
      kind: "text",
      value: tmpToken.trim(),
    });
  }
  return tokens;
}

Deno.test("ex", () => {
  const text = "{list {* strong text is here}}";
  // const expected = ["{", "list", "{", "*", "strong text is here", "}", "}"];
  const expected: Token[] = [
    {
      kind: "curlyBracket",
      value: "{",
    },
    { kind: "command", value: "list" },
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
      value: "strong text is here",
    },
    {
      kind: "curlyBracket",
      value: "}",
    },
    {
      kind: "curlyBracket",
      value: "}",
    },
  ];
  assertEquals(tokenizer(text), expected);
});

Deno.test("including new line", () => {
  const text = "{list\n {* strong text is here]]]}}";
  // const expected = ["{", "list", "{", "*", "strong text is here]]]", "}", "}"];
  const expected: Token[] = [
    {
      kind: "curlyBracket",
      value: "{",
    },
    { kind: "command", value: "list" },
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
      value: "strong text is here]]]",
    },
    {
      kind: "curlyBracket",
      value: "}",
    },
    {
      kind: "curlyBracket",
      value: "}",
    },
  ];
  assertEquals(tokenizer(text), expected);
});

Deno.test("escaped bracket", () => {
  const tokens = tokenizer("\\<");
  const expected: Token[] = [
    { kind: "text", value: "\<" },
  ];
  assertEquals(tokens, expected);
});

Deno.test("opening bracket", () => {
  const tokens = tokenizer("<");
  const expected: Token[] = [
    { kind: "angleBracket", value: "<" },
  ];
  assertEquals(tokens, expected);
});

Deno.test("a angle bracket pair", () => {
  const tokens = tokenizer("<>");
  const expected: Token[] = [
    { kind: "angleBracket", value: "<" },
    { kind: "angleBracket", value: ">" },
  ];
  assertEquals(tokens, expected);
});

Deno.test("nested angle bracket pair", () => {
  const tokens = tokenizer("{{}}");
  const expected: Token[] = [
    { kind: "curlyBracket", value: "{" },
    { kind: "curlyBracket", value: "{" },
    { kind: "curlyBracket", value: "}" },
    { kind: "curlyBracket", value: "}" },
  ];
  assertEquals(tokens, expected);
});

Deno.test("a square bracket pair", () => {
  const tokens = tokenizer("[]");
  const expected: Token[] = [
    { kind: "squareBracket", value: "[" },
    { kind: "squareBracket", value: "]" },
  ];
  assertEquals(tokens, expected);
});

Deno.test("a curly bracket pair", () => {
  const tokens = tokenizer("{}");
  const expected: Token[] = [
    { kind: "curlyBracket", value: "{" },
    { kind: "curlyBracket", value: "}" },
  ];
  assertEquals(tokens, expected);
});

Deno.test("nested bracket pair", () => {
  const tokens = tokenizer("{[]}");
  const expected: Token[] = [
    { kind: "curlyBracket", value: "{" },
    { kind: "squareBracket", value: "[" },
    { kind: "squareBracket", value: "]" },
    { kind: "curlyBracket", value: "}" },
  ];
  assertEquals(tokens, expected);
});

Deno.test("example", () => {
  const tokens = tokenizer("{li arg1, arg2}");
  // assertEquals(tokens, ["{", "li", "arg1", ",", "arg2", "}"]);
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

Deno.test("example", () => {
  const tokens = tokenizer("{* 文字列}");
  // assertEquals(tokens, ["{", "*", "文字列", "}"]);
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

Deno.test("example", () => {
  const tokens = tokenizer("[* [/ 文字列 ]]");
  // assertEquals(tokens, ["[", "*", "[", "/", "文字列", "]", "]"]);
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
