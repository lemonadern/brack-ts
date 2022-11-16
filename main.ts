import {
  assert,
  assertEquals,
  assertIsError,
} from "https://deno.land/std@0.161.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.164.0/testing/bdd.ts";

import { Option } from "npm:fp-ts/lib/Option.ts";
import { err, ok, Result } from "npm:neverthrow@5.1.0";
import { Token } from "./tokenTypes.ts";

const test = it;

type Node = ExpressionNode | AtomNode;

type AtomNode = CommandNode | TextNode;

type ExpressionNodeKind = "block" | "inline" | "macro";
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
    - parseBlock
    - parseInline
    - parseMacro
    - parseText

  parseText
    - token is a text

  parseInline
    - comsume "["
    - parseCommand? consumeCommand?
    - make inlineNode
    - parse arguments (loop)
      - parseText
      - parseInline
      - parseMacro?
    - ok
      - add node to block's arguments
      - comsume "]"
      - return inlineNode
    err: cannnot parse tokens as inline

  parseBlock
    - comsume "{"
    - parseCommand? consumeCommand?
    - parse arguments (loop)
      - parseText
      - parseInline
      - parseMacro?
    - ok
      - add node to block's arguments
      - consume "}"
      - return parseBlock
    err: cannnot parse tokens as block

  parseMacro
    - ***** todo *****

 */
}

// const parseExpression = (tokens: Token[], index: number): ParseResult<Node> => {};

class ParseError extends Error {}

type NodeAndIndex<T extends Node> = { node: T; index: number };
type ParseResult<N extends Node> = Result<NodeAndIndex<N>, ParseError>;

type InlineNode = {
  command: string;
  arguments: InlineNodeArguments[];
};
type InlineNodeArguments = InlineNode | TextNode;

const parseInline = (tokens: Token[]) => (index: number): ParseResult<Node> => {
  const { kind, value } = tokens[index];
  const node: InlineNode = { command, arguments: [] };

  const { command, i } = consume(tokens, index, { value: "[" })
    .andThen(consumeCommand(tokens))
    .match((o) => ok(o), () => {
      return err(new ParseError("Cannot parse tokens as InlineNode"));
    });
};

class ConsumeError extends Error {}
type ConsumeResult = Result<number, ConsumeError>;

const consume = (
  tokens: Token[],
  index: number,
  target: Partial<Token>, // todo: update to appropreate type that accepts either `kind` or `value`
): ConsumeResult => {
  const { kind, value } = tokens[index];
  const { kind: targetKind, value: targetValue } = target;

  const kindEqualsTarget = kind === targetKind;
  const valueEqualsTarget = value === targetValue;

  if (!targetKind && !targetValue) {
    return err(new ConsumeError("Cannot consume: Specify the target."));
  }

  if (kindEqualsTarget && valueEqualsTarget) {
    return ok(index + 1);
  }

  if (!targetValue && kindEqualsTarget) {
    return ok(index + 1);
  }

  if (!targetKind && valueEqualsTarget) {
    return ok(index + 1);
  }

  return err(new ConsumeError("Target didn't match the target."));
};

describe("consume", () => {
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

  test("Sad path: target is invalid token", () => {
    const tokens: Token[] = [{ kind: "curlyBracket", value: "{" }];

    const result = consume(tokens, 0, { kind: "curlyBracket", value: "}" });

    assert(result.isErr);
    assertIsError(result._unsafeUnwrapErr(), ConsumeError, "didn't match");
  });

  test("Sad path: target doesn't have any props", () => {
    const tokens: Token[] = [{ kind: "comma", value: "," }];

    const result = consume(tokens, 0, {});

    assert(result.isErr);
    assertIsError(result._unsafeUnwrapErr(), ConsumeError, "Cannot consume");
  });
});

// use consumeCommand or parseCommand (considering)

class ConsumeCommandError extends Error {}
type CommandNameAndIndex = {
  command: string;
  index: number;
};
type ConsumeCommandResult = Result<CommandNameAndIndex, ConsumeCommandError>;

// todo: consumer must return index
const consumeCommand =
  (tokens: Token[]) => (index: number): ConsumeCommandResult => {
    const { kind, value } = tokens[index];
    if (kind === "command") {
      return ok({ command: value, index: index + 1 });
    }
    return err(new ConsumeCommandError("cannot consume command."));
  };

describe("consumeCommand", () => {
  test("Happy path", () => {
    const tokens: Token[] = [{ kind: "command", value: "bold" }];
    const result = consumeCommand(tokens)(0);
    assert(result.isOk);

    assertEquals(result._unsafeUnwrap(), { command: "bold", index: 1 });
  });

  test("Err path: token isn't a command", () => {
    const tokens: Token[] = [
      { kind: "text", value: "hi, this is text." },
    ];
    const resultNode = consumeCommand(tokens)(0);
    assert(resultNode.isErr);

    assertIsError(
      resultNode._unsafeUnwrapErr(),
      ConsumeCommandError,
      "cannot consume command",
    );
  });
});

type CommandNode = {
  kind: "command";
  value: string;
};

const parseCommand =
  (tokens: Token[]) => (index: number): ParseResult<CommandNode> => {
    const { kind, value } = tokens[index];
    if (kind === "command") {
      return ok({
        node: { kind, value },
        index: index + 1,
      });
    }
    return err(new ParseError("not a command token."));
  };

describe("parseCommand", () => {
  test("Happy Path", () => {
    const tokens: Token[] = [{ kind: "command", value: "bold" }];
    const result = parseCommand(tokens)(0);
    assert(result.isOk);

    const expected = {
      node: { kind: "command", value: "bold" },
      index: 1,
    };
    assertEquals(result._unsafeUnwrap(), expected);
  });

  test("Err path: token isn't a command", () => {
    const tokens: Token[] = [
      { kind: "text", value: "hi, this is text." },
    ];
    const resultNode = parseCommand(tokens)(0);
    assert(resultNode.isErr);

    assertIsError(resultNode._unsafeUnwrapErr(), ParseError, "command");
  });
});

type TextNode = {
  kind: "text";
  value: string;
};

const parseText =
  (tokens: Token[]) => (index: number): ParseResult<TextNode> => {
    const { kind, value } = tokens[index];
    if (kind === "text") {
      return ok({
        node: { kind, value },
        index: index + 1,
      });
    }
    return err(new ParseError("not a text token."));
  };

describe("parseText", () => {
  test("Happy path", () => {
    const tokens: Token[] = [
      { kind: "comma", value: "," },
      { kind: "text", value: "hi, this is text." },
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

  test("Err path: token isn't a text", () => {
    const tokens: Token[] = [
      { kind: "text", value: "hi, this is text." },
      { kind: "comma", value: "," },
    ];
    const resultNode = parseText(tokens, 1);
    assert(resultNode.isErr);

    assertIsError(resultNode._unsafeUnwrapErr(), ParseError, "text");
  });
});
