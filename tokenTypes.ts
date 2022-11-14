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
