import { Token } from "./types.ts";

export function tokenize(input: string): Token[] {
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
