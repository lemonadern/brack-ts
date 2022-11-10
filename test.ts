import { assertEquals } from "https://deno.land/std@0.161.0/testing/asserts.ts";
import { tokenizer } from "./main.ts";

Deno.test("]]", () => {
  const tokens = tokenizer("\\[aaa\\]");
  assertEquals(tokens, ["\[aaa\]"]);
});

Deno.test("]]", () => {
  const tokens = tokenizer("\\<enh>");
  assertEquals(tokens, ["\<enh>"]);
});

Deno.test("]]", () => {
  const tokens = tokenizer("\\[enh][]");
  assertEquals(tokens, ["\[enh]", "[", "]"]);
});
