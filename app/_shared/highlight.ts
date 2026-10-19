// app/_shared/highlight.ts
// Tiny, dependency-free TS/TSX highlighter. Understands comments, strings, numbers, keywords,
// function calls, types/components, JSX tags, JSX attributes and JSX text (so words inside
// <p>…</p> are NOT coloured like code). Pure function: no globals, no leaks.

export type Tok = { t: string; c: string };

// Chalk-on-charcoal palette (soft pastels that stay readable on #1D1D1D)
const C = {
  comment: "text-[#7A7A74] italic",
  string: "text-[#A9D6A0]",
  keyword: "text-[#D3A9EC]",
  fn: "text-[#8CC8EA]",
  type: "text-[#EBD48E]",
  tag: "text-[#EE9C9C]",
  attr: "text-[#A4D4DC]",
  constant: "text-[#EDB68A]",
  number: "text-[#EDB68A]",
  prop: "text-[#EFEDE4]",
  tagPunct: "text-[#6E6E69]",
} as const;

const KEYWORDS = new Set([
  "import", "export", "from", "default", "const", "let", "var", "function", "return", "if", "else",
  "for", "while", "switch", "case", "break", "continue", "new", "typeof", "instanceof", "as", "type",
  "interface", "extends", "implements", "async", "await", "try", "catch", "finally", "throw", "class",
  "static", "public", "private", "readonly", "of", "in", "void", "enum", "satisfies", "keyof", "do",
]);
const CONSTS = new Set(["true", "false", "null", "undefined", "NaN", "this"]);
const TYPES = new Set(["string", "number", "boolean", "unknown", "any", "never", "object", "symbol"]);
const HTML_TAGS = new Set([
  "a", "div", "span", "p", "button", "svg", "path", "img", "ul", "ol", "li", "section", "nav", "pre",
  "code", "input", "label", "h1", "h2", "h3", "h4", "h5", "h6", "main", "header", "footer", "form",
  "textarea", "table", "tr", "td", "th", "aside", "article", "circle", "rect", "g", "strong", "em",
  "small", "select", "option", "defs", "stop", "linearGradient",
]);

// 1 comment | 2 string | 3 "<tag" / "</tag" | 4 number | 5 identifier | 6 whitespace | 7 any char
// (\x60 is a backtick, written this way to keep the template literal simple)
const SRC = String.raw`(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|(\x60(?:\\[\s\S]|[^\x60\\])*\x60|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(<\/?[A-Za-z][\w.]*)|(\d[\d_]*(?:\.\d+)?)|([A-Za-z_$][\w$]*)|(\s+)|([\s\S])`;

type Frame =
  | { k: "tag"; brace: number; closing: boolean } // inside <Tag … >
  | { k: "el" } //                                    JSX children (text mode)
  | { k: "expr"; b: number }; //                       {…} expression inside JSX children

function nextNonSpace(s: string, from: number) {
  let k = from;
  while (k < s.length && (s[k] === " " || s[k] === "\t")) k++;
  return s[k];
}

export function highlight(code: string): Tok[] {
  const out: Tok[] = [];
  const push = (t: string, c: string) => {
    const last = out[out.length - 1];
    if (last && last.c === c) last.t += t;
    else out.push({ t, c });
  };

  const re = new RegExp(SRC, "y");
  const stack: Frame[] = [];
  const n = code.length;
  let i = 0;

  while (i < n) {
    let top = stack[stack.length - 1];

    // JSX text: everything up to the next "<" or "{" is plain text.
    if (top?.k === "el") {
      let j = i;
      while (j < n && code[j] !== "<" && code[j] !== "{") j++;
      if (j > i) {
        push(code.slice(i, j), "");
        i = j;
        if (i >= n) break;
      }
    }

    re.lastIndex = i;
    const m = re.exec(code);
    if (!m) break;
    const text = m[0];
    const idx = i;
    i = idx + text.length;
    top = stack[stack.length - 1];

    if (m[1]) {
      push(text, C.comment);
    } else if (m[2]) {
      push(text, C.string);
    } else if (m[3]) {
      const closing = text[1] === "/";
      const name = text.slice(closing ? 2 : 1);
      const inText = top?.k === "el";
      const isComp = /^[A-Z]/.test(name);
      const prev = code[idx - 1] ?? "";
      const generic = !inText && /[\w$)\]]/.test(prev); // Array<string>, useState<Foo>
      if (generic || (!inText && !isComp && !HTML_TAGS.has(name.split(".")[0]))) {
        push("<", "");
        i = idx + 1;
        continue;
      }
      push(closing ? "</" : "<", C.tagPunct);
      push(name, isComp ? C.type : C.tag);
      stack.push({ k: "tag", brace: 0, closing });
    } else if (m[4]) {
      push(text, C.number);
    } else if (m[5]) {
      let word = text;
      let c = "";
      if (top?.k === "tag" && top.brace === 0) {
        // attribute name (supports data-foo / aria-hidden)
        let end = idx + text.length;
        while (code[end] === "-" && /[\w$]/.test(code[end + 1] ?? "")) {
          end++;
          while (/[\w$]/.test(code[end] ?? "")) end++;
        }
        word = code.slice(idx, end);
        i = end;
        c = C.attr;
      } else {
        const prev = code[idx - 1];
        const after = nextNonSpace(code, i);
        if (prev === ".") c = after === "(" ? C.fn : C.prop;
        else if (KEYWORDS.has(word)) c = C.keyword;
        else if (CONSTS.has(word)) c = C.constant;
        else if (TYPES.has(word)) c = C.type;
        else if (after === "(") c = C.fn;
        else if (/^[A-Z]/.test(word)) c = C.type;
      }
      push(word, c);
    } else if (m[6]) {
      push(text, "");
    } else {
      const ch = text;

      if (ch === "<" && code[idx + 1] === ">") {
        push("<>", C.tagPunct);
        i = idx + 2;
        stack.push({ k: "el" });
      } else if (ch === "<" && code.startsWith("</>", idx)) {
        push("</>", C.tagPunct);
        i = idx + 3;
        if (stack[stack.length - 1]?.k === "el") stack.pop();
      } else if (ch === "{") {
        if (top?.k === "tag") top.brace++;
        else if (top?.k === "expr") top.b++;
        else if (top?.k === "el") stack.push({ k: "expr", b: 1 });
        push(ch, "");
      } else if (ch === "}") {
        if (top?.k === "tag" && top.brace > 0) top.brace--;
        else if (top?.k === "expr") {
          top.b--;
          if (top.b === 0) stack.pop();
        }
        push(ch, "");
      } else if (top?.k === "tag" && top.brace === 0 && ch === "/" && code[idx + 1] === ">") {
        push("/>", C.tagPunct);
        i = idx + 2;
        stack.pop(); // self-closing
      } else if (top?.k === "tag" && top.brace === 0 && ch === ">") {
        stack.pop();
        if (top.closing) {
          if (stack[stack.length - 1]?.k === "el") stack.pop();
        } else {
          stack.push({ k: "el" });
        }
        push(ch, C.tagPunct);
      } else {
        push(ch, "");
      }
    }
  }

  return out;
}

/** Highlight and split into lines (tokens that span newlines are split). */
export function highlightLines(code: string): Tok[][] {
  const lines: Tok[][] = [[]];
  for (const tok of highlight(code)) {
    const parts = tok.t.split("\n");
    parts.forEach((p, k) => {
      if (k > 0) lines.push([]);
      if (p) lines[lines.length - 1].push({ t: p, c: tok.c });
    });
  }
  return lines;
}