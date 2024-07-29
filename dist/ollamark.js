#!/usr/bin/env bun
// @bun

// src/ollamark.tsx
import ollama2 from "ollama";
import {Command} from "commander";

// package.json
var name = "ollamark";
var version = "0.1.0";
var description = "A command-line client for Ollama with markdown support";

// src/commands/run.tsx
import {Box as Box2, Static, Text as Text2, render} from "ink";

// src/components/Message.tsx
import {Box, Text} from "ink";

// src/support/markdown.tsx
import {
Box as InkBox,
Text as InkText,
Transform
} from "ink";

// src/support/theming.tsx
import React from "react";
import chalk from "chalk";
import {identity} from "lodash-es";
function useTheme() {
  return React.useContext(ThemeContext);
}
var colors = {
  yellow: "#fad000",
  pink: "#ff628c",
  purple: "#b362ff",
  cyan: "#9effff",
  green: "#a5ff90",
  dimPurple: "#a599e9",
  darkPurple: "#2D2B55"
};
var defaultTheme = {
  text: "#fffbff",
  muted: colors.dimPurple,
  heading: colors.yellow,
  link: colors.cyan,
  listItem: colors.purple,
  inlineCode: colors.yellow,
  emphasis: colors.green,
  strong: colors.dimPurple,
  delete: colors.dimPurple,
  code: colors.darkPurple,
  blockquote: colors.dimPurple,
  thematicBreak: colors.darkPurple
};
var highlightTheme = {
  keyword: chalk.hex(defaultTheme.inlineCode),
  built_in: chalk.hex(defaultTheme.inlineCode),
  type: chalk.hex(defaultTheme.inlineCode),
  literal: chalk.hex(defaultTheme.emphasis),
  number: chalk.hex(defaultTheme.emphasis),
  regexp: chalk.hex(defaultTheme.emphasis),
  string: chalk.hex(defaultTheme.emphasis),
  subst: chalk.hex(defaultTheme.emphasis),
  symbol: chalk.hex(defaultTheme.inlineCode),
  class: chalk.hex(defaultTheme.inlineCode),
  function: chalk.hex(defaultTheme.inlineCode),
  title: identity,
  params: identity,
  comment: chalk.hex(defaultTheme.muted),
  doctag: chalk.hex(defaultTheme.link),
  meta: chalk.hex(defaultTheme.link),
  "meta-keyword": chalk.hex(defaultTheme.link),
  "meta-string": chalk.hex(defaultTheme.link),
  section: chalk.hex(defaultTheme.link),
  tag: chalk.hex(defaultTheme.link),
  name: chalk.hex(defaultTheme.emphasis),
  "builtin-name": chalk.hex(defaultTheme.emphasis),
  attr: chalk.hex(defaultTheme.listItem),
  attribute: chalk.hex(defaultTheme.listItem),
  variable: chalk.hex(defaultTheme.listItem),
  bullet: chalk.hex(defaultTheme.listItem),
  code: chalk.hex(defaultTheme.code),
  emphasis: chalk.hex(defaultTheme.emphasis),
  strong: chalk.hex(defaultTheme.strong),
  formula: chalk.hex(defaultTheme.inlineCode),
  link: chalk.hex(defaultTheme.link),
  quote: chalk.hex(defaultTheme.blockquote),
  "selector-tag": chalk.hex(defaultTheme.link),
  "selector-id": chalk.hex(defaultTheme.link),
  "selector-class": chalk.hex(defaultTheme.link),
  "selector-attr": chalk.hex(defaultTheme.link),
  "selector-pseudo": chalk.hex(defaultTheme.link),
  "template-tag": chalk.hex(defaultTheme.link),
  "template-variable": chalk.hex(defaultTheme.link),
  addition: chalk.hex(defaultTheme.strong),
  deletion: chalk.hex(defaultTheme.link),
  default: identity
};
var ThemeContext = React.createContext(defaultTheme);

// src/support/markdown.tsx
import {compact} from "mdast-util-compact";
import {fromMarkdown} from "mdast-util-from-markdown";
import {gfm} from "micromark-extension-gfm";
import {gfmFromMarkdown, gfmToMarkdown} from "mdast-util-gfm";
import {highlight, supportsLanguage} from "cli-highlight";
import {jsx} from "react/jsx-runtime";
import {selectAll} from "unist-util-select";
import {toMarkdown} from "mdast-util-to-markdown";
import {unified} from "unified";
import {visit} from "unist-util-visit";
import InkLink from "ink-link";
import React2, {useContext} from "react";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkStringify from "remark-stringify";
function html2md(corpus) {
  return String(unified().use(rehypeParse).use(rehypeRemark).use(remarkGfm).use(remarkEmoji).use(remarkMath).use(remarkStringify).processSync(corpus));
}
function mdast2md(tree) {
  return toMarkdown(tree, { extensions: [gfmToMarkdown()] });
}
function md2mdast(corpus) {
  const tree = fromMarkdown(corpus, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()]
  });
  compact(tree);
  return tree;
}
var textContent = function(node) {
  return selectAll("text", node).map((x) => x.value).join().trim();
};
var removeEmptyTableRows = function(node) {
  visit(node, (n, index, parent) => {
    if (n.type == "tableRow") {
      const tableRow = n;
      if (!textContent(tableRow)) {
        const table = parent;
        table.children.splice(index, 1);
      }
    }
  });
};
var removeEmptyListItems = function(node) {
  visit(node, (n, index, parent) => {
    if (n.type == "listItem") {
      const listItem = n;
      if (!textContent(listItem)) {
        const list = parent;
        list.children.splice(index, 1);
      }
    }
  });
};
function toInk(text, theme = defaultTheme) {
  const mdastTree = md2mdast(text);
  const toJSX = (node, i) => {
    if (node.type == "table") {
      removeEmptyTableRows(node);
      return jsxDEV(InkText, {
        children: mdast2md(node)
      }, i, false, undefined, this);
    }
    if (node.type == "list") {
      removeEmptyListItems(node);
    }
    if (node.type in mdastMap) {
      const { type, children, position, ...props } = node;
      const key = type;
      return jsx(mdastMap[key], { ...props, children: children?.map(toJSX) }, i);
    }
    throw new Error(`Unknown type: ${node.type}`);
  };
  return jsxDEV(ThemeContext.Provider, {
    value: theme,
    children: mdastTree.children.map(toJSX)
  }, undefined, false, undefined, this);
}
import {
jsxDEV
} from "react/jsx-dev-runtime";
var TextStyleContext = React2.createContext({});
var TextStyle = ({ children, ...props }) => jsxDEV(TextStyleContext.Provider, {
  value: props,
  children
}, undefined, false, undefined, this);
var styled = (fn) => ({ children }) => {
  const theme = useTheme();
  const context = useContext(TextStyleContext);
  const props = fn({ theme, context });
  return jsxDEV(TextStyle, {
    ...props,
    children
  }, undefined, false, undefined, this);
};
var MdText = ({ value, ...props }) => {
  const contextProps = useContext(TextStyleContext);
  return jsxDEV(InkText, {
    ...contextProps,
    ...props,
    children: value
  }, undefined, false, undefined, this);
};
var MdRoot = ({
  children,
  ...props
}) => {
  return jsxDEV(TextStyle, {
    color: useTheme().text,
    children: jsxDEV(InkBox, {
      ...props,
      flexDirection: "column",
      gap: 1,
      children
    }, undefined, false, undefined, this)
  }, undefined, false, undefined, this);
};
var MdInlineCode = ({ value }) => jsxDEV(InkText, {
  color: useTheme().inlineCode,
  children: [
    "`",
    value,
    "`"
  ]
}, undefined, true, undefined, this);
var MdEmphasis = styled(({ context }) => ({
  italic: true,
  color: useTheme().emphasis
}));
var MdStrong = styled(({ context }) => {
  return {
    bold: true,
    color: useTheme().strong
  };
});
var MdDelete = styled(() => ({
  strikethrough: true,
  dimColor: true
}));
var MdHeading = ({ depth, ...n }) => {
  const theme = useTheme();
  const style = { bold: true, underline: true, color: theme.heading };
  return jsxDEV(InkBox, {
    children: jsxDEV(TextStyle, {
      ...style,
      children: [
        jsxDEV(InkText, {
          ...style,
          children: [
            "#".repeat(depth),
            " "
          ]
        }, undefined, true, undefined, this),
        n.children
      ]
    }, undefined, true, undefined, this)
  }, undefined, false, undefined, this);
};
var MdLink = ({
  url,
  ...node
}) => {
  const theme = useTheme();
  return jsxDEV(InkLink, {
    url,
    children: jsxDEV(TextStyle, {
      color: theme.link,
      children: node.children
    }, undefined, false, undefined, this)
  }, undefined, false, undefined, this);
};
var MdParagraph = ({ children }) => {
  const style = useContext(TextStyleContext);
  return jsxDEV(InkText, {
    ...style,
    children: jsxDEV(Transform, {
      transform: (x) => x.trim(),
      children
    }, undefined, false, undefined, this)
  }, undefined, false, undefined, this);
};
var MdList = ({ children, ...props }) => {
  return jsxDEV(InkBox, {
    ...props,
    paddingLeft: 2,
    flexDirection: "column",
    children
  }, undefined, false, undefined, this);
};
var MdListItem = ({ children }) => {
  const theme = useTheme();
  return jsxDEV(InkBox, {
    children: [
      jsxDEV(InkText, {
        color: theme.listItem,
        children: "\u2022 "
      }, undefined, false, undefined, this),
      jsxDEV(InkBox, {
        flexDirection: "column",
        children
      }, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
};
var MdBlockQuote = ({ children }) => {
  const theme = useTheme();
  return jsxDEV(TextStyleContext.Provider, {
    value: {
      color: theme.blockquote
    },
    children: jsxDEV(InkBox, {
      flexDirection: "row",
      flexGrow: 0,
      flexShrink: 1,
      flexWrap: "wrap",
      paddingLeft: 1,
      borderColor: theme.blockquote,
      borderRight: false,
      borderBottom: false,
      borderTop: false,
      borderStyle: "bold",
      children: jsxDEV(TextStyle, {
        color: theme.blockquote,
        children
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this)
  }, undefined, false, undefined, this);
};
var MdCode = ({ lang, value }) => {
  const theme = useTheme();
  const language = supportsLanguage(lang) ? lang : "text";
  return jsxDEV(InkBox, {
    flexDirection: "column",
    marginLeft: 1,
    children: [
      language != "text" && jsxDEV(InkBox, {
        flexDirection: "column",
        marginLeft: 1,
        children: jsxDEV(InkText, {
          color: theme.muted,
          dimColor: true,
          children: language
        }, undefined, false, undefined, this)
      }, undefined, false, undefined, this),
      jsxDEV(InkBox, {
        flexDirection: "column",
        paddingX: 1,
        borderStyle: "round",
        borderColor: theme.code,
        children: jsxDEV(InkText, {
          children: highlight(value, {
            language,
            theme: highlightTheme
          }).trim()
        }, undefined, false, undefined, this)
      }, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
};
var MdThematicBreak = () => {
  return jsxDEV(InkBox, {
    borderColor: useTheme().thematicBreak,
    borderStyle: "bold",
    borderBottom: false,
    borderRight: false,
    borderLeft: false
  }, undefined, false, undefined, this);
};
var MdBreak = () => {
  return jsxDEV(InkText, {
    children: "\n"
  }, undefined, false, undefined, this);
};
var MdImage = ({ alt }) => {
  if (alt)
    return jsxDEV(InkText, {
      color: useTheme().muted,
      children: `(<image> ${alt})`
    }, undefined, false, undefined, this);
  return null;
};
var mdastMap = {
  root: MdRoot,
  text: MdText,
  inlineCode: MdInlineCode,
  heading: MdHeading,
  emphasis: MdEmphasis,
  strong: MdStrong,
  delete: MdDelete,
  link: MdLink,
  paragraph: MdParagraph,
  code: MdCode,
  blockquote: MdBlockQuote,
  list: MdList,
  listItem: MdListItem,
  break: MdBreak,
  thematicBreak: MdThematicBreak,
  image: MdImage,
  html: () => {
  }
};

// src/support/util.tsx
import {createReadStream} from "fs";
async function readStream(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk.toString());
  }
  return chunks.join("").trim();
}
async function readTTYStream(stream, html) {
  const output = stream.isTTY ? undefined : await readStream(stream);
  if (output && html)
    return html2md(output);
  return output;
}
async function readStdInOrFile(file, html) {
  let output = await readStream(process.stdin);
  if (!output) {
    output = await readStream(createReadStream(file));
  }
  if (html)
    return html2md(output);
  return output;
}
function capitalize(str) {
  if (str.length < 2)
    return str;
  return str[0].toUpperCase() + str.slice(1);
}
function dumbFormat(xmlLike) {
  var formatted = "";
  var reg = /(>)(<)(\/*)/g;
  xmlLike = xmlLike.replace(reg, "$1\r\n$2$3");
  var pad = 0;
  const parts = xmlLike.split("\r\n");
  parts.forEach((node) => {
    var indent = 0;
    if (node.match(/.+<\/\w[^>]*>$/)) {
      indent = 0;
    } else if (node.match(/^<\/\w/)) {
      if (pad != 0) {
        pad -= 1;
      }
    } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
      indent = 1;
    } else {
      indent = 0;
    }
    var padding = "";
    for (var i = 0;i < pad; i++) {
      padding += "  ";
    }
    formatted += padding + node + "\r\n";
    pad += indent;
  });
  return formatted;
}

// src/components/Message.tsx
import color from "tinycolor2";
import {
jsxDEV as jsxDEV2
} from "react/jsx-dev-runtime";
var Message = ({ role, model, children }) => {
  const theme = useTheme();
  return jsxDEV2(Box, {
    padding: 1,
    gap: 1,
    flexDirection: "column",
    width: "100%",
    children: [
      jsxDEV2(Box, {
        gap: 1,
        justifyContent: "space-between",
        children: [
          jsxDEV2(Text, {
            bold: true,
            color: color(theme.text).darken(5).toHexString(),
            children: [
              capitalize(role),
              ":"
            ]
          }, undefined, true, undefined, this),
          role == "assistant" && jsxDEV2(Text, {
            color: theme.muted,
            children: model
          }, undefined, false, undefined, this)
        ]
      }, undefined, true, undefined, this),
      jsxDEV2(Box, {
        flexDirection: "column",
        children
      }, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
};

// src/support/mime.tsx
import {useEffect, useRef} from "react";
import {last, sortBy} from "lodash-es";
import languagedetection from "@vscode/vscode-languagedetection";
async function guessMime(str, minConfidence = 0.05) {
  const result = await ops.runModel(str);
  return last(sortBy(result.filter((r) => r.confidence > minConfidence), (r) => r.confidence))?.languageId;
}
var ops = new languagedetection.ModelOperations;

// src/commands/run.tsx
import {useEffect as useEffect2, useState} from "react";
import ollama from "ollama";
import Spinner from "ink-spinner";
import {highlight as highlight2, supportsLanguage as supportsLanguage2} from "cli-highlight";
import fs from "fs";
import {
jsxDEV as jsxDEV3
} from "react/jsx-dev-runtime";
var Renderer = ({ content, mime: mime2 = "md" }) => {
  if (mime2 == "md") {
    return jsxDEV3(MdRoot, {
      children: toInk(content)
    }, undefined, false, undefined, this);
  }
  if (mime2 && supportsLanguage2(mime2)) {
    return jsxDEV3(Text2, {
      children: highlight2(content, { language: mime2 })
    }, undefined, false, undefined, this);
  }
  return jsxDEV3(Text2, {
    children: content
  }, undefined, false, undefined, this);
};
var RunCommand = ({ stdin, prompt, options, models }) => {
  let conversation = [];
  let [buffer, setBuffer] = useState("");
  if (options.system) {
    let system = options.system;
    if (fs.existsSync(system)) {
      system = fs.readFileSync(system, "utf8");
    }
    conversation.push({ role: "system", content: system });
  }
  if (fs.existsSync(prompt)) {
    prompt = fs.readFileSync(prompt, "utf8");
  }
  if (stdin) {
    if (prompt == "-") {
      prompt = stdin.content;
    } else {
      prompt = `${stdin.content}\n\n${prompt}`;
    }
  }
  conversation.push({
    role: "user",
    content: prompt
  });
  const match = models.map(({ name: name2 }) => name2).find((name2) => name2.toLowerCase().includes(options.model?.toLowerCase()));
  if (match) {
    options.model = match;
  } else {
    return jsxDEV3(Text2, {
      children: options.model ? `No model matches ${options.model}` : `No model specified`
    }, undefined, false, undefined, this);
  }
  async function run() {
    const response = await ollama.chat({
      messages: conversation,
      model: options.model,
      format: options.json ? "json" : undefined,
      options: {
        temperature: options.temp,
        num_predict: options.numPred,
        num_ctx: options.ctx
      },
      stream: true
    });
    for await (const chunk of response) {
      setBuffer((buffer2) => buffer2 + chunk.message.content);
    }
  }
  useEffect2(() => {
    run();
  }, []);
  if (options.raw || options.json) {
    return jsxDEV3(Text2, {
      children: buffer
    }, undefined, false, undefined, this);
  }
  return jsxDEV3(Box2, {
    flexDirection: "column",
    flexWrap: "wrap",
    width: options.printWidth,
    children: [
      options.whole && jsxDEV3(Static, {
        items: conversation,
        children: (props, i) => jsxDEV3(Message, {
          ...props,
          ...options,
          children: jsxDEV3(Renderer, {
            ...props
          }, undefined, false, undefined, this)
        }, i, false, undefined, this)
      }, undefined, false, undefined, this),
      jsxDEV3(Message, {
        role: "assistant",
        ...options,
        children: buffer ? jsxDEV3(Renderer, {
          content: buffer
        }, undefined, false, undefined, this) : jsxDEV3(Text2, {
          children: jsxDEV3(Spinner, {
            type: "simpleDotsScrolling"
          }, undefined, false, undefined, this)
        }, undefined, false, undefined, this)
      }, "buffer", false, undefined, this)
    ]
  }, undefined, true, undefined, this);
};
var run_default = (ollamark) => ollamark.command("run", { isDefault: true }).description("Execute a prompt").argument("<prompt...>", "the prompt").option("--html", "treat input as html").option("--json", "output in json").option("-m, --model <string>", "model name (partial match supported)").option("-s, --system <string>", "system prompt").option("-t, --temp <value>", "temperature").option("-n, --num-pred <value>", "number of predictions").option("-C, --ctx <value>", "context length").option("-r, --raw", "output the raw response").option("-W, --print-width <chars>", "print width", "100").option("-w, --whole", "print the whole conversation", false).action(async (parts, options) => {
  const models = await ollama.list();
  const stdin = await readTTYStream(process.stdin, !!options.html);
  render(jsxDEV3(RunCommand, {
    models: models.models,
    stdin: stdin ? { content: stdin, mime: await guessMime(stdin) } : undefined,
    prompt: parts.join(" "),
    options: {
      ...options,
      temp: Number(options.temp),
      numPred: Number(options.numPred),
      ctx: Number(options.ctx),
      printWidth: Number(options.printWidth)
    }
  }, undefined, false, undefined, this));
});

// src/commands/render.tsx
import {render as render2} from "ink";
import {
jsxDEV as jsxDEV4
} from "react/jsx-dev-runtime";
var render_default = (ollamark) => ollamark.description("Render markdown").command("render").argument("[file]", "file to render").option("--html", "treat input as html").option("--print-width <chars>", "print width", "120").action(async (file, options) => {
  let input = await readStdInOrFile(file, !!options.html);
  render2(jsxDEV4(MdRoot, {
    width: Number(options.printWidth),
    children: toInk(input)
  }, undefined, false, undefined, this));
});

// src/commands/ast.tsx
import {renderToStaticMarkup} from "react-dom/server";
import {highlight as highlight3} from "cli-highlight";
var ast_default = (ollamark) => ollamark.command("ast").description("Inspect the rendered AST of a markdown file").argument("[file]", "file to render").option("--html", "treat input as html").option("--print-width <chars>", "print width", "120").action(async (file, options) => {
  let input = await readStdInOrFile(file, !!options.html);
  process.stdout.write(highlight3(dumbFormat(renderToStaticMarkup(toInk(input))), {
    language: "xml",
    theme: highlightTheme
  }));
});

// src/ollamark.tsx
var shutdown = function() {
  ollama2.abort();
  process.stdout.write("\x1B[?25h");
};
var program = new Command;
program.name(name).description(description).version(version);
run_default(program);
render_default(program);
ast_default(program);
program.parse();
process.on("SIGINT", shutdown);
process.on("exit", shutdown);

//# debugId=5946F718A9ED94EB64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL29sbGFtYXJrLnRzeCIsICIuLi9zcmMvY29tbWFuZHMvcnVuLnRzeCIsICIuLi9zcmMvY29tcG9uZW50cy9NZXNzYWdlLnRzeCIsICIuLi9zcmMvc3VwcG9ydC9tYXJrZG93bi50c3giLCAiLi4vc3JjL3N1cHBvcnQvdGhlbWluZy50c3giLCAiLi4vc3JjL3N1cHBvcnQvdXRpbC50c3giLCAiLi4vc3JjL3N1cHBvcnQvbWltZS50c3giLCAiLi4vc3JjL2NvbW1hbmRzL3JlbmRlci50c3giLCAiLi4vc3JjL2NvbW1hbmRzL2FzdC50c3giXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiIyEvdXNyL2Jpbi9lbnYgYnVuXG5cbmltcG9ydCBvbGxhbWEgZnJvbSBcIm9sbGFtYVwiO1xuXG5pbXBvcnQgeyBDb21tYW5kIH0gZnJvbSBcImNvbW1hbmRlclwiO1xuaW1wb3J0IHsgbmFtZSwgZGVzY3JpcHRpb24sIHZlcnNpb24gfSBmcm9tIFwiLi4vcGFja2FnZS5qc29uXCI7XG5cbmltcG9ydCByZWdpc3RlclJ1bkNvbW1hbmQgZnJvbSBcIi4vY29tbWFuZHMvcnVuXCI7XG5pbXBvcnQgcmVnaXN0ZXJSZW5kZXJDb21tYW5kIGZyb20gXCIuL2NvbW1hbmRzL3JlbmRlclwiO1xuaW1wb3J0IHJlZ2lzdGVyQXN0Q29tbWFuZCBmcm9tIFwiLi9jb21tYW5kcy9hc3RcIjtcblxuY29uc3QgcHJvZ3JhbSA9IG5ldyBDb21tYW5kKCk7XG5wcm9ncmFtLm5hbWUobmFtZSkuZGVzY3JpcHRpb24oZGVzY3JpcHRpb24pLnZlcnNpb24odmVyc2lvbik7XG5cbnJlZ2lzdGVyUnVuQ29tbWFuZChwcm9ncmFtKTtcbnJlZ2lzdGVyUmVuZGVyQ29tbWFuZChwcm9ncmFtKTtcbnJlZ2lzdGVyQXN0Q29tbWFuZChwcm9ncmFtKTtcblxucHJvZ3JhbS5wYXJzZSgpO1xuXG5wcm9jZXNzLm9uKFwiU0lHSU5UXCIsIHNodXRkb3duKTtcbnByb2Nlc3Mub24oXCJleGl0XCIsIHNodXRkb3duKTtcblxuZnVuY3Rpb24gc2h1dGRvd24oKSB7XG4gIG9sbGFtYS5hYm9ydCgpO1xuICBwcm9jZXNzLnN0ZG91dC53cml0ZShcIlxceDFiWz8yNWhcIik7IC8vIHJlc2V0IGN1cnNvclxufVxuIiwKICAgICJpbXBvcnQgeyBCb3gsIFN0YXRpYywgVGV4dCwgcmVuZGVyIH0gZnJvbSBcImlua1wiO1xuaW1wb3J0IHsgQ29tbWFuZCB9IGZyb20gXCJjb21tYW5kZXJcIjtcbmltcG9ydCB7IE1lc3NhZ2UsIHR5cGUgTWVzc2FnZVByb3BzIH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvTWVzc2FnZVwiO1xuaW1wb3J0IHsgcmVhZFRUWVN0cmVhbSB9IGZyb20gXCIuLi9zdXBwb3J0L3V0aWxcIjtcbmltcG9ydCB7IGd1ZXNzTWltZSB9IGZyb20gXCIuLi9zdXBwb3J0L21pbWVcIjtcbmltcG9ydCB7IE1kUm9vdCwgdG9JbmsgfSBmcm9tIFwiLi4vc3VwcG9ydC9tYXJrZG93blwiO1xuaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IG9sbGFtYSwgeyB0eXBlIE1vZGVsUmVzcG9uc2UgfSBmcm9tIFwib2xsYW1hXCI7XG5pbXBvcnQgU3Bpbm5lciBmcm9tIFwiaW5rLXNwaW5uZXJcIjtcbmltcG9ydCB7IGhpZ2hsaWdodCwgc3VwcG9ydHNMYW5ndWFnZSB9IGZyb20gXCJjbGktaGlnaGxpZ2h0XCI7XG5pbXBvcnQgZnMgZnJvbSBcImZzXCI7XG5cbnR5cGUgUmVuZGVyZXJQcm9wcyA9IHsgY29udGVudDogc3RyaW5nOyBtaW1lPzogc3RyaW5nIH07XG5jb25zdCBSZW5kZXJlciA9ICh7IGNvbnRlbnQsIG1pbWUgPSBcIm1kXCIgfTogUmVuZGVyZXJQcm9wcykgPT4ge1xuICBpZiAobWltZSA9PSBcIm1kXCIpIHtcbiAgICByZXR1cm4gPE1kUm9vdD57dG9JbmsoY29udGVudCl9PC9NZFJvb3Q+O1xuICB9XG4gIGlmIChtaW1lICYmIHN1cHBvcnRzTGFuZ3VhZ2UobWltZSkpIHtcbiAgICByZXR1cm4gPFRleHQ+e2hpZ2hsaWdodChjb250ZW50LCB7IGxhbmd1YWdlOiBtaW1lIH0pfTwvVGV4dD47XG4gIH1cbiAgcmV0dXJuIDxUZXh0Pntjb250ZW50fTwvVGV4dD47XG59O1xuXG50eXBlIFJ1bk9wdGlvbnMgPSB7XG4gIG1vZGVsOiBzdHJpbmc7XG4gIHN5c3RlbT86IHN0cmluZztcbiAgd2hvbGU/OiBib29sZWFuO1xuICBqc29uPzogYm9vbGVhbjtcbiAgaHRtbD86IGJvb2xlYW47XG4gIHJhdz86IGJvb2xlYW47XG4gIHRlbXA/OiBudW1iZXI7XG4gIG51bVByZWQ/OiBudW1iZXI7XG4gIGN0eD86IG51bWJlcjtcbiAgcHJpbnRXaWR0aD86IG51bWJlcjtcbn07XG5cbnR5cGUgUnVuUHJvcHMgPSB7XG4gIHN0ZGluOiBSZW5kZXJlclByb3BzIHwgdW5kZWZpbmVkO1xuICBwcm9tcHQ6IHN0cmluZztcbiAgb3B0aW9uczogUnVuT3B0aW9ucztcbiAgbW9kZWxzOiBNb2RlbFJlc3BvbnNlW107XG59O1xuXG5jb25zdCBSdW5Db21tYW5kID0gKHsgc3RkaW4sIHByb21wdCwgb3B0aW9ucywgbW9kZWxzIH06IFJ1blByb3BzKSA9PiB7XG4gIGxldCBjb252ZXJzYXRpb246IChSZW5kZXJlclByb3BzICYgUGljazxNZXNzYWdlUHJvcHMsIFwicm9sZVwiPilbXSA9IFtdO1xuICBsZXQgW2J1ZmZlciwgc2V0QnVmZmVyXSA9IHVzZVN0YXRlKFwiXCIpO1xuXG4gIGlmIChvcHRpb25zLnN5c3RlbSkge1xuICAgIGxldCBzeXN0ZW0gPSBvcHRpb25zLnN5c3RlbSE7XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoc3lzdGVtKSkge1xuICAgICAgc3lzdGVtID0gZnMucmVhZEZpbGVTeW5jKHN5c3RlbSwgXCJ1dGY4XCIpO1xuICAgIH1cbiAgICBjb252ZXJzYXRpb24ucHVzaCh7IHJvbGU6IFwic3lzdGVtXCIsIGNvbnRlbnQ6IHN5c3RlbSB9KTtcbiAgfVxuXG4gIGlmIChmcy5leGlzdHNTeW5jKHByb21wdCkpIHtcbiAgICBwcm9tcHQgPSBmcy5yZWFkRmlsZVN5bmMocHJvbXB0LCBcInV0ZjhcIik7XG4gIH1cblxuICBpZiAoc3RkaW4pIHtcbiAgICBpZiAocHJvbXB0ID09IFwiLVwiKSB7XG4gICAgICBwcm9tcHQgPSBzdGRpbi5jb250ZW50O1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9tcHQgPSBgJHtzdGRpbi5jb250ZW50fVxcblxcbiR7cHJvbXB0fWA7XG4gICAgICAvLyBwcm9tcHQgKz0gYFxcblxcbiR7c3RkaW4uY29udGVudH1gXG4gICAgfVxuICB9XG5cbiAgY29udmVyc2F0aW9uLnB1c2goe1xuICAgIHJvbGU6IFwidXNlclwiLFxuICAgIGNvbnRlbnQ6IHByb21wdCxcbiAgfSk7XG5cbiAgY29uc3QgbWF0Y2ggPSBtb2RlbHNcbiAgICAubWFwKCh7IG5hbWUgfSkgPT4gbmFtZSlcbiAgICAuZmluZCgobmFtZSkgPT4gbmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKG9wdGlvbnMubW9kZWw/LnRvTG93ZXJDYXNlKCkpKTtcblxuICBpZiAobWF0Y2gpIHtcbiAgICBvcHRpb25zLm1vZGVsID0gbWF0Y2g7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxUZXh0PlxuICAgICAgICB7b3B0aW9ucy5tb2RlbFxuICAgICAgICAgID8gYE5vIG1vZGVsIG1hdGNoZXMgJHtvcHRpb25zLm1vZGVsfWBcbiAgICAgICAgICA6IGBObyBtb2RlbCBzcGVjaWZpZWRgfVxuICAgICAgPC9UZXh0PlxuICAgICk7XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBydW4oKSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBvbGxhbWEuY2hhdCh7XG4gICAgICBtZXNzYWdlczogY29udmVyc2F0aW9uLFxuICAgICAgbW9kZWw6IG9wdGlvbnMubW9kZWwsXG4gICAgICBmb3JtYXQ6IG9wdGlvbnMuanNvbiA/IFwianNvblwiIDogdW5kZWZpbmVkLFxuICAgICAgb3B0aW9uczoge1xuICAgICAgICB0ZW1wZXJhdHVyZTogb3B0aW9ucy50ZW1wLFxuICAgICAgICBudW1fcHJlZGljdDogb3B0aW9ucy5udW1QcmVkLFxuICAgICAgICBudW1fY3R4OiBvcHRpb25zLmN0eCxcbiAgICAgIH0sXG4gICAgICBzdHJlYW06IHRydWUsXG4gICAgfSk7XG5cbiAgICBmb3IgYXdhaXQgKGNvbnN0IGNodW5rIG9mIHJlc3BvbnNlKSB7XG4gICAgICBzZXRCdWZmZXIoKGJ1ZmZlcjogc3RyaW5nKSA9PiBidWZmZXIgKyBjaHVuay5tZXNzYWdlLmNvbnRlbnQpO1xuICAgIH1cbiAgfVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcnVuKCk7XG4gIH0sIFtdKTtcblxuICBpZiAob3B0aW9ucy5yYXcgfHwgb3B0aW9ucy5qc29uKSB7XG4gICAgcmV0dXJuIDxUZXh0PntidWZmZXJ9PC9UZXh0PjtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgZmxleFdyYXA9XCJ3cmFwXCIgd2lkdGg9e29wdGlvbnMucHJpbnRXaWR0aH0+XG4gICAgICB7b3B0aW9ucy53aG9sZSAmJiAoXG4gICAgICAgIDxTdGF0aWMgaXRlbXM9e2NvbnZlcnNhdGlvbn0+XG4gICAgICAgICAgeyhwcm9wcywgaSkgPT4gKFxuICAgICAgICAgICAgPE1lc3NhZ2Uga2V5PXtpfSB7Li4ucHJvcHN9IHsuLi5vcHRpb25zfT5cbiAgICAgICAgICAgICAgPFJlbmRlcmVyIHsuLi5wcm9wc30gLz5cbiAgICAgICAgICAgIDwvTWVzc2FnZT5cbiAgICAgICAgICApfVxuICAgICAgICA8L1N0YXRpYz5cbiAgICAgICl9XG5cbiAgICAgIDxNZXNzYWdlIGtleT1cImJ1ZmZlclwiIHJvbGU9XCJhc3Npc3RhbnRcIiB7Li4ub3B0aW9uc30+XG4gICAgICAgIHtidWZmZXIgPyAoXG4gICAgICAgICAgPFJlbmRlcmVyIGNvbnRlbnQ9e2J1ZmZlcn0gLz5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8VGV4dD5cbiAgICAgICAgICAgIDxTcGlubmVyIHR5cGU9XCJzaW1wbGVEb3RzU2Nyb2xsaW5nXCIgLz5cbiAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICl9XG4gICAgICA8L01lc3NhZ2U+XG4gICAgPC9Cb3g+XG4gICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCAob2xsYW1hcms6IENvbW1hbmQpID0+XG4gIG9sbGFtYXJrXG4gICAgLmNvbW1hbmQoXCJydW5cIiwgeyBpc0RlZmF1bHQ6IHRydWUgfSlcbiAgICAuZGVzY3JpcHRpb24oXCJFeGVjdXRlIGEgcHJvbXB0XCIpXG4gICAgLmFyZ3VtZW50KFwiPHByb21wdC4uLj5cIiwgXCJ0aGUgcHJvbXB0XCIpXG4gICAgLm9wdGlvbihcIi0taHRtbFwiLCBcInRyZWF0IGlucHV0IGFzIGh0bWxcIilcbiAgICAub3B0aW9uKFwiLS1qc29uXCIsIFwib3V0cHV0IGluIGpzb25cIilcbiAgICAub3B0aW9uKFwiLW0sIC0tbW9kZWwgPHN0cmluZz5cIiwgXCJtb2RlbCBuYW1lIChwYXJ0aWFsIG1hdGNoIHN1cHBvcnRlZClcIilcbiAgICAub3B0aW9uKFwiLXMsIC0tc3lzdGVtIDxzdHJpbmc+XCIsIFwic3lzdGVtIHByb21wdFwiKVxuICAgIC5vcHRpb24oXCItdCwgLS10ZW1wIDx2YWx1ZT5cIiwgXCJ0ZW1wZXJhdHVyZVwiKVxuICAgIC5vcHRpb24oXCItbiwgLS1udW0tcHJlZCA8dmFsdWU+XCIsIFwibnVtYmVyIG9mIHByZWRpY3Rpb25zXCIpXG4gICAgLm9wdGlvbihcIi1DLCAtLWN0eCA8dmFsdWU+XCIsIFwiY29udGV4dCBsZW5ndGhcIilcbiAgICAub3B0aW9uKFwiLXIsIC0tcmF3XCIsIFwib3V0cHV0IHRoZSByYXcgcmVzcG9uc2VcIilcbiAgICAub3B0aW9uKFwiLVcsIC0tcHJpbnQtd2lkdGggPGNoYXJzPlwiLCBcInByaW50IHdpZHRoXCIsIFwiMTAwXCIpXG4gICAgLm9wdGlvbihcIi13LCAtLXdob2xlXCIsIFwicHJpbnQgdGhlIHdob2xlIGNvbnZlcnNhdGlvblwiLCBmYWxzZSlcbiAgICAuYWN0aW9uKGFzeW5jIChwYXJ0czogc3RyaW5nW10sIG9wdGlvbnM6IFJ1bk9wdGlvbnMpID0+IHtcbiAgICAgIGNvbnN0IG1vZGVscyA9IGF3YWl0IG9sbGFtYS5saXN0KCk7XG4gICAgICBjb25zdCBzdGRpbiA9IGF3YWl0IHJlYWRUVFlTdHJlYW0ocHJvY2Vzcy5zdGRpbiwgISFvcHRpb25zLmh0bWwpO1xuICAgICAgcmVuZGVyKFxuICAgICAgICA8UnVuQ29tbWFuZFxuICAgICAgICAgIG1vZGVscz17bW9kZWxzLm1vZGVsc31cbiAgICAgICAgICBzdGRpbj17XG4gICAgICAgICAgICBzdGRpbiA/IHsgY29udGVudDogc3RkaW4sIG1pbWU6IGF3YWl0IGd1ZXNzTWltZShzdGRpbikgfSA6IHVuZGVmaW5lZFxuICAgICAgICAgIH1cbiAgICAgICAgICBwcm9tcHQ9e3BhcnRzLmpvaW4oXCIgXCIpfVxuICAgICAgICAgIG9wdGlvbnM9e3tcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgICAgICB0ZW1wOiBOdW1iZXIob3B0aW9ucy50ZW1wKSxcbiAgICAgICAgICAgIG51bVByZWQ6IE51bWJlcihvcHRpb25zLm51bVByZWQpLFxuICAgICAgICAgICAgY3R4OiBOdW1iZXIob3B0aW9ucy5jdHgpLFxuICAgICAgICAgICAgcHJpbnRXaWR0aDogTnVtYmVyKG9wdGlvbnMucHJpbnRXaWR0aCksXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfSk7XG4iLAogICAgImltcG9ydCB7IHR5cGUgUmVhY3ROb2RlIH0gZnJvbSBcInJlYWN0XCJcbmltcG9ydCB7IEJveCwgVGV4dCB9IGZyb20gXCJpbmtcIlxuaW1wb3J0IHsgY2FwaXRhbGl6ZSB9IGZyb20gXCIuLi9zdXBwb3J0L3V0aWxcIlxuaW1wb3J0IHsgdXNlVGhlbWUgfSBmcm9tIFwiLi4vc3VwcG9ydC90aGVtaW5nXCJcbmltcG9ydCBjb2xvciBmcm9tIFwidGlueWNvbG9yMlwiXG5cbmV4cG9ydCB0eXBlIE1lc3NhZ2VQcm9wcyA9IHtcbiAgcm9sZTogc3RyaW5nXG4gIG1vZGVsPzogc3RyaW5nXG4gIGNoaWxkcmVuOiBSZWFjdE5vZGVcbn1cblxuZXhwb3J0IGNvbnN0IE1lc3NhZ2UgPSAoeyByb2xlLCBtb2RlbCwgY2hpbGRyZW4gfTogTWVzc2FnZVByb3BzKSA9PiB7XG4gIGNvbnN0IHRoZW1lID0gdXNlVGhlbWUoKVxuICByZXR1cm4gKFxuICAgIDxCb3ggcGFkZGluZz17MX0gZ2FwPXsxfSBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgd2lkdGg9XCIxMDAlXCI+XG4gICAgICA8Qm94IGdhcD17MX0ganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCI+XG4gICAgICAgIDxUZXh0IGJvbGQgY29sb3I9e2NvbG9yKHRoZW1lLnRleHQpLmRhcmtlbig1KS50b0hleFN0cmluZygpfT5cbiAgICAgICAgICB7Y2FwaXRhbGl6ZShyb2xlKX06XG4gICAgICAgIDwvVGV4dD5cbiAgICAgICAge3JvbGUgPT0gXCJhc3Npc3RhbnRcIiAmJiA8VGV4dCBjb2xvcj17dGhlbWUubXV0ZWR9Pnttb2RlbH08L1RleHQ+fVxuICAgICAgPC9Cb3g+XG4gICAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIj57Y2hpbGRyZW59PC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cbiIsCiAgICAiaW1wb3J0IHtcbiAgQm94IGFzIElua0JveCxcbiAgVGV4dCBhcyBJbmtUZXh0LFxuICBUcmFuc2Zvcm0sXG4gIHR5cGUgVGV4dFByb3BzLFxuICB0eXBlIEJveFByb3BzLFxufSBmcm9tIFwiaW5rXCI7XG5cbmltcG9ydCB0eXBlIHtcbiAgTGlzdCxcbiAgTGlzdEl0ZW0sXG4gIE5vZGVzIGFzIE1kYXN0Tm9kZXMsXG4gIE5vZGUsXG4gIFBhcmVudCxcbiAgVGFibGUsXG4gIFRhYmxlUm93LFxuICBUZXh0LFxufSBmcm9tIFwibWRhc3RcIjtcblxuaW1wb3J0IHtcbiAgVGhlbWUsXG4gIGRlZmF1bHRUaGVtZSxcbiAgdXNlVGhlbWUsXG4gIGhpZ2hsaWdodFRoZW1lLFxuICBUaGVtZUNvbnRleHQsXG59IGZyb20gXCIuL3RoZW1pbmdcIjtcblxuaW1wb3J0IHsgY29tcGFjdCB9IGZyb20gXCJtZGFzdC11dGlsLWNvbXBhY3RcIjtcbmltcG9ydCB7IGZyb21NYXJrZG93biB9IGZyb20gXCJtZGFzdC11dGlsLWZyb20tbWFya2Rvd25cIjtcbmltcG9ydCB7IGdmbSB9IGZyb20gXCJtaWNyb21hcmstZXh0ZW5zaW9uLWdmbVwiO1xuaW1wb3J0IHsgZ2ZtRnJvbU1hcmtkb3duLCBnZm1Ub01hcmtkb3duIH0gZnJvbSBcIm1kYXN0LXV0aWwtZ2ZtXCI7XG5pbXBvcnQgeyBoaWdobGlnaHQsIHN1cHBvcnRzTGFuZ3VhZ2UgfSBmcm9tIFwiY2xpLWhpZ2hsaWdodFwiO1xuaW1wb3J0IHsganN4IH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCI7XG5pbXBvcnQgeyBzZWxlY3RBbGwgfSBmcm9tIFwidW5pc3QtdXRpbC1zZWxlY3RcIjtcbmltcG9ydCB7IHRvTWFya2Rvd24gfSBmcm9tIFwibWRhc3QtdXRpbC10by1tYXJrZG93blwiO1xuaW1wb3J0IHsgdW5pZmllZCB9IGZyb20gXCJ1bmlmaWVkXCI7XG5pbXBvcnQgeyB2aXNpdCB9IGZyb20gXCJ1bmlzdC11dGlsLXZpc2l0XCI7XG5pbXBvcnQgSW5rTGluayBmcm9tIFwiaW5rLWxpbmtcIjtcbmltcG9ydCBSZWFjdCwgeyB1c2VDb250ZXh0IH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgcmVoeXBlUGFyc2UgZnJvbSBcInJlaHlwZS1wYXJzZVwiO1xuaW1wb3J0IHJlaHlwZVJlbWFyayBmcm9tIFwicmVoeXBlLXJlbWFya1wiO1xuaW1wb3J0IHJlbWFya0Vtb2ppIGZyb20gXCJyZW1hcmstZW1vamlcIjtcbmltcG9ydCByZW1hcmtHZm0gZnJvbSBcInJlbWFyay1nZm1cIjtcbmltcG9ydCByZW1hcmtNYXRoIGZyb20gXCJyZW1hcmstbWF0aFwiO1xuaW1wb3J0IHJlbWFya1N0cmluZ2lmeSBmcm9tIFwicmVtYXJrLXN0cmluZ2lmeVwiO1xuaW1wb3J0IHRpbnljb2xvciBmcm9tIFwidGlueWNvbG9yMlwiO1xuaW1wb3J0IHR5cGUgeyBFbGVtZW50VHlwZSwgUmVhY3RFbGVtZW50LCBSZWFjdE5vZGUgfSBmcm9tIFwicmVhY3RcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGh0bWwybWQoY29ycHVzOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gU3RyaW5nKFxuICAgIHVuaWZpZWQoKVxuICAgICAgLnVzZShyZWh5cGVQYXJzZSlcbiAgICAgIC51c2UocmVoeXBlUmVtYXJrKVxuICAgICAgLnVzZShyZW1hcmtHZm0pXG4gICAgICAudXNlKHJlbWFya0Vtb2ppKVxuICAgICAgLnVzZShyZW1hcmtNYXRoKVxuICAgICAgLnVzZShyZW1hcmtTdHJpbmdpZnkpXG4gICAgICAucHJvY2Vzc1N5bmMoY29ycHVzKVxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWRhc3QybWQodHJlZTogTWRhc3ROb2Rlcykge1xuICByZXR1cm4gdG9NYXJrZG93bih0cmVlLCB7IGV4dGVuc2lvbnM6IFtnZm1Ub01hcmtkb3duKCldIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWQybWRhc3QoY29ycHVzOiBzdHJpbmcpIHtcbiAgY29uc3QgdHJlZSA9IGZyb21NYXJrZG93bihjb3JwdXMsIHtcbiAgICBleHRlbnNpb25zOiBbZ2ZtKCldLFxuICAgIG1kYXN0RXh0ZW5zaW9uczogW2dmbUZyb21NYXJrZG93bigpXSxcbiAgfSk7XG4gIGNvbXBhY3QodHJlZSk7XG4gIHJldHVybiB0cmVlO1xufVxuXG5jb25zdCBUZXh0U3R5bGVDb250ZXh0ID0gUmVhY3QuY3JlYXRlQ29udGV4dDxUZXh0UHJvcHM+KHt9KTtcbmNvbnN0IFRleHRTdHlsZSA9ICh7IGNoaWxkcmVuLCAuLi5wcm9wcyB9OiBUZXh0UHJvcHMpID0+IChcbiAgPFRleHRTdHlsZUNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3Byb3BzfT5cbiAgICB7Y2hpbGRyZW59XG4gIDwvVGV4dFN0eWxlQ29udGV4dC5Qcm92aWRlcj5cbik7XG5cbmNvbnN0IHN0eWxlZCA9XG4gIChcbiAgICBmbjogKHsgdGhlbWUsIGNvbnRleHQgfTogeyB0aGVtZTogVGhlbWU7IGNvbnRleHQ6IFRleHRQcm9wcyB9KSA9PiBUZXh0UHJvcHNcbiAgKSA9PlxuICAoeyBjaGlsZHJlbiB9OiB7IGNoaWxkcmVuOiBSZWFjdE5vZGUgfSkgPT4ge1xuICAgIGNvbnN0IHRoZW1lID0gdXNlVGhlbWUoKTtcbiAgICBjb25zdCBjb250ZXh0ID0gdXNlQ29udGV4dChUZXh0U3R5bGVDb250ZXh0KTtcbiAgICBjb25zdCBwcm9wcyA9IGZuKHsgdGhlbWUsIGNvbnRleHQgfSk7XG4gICAgcmV0dXJuIDxUZXh0U3R5bGUgey4uLnByb3BzfT57Y2hpbGRyZW59PC9UZXh0U3R5bGU+O1xuICB9O1xuXG5jb25zdCBNZFRleHQgPSAoeyB2YWx1ZSwgLi4ucHJvcHMgfTogeyB2YWx1ZTogc3RyaW5nIH0pID0+IHtcbiAgY29uc3QgY29udGV4dFByb3BzID0gdXNlQ29udGV4dChUZXh0U3R5bGVDb250ZXh0KTtcbiAgcmV0dXJuIChcbiAgICA8SW5rVGV4dCB7Li4uY29udGV4dFByb3BzfSB7Li4ucHJvcHN9PlxuICAgICAge3ZhbHVlfVxuICAgIDwvSW5rVGV4dD5cbiAgKTtcbn07XG5cbmV4cG9ydCBjb25zdCBNZFJvb3QgPSAoe1xuICBjaGlsZHJlbixcbiAgLi4ucHJvcHNcbn06IHsgY2hpbGRyZW46IFJlYWN0Tm9kZSB9ICYgQm94UHJvcHMpID0+IHtcbiAgcmV0dXJuIChcbiAgICA8VGV4dFN0eWxlIGNvbG9yPXt1c2VUaGVtZSgpLnRleHR9PlxuICAgICAgPElua0JveCB7Li4ucHJvcHN9IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBnYXA9ezF9PlxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L0lua0JveD5cbiAgICA8L1RleHRTdHlsZT5cbiAgKTtcbn07XG5cbmNvbnN0IE1kSW5saW5lQ29kZSA9ICh7IHZhbHVlIH06IHsgdmFsdWU6IHN0cmluZyB9KSA9PiAoXG4gIDxJbmtUZXh0IGNvbG9yPXt1c2VUaGVtZSgpLmlubGluZUNvZGV9PmB7dmFsdWV9YDwvSW5rVGV4dD5cbik7XG5jb25zdCBNZEVtcGhhc2lzID0gc3R5bGVkKCh7IGNvbnRleHQgfSkgPT4gKHtcbiAgaXRhbGljOiB0cnVlLFxuICBjb2xvcjogdXNlVGhlbWUoKS5lbXBoYXNpcyxcbn0pKTtcbmNvbnN0IE1kU3Ryb25nID0gc3R5bGVkKCh7IGNvbnRleHQgfSkgPT4ge1xuICByZXR1cm4ge1xuICAgIGJvbGQ6IHRydWUsXG4gICAgY29sb3I6IHVzZVRoZW1lKCkuc3Ryb25nLFxuICAgIC8vIGNvbG9yOiB0aW55Y29sb3IoY29udGV4dC5jb2xvcikuZGFya2VuKDUpLnRvSGV4U3RyaW5nKCksXG4gIH07XG59KTtcbmNvbnN0IE1kRGVsZXRlID0gc3R5bGVkKCgpID0+ICh7XG4gIHN0cmlrZXRocm91Z2g6IHRydWUsXG4gIGRpbUNvbG9yOiB0cnVlLFxufSkpO1xuXG5jb25zdCBNZEhlYWRpbmcgPSAoeyBkZXB0aCwgLi4ubiB9OiB7IGRlcHRoOiBudW1iZXI7IGNoaWxkcmVuOiBSZWFjdE5vZGUgfSkgPT4ge1xuICBjb25zdCB0aGVtZSA9IHVzZVRoZW1lKCk7XG4gIGNvbnN0IHN0eWxlID0geyBib2xkOiB0cnVlLCB1bmRlcmxpbmU6IHRydWUsIGNvbG9yOiB0aGVtZS5oZWFkaW5nIH07XG4gIHJldHVybiAoXG4gICAgPElua0JveD5cbiAgICAgIDxUZXh0U3R5bGUgey4uLnN0eWxlfT5cbiAgICAgICAgPElua1RleHQgey4uLnN0eWxlfT57XCIjXCIucmVwZWF0KGRlcHRoKX0gPC9JbmtUZXh0PlxuICAgICAgICB7bi5jaGlsZHJlbn1cbiAgICAgIDwvVGV4dFN0eWxlPlxuICAgIDwvSW5rQm94PlxuICApO1xufTtcblxuY29uc3QgTWRMaW5rID0gKHtcbiAgdXJsLFxuICAuLi5ub2RlXG59OiB7IHVybDogc3RyaW5nIH0gJiB7IGNoaWxkcmVuOiBSZWFjdE5vZGUgfSkgPT4ge1xuICBjb25zdCB0aGVtZSA9IHVzZVRoZW1lKCk7XG4gIHJldHVybiAoXG4gICAgPElua0xpbmsgdXJsPXt1cmx9PlxuICAgICAgPFRleHRTdHlsZSBjb2xvcj17dGhlbWUubGlua30+e25vZGUuY2hpbGRyZW59PC9UZXh0U3R5bGU+XG4gICAgPC9JbmtMaW5rPlxuICApO1xufTtcblxuY29uc3QgTWRQYXJhZ3JhcGggPSAoeyBjaGlsZHJlbiB9OiB7IGNoaWxkcmVuOiBSZWFjdE5vZGUgfSkgPT4ge1xuICBjb25zdCBzdHlsZSA9IHVzZUNvbnRleHQoVGV4dFN0eWxlQ29udGV4dCk7XG4gIHJldHVybiAoXG4gICAgPElua1RleHQgey4uLnN0eWxlfT5cbiAgICAgIDxUcmFuc2Zvcm0gdHJhbnNmb3JtPXsoeCkgPT4geC50cmltKCl9PntjaGlsZHJlbn08L1RyYW5zZm9ybT5cbiAgICA8L0lua1RleHQ+XG4gICk7XG59O1xuXG5jb25zdCBNZExpc3QgPSAoeyBjaGlsZHJlbiwgLi4ucHJvcHMgfTogeyBjaGlsZHJlbjogUmVhY3ROb2RlIH0pID0+IHtcbiAgcmV0dXJuIChcbiAgICA8SW5rQm94IHsuLi5wcm9wc30gcGFkZGluZ0xlZnQ9ezJ9IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIj5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L0lua0JveD5cbiAgKTtcbn07XG5cbmNvbnN0IE1kTGlzdEl0ZW0gPSAoeyBjaGlsZHJlbiB9OiB7IGNoaWxkcmVuOiBSZWFjdE5vZGUgfSkgPT4ge1xuICBjb25zdCB0aGVtZSA9IHVzZVRoZW1lKCk7XG5cbiAgcmV0dXJuIChcbiAgICA8SW5rQm94PlxuICAgICAgPElua1RleHQgY29sb3I9e3RoZW1lLmxpc3RJdGVtfT7igKIgPC9JbmtUZXh0PlxuICAgICAgPElua0JveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCI+e2NoaWxkcmVufTwvSW5rQm94PlxuICAgIDwvSW5rQm94PlxuICApO1xufTtcblxuY29uc3QgTWRCbG9ja1F1b3RlID0gKHsgY2hpbGRyZW4gfTogeyBjaGlsZHJlbjogUmVhY3ROb2RlIH0pID0+IHtcbiAgY29uc3QgdGhlbWUgPSB1c2VUaGVtZSgpO1xuXG4gIHJldHVybiAoXG4gICAgPFRleHRTdHlsZUNvbnRleHQuUHJvdmlkZXJcbiAgICAgIHZhbHVlPXt7XG4gICAgICAgIGNvbG9yOiB0aGVtZS5ibG9ja3F1b3RlLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8SW5rQm94XG4gICAgICAgIGZsZXhEaXJlY3Rpb249XCJyb3dcIlxuICAgICAgICBmbGV4R3Jvdz17MH1cbiAgICAgICAgZmxleFNocmluaz17MX1cbiAgICAgICAgZmxleFdyYXA9XCJ3cmFwXCJcbiAgICAgICAgcGFkZGluZ0xlZnQ9ezF9XG4gICAgICAgIGJvcmRlckNvbG9yPXt0aGVtZS5ibG9ja3F1b3RlfVxuICAgICAgICBib3JkZXJSaWdodD17ZmFsc2V9XG4gICAgICAgIGJvcmRlckJvdHRvbT17ZmFsc2V9XG4gICAgICAgIGJvcmRlclRvcD17ZmFsc2V9XG4gICAgICAgIGJvcmRlclN0eWxlPXtcImJvbGRcIn1cbiAgICAgID5cbiAgICAgICAgPFRleHRTdHlsZSBjb2xvcj17dGhlbWUuYmxvY2txdW90ZX0+e2NoaWxkcmVufTwvVGV4dFN0eWxlPlxuICAgICAgPC9JbmtCb3g+XG4gICAgPC9UZXh0U3R5bGVDb250ZXh0LlByb3ZpZGVyPlxuICApO1xufTtcblxuY29uc3QgTWRDb2RlID0gKHsgbGFuZywgdmFsdWUgfTogeyBsYW5nOiBzdHJpbmc7IHZhbHVlOiBzdHJpbmcgfSkgPT4ge1xuICBjb25zdCB0aGVtZSA9IHVzZVRoZW1lKCk7XG4gIGNvbnN0IGxhbmd1YWdlID0gc3VwcG9ydHNMYW5ndWFnZShsYW5nKSA/IGxhbmcgOiBcInRleHRcIjtcblxuICByZXR1cm4gKFxuICAgIDxJbmtCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIG1hcmdpbkxlZnQ9ezF9PlxuICAgICAge2xhbmd1YWdlICE9IFwidGV4dFwiICYmIChcbiAgICAgICAgPElua0JveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgbWFyZ2luTGVmdD17MX0+XG4gICAgICAgICAgPElua1RleHQgY29sb3I9e3RoZW1lLm11dGVkfSBkaW1Db2xvcj5cbiAgICAgICAgICAgIHtsYW5ndWFnZX1cbiAgICAgICAgICA8L0lua1RleHQ+XG4gICAgICAgIDwvSW5rQm94PlxuICAgICAgKX1cbiAgICAgIDxJbmtCb3hcbiAgICAgICAgZmxleERpcmVjdGlvbj1cImNvbHVtblwiXG4gICAgICAgIHBhZGRpbmdYPXsxfVxuICAgICAgICBib3JkZXJTdHlsZT1cInJvdW5kXCJcbiAgICAgICAgYm9yZGVyQ29sb3I9e3RoZW1lLmNvZGV9XG4gICAgICA+XG4gICAgICAgIDxJbmtUZXh0PlxuICAgICAgICAgIHtoaWdobGlnaHQodmFsdWUsIHtcbiAgICAgICAgICAgIGxhbmd1YWdlLFxuICAgICAgICAgICAgdGhlbWU6IGhpZ2hsaWdodFRoZW1lLFxuICAgICAgICAgIH0pLnRyaW0oKX1cbiAgICAgICAgPC9JbmtUZXh0PlxuICAgICAgPC9JbmtCb3g+XG4gICAgPC9JbmtCb3g+XG4gICk7XG59O1xuXG5jb25zdCBNZFRoZW1hdGljQnJlYWsgPSAoKSA9PiB7XG4gIHJldHVybiAoXG4gICAgPElua0JveFxuICAgICAgYm9yZGVyQ29sb3I9e3VzZVRoZW1lKCkudGhlbWF0aWNCcmVha31cbiAgICAgIGJvcmRlclN0eWxlPXtcImJvbGRcIn1cbiAgICAgIGJvcmRlckJvdHRvbT17ZmFsc2V9XG4gICAgICBib3JkZXJSaWdodD17ZmFsc2V9XG4gICAgICBib3JkZXJMZWZ0PXtmYWxzZX1cbiAgICAvPlxuICApO1xufTtcblxuY29uc3QgTWRCcmVhayA9ICgpID0+IHtcbiAgcmV0dXJuIDxJbmtUZXh0PntcIlxcblwifTwvSW5rVGV4dD47XG59O1xuXG5jb25zdCBNZEltYWdlID0gKHsgYWx0IH06IHsgdXJsOiBzdHJpbmc7IGFsdD86IHN0cmluZyB9KSA9PiB7XG4gIC8vIFRPRE86IFNJR1NFR1YsIG5lZWQgdG8gaW52ZXN0aWdhdGVcbiAgLy8gaWYgKGZzLmV4aXN0c1N5bmModXJsKSkge1xuICAvLyAgIHJldHVybiA8SW1hZ2UgcHJlc2VydmVBc3BlY3RSYXRpbyBzcmM9e3VybH0gYWx0PXthbHR9IHdpZHRoPVwiNTAlXCIgLz5cbiAgLy8gfVxuICBpZiAoYWx0KVxuICAgIHJldHVybiA8SW5rVGV4dCBjb2xvcj17dXNlVGhlbWUoKS5tdXRlZH0+e2AoPGltYWdlPiAke2FsdH0pYH08L0lua1RleHQ+O1xuXG4gIHJldHVybiBudWxsO1xufTtcblxuY29uc3QgbWRhc3RNYXAgPSB7XG4gIHJvb3Q6IE1kUm9vdCxcbiAgdGV4dDogTWRUZXh0LFxuICBpbmxpbmVDb2RlOiBNZElubGluZUNvZGUsXG4gIGhlYWRpbmc6IE1kSGVhZGluZyxcbiAgZW1waGFzaXM6IE1kRW1waGFzaXMsXG4gIHN0cm9uZzogTWRTdHJvbmcsXG4gIGRlbGV0ZTogTWREZWxldGUsXG4gIGxpbms6IE1kTGluayxcbiAgcGFyYWdyYXBoOiBNZFBhcmFncmFwaCxcbiAgY29kZTogTWRDb2RlLFxuICBibG9ja3F1b3RlOiBNZEJsb2NrUXVvdGUsXG4gIGxpc3Q6IE1kTGlzdCxcbiAgbGlzdEl0ZW06IE1kTGlzdEl0ZW0sXG4gIGJyZWFrOiBNZEJyZWFrLFxuICB0aGVtYXRpY0JyZWFrOiBNZFRoZW1hdGljQnJlYWssXG4gIGltYWdlOiBNZEltYWdlLFxuICBodG1sOiAoKSA9PiB7XG4gICAgLy8gVE9ETzogd2hhdCB0byBkbz9cbiAgfSxcbn07XG5cbmZ1bmN0aW9uIHRleHRDb250ZW50KG5vZGU6IE5vZGUpIHtcbiAgcmV0dXJuIHNlbGVjdEFsbChcInRleHRcIiwgbm9kZSlcbiAgICAubWFwKCh4KSA9PiAoeCBhcyBUZXh0KS52YWx1ZSlcbiAgICAuam9pbigpXG4gICAgLnRyaW0oKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRW1wdHlUYWJsZVJvd3Mobm9kZTogVGFibGUpIHtcbiAgdmlzaXQobm9kZSwgKG4sIGluZGV4LCBwYXJlbnQpID0+IHtcbiAgICBpZiAobi50eXBlID09IFwidGFibGVSb3dcIikge1xuICAgICAgY29uc3QgdGFibGVSb3cgPSBuIGFzIFRhYmxlUm93O1xuICAgICAgaWYgKCF0ZXh0Q29udGVudCh0YWJsZVJvdykpIHtcbiAgICAgICAgY29uc3QgdGFibGUgPSBwYXJlbnQgYXMgVGFibGU7XG4gICAgICAgIHRhYmxlLmNoaWxkcmVuLnNwbGljZShpbmRleCEsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUVtcHR5TGlzdEl0ZW1zKG5vZGU6IExpc3QpIHtcbiAgdmlzaXQobm9kZSwgKG4sIGluZGV4LCBwYXJlbnQpID0+IHtcbiAgICBpZiAobi50eXBlID09IFwibGlzdEl0ZW1cIikge1xuICAgICAgY29uc3QgbGlzdEl0ZW0gPSBuIGFzIExpc3RJdGVtO1xuICAgICAgaWYgKCF0ZXh0Q29udGVudChsaXN0SXRlbSkpIHtcbiAgICAgICAgY29uc3QgbGlzdCA9IHBhcmVudCBhcyBMaXN0O1xuICAgICAgICBsaXN0LmNoaWxkcmVuLnNwbGljZShpbmRleCEsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b0luayh0ZXh0OiBzdHJpbmcsIHRoZW1lOiBUaGVtZSA9IGRlZmF1bHRUaGVtZSkge1xuICBjb25zdCBtZGFzdFRyZWUgPSBtZDJtZGFzdCh0ZXh0KTtcblxuICBjb25zdCB0b0pTWCA9IChub2RlOiBOb2RlLCBpOiBudW1iZXIpOiBSZWFjdEVsZW1lbnQgPT4ge1xuICAgIGlmIChub2RlLnR5cGUgPT0gXCJ0YWJsZVwiKSB7XG4gICAgICByZW1vdmVFbXB0eVRhYmxlUm93cyhub2RlIGFzIFRhYmxlKTtcbiAgICAgIC8vIGRlbGVnYXRlIHRhYmxlIHJlbmRlcmluZyB0byBtZGFzdFxuICAgICAgcmV0dXJuIDxJbmtUZXh0IGtleT17aX0+e21kYXN0Mm1kKG5vZGUgYXMgTWRhc3ROb2Rlcyl9PC9JbmtUZXh0PjtcbiAgICB9XG5cbiAgICBpZiAobm9kZS50eXBlID09IFwibGlzdFwiKSB7XG4gICAgICByZW1vdmVFbXB0eUxpc3RJdGVtcyhub2RlIGFzIExpc3QpO1xuICAgIH1cblxuICAgIGlmIChub2RlLnR5cGUgaW4gbWRhc3RNYXApIHtcbiAgICAgIGNvbnN0IHsgdHlwZSwgY2hpbGRyZW4sIHBvc2l0aW9uLCAuLi5wcm9wcyB9ID0gbm9kZSBhcyBQYXJlbnQ7XG4gICAgICBjb25zdCBrZXkgPSB0eXBlIGFzIGtleW9mIHR5cGVvZiBtZGFzdE1hcDtcbiAgICAgIHJldHVybiBqc3goXG4gICAgICAgIG1kYXN0TWFwW2tleV0gYXMgRWxlbWVudFR5cGUsXG4gICAgICAgIHsgLi4ucHJvcHMsIGNoaWxkcmVuOiBjaGlsZHJlbj8ubWFwKHRvSlNYKSB9LFxuICAgICAgICBpXG4gICAgICApO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gdHlwZTogJHtub2RlLnR5cGV9YCk7XG4gIH07XG4gIHJldHVybiAoXG4gICAgPFRoZW1lQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17dGhlbWV9PlxuICAgICAge21kYXN0VHJlZS5jaGlsZHJlbi5tYXAodG9KU1gpfVxuICAgIDwvVGhlbWVDb250ZXh0LlByb3ZpZGVyPlxuICApO1xufVxuIiwKICAgICJpbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgY2hhbGsgZnJvbSBcImNoYWxrXCI7XG5pbXBvcnQgeyBpZGVudGl0eSB9IGZyb20gXCJsb2Rhc2gtZXNcIjtcblxuLy8gVE9ETzogSW1wcm92ZSBkZWZhdWx0IHRoZW1lXG5cbi8vICNmZjYyOGNcbi8vICNmYWQwMDBcbi8vICNmZjlkMDBcbi8vICNhNWZmOTBcbi8vICNhNTk5ZTlcbi8vICM5ZWZmZmZcbi8vICMyRDJCNTVcblxuY29uc3QgY29sb3JzID0ge1xuICB5ZWxsb3c6IFwiI2ZhZDAwMFwiLFxuICBwaW5rOiBcIiNmZjYyOGNcIixcbiAgcHVycGxlOiBcIiNiMzYyZmZcIixcbiAgY3lhbjogXCIjOWVmZmZmXCIsXG4gIGdyZWVuOiBcIiNhNWZmOTBcIixcbiAgZGltUHVycGxlOiBcIiNhNTk5ZTlcIixcbiAgZGFya1B1cnBsZTogXCIjMkQyQjU1XCIsXG59O1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdFRoZW1lID0ge1xuICB0ZXh0OiBcIiNmZmZiZmZcIixcbiAgbXV0ZWQ6IGNvbG9ycy5kaW1QdXJwbGUsXG5cbiAgaGVhZGluZzogY29sb3JzLnllbGxvdyxcbiAgbGluazogY29sb3JzLmN5YW4sXG4gIGxpc3RJdGVtOiBjb2xvcnMucHVycGxlLFxuICBpbmxpbmVDb2RlOiBjb2xvcnMueWVsbG93LFxuICBlbXBoYXNpczogY29sb3JzLmdyZWVuLFxuICBzdHJvbmc6IGNvbG9ycy5kaW1QdXJwbGUsXG4gIGRlbGV0ZTogY29sb3JzLmRpbVB1cnBsZSxcbiAgY29kZTogY29sb3JzLmRhcmtQdXJwbGUsXG4gIGJsb2NrcXVvdGU6IGNvbG9ycy5kaW1QdXJwbGUsXG4gIHRoZW1hdGljQnJlYWs6IGNvbG9ycy5kYXJrUHVycGxlLFxufTtcblxuZXhwb3J0IGNvbnN0IGhpZ2hsaWdodFRoZW1lID0ge1xuICBrZXl3b3JkOiBjaGFsay5oZXgoZGVmYXVsdFRoZW1lLmlubGluZUNvZGUpLFxuICBidWlsdF9pbjogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5pbmxpbmVDb2RlKSxcbiAgdHlwZTogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5pbmxpbmVDb2RlKSxcbiAgbGl0ZXJhbDogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5lbXBoYXNpcyksXG4gIG51bWJlcjogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5lbXBoYXNpcyksXG4gIHJlZ2V4cDogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5lbXBoYXNpcyksXG4gIHN0cmluZzogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5lbXBoYXNpcyksXG4gIHN1YnN0OiBjaGFsay5oZXgoZGVmYXVsdFRoZW1lLmVtcGhhc2lzKSxcbiAgc3ltYm9sOiBjaGFsay5oZXgoZGVmYXVsdFRoZW1lLmlubGluZUNvZGUpLFxuICBjbGFzczogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5pbmxpbmVDb2RlKSxcbiAgZnVuY3Rpb246IGNoYWxrLmhleChkZWZhdWx0VGhlbWUuaW5saW5lQ29kZSksXG4gIHRpdGxlOiBpZGVudGl0eSxcbiAgcGFyYW1zOiBpZGVudGl0eSxcbiAgY29tbWVudDogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5tdXRlZCksXG4gIGRvY3RhZzogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5saW5rKSxcbiAgbWV0YTogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5saW5rKSxcbiAgXCJtZXRhLWtleXdvcmRcIjogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5saW5rKSxcbiAgXCJtZXRhLXN0cmluZ1wiOiBjaGFsay5oZXgoZGVmYXVsdFRoZW1lLmxpbmspLFxuICBzZWN0aW9uOiBjaGFsay5oZXgoZGVmYXVsdFRoZW1lLmxpbmspLFxuICB0YWc6IGNoYWxrLmhleChkZWZhdWx0VGhlbWUubGluayksXG4gIG5hbWU6IGNoYWxrLmhleChkZWZhdWx0VGhlbWUuZW1waGFzaXMpLFxuICBcImJ1aWx0aW4tbmFtZVwiOiBjaGFsay5oZXgoZGVmYXVsdFRoZW1lLmVtcGhhc2lzKSxcbiAgYXR0cjogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5saXN0SXRlbSksXG4gIGF0dHJpYnV0ZTogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5saXN0SXRlbSksXG4gIHZhcmlhYmxlOiBjaGFsay5oZXgoZGVmYXVsdFRoZW1lLmxpc3RJdGVtKSxcbiAgYnVsbGV0OiBjaGFsay5oZXgoZGVmYXVsdFRoZW1lLmxpc3RJdGVtKSxcbiAgY29kZTogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5jb2RlKSxcbiAgZW1waGFzaXM6IGNoYWxrLmhleChkZWZhdWx0VGhlbWUuZW1waGFzaXMpLFxuICBzdHJvbmc6IGNoYWxrLmhleChkZWZhdWx0VGhlbWUuc3Ryb25nKSxcbiAgZm9ybXVsYTogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5pbmxpbmVDb2RlKSxcbiAgbGluazogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5saW5rKSxcbiAgcXVvdGU6IGNoYWxrLmhleChkZWZhdWx0VGhlbWUuYmxvY2txdW90ZSksXG4gIFwic2VsZWN0b3ItdGFnXCI6IGNoYWxrLmhleChkZWZhdWx0VGhlbWUubGluayksXG4gIFwic2VsZWN0b3ItaWRcIjogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5saW5rKSxcbiAgXCJzZWxlY3Rvci1jbGFzc1wiOiBjaGFsay5oZXgoZGVmYXVsdFRoZW1lLmxpbmspLFxuICBcInNlbGVjdG9yLWF0dHJcIjogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5saW5rKSxcbiAgXCJzZWxlY3Rvci1wc2V1ZG9cIjogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5saW5rKSxcbiAgXCJ0ZW1wbGF0ZS10YWdcIjogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5saW5rKSxcbiAgXCJ0ZW1wbGF0ZS12YXJpYWJsZVwiOiBjaGFsay5oZXgoZGVmYXVsdFRoZW1lLmxpbmspLFxuICBhZGRpdGlvbjogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5zdHJvbmcpLFxuICBkZWxldGlvbjogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5saW5rKSxcbiAgZGVmYXVsdDogaWRlbnRpdHksXG59O1xuXG5leHBvcnQgdHlwZSBUaGVtZSA9IHR5cGVvZiBkZWZhdWx0VGhlbWU7XG5leHBvcnQgY29uc3QgVGhlbWVDb250ZXh0ID0gUmVhY3QuY3JlYXRlQ29udGV4dDxUaGVtZT4oZGVmYXVsdFRoZW1lKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVRoZW1lKCkge1xuICByZXR1cm4gUmVhY3QudXNlQ29udGV4dChUaGVtZUNvbnRleHQpO1xufVxuIiwKICAgICJpbXBvcnQgeyBodG1sMm1kIH0gZnJvbSBcIi4vbWFya2Rvd25cIlxuaW1wb3J0IHsgY3JlYXRlUmVhZFN0cmVhbSB9IGZyb20gXCJub2RlOmZzXCJcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRTdHJlYW0oXG4gIHN0cmVhbTogTm9kZUpTLlJlYWRhYmxlU3RyZWFtLFxuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgY2h1bmtzOiBzdHJpbmdbXSA9IFtdXG4gIGZvciBhd2FpdCAoY29uc3QgY2h1bmsgb2Ygc3RyZWFtKSB7XG4gICAgY2h1bmtzLnB1c2goY2h1bmsudG9TdHJpbmcoKSlcbiAgfVxuICByZXR1cm4gY2h1bmtzLmpvaW4oXCJcIikudHJpbSgpXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkVFRZU3RyZWFtKFxuICBzdHJlYW06IHR5cGVvZiBwcm9jZXNzLnN0ZGluLFxuICBodG1sOiBib29sZWFuLFxuKTogUHJvbWlzZTxzdHJpbmcgfCB1bmRlZmluZWQ+IHtcbiAgY29uc3Qgb3V0cHV0ID0gc3RyZWFtLmlzVFRZID8gdW5kZWZpbmVkIDogYXdhaXQgcmVhZFN0cmVhbShzdHJlYW0pXG4gIGlmIChvdXRwdXQgJiYgaHRtbCkgcmV0dXJuIGh0bWwybWQob3V0cHV0KVxuICByZXR1cm4gb3V0cHV0XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkU3RkSW5PckZpbGUoXG4gIGZpbGU6IHN0cmluZyxcbiAgaHRtbDogYm9vbGVhbixcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIGxldCBvdXRwdXQgPSBhd2FpdCByZWFkU3RyZWFtKHByb2Nlc3Muc3RkaW4pXG4gIGlmICghb3V0cHV0KSB7XG4gICAgb3V0cHV0ID0gYXdhaXQgcmVhZFN0cmVhbShjcmVhdGVSZWFkU3RyZWFtKGZpbGUpKVxuICB9XG4gIGlmIChodG1sKSByZXR1cm4gaHRtbDJtZChvdXRwdXQpXG4gIHJldHVybiBvdXRwdXRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhcGl0YWxpemUoc3RyOiBzdHJpbmcpIHtcbiAgaWYgKHN0ci5sZW5ndGggPCAyKSByZXR1cm4gc3RyXG4gIHJldHVybiBzdHJbMF0hLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGR1bWJGb3JtYXQoeG1sTGlrZTogc3RyaW5nKSB7XG4gIHZhciBmb3JtYXR0ZWQgPSBcIlwiXG4gIHZhciByZWcgPSAvKD4pKDwpKFxcLyopL2dcbiAgeG1sTGlrZSA9IHhtbExpa2UucmVwbGFjZShyZWcsIFwiJDFcXHJcXG4kMiQzXCIpXG4gIHZhciBwYWQgPSAwXG4gIGNvbnN0IHBhcnRzID0geG1sTGlrZS5zcGxpdChcIlxcclxcblwiKVxuICBwYXJ0cy5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgdmFyIGluZGVudCA9IDBcbiAgICBpZiAobm9kZS5tYXRjaCgvLis8XFwvXFx3W14+XSo+JC8pKSB7XG4gICAgICBpbmRlbnQgPSAwXG4gICAgfSBlbHNlIGlmIChub2RlLm1hdGNoKC9ePFxcL1xcdy8pKSB7XG4gICAgICBpZiAocGFkICE9IDApIHtcbiAgICAgICAgcGFkIC09IDFcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG5vZGUubWF0Y2goL148XFx3W14+XSpbXlxcL10+LiokLykpIHtcbiAgICAgIGluZGVudCA9IDFcbiAgICB9IGVsc2Uge1xuICAgICAgaW5kZW50ID0gMFxuICAgIH1cblxuICAgIHZhciBwYWRkaW5nID0gXCJcIlxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFkOyBpKyspIHtcbiAgICAgIHBhZGRpbmcgKz0gXCIgIFwiXG4gICAgfVxuXG4gICAgZm9ybWF0dGVkICs9IHBhZGRpbmcgKyBub2RlICsgXCJcXHJcXG5cIlxuICAgIHBhZCArPSBpbmRlbnRcbiAgfSlcblxuICByZXR1cm4gZm9ybWF0dGVkXG59XG4iLAogICAgImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlUmVmIH0gZnJvbSBcInJlYWN0XCJcbmltcG9ydCB7IGxhc3QsIHNvcnRCeSB9IGZyb20gXCJsb2Rhc2gtZXNcIlxuaW1wb3J0IGxhbmd1YWdlZGV0ZWN0aW9uIGZyb20gXCJAdnNjb2RlL3ZzY29kZS1sYW5ndWFnZWRldGVjdGlvblwiXG5cbmV4cG9ydCBjb25zdCBvcHMgPSBuZXcgbGFuZ3VhZ2VkZXRlY3Rpb24uTW9kZWxPcGVyYXRpb25zKClcblxuZXhwb3J0IGNvbnN0IHVzZU1pbWUgPSAoc3RyOiBzdHJpbmcsIG1pbkxlbmd0aCA9IDUwKTogc3RyaW5nIHwgdW5kZWZpbmVkID0+IHtcbiAgY29uc3QgbWltZSA9IHVzZVJlZjxzdHJpbmc+KClcbiAgY29uc3QgbiA9IHVzZVJlZigwKVxuXG4gIGNvbnN0IHJ1biA9IGFzeW5jICgpID0+IHtcbiAgICBpZiAoc3RyLmxlbmd0aCA+PSBtaW5MZW5ndGggKiBuLmN1cnJlbnQpIHtcbiAgICAgIGNvbnN0IG0gPSBhd2FpdCBndWVzc01pbWUoc3RyKVxuICAgICAgbi5jdXJyZW50ICs9IDFcbiAgICAgIGlmIChtKSBtaW1lLmN1cnJlbnQgPSBtXG4gICAgfVxuICB9XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBydW4oKVxuICB9LCBbc3RyXSlcblxuICByZXR1cm4gbWltZS5jdXJyZW50XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBndWVzc01pbWUoc3RyOiBzdHJpbmcsIG1pbkNvbmZpZGVuY2UgPSAwLjA1KSB7XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IG9wcy5ydW5Nb2RlbChzdHIpXG4gIHJldHVybiBsYXN0KFxuICAgIHNvcnRCeShcbiAgICAgIHJlc3VsdC5maWx0ZXIoKHIpID0+IHIuY29uZmlkZW5jZSA+IG1pbkNvbmZpZGVuY2UpLFxuICAgICAgKHIpID0+IHIuY29uZmlkZW5jZSxcbiAgICApLFxuICApPy5sYW5ndWFnZUlkXG59XG4iLAogICAgImltcG9ydCB7IHJlbmRlciB9IGZyb20gXCJpbmtcIlxuaW1wb3J0IHsgQ29tbWFuZCB9IGZyb20gXCJjb21tYW5kZXJcIlxuaW1wb3J0IHsgcmVhZFN0ZEluT3JGaWxlIH0gZnJvbSBcIi4uL3N1cHBvcnQvdXRpbFwiXG5pbXBvcnQgeyBNZFJvb3QsIHRvSW5rIH0gZnJvbSBcIi4uL3N1cHBvcnQvbWFya2Rvd25cIlxuXG50eXBlIFJlbmRlck9wdGlvbnMgPSB7XG4gIHByaW50V2lkdGg/OiBzdHJpbmdcbiAgaHRtbD86IGJvb2xlYW5cbn1cblxuZXhwb3J0IGRlZmF1bHQgKG9sbGFtYXJrOiBDb21tYW5kKSA9PlxuICBvbGxhbWFya1xuICAgIC5kZXNjcmlwdGlvbihcIlJlbmRlciBtYXJrZG93blwiKVxuICAgIC5jb21tYW5kKFwicmVuZGVyXCIpXG4gICAgLmFyZ3VtZW50KFwiW2ZpbGVdXCIsIFwiZmlsZSB0byByZW5kZXJcIilcbiAgICAub3B0aW9uKFwiLS1odG1sXCIsIFwidHJlYXQgaW5wdXQgYXMgaHRtbFwiKVxuICAgIC5vcHRpb24oXCItLXByaW50LXdpZHRoIDxjaGFycz5cIiwgXCJwcmludCB3aWR0aFwiLCBcIjEyMFwiKVxuICAgIC5hY3Rpb24oYXN5bmMgKGZpbGU6IHN0cmluZywgb3B0aW9uczogUmVuZGVyT3B0aW9ucykgPT4ge1xuICAgICAgbGV0IGlucHV0ID0gYXdhaXQgcmVhZFN0ZEluT3JGaWxlKGZpbGUsICEhb3B0aW9ucy5odG1sKVxuICAgICAgcmVuZGVyKDxNZFJvb3Qgd2lkdGg9e051bWJlcihvcHRpb25zLnByaW50V2lkdGgpfT57dG9JbmsoaW5wdXQpfTwvTWRSb290PilcbiAgICB9KVxuIiwKICAgICJpbXBvcnQgeyBDb21tYW5kIH0gZnJvbSBcImNvbW1hbmRlclwiXG5pbXBvcnQgeyBoaWdobGlnaHRUaGVtZSB9IGZyb20gXCIuLi9zdXBwb3J0L3RoZW1pbmdcIlxuaW1wb3J0IHsgcmVhZFN0ZEluT3JGaWxlLCBkdW1iRm9ybWF0IH0gZnJvbSBcIi4uL3N1cHBvcnQvdXRpbFwiXG5pbXBvcnQgeyByZW5kZXJUb1N0YXRpY01hcmt1cCB9IGZyb20gXCJyZWFjdC1kb20vc2VydmVyXCJcbmltcG9ydCB7IHRvSW5rIH0gZnJvbSBcIi4uL3N1cHBvcnQvbWFya2Rvd25cIlxuaW1wb3J0IHsgaGlnaGxpZ2h0IH0gZnJvbSBcImNsaS1oaWdobGlnaHRcIlxuXG50eXBlIFJlbmRlck9wdGlvbnMgPSB7XG4gIHByaW50V2lkdGg/OiBzdHJpbmdcbiAgaHRtbD86IGJvb2xlYW5cbn1cblxuZXhwb3J0IGRlZmF1bHQgKG9sbGFtYXJrOiBDb21tYW5kKSA9PlxuICBvbGxhbWFya1xuICAgIC5jb21tYW5kKFwiYXN0XCIpXG4gICAgLmRlc2NyaXB0aW9uKFwiSW5zcGVjdCB0aGUgcmVuZGVyZWQgQVNUIG9mIGEgbWFya2Rvd24gZmlsZVwiKVxuICAgIC5hcmd1bWVudChcIltmaWxlXVwiLCBcImZpbGUgdG8gcmVuZGVyXCIpXG4gICAgLm9wdGlvbihcIi0taHRtbFwiLCBcInRyZWF0IGlucHV0IGFzIGh0bWxcIilcbiAgICAub3B0aW9uKFwiLS1wcmludC13aWR0aCA8Y2hhcnM+XCIsIFwicHJpbnQgd2lkdGhcIiwgXCIxMjBcIilcbiAgICAuYWN0aW9uKGFzeW5jIChmaWxlOiBzdHJpbmcsIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMpID0+IHtcbiAgICAgIGxldCBpbnB1dCA9IGF3YWl0IHJlYWRTdGRJbk9yRmlsZShmaWxlLCAhIW9wdGlvbnMuaHRtbClcbiAgICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKFxuICAgICAgICBoaWdobGlnaHQoZHVtYkZvcm1hdChyZW5kZXJUb1N0YXRpY01hcmt1cCh0b0luayhpbnB1dCkpKSwge1xuICAgICAgICAgIGxhbmd1YWdlOiBcInhtbFwiLFxuICAgICAgICAgIHRoZW1lOiBoaWdobGlnaHRUaGVtZSxcbiAgICAgICAgfSksXG4gICAgICApXG4gICAgfSlcbiIKICBdLAogICJtYXBwaW5ncyI6ICI7Ozs7QUFFQTtBQUVBOzs7Ozs7OztBQ0pBLGVBQVMsc0JBQWE7OztBQ0N0Qjs7O0FDREE7QUFBQSxPQUNFO0FBQUEsUUFDQTtBQUFBO0FBQUE7OztBQ0ZGO0FBQ0E7QUFDQTtBQXNGTyxTQUFTLFFBQVEsR0FB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LE1BQUksUUFBUSxNQUFNLGdCQUFnQixRQUFRLFFBQVEsSUFBSTtBQUN0RCxVQUFRLE9BQU8sTUFDYixXQUFVLFdBQVcscUJBQXFCLE1BQU0sS0FBSyxDQUFDLENBQUMsR0FBRztBQUFBLElBQ3hELFVBQVU7QUFBQSxJQUNWLE9BQU87QUFBQSxFQUNULENBQUMsQ0FDSDtBQUFBLENBQ0Q7OztBUkpMLElBQVMsbUJBQVEsR0FBRztBQUNsQixVQUFPLE1BQU07QUFDYixVQUFRLE9BQU8sTUFBTSxXQUFXO0FBQUE7QUFkbEMsSUFBTSxVQUFVLElBQUk7QUFDcEIsUUFBUSxLQUFLLElBQUksRUFBRSxZQUFZLFdBQVcsRUFBRSxRQUFRLE9BQU87QUFFM0QsWUFBbUIsT0FBTztBQUMxQixlQUFzQixPQUFPO0FBQzdCLFlBQW1CLE9BQU87QUFFMUIsUUFBUSxNQUFNO0FBRWQsUUFBUSxHQUFHLFVBQVUsUUFBUTtBQUM3QixRQUFRLEdBQUcsUUFBUSxRQUFROyIsCiAgImRlYnVnSWQiOiAiNTk0NkY3MThBOUVEOTRFQjY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
