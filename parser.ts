import { Token } from "./main.ts";

type Node = ExpressionNode | AtomNode;

type AtomNodeKind = "command" | "text";
type AtomNode = {
  kind: AtomNodeKind;
  value: string;
};

type ExpressionNodeKind = "block" | "inline" | "macro" | "argument";
type ExpressionNode = {
  kind: ExpressionNodeKind;
  value: string;
  children: Node[];
};

type AST = {
  kind: "root";
  children: Node[];
};

export function parser(tokens: Token[]) {
  let i = 0;

  function parse(): Node {
    let token = tokens[i];

    if (token.kind === "text") {
      i++;
      return {
        kind: "text",
        value: token.value,
      };
    }
  }

  // immutable
  const ast: AST = {
    kind: "root",
    children: [],
  };

  while (i > tokens.length) {
    ast.children.push(parse());
  }

  return ast;
}
