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
  let index = 0;

  function parse(): Node {
    // todo: implement
  }

  // immutable
  const ast: AST = {
    kind: "root",
    children: [],
  };

  while (index > tokens.length) {
    ast.children.push(parse());
  }

  return ast;
}
