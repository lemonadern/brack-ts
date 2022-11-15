import {
  assert,
  assertEquals,
  assertIsError,
} from "https://deno.land/std@0.161.0/testing/asserts.ts";

import { err, ok, Result } from "npm:neverthrow@5.1.0";

import { Token } from "./tokenTypes.ts";

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

const parseExpression = () => {};

class ParseError extends Error {}

type ParseResult<N extends Node> = Result<N, ParseError>;

const parseText = (tokens: Token[], index: number): ParseResult<AtomNode> => {
  const { kind, value } = tokens[index];
  if (kind === "text") {
    return ok({
      kind,
      value,
    });
  }
  return err(new ParseError("not a text node"));
};

const test = Deno.test;

test("parseText: ok path", () => {
  const tokens: Token[] = [
    { kind: "comma", value: "," },
    { kind: "text", value: "hi, this is text." },
    { kind: "comma", value: "," },
  ];
  const expected: AtomNode = {
    kind: "text",
    value: "hi, this is text.",
  };
  const resultNode = parseText(tokens, 1);
  assert(resultNode.isOk);

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
