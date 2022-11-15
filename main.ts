import {
  assert,
  assertEquals,
  assertIsError,
} from "https://deno.land/std@0.161.0/testing/asserts.ts";

import { err, ok, Result } from "npm:neverthrow@5.1.0";
import { Token } from "./tokenTypes.ts";

const test = Deno.test;

type Node = ExpressionNode | AtomNode;

type AtomNodeKind = "command" | "text";
type AtomNode = {
  kind: AtomNodeKind;
  value: string;
};

type ExpressionNodeKind = "block" | "inline" | "argument"; // todo: "macro"
type ExpressionNode = {
  kind: ExpressionNodeKind;
  value: string;
  children: Node[];
};

type AST = {
  kind: "root";
  children: Node[];
};

export const parse = (tokens: Token[]): AST => {
  // some stuff...

  const ast: AST = {
    kind: "root",
    children: [],
  };

  // some stuff...

  return ast;
};

{
  /*
  parseExpression
    - token[i] が opening bracket のとき
      - コマンド名を読む
        - parseCommand ?
      - expression の node をつくる
      - 引数を読む
        - parseExpression(recursion) ? or parseArgument ?
 */
}

{
  /*
  parseExpression
    - parseBlock
      - parseCommand
      - parseExpression (recursion)
    - parseInline
      - parseCommand
      - parseExpression (recursion)

 */
}

const parseExpression = () => {};

class ParseError extends Error {}
class ConsumeError extends Error {}

type NodeAndIndex<T extends Node> = { node: T; index: number };
type ParseResult<N extends Node> = Result<NodeAndIndex<N>, ParseError>;

type ConsumeResult = Result<number, ConsumeError>;

const consume = (
  tokens: Token[],
  index: number,
  target: Partial<Token>,
): ConsumeResult => {
  const { kind, value } = tokens[index];
  const { kind: targetKind, value: targetValue } = target;

  if (targetKind) {
    return targetKind === kind
      ? ok(index + 1)
      : err(new ConsumeError("Target didn't match the token."));
  }

  if (targetValue) {
    return targetValue === value
      ? ok(index + 1)
      : err(new ConsumeError("Target didn't match the token."));
  }

  return err(new ConsumeError("Cannnot consume the token."));
};

test("Happy path: consume with kind", () => {
  const tokens: Token[] = [{ kind: "comma", value: "," }];

  const result = consume(tokens, 0, { kind: "comma" });

  assert(result.isOk);
  assertEquals(result._unsafeUnwrap(), 1);
});

test("Sad path: target does not match the token (with kind)", () => {
  const tokens: Token[] = [{ kind: "comma", value: "," }];

  const result = consume(tokens, 0, { kind: "text" });

  assert(result.isErr);
  assertIsError(result._unsafeUnwrapErr(), ConsumeError, "didn't match");
});

test("Happy path: consume with value", () => {
  const tokens: Token[] = [{ kind: "text", value: "hi, you" }];

  const result = consume(tokens, 0, { value: "hi, you" });

  assert(result.isOk);
  assertEquals(result._unsafeUnwrap(), 1);
});

test("Sad path: target does not match the token (with value)", () => {
  const tokens: Token[] = [{ kind: "comma", value: "," }];

  const result = consume(tokens, 0, { value: "}" });

  assert(result.isErr);
  assertIsError(result._unsafeUnwrapErr(), ConsumeError, "didn't match");
});

test("Sad path: target doesn't have any props", () => {
  const tokens: Token[] = [{ kind: "comma", value: "," }];

  const result = consume(tokens, 0, {});

  assert(result.isErr);
  assertIsError(result._unsafeUnwrapErr(), ConsumeError, "Cannnot consume");
});

const parseText = (
  tokens: Token[],
  index: number,
): ParseResult<AtomNode> => {
  const { kind, value } = tokens[index];
  if (kind === "text") {
    return ok({
      node: { kind, value },
      index: index + 1,
    });
  }
  return err(new ParseError("not a text node"));
};

test("parseText: ok path", () => {
  const tokens: Token[] = [
    { kind: "comma", value: "," },
    { kind: "text", value: "hi, this is text." },
    { kind: "comma", value: "," },
  ];
  const resultNode = parseText(tokens, 1);
  assert(resultNode.isOk);

  const expected = {
    node: {
      kind: "text",
      value: "hi, this is text.",
    },
    index: 2,
  };

  assertEquals(resultNode._unsafeUnwrap(), expected);
});

test("parseText: err path", () => {
  const tokens: Token[] = [
    { kind: "comma", value: "," },
    { kind: "text", value: "hi, this is text." },
    { kind: "comma", value: "," },
  ];
  const resultNode = parseText(tokens, 2);
  assert(resultNode.isErr);

  assertIsError(resultNode._unsafeUnwrapErr(), ParseError, "text");
});
