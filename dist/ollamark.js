#!/usr/bin/env node

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
  link: colors.pink,
  listItem: colors.purple,
  inlineCode: colors.cyan,
  emphasis: colors.green,
  strong: colors.yellow,
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
import tinycolor from "tinycolor2";
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
  color: tinycolor(context.color).brighten(25).toString()
}));
var MdStrong = styled(({ context }) => {
  return {
    bold: true,
    color: tinycolor(context.color).darken(5).toHexString()
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
import {createReadStream} from "node:fs";
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
        borderStyle: "round",
        borderColor: theme.muted,
        paddingX: 2,
        paddingY: 1,
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
var useMime = (str, minLength = 50) => {
  const mime = useRef();
  const n = useRef(0);
  const run = async () => {
    if (str.length >= minLength * n.current) {
      const m = await guessMime(str);
      n.current += 1;
      if (m)
        mime.current = m;
    }
  };
  useEffect(() => {
    run();
  }, [str]);
  return mime.current;
};

// src/commands/run.tsx
import {useEffect as useEffect2, useState} from "react";
import ollama from "ollama";
import Spinner from "ink-spinner";
import {highlight as highlight2, supportsLanguage as supportsLanguage2} from "cli-highlight";
import {
jsxDEV as jsxDEV3
} from "react/jsx-dev-runtime";
var Renderer = ({ content, mime: mime2 }) => {
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
  if (options.system)
    conversation.push({ role: "system", content: options.system });
  conversation.push({
    role: "user",
    content: prompt
  });
  if (stdin)
    conversation.push({ role: "user", ...stdin });
  const match = models.map(({ name: name2 }) => name2).find((name2) => name2.toLowerCase().includes(options.model?.toLowerCase()));
  let model;
  if (match) {
    model = match;
  } else {
    return jsxDEV3(Text2, {
      children: options.model ? `No model matches ${options.model}` : `No model specified`
    }, undefined, false, undefined, this);
  }
  async function run() {
    const response = await ollama.chat({
      messages: conversation,
      model,
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
  const bufferMime = useMime(buffer);
  if (options.response || options.json)
    return jsxDEV3(Renderer, {
      content: buffer,
      mime: bufferMime
    }, undefined, false, undefined, this);
  return jsxDEV3(Box2, {
    flexDirection: "column",
    flexWrap: "wrap",
    width: options.printWidth,
    children: [
      jsxDEV3(Static, {
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
          content: buffer,
          mime: bufferMime
        }, undefined, false, undefined, this) : jsxDEV3(Text2, {
          children: jsxDEV3(Spinner, {
            type: "simpleDotsScrolling"
          }, undefined, false, undefined, this)
        }, undefined, false, undefined, this)
      }, "buffer", false, undefined, this)
    ]
  }, undefined, true, undefined, this);
};
var run_default = (ollamark) => ollamark.command("run", { isDefault: true }).description("Execute a prompt").argument("<prompt...>").option("--html", "treat input as html").option("--json", "output in json").option("-m, --model <string>", "model name (partial match supported)").option("-s, --system <string>", "system prompt").option("-t, --temp <value>", "temperature").option("-n, --num-pred <value>", "number of predictions").option("-C, --ctx <value>", "context length").option("-r, --response", "only print response").option("-W, --print-width <chars>", "print width", "100").action(async (parts, options) => {
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

//# debugId=5A52366DA0F8A92064756e2164756e21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL29sbGFtYXJrLnRzeCIsICIuLi9wYWNrYWdlLmpzb24iLCAiLi4vc3JjL2NvbW1hbmRzL3J1bi50c3giLCAiLi4vc3JjL2NvbXBvbmVudHMvTWVzc2FnZS50c3giLCAiLi4vc3JjL3N1cHBvcnQvbWFya2Rvd24udHN4IiwgIi4uL3NyYy9zdXBwb3J0L3RoZW1pbmcudHN4IiwgIi4uL3NyYy9zdXBwb3J0L21hcmtkb3duLnRzeCIsICIuLi9zcmMvc3VwcG9ydC91dGlsLnRzeCIsICIuLi9zcmMvY29tcG9uZW50cy9NZXNzYWdlLnRzeCIsICIuLi9zcmMvc3VwcG9ydC9taW1lLnRzeCIsICIuLi9zcmMvY29tbWFuZHMvcnVuLnRzeCIsICIuLi9zcmMvY29tbWFuZHMvcmVuZGVyLnRzeCIsICIuLi9zcmMvY29tbWFuZHMvcmVuZGVyLnRzeCIsICIuLi9zcmMvY29tbWFuZHMvYXN0LnRzeCIsICIuLi9zcmMvY29tbWFuZHMvYXN0LnRzeCIsICIuLi9zcmMvb2xsYW1hcmsudHN4Il0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgIiMhL3Vzci9iaW4vZW52IG5vZGVcblxuaW1wb3J0IG9sbGFtYSBmcm9tIFwib2xsYW1hXCJcblxuaW1wb3J0IHsgQ29tbWFuZCB9IGZyb20gXCJjb21tYW5kZXJcIlxuaW1wb3J0IHsgbmFtZSwgZGVzY3JpcHRpb24sIHZlcnNpb24gfSBmcm9tIFwiLi4vcGFja2FnZS5qc29uXCJcblxuaW1wb3J0IHJlZ2lzdGVyUnVuQ29tbWFuZCBmcm9tIFwiLi9jb21tYW5kcy9ydW5cIlxuaW1wb3J0IHJlZ2lzdGVyUmVuZGVyQ29tbWFuZCBmcm9tIFwiLi9jb21tYW5kcy9yZW5kZXJcIlxuaW1wb3J0IHJlZ2lzdGVyQXN0Q29tbWFuZCBmcm9tIFwiLi9jb21tYW5kcy9hc3RcIlxuXG5jb25zdCBwcm9ncmFtID0gbmV3IENvbW1hbmQoKVxucHJvZ3JhbS5uYW1lKG5hbWUpLmRlc2NyaXB0aW9uKGRlc2NyaXB0aW9uKS52ZXJzaW9uKHZlcnNpb24pXG5cbnJlZ2lzdGVyUnVuQ29tbWFuZChwcm9ncmFtKVxucmVnaXN0ZXJSZW5kZXJDb21tYW5kKHByb2dyYW0pXG5yZWdpc3RlckFzdENvbW1hbmQocHJvZ3JhbSlcblxucHJvZ3JhbS5wYXJzZSgpXG5cbnByb2Nlc3Mub24oXCJTSUdJTlRcIiwgc2h1dGRvd24pXG5wcm9jZXNzLm9uKFwiZXhpdFwiLCBzaHV0ZG93bilcblxuZnVuY3Rpb24gc2h1dGRvd24oKSB7XG4gIG9sbGFtYS5hYm9ydCgpXG4gIHByb2Nlc3Muc3Rkb3V0LndyaXRlKFwiXFx4MWJbPzI1aFwiKSAvLyByZXNldCBjdXJzb3Jcbn1cbiIsCiAgIntcbiAgXCJuYW1lXCI6IFwib2xsYW1hcmtcIixcbiAgXCJ2ZXJzaW9uXCI6IFwiMC4xLjBcIixcbiAgXCJkZXNjcmlwdGlvblwiOiBcIkEgY29tbWFuZC1saW5lIGNsaWVudCBmb3IgT2xsYW1hIHdpdGggbWFya2Rvd24gc3VwcG9ydFwiLFxuICBcIm1vZHVsZVwiOiBcIi4vZGlzdC9vbGxhbWFyay5qc1wiLFxuICBcImVuZ2luZXNcIjoge1xuICAgIFwibm9kZVwiOiBcIj49MTZcIlxuICB9LFxuICBcInR5cGVcIjogXCJtb2R1bGVcIixcbiAgXCJiaW5cIjoge1xuICAgIFwib2xsYW1hcmtcIjogXCIuL2Rpc3Qvb2xsYW1hcmsuanNcIlxuICB9LFxuICBcImZpbGVzXCI6IFtcbiAgICBcImRpc3RcIlxuICBdLFxuICBcInNjcmlwdHNcIjoge1xuICAgIFwiZGlzdFwiOiBcImJ1biBidWlsZCBzcmMvb2xsYW1hcmsudHN4IC0tb3V0ZGlyIGRpc3QgLS10YXJnZXQgbm9kZSAtLXNvdXJjZW1hcCAtZSAnQHZzY29kZS92c2NvZGUtbGFuZ3VhZ2VkZXRlY3Rpb24nIC1lICdjaGFsaycgLWUgJ2NsaS1oaWdobGlnaHQnIC1lICdjb21tYW5kZXInIC1lICdpbmsqJyAtZSAnbG9kYXNoLWVzJyAtZSAnbWRhc3QqJyAtZSAnb2xsYW1hJyAtZSAncmVhY3QqJyAtZSAncmVoeXBlKicgLWUgJ3JlbWFyayonIC1lICd0aW55Y29sb3IyJyAtZSAndW5pc3QqJyAgLWUgJ21pY3JvbWFyayonIC1lICd1bmlmaWVkJ1wiLFxuICAgIFwicHJlcHVibGlzaFwiOiBcImJ1biBkaXN0XCJcbiAgfSxcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQHR5cGVzL2J1blwiOiBcImxhdGVzdFwiLFxuICAgIFwiQHR5cGVzL2xvZGFzaC1lc1wiOiBcIl40LjE3LjEyXCIsXG4gICAgXCJAdHlwZXMvcmVhY3RcIjogXCJeMTguMi42NlwiLFxuICAgIFwiQHR5cGVzL3JlYWN0LWRvbVwiOiBcIl4xOC4yLjIyXCIsXG4gICAgXCJAdHlwZXMvdGlueWNvbG9yMlwiOiBcIl4xLjQuNlwiLFxuICAgIFwicmVhY3QtZGV2dG9vbHMtY29yZVwiOiBcIl40LjI4LjVcIixcbiAgICBcInR5cGVzY3JpcHRcIjogXCJeNS40LjJcIlxuICB9LFxuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAdnNjb2RlL3ZzY29kZS1sYW5ndWFnZWRldGVjdGlvblwiOiBcIl4xLjAuMjJcIixcbiAgICBcImNoYWxrXCI6IFwiXjUuMy4wXCIsXG4gICAgXCJjbGktaGlnaGxpZ2h0XCI6IFwiXjIuMS4xMVwiLFxuICAgIFwiY29tbWFuZGVyXCI6IFwiXjEyLjAuMFwiLFxuICAgIFwiaW5rXCI6IFwiXjQuNC4xXCIsXG4gICAgXCJpbmstbGlua1wiOiBcIl4zLjAuMFwiLFxuICAgIFwiaW5rLXNwaW5uZXJcIjogXCJeNS4wLjBcIixcbiAgICBcImxvZGFzaC1lc1wiOiBcIl40LjE3LjIxXCIsXG4gICAgXCJtZGFzdC11dGlsLWNvbXBhY3RcIjogXCJeNS4wLjBcIixcbiAgICBcIm9sbGFtYVwiOiBcIl4wLjUuMFwiLFxuICAgIFwicmVhY3RcIjogXCJeMTguMi4wXCIsXG4gICAgXCJyZWFjdC1kb21cIjogXCJeMTguMi4wXCIsXG4gICAgXCJyZWh5cGUtcGFyc2VcIjogXCJeOS4wLjBcIixcbiAgICBcInJlaHlwZS1yZW1hcmtcIjogXCJeMTAuMC4wXCIsXG4gICAgXCJyZW1hcmstZW1vamlcIjogXCJeNC4wLjFcIixcbiAgICBcInJlbWFyay1nZm1cIjogXCJeNC4wLjBcIixcbiAgICBcInJlbWFyay1tYXRoXCI6IFwiXjYuMC4wXCIsXG4gICAgXCJ0aW55Y29sb3IyXCI6IFwiXjEuNi4wXCIsXG4gICAgXCJ1bmlzdC11dGlsLXNlbGVjdFwiOiBcIl41LjEuMFwiLFxuICAgIFwidW5pc3QtdXRpbC12aXNpdFwiOiBcIl41LjAuMFwiXG4gIH1cbn1cbiIsCiAgImltcG9ydCB7IEJveCwgU3RhdGljLCBUZXh0LCByZW5kZXIgfSBmcm9tIFwiaW5rXCJcbmltcG9ydCB7IENvbW1hbmQgfSBmcm9tIFwiY29tbWFuZGVyXCJcbmltcG9ydCB7IE1lc3NhZ2UsIHR5cGUgTWVzc2FnZVByb3BzIH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvTWVzc2FnZVwiXG5pbXBvcnQgeyByZWFkVFRZU3RyZWFtIH0gZnJvbSBcIi4uL3N1cHBvcnQvdXRpbFwiXG5pbXBvcnQgeyBndWVzc01pbWUsIHVzZU1pbWUgfSBmcm9tIFwiLi4vc3VwcG9ydC9taW1lXCJcbmltcG9ydCB7IE1kUm9vdCwgdG9JbmsgfSBmcm9tIFwiLi4vc3VwcG9ydC9tYXJrZG93blwiXG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCJcbmltcG9ydCBvbGxhbWEsIHsgdHlwZSBNb2RlbFJlc3BvbnNlIH0gZnJvbSBcIm9sbGFtYVwiXG5pbXBvcnQgU3Bpbm5lciBmcm9tIFwiaW5rLXNwaW5uZXJcIlxuaW1wb3J0IHsgaGlnaGxpZ2h0LCBzdXBwb3J0c0xhbmd1YWdlIH0gZnJvbSBcImNsaS1oaWdobGlnaHRcIlxuXG50eXBlIFJlbmRlcmVyUHJvcHMgPSB7IGNvbnRlbnQ6IHN0cmluZzsgbWltZT86IHN0cmluZyB9XG5jb25zdCBSZW5kZXJlciA9ICh7IGNvbnRlbnQsIG1pbWUgfTogUmVuZGVyZXJQcm9wcykgPT4ge1xuICBpZiAobWltZSA9PSBcIm1kXCIpIHtcbiAgICByZXR1cm4gPE1kUm9vdD57dG9JbmsoY29udGVudCl9PC9NZFJvb3Q+XG4gIH1cbiAgaWYgKG1pbWUgJiYgc3VwcG9ydHNMYW5ndWFnZShtaW1lKSkge1xuICAgIHJldHVybiA8VGV4dD57aGlnaGxpZ2h0KGNvbnRlbnQsIHsgbGFuZ3VhZ2U6IG1pbWUgfSl9PC9UZXh0PlxuICB9XG4gIHJldHVybiA8VGV4dD57Y29udGVudH08L1RleHQ+XG59XG5cbnR5cGUgUnVuT3B0aW9ucyA9IHtcbiAgbW9kZWw6IHN0cmluZ1xuICBzeXN0ZW0/OiBzdHJpbmdcbiAganNvbj86IGJvb2xlYW5cbiAgaHRtbD86IGJvb2xlYW5cbiAgcmVzcG9uc2U/OiBib29sZWFuXG4gIHRlbXA/OiBudW1iZXJcbiAgbnVtUHJlZD86IG51bWJlclxuICBjdHg/OiBudW1iZXJcbiAgcHJpbnRXaWR0aD86IG51bWJlclxufVxuXG50eXBlIFJ1blByb3BzID0ge1xuICBzdGRpbjogUmVuZGVyZXJQcm9wcyB8IHVuZGVmaW5lZFxuICBwcm9tcHQ6IHN0cmluZ1xuICBvcHRpb25zOiBSdW5PcHRpb25zXG4gIG1vZGVsczogTW9kZWxSZXNwb25zZVtdXG59XG5cbmNvbnN0IFJ1bkNvbW1hbmQgPSAoeyBzdGRpbiwgcHJvbXB0LCBvcHRpb25zLCBtb2RlbHMgfTogUnVuUHJvcHMpID0+IHtcbiAgbGV0IGNvbnZlcnNhdGlvbjogKFJlbmRlcmVyUHJvcHMgJiBQaWNrPE1lc3NhZ2VQcm9wcywgXCJyb2xlXCI+KVtdID0gW11cbiAgbGV0IFtidWZmZXIsIHNldEJ1ZmZlcl0gPSB1c2VTdGF0ZShcIlwiKVxuXG4gIGlmIChvcHRpb25zLnN5c3RlbSlcbiAgICBjb252ZXJzYXRpb24ucHVzaCh7IHJvbGU6IFwic3lzdGVtXCIsIGNvbnRlbnQ6IG9wdGlvbnMuc3lzdGVtISB9KVxuXG4gIGNvbnZlcnNhdGlvbi5wdXNoKHtcbiAgICByb2xlOiBcInVzZXJcIixcbiAgICBjb250ZW50OiBwcm9tcHQsXG4gIH0pXG5cbiAgaWYgKHN0ZGluKSBjb252ZXJzYXRpb24ucHVzaCh7IHJvbGU6IFwidXNlclwiLCAuLi5zdGRpbiB9KVxuXG4gIGNvbnN0IG1hdGNoID0gbW9kZWxzXG4gICAgLm1hcCgoeyBuYW1lIH0pID0+IG5hbWUpXG4gICAgLmZpbmQoKG5hbWUpID0+IG5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhvcHRpb25zLm1vZGVsPy50b0xvd2VyQ2FzZSgpKSlcblxuICBsZXQgbW9kZWw6IHN0cmluZ1xuICBpZiAobWF0Y2gpIHtcbiAgICBtb2RlbCA9IG1hdGNoXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxUZXh0PlxuICAgICAgICB7b3B0aW9ucy5tb2RlbFxuICAgICAgICAgID8gYE5vIG1vZGVsIG1hdGNoZXMgJHtvcHRpb25zLm1vZGVsfWBcbiAgICAgICAgICA6IGBObyBtb2RlbCBzcGVjaWZpZWRgfVxuICAgICAgPC9UZXh0PlxuICAgIClcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIHJ1bigpIHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IG9sbGFtYS5jaGF0KHtcbiAgICAgIG1lc3NhZ2VzOiBjb252ZXJzYXRpb24sXG4gICAgICBtb2RlbCxcbiAgICAgIGZvcm1hdDogb3B0aW9ucy5qc29uID8gXCJqc29uXCIgOiB1bmRlZmluZWQsXG4gICAgICBvcHRpb25zOiB7XG4gICAgICAgIHRlbXBlcmF0dXJlOiBvcHRpb25zLnRlbXAsXG4gICAgICAgIG51bV9wcmVkaWN0OiBvcHRpb25zLm51bVByZWQsXG4gICAgICAgIG51bV9jdHg6IG9wdGlvbnMuY3R4LFxuICAgICAgfSxcbiAgICAgIHN0cmVhbTogdHJ1ZSxcbiAgICB9KVxuXG4gICAgZm9yIGF3YWl0IChjb25zdCBjaHVuayBvZiByZXNwb25zZSkge1xuICAgICAgc2V0QnVmZmVyKChidWZmZXI6IHN0cmluZykgPT4gYnVmZmVyICsgY2h1bmsubWVzc2FnZS5jb250ZW50KVxuICAgIH1cbiAgfVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcnVuKClcbiAgfSwgW10pXG5cbiAgY29uc3QgYnVmZmVyTWltZSA9IHVzZU1pbWUoYnVmZmVyKVxuICBpZiAob3B0aW9ucy5yZXNwb25zZSB8fCBvcHRpb25zLmpzb24pXG4gICAgcmV0dXJuIDxSZW5kZXJlciBjb250ZW50PXtidWZmZXJ9IG1pbWU9e2J1ZmZlck1pbWV9IC8+XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBmbGV4V3JhcD1cIndyYXBcIiB3aWR0aD17b3B0aW9ucy5wcmludFdpZHRofT5cbiAgICAgIDxTdGF0aWMgaXRlbXM9e2NvbnZlcnNhdGlvbn0+XG4gICAgICAgIHsocHJvcHMsIGkpID0+IChcbiAgICAgICAgICA8TWVzc2FnZSBrZXk9e2l9IHsuLi5wcm9wc30gey4uLm9wdGlvbnN9PlxuICAgICAgICAgICAgPFJlbmRlcmVyIHsuLi5wcm9wc30gLz5cbiAgICAgICAgICA8L01lc3NhZ2U+XG4gICAgICAgICl9XG4gICAgICA8L1N0YXRpYz5cblxuICAgICAgPE1lc3NhZ2Uga2V5PVwiYnVmZmVyXCIgcm9sZT1cImFzc2lzdGFudFwiIHsuLi5vcHRpb25zfT5cbiAgICAgICAge2J1ZmZlciA/IChcbiAgICAgICAgICA8UmVuZGVyZXIgY29udGVudD17YnVmZmVyfSBtaW1lPXtidWZmZXJNaW1lfSAvPlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxUZXh0PlxuICAgICAgICAgICAgPFNwaW5uZXIgdHlwZT1cInNpbXBsZURvdHNTY3JvbGxpbmdcIiAvPlxuICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgKX1cbiAgICAgIDwvTWVzc2FnZT5cbiAgICA8L0JveD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCAob2xsYW1hcms6IENvbW1hbmQpID0+XG4gIG9sbGFtYXJrXG4gICAgLmNvbW1hbmQoXCJydW5cIiwgeyBpc0RlZmF1bHQ6IHRydWUgfSlcbiAgICAuZGVzY3JpcHRpb24oXCJFeGVjdXRlIGEgcHJvbXB0XCIpXG4gICAgLmFyZ3VtZW50KFwiPHByb21wdC4uLj5cIilcbiAgICAub3B0aW9uKFwiLS1odG1sXCIsIFwidHJlYXQgaW5wdXQgYXMgaHRtbFwiKVxuICAgIC5vcHRpb24oXCItLWpzb25cIiwgXCJvdXRwdXQgaW4ganNvblwiKVxuICAgIC5vcHRpb24oXCItbSwgLS1tb2RlbCA8c3RyaW5nPlwiLCBcIm1vZGVsIG5hbWUgKHBhcnRpYWwgbWF0Y2ggc3VwcG9ydGVkKVwiKVxuICAgIC5vcHRpb24oXCItcywgLS1zeXN0ZW0gPHN0cmluZz5cIiwgXCJzeXN0ZW0gcHJvbXB0XCIpXG4gICAgLm9wdGlvbihcIi10LCAtLXRlbXAgPHZhbHVlPlwiLCBcInRlbXBlcmF0dXJlXCIpXG4gICAgLm9wdGlvbihcIi1uLCAtLW51bS1wcmVkIDx2YWx1ZT5cIiwgXCJudW1iZXIgb2YgcHJlZGljdGlvbnNcIilcbiAgICAub3B0aW9uKFwiLUMsIC0tY3R4IDx2YWx1ZT5cIiwgXCJjb250ZXh0IGxlbmd0aFwiKVxuICAgIC5vcHRpb24oXCItciwgLS1yZXNwb25zZVwiLCBcIm9ubHkgcHJpbnQgcmVzcG9uc2VcIilcbiAgICAub3B0aW9uKFwiLVcsIC0tcHJpbnQtd2lkdGggPGNoYXJzPlwiLCBcInByaW50IHdpZHRoXCIsIFwiMTAwXCIpXG4gICAgLmFjdGlvbihhc3luYyAocGFydHM6IHN0cmluZ1tdLCBvcHRpb25zOiBSdW5PcHRpb25zKSA9PiB7XG4gICAgICBjb25zdCBtb2RlbHMgPSBhd2FpdCBvbGxhbWEubGlzdCgpXG4gICAgICBjb25zdCBzdGRpbiA9IGF3YWl0IHJlYWRUVFlTdHJlYW0ocHJvY2Vzcy5zdGRpbiwgISFvcHRpb25zLmh0bWwpXG4gICAgICByZW5kZXIoXG4gICAgICAgIDxSdW5Db21tYW5kXG4gICAgICAgICAgbW9kZWxzPXttb2RlbHMubW9kZWxzfVxuICAgICAgICAgIHN0ZGluPXtcbiAgICAgICAgICAgIHN0ZGluID8geyBjb250ZW50OiBzdGRpbiwgbWltZTogYXdhaXQgZ3Vlc3NNaW1lKHN0ZGluKSB9IDogdW5kZWZpbmVkXG4gICAgICAgICAgfVxuICAgICAgICAgIHByb21wdD17cGFydHMuam9pbihcIiBcIil9XG4gICAgICAgICAgb3B0aW9ucz17e1xuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIHRlbXA6IE51bWJlcihvcHRpb25zLnRlbXApLFxuICAgICAgICAgICAgbnVtUHJlZDogTnVtYmVyKG9wdGlvbnMubnVtUHJlZCksXG4gICAgICAgICAgICBjdHg6IE51bWJlcihvcHRpb25zLmN0eCksXG4gICAgICAgICAgICBwcmludFdpZHRoOiBOdW1iZXIob3B0aW9ucy5wcmludFdpZHRoKSxcbiAgICAgICAgICB9fVxuICAgICAgICAvPixcbiAgICAgIClcbiAgICB9KVxuIiwKICAiaW1wb3J0IHsgdHlwZSBSZWFjdE5vZGUgfSBmcm9tIFwicmVhY3RcIlxuaW1wb3J0IHsgQm94LCBUZXh0IH0gZnJvbSBcImlua1wiXG5pbXBvcnQgeyBjYXBpdGFsaXplIH0gZnJvbSBcIi4uL3N1cHBvcnQvdXRpbFwiXG5pbXBvcnQgeyB1c2VUaGVtZSB9IGZyb20gXCIuLi9zdXBwb3J0L3RoZW1pbmdcIlxuaW1wb3J0IGNvbG9yIGZyb20gXCJ0aW55Y29sb3IyXCJcblxuZXhwb3J0IHR5cGUgTWVzc2FnZVByb3BzID0ge1xuICByb2xlOiBzdHJpbmdcbiAgbW9kZWw/OiBzdHJpbmdcbiAgY2hpbGRyZW46IFJlYWN0Tm9kZVxufVxuXG5leHBvcnQgY29uc3QgTWVzc2FnZSA9ICh7IHJvbGUsIG1vZGVsLCBjaGlsZHJlbiB9OiBNZXNzYWdlUHJvcHMpID0+IHtcbiAgY29uc3QgdGhlbWUgPSB1c2VUaGVtZSgpXG4gIHJldHVybiAoXG4gICAgPEJveCBwYWRkaW5nPXsxfSBnYXA9ezF9IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiB3aWR0aD1cIjEwMCVcIj5cbiAgICAgIDxCb3ggZ2FwPXsxfSBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIj5cbiAgICAgICAgPFRleHQgYm9sZCBjb2xvcj17Y29sb3IodGhlbWUudGV4dCkuZGFya2VuKDUpLnRvSGV4U3RyaW5nKCl9PlxuICAgICAgICAgIHtjYXBpdGFsaXplKHJvbGUpfTpcbiAgICAgICAgPC9UZXh0PlxuICAgICAgICB7cm9sZSA9PSBcImFzc2lzdGFudFwiICYmIDxUZXh0IGNvbG9yPXt0aGVtZS5tdXRlZH0+e21vZGVsfTwvVGV4dD59XG4gICAgICA8L0JveD5cbiAgICAgIDxCb3hcbiAgICAgICAgZmxleERpcmVjdGlvbj1cImNvbHVtblwiXG4gICAgICAgIGJvcmRlclN0eWxlPVwicm91bmRcIlxuICAgICAgICBib3JkZXJDb2xvcj17dGhlbWUubXV0ZWR9XG4gICAgICAgIHBhZGRpbmdYPXsyfVxuICAgICAgICBwYWRkaW5nWT17MX1cbiAgICAgID5cbiAgICAgICAge2NoaWxkcmVufVxuICAgICAgPC9Cb3g+XG4gICAgPC9Cb3g+XG4gIClcbn1cbiIsCiAgImltcG9ydCB7XG4gIEJveCBhcyBJbmtCb3gsXG4gIFRleHQgYXMgSW5rVGV4dCxcbiAgVHJhbnNmb3JtLFxuICB0eXBlIFRleHRQcm9wcyxcbiAgdHlwZSBCb3hQcm9wcyxcbn0gZnJvbSBcImlua1wiXG5cbmltcG9ydCB0eXBlIHtcbiAgTGlzdCxcbiAgTGlzdEl0ZW0sXG4gIE5vZGVzIGFzIE1kYXN0Tm9kZXMsXG4gIE5vZGUsXG4gIFBhcmVudCxcbiAgVGFibGUsXG4gIFRhYmxlUm93LFxuICBUZXh0LFxufSBmcm9tIFwibWRhc3RcIlxuXG5pbXBvcnQge1xuICBUaGVtZSxcbiAgZGVmYXVsdFRoZW1lLFxuICB1c2VUaGVtZSxcbiAgaGlnaGxpZ2h0VGhlbWUsXG4gIFRoZW1lQ29udGV4dCxcbn0gZnJvbSBcIi4vdGhlbWluZ1wiXG5cbmltcG9ydCB7IGNvbXBhY3QgfSBmcm9tIFwibWRhc3QtdXRpbC1jb21wYWN0XCJcbmltcG9ydCB7IGZyb21NYXJrZG93biB9IGZyb20gXCJtZGFzdC11dGlsLWZyb20tbWFya2Rvd25cIlxuaW1wb3J0IHsgZ2ZtIH0gZnJvbSBcIm1pY3JvbWFyay1leHRlbnNpb24tZ2ZtXCJcbmltcG9ydCB7IGdmbUZyb21NYXJrZG93biwgZ2ZtVG9NYXJrZG93biB9IGZyb20gXCJtZGFzdC11dGlsLWdmbVwiXG5pbXBvcnQgeyBoaWdobGlnaHQsIHN1cHBvcnRzTGFuZ3VhZ2UgfSBmcm9tIFwiY2xpLWhpZ2hsaWdodFwiXG5pbXBvcnQgeyBqc3ggfSBmcm9tIFwicmVhY3QvanN4LXJ1bnRpbWVcIlxuaW1wb3J0IHsgc2VsZWN0QWxsIH0gZnJvbSBcInVuaXN0LXV0aWwtc2VsZWN0XCJcbmltcG9ydCB7IHRvTWFya2Rvd24gfSBmcm9tIFwibWRhc3QtdXRpbC10by1tYXJrZG93blwiXG5pbXBvcnQgeyB1bmlmaWVkIH0gZnJvbSBcInVuaWZpZWRcIlxuaW1wb3J0IHsgdmlzaXQgfSBmcm9tIFwidW5pc3QtdXRpbC12aXNpdFwiXG5pbXBvcnQgSW5rTGluayBmcm9tIFwiaW5rLWxpbmtcIlxuaW1wb3J0IFJlYWN0LCB7IHVzZUNvbnRleHQgfSBmcm9tIFwicmVhY3RcIlxuaW1wb3J0IHJlaHlwZVBhcnNlIGZyb20gXCJyZWh5cGUtcGFyc2VcIlxuaW1wb3J0IHJlaHlwZVJlbWFyayBmcm9tIFwicmVoeXBlLXJlbWFya1wiXG5pbXBvcnQgcmVtYXJrRW1vamkgZnJvbSBcInJlbWFyay1lbW9qaVwiXG5pbXBvcnQgcmVtYXJrR2ZtIGZyb20gXCJyZW1hcmstZ2ZtXCJcbmltcG9ydCByZW1hcmtNYXRoIGZyb20gXCJyZW1hcmstbWF0aFwiXG5pbXBvcnQgcmVtYXJrU3RyaW5naWZ5IGZyb20gXCJyZW1hcmstc3RyaW5naWZ5XCJcbmltcG9ydCB0aW55Y29sb3IgZnJvbSBcInRpbnljb2xvcjJcIlxuaW1wb3J0IHR5cGUgeyBFbGVtZW50VHlwZSwgUmVhY3RFbGVtZW50LCBSZWFjdE5vZGUgfSBmcm9tIFwicmVhY3RcIlxuXG5leHBvcnQgZnVuY3Rpb24gaHRtbDJtZChjb3JwdXM6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBTdHJpbmcoXG4gICAgdW5pZmllZCgpXG4gICAgICAudXNlKHJlaHlwZVBhcnNlKVxuICAgICAgLnVzZShyZWh5cGVSZW1hcmspXG4gICAgICAudXNlKHJlbWFya0dmbSlcbiAgICAgIC51c2UocmVtYXJrRW1vamkpXG4gICAgICAudXNlKHJlbWFya01hdGgpXG4gICAgICAudXNlKHJlbWFya1N0cmluZ2lmeSlcbiAgICAgIC5wcm9jZXNzU3luYyhjb3JwdXMpLFxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZGFzdDJtZCh0cmVlOiBNZGFzdE5vZGVzKSB7XG4gIHJldHVybiB0b01hcmtkb3duKHRyZWUsIHsgZXh0ZW5zaW9uczogW2dmbVRvTWFya2Rvd24oKV0gfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1kMm1kYXN0KGNvcnB1czogc3RyaW5nKSB7XG4gIGNvbnN0IHRyZWUgPSBmcm9tTWFya2Rvd24oY29ycHVzLCB7XG4gICAgZXh0ZW5zaW9uczogW2dmbSgpXSxcbiAgICBtZGFzdEV4dGVuc2lvbnM6IFtnZm1Gcm9tTWFya2Rvd24oKV0sXG4gIH0pXG4gIGNvbXBhY3QodHJlZSlcbiAgcmV0dXJuIHRyZWVcbn1cblxuY29uc3QgVGV4dFN0eWxlQ29udGV4dCA9IFJlYWN0LmNyZWF0ZUNvbnRleHQ8VGV4dFByb3BzPih7fSlcbmNvbnN0IFRleHRTdHlsZSA9ICh7IGNoaWxkcmVuLCAuLi5wcm9wcyB9OiBUZXh0UHJvcHMpID0+IChcbiAgPFRleHRTdHlsZUNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3Byb3BzfT5cbiAgICB7Y2hpbGRyZW59XG4gIDwvVGV4dFN0eWxlQ29udGV4dC5Qcm92aWRlcj5cbilcblxuY29uc3Qgc3R5bGVkID1cbiAgKFxuICAgIGZuOiAoeyB0aGVtZSwgY29udGV4dCB9OiB7IHRoZW1lOiBUaGVtZTsgY29udGV4dDogVGV4dFByb3BzIH0pID0+IFRleHRQcm9wcyxcbiAgKSA9PlxuICAoeyBjaGlsZHJlbiB9OiB7IGNoaWxkcmVuOiBSZWFjdE5vZGUgfSkgPT4ge1xuICAgIGNvbnN0IHRoZW1lID0gdXNlVGhlbWUoKVxuICAgIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KFRleHRTdHlsZUNvbnRleHQpXG4gICAgY29uc3QgcHJvcHMgPSBmbih7IHRoZW1lLCBjb250ZXh0IH0pXG4gICAgcmV0dXJuIDxUZXh0U3R5bGUgey4uLnByb3BzfT57Y2hpbGRyZW59PC9UZXh0U3R5bGU+XG4gIH1cblxuY29uc3QgTWRUZXh0ID0gKHsgdmFsdWUsIC4uLnByb3BzIH06IHsgdmFsdWU6IHN0cmluZyB9KSA9PiB7XG4gIGNvbnN0IGNvbnRleHRQcm9wcyA9IHVzZUNvbnRleHQoVGV4dFN0eWxlQ29udGV4dClcbiAgcmV0dXJuIChcbiAgICA8SW5rVGV4dCB7Li4uY29udGV4dFByb3BzfSB7Li4ucHJvcHN9PlxuICAgICAge3ZhbHVlfVxuICAgIDwvSW5rVGV4dD5cbiAgKVxufVxuXG5leHBvcnQgY29uc3QgTWRSb290ID0gKHtcbiAgY2hpbGRyZW4sXG4gIC4uLnByb3BzXG59OiB7IGNoaWxkcmVuOiBSZWFjdE5vZGUgfSAmIEJveFByb3BzKSA9PiB7XG4gIHJldHVybiAoXG4gICAgPFRleHRTdHlsZSBjb2xvcj17dXNlVGhlbWUoKS50ZXh0fT5cbiAgICAgIDxJbmtCb3ggey4uLnByb3BzfSBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgZ2FwPXsxfT5cbiAgICAgICAge2NoaWxkcmVufVxuICAgICAgPC9JbmtCb3g+XG4gICAgPC9UZXh0U3R5bGU+XG4gIClcbn1cblxuY29uc3QgTWRJbmxpbmVDb2RlID0gKHsgdmFsdWUgfTogeyB2YWx1ZTogc3RyaW5nIH0pID0+IChcbiAgPElua1RleHQgY29sb3I9e3VzZVRoZW1lKCkuaW5saW5lQ29kZX0+YHt2YWx1ZX1gPC9JbmtUZXh0PlxuKVxuY29uc3QgTWRFbXBoYXNpcyA9IHN0eWxlZCgoeyBjb250ZXh0IH0pID0+ICh7XG4gIGl0YWxpYzogdHJ1ZSxcbiAgY29sb3I6IHRpbnljb2xvcihjb250ZXh0LmNvbG9yKS5icmlnaHRlbigyNSkudG9TdHJpbmcoKSxcbn0pKVxuY29uc3QgTWRTdHJvbmcgPSBzdHlsZWQoKHsgY29udGV4dCB9KSA9PiB7XG4gIHJldHVybiB7XG4gICAgYm9sZDogdHJ1ZSxcbiAgICBjb2xvcjogdGlueWNvbG9yKGNvbnRleHQuY29sb3IpLmRhcmtlbig1KS50b0hleFN0cmluZygpLFxuICB9XG59KVxuY29uc3QgTWREZWxldGUgPSBzdHlsZWQoKCkgPT4gKHtcbiAgc3RyaWtldGhyb3VnaDogdHJ1ZSxcbiAgZGltQ29sb3I6IHRydWUsXG59KSlcblxuY29uc3QgTWRIZWFkaW5nID0gKHsgZGVwdGgsIC4uLm4gfTogeyBkZXB0aDogbnVtYmVyOyBjaGlsZHJlbjogUmVhY3ROb2RlIH0pID0+IHtcbiAgY29uc3QgdGhlbWUgPSB1c2VUaGVtZSgpXG4gIGNvbnN0IHN0eWxlID0geyBib2xkOiB0cnVlLCB1bmRlcmxpbmU6IHRydWUsIGNvbG9yOiB0aGVtZS5oZWFkaW5nIH1cbiAgcmV0dXJuIChcbiAgICA8SW5rQm94PlxuICAgICAgPFRleHRTdHlsZSB7Li4uc3R5bGV9PlxuICAgICAgICA8SW5rVGV4dCB7Li4uc3R5bGV9PntcIiNcIi5yZXBlYXQoZGVwdGgpfSA8L0lua1RleHQ+XG4gICAgICAgIHtuLmNoaWxkcmVufVxuICAgICAgPC9UZXh0U3R5bGU+XG4gICAgPC9JbmtCb3g+XG4gIClcbn1cblxuY29uc3QgTWRMaW5rID0gKHtcbiAgdXJsLFxuICAuLi5ub2RlXG59OiB7IHVybDogc3RyaW5nIH0gJiB7IGNoaWxkcmVuOiBSZWFjdE5vZGUgfSkgPT4ge1xuICBjb25zdCB0aGVtZSA9IHVzZVRoZW1lKClcbiAgcmV0dXJuIChcbiAgICA8SW5rTGluayB1cmw9e3VybH0+XG4gICAgICA8VGV4dFN0eWxlIGNvbG9yPXt0aGVtZS5saW5rfT57bm9kZS5jaGlsZHJlbn08L1RleHRTdHlsZT5cbiAgICA8L0lua0xpbms+XG4gIClcbn1cblxuY29uc3QgTWRQYXJhZ3JhcGggPSAoeyBjaGlsZHJlbiB9OiB7IGNoaWxkcmVuOiBSZWFjdE5vZGUgfSkgPT4ge1xuICBjb25zdCBzdHlsZSA9IHVzZUNvbnRleHQoVGV4dFN0eWxlQ29udGV4dClcbiAgcmV0dXJuIChcbiAgICA8SW5rVGV4dCB7Li4uc3R5bGV9PlxuICAgICAgPFRyYW5zZm9ybSB0cmFuc2Zvcm09eyh4KSA9PiB4LnRyaW0oKX0+e2NoaWxkcmVufTwvVHJhbnNmb3JtPlxuICAgIDwvSW5rVGV4dD5cbiAgKVxufVxuXG5jb25zdCBNZExpc3QgPSAoeyBjaGlsZHJlbiwgLi4ucHJvcHMgfTogeyBjaGlsZHJlbjogUmVhY3ROb2RlIH0pID0+IHtcbiAgcmV0dXJuIChcbiAgICA8SW5rQm94IHsuLi5wcm9wc30gcGFkZGluZ0xlZnQ9ezJ9IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIj5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L0lua0JveD5cbiAgKVxufVxuXG5jb25zdCBNZExpc3RJdGVtID0gKHsgY2hpbGRyZW4gfTogeyBjaGlsZHJlbjogUmVhY3ROb2RlIH0pID0+IHtcbiAgY29uc3QgdGhlbWUgPSB1c2VUaGVtZSgpXG5cbiAgcmV0dXJuIChcbiAgICA8SW5rQm94PlxuICAgICAgPElua1RleHQgY29sb3I9e3RoZW1lLmxpc3RJdGVtfT7igKIgPC9JbmtUZXh0PlxuICAgICAgPElua0JveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCI+e2NoaWxkcmVufTwvSW5rQm94PlxuICAgIDwvSW5rQm94PlxuICApXG59XG5cbmNvbnN0IE1kQmxvY2tRdW90ZSA9ICh7IGNoaWxkcmVuIH06IHsgY2hpbGRyZW46IFJlYWN0Tm9kZSB9KSA9PiB7XG4gIGNvbnN0IHRoZW1lID0gdXNlVGhlbWUoKVxuXG4gIHJldHVybiAoXG4gICAgPFRleHRTdHlsZUNvbnRleHQuUHJvdmlkZXJcbiAgICAgIHZhbHVlPXt7XG4gICAgICAgIGNvbG9yOiB0aGVtZS5ibG9ja3F1b3RlLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8SW5rQm94XG4gICAgICAgIGZsZXhEaXJlY3Rpb249XCJyb3dcIlxuICAgICAgICBmbGV4R3Jvdz17MH1cbiAgICAgICAgZmxleFNocmluaz17MX1cbiAgICAgICAgZmxleFdyYXA9XCJ3cmFwXCJcbiAgICAgICAgcGFkZGluZ0xlZnQ9ezF9XG4gICAgICAgIGJvcmRlckNvbG9yPXt0aGVtZS5ibG9ja3F1b3RlfVxuICAgICAgICBib3JkZXJSaWdodD17ZmFsc2V9XG4gICAgICAgIGJvcmRlckJvdHRvbT17ZmFsc2V9XG4gICAgICAgIGJvcmRlclRvcD17ZmFsc2V9XG4gICAgICAgIGJvcmRlclN0eWxlPXtcImJvbGRcIn1cbiAgICAgID5cbiAgICAgICAgPFRleHRTdHlsZSBjb2xvcj17dGhlbWUuYmxvY2txdW90ZX0+e2NoaWxkcmVufTwvVGV4dFN0eWxlPlxuICAgICAgPC9JbmtCb3g+XG4gICAgPC9UZXh0U3R5bGVDb250ZXh0LlByb3ZpZGVyPlxuICApXG59XG5cbmNvbnN0IE1kQ29kZSA9ICh7IGxhbmcsIHZhbHVlIH06IHsgbGFuZzogc3RyaW5nOyB2YWx1ZTogc3RyaW5nIH0pID0+IHtcbiAgY29uc3QgdGhlbWUgPSB1c2VUaGVtZSgpXG4gIGNvbnN0IGxhbmd1YWdlID0gc3VwcG9ydHNMYW5ndWFnZShsYW5nKSA/IGxhbmcgOiBcInRleHRcIlxuXG4gIHJldHVybiAoXG4gICAgPElua0JveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgbWFyZ2luTGVmdD17MX0+XG4gICAgICB7bGFuZ3VhZ2UgIT0gXCJ0ZXh0XCIgJiYgKFxuICAgICAgICA8SW5rQm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBtYXJnaW5MZWZ0PXsxfT5cbiAgICAgICAgICA8SW5rVGV4dCBjb2xvcj17dGhlbWUubXV0ZWR9IGRpbUNvbG9yPlxuICAgICAgICAgICAge2xhbmd1YWdlfVxuICAgICAgICAgIDwvSW5rVGV4dD5cbiAgICAgICAgPC9JbmtCb3g+XG4gICAgICApfVxuICAgICAgPElua0JveFxuICAgICAgICBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCJcbiAgICAgICAgcGFkZGluZ1g9ezF9XG4gICAgICAgIGJvcmRlclN0eWxlPVwicm91bmRcIlxuICAgICAgICBib3JkZXJDb2xvcj17dGhlbWUuY29kZX1cbiAgICAgID5cbiAgICAgICAgPElua1RleHQ+XG4gICAgICAgICAge2hpZ2hsaWdodCh2YWx1ZSwge1xuICAgICAgICAgICAgbGFuZ3VhZ2UsXG4gICAgICAgICAgICB0aGVtZTogaGlnaGxpZ2h0VGhlbWUsXG4gICAgICAgICAgfSkudHJpbSgpfVxuICAgICAgICA8L0lua1RleHQ+XG4gICAgICA8L0lua0JveD5cbiAgICA8L0lua0JveD5cbiAgKVxufVxuXG5jb25zdCBNZFRoZW1hdGljQnJlYWsgPSAoKSA9PiB7XG4gIHJldHVybiAoXG4gICAgPElua0JveFxuICAgICAgYm9yZGVyQ29sb3I9e3VzZVRoZW1lKCkudGhlbWF0aWNCcmVha31cbiAgICAgIGJvcmRlclN0eWxlPXtcImJvbGRcIn1cbiAgICAgIGJvcmRlckJvdHRvbT17ZmFsc2V9XG4gICAgICBib3JkZXJSaWdodD17ZmFsc2V9XG4gICAgICBib3JkZXJMZWZ0PXtmYWxzZX1cbiAgICAvPlxuICApXG59XG5cbmNvbnN0IE1kQnJlYWsgPSAoKSA9PiB7XG4gIHJldHVybiA8SW5rVGV4dD57XCJcXG5cIn08L0lua1RleHQ+XG59XG5cbmNvbnN0IE1kSW1hZ2UgPSAoeyBhbHQgfTogeyB1cmw6IHN0cmluZzsgYWx0Pzogc3RyaW5nIH0pID0+IHtcbiAgLy8gVE9ETzogU0lHU0VHViwgbmVlZCB0byBpbnZlc3RpZ2F0ZVxuICAvLyBpZiAoZnMuZXhpc3RzU3luYyh1cmwpKSB7XG4gIC8vICAgcmV0dXJuIDxJbWFnZSBwcmVzZXJ2ZUFzcGVjdFJhdGlvIHNyYz17dXJsfSBhbHQ9e2FsdH0gd2lkdGg9XCI1MCVcIiAvPlxuICAvLyB9XG4gIGlmIChhbHQpXG4gICAgcmV0dXJuIDxJbmtUZXh0IGNvbG9yPXt1c2VUaGVtZSgpLm11dGVkfT57YCg8aW1hZ2U+ICR7YWx0fSlgfTwvSW5rVGV4dD5cblxuICByZXR1cm4gbnVsbFxufVxuXG5jb25zdCBtZGFzdE1hcCA9IHtcbiAgcm9vdDogTWRSb290LFxuICB0ZXh0OiBNZFRleHQsXG4gIGlubGluZUNvZGU6IE1kSW5saW5lQ29kZSxcbiAgaGVhZGluZzogTWRIZWFkaW5nLFxuICBlbXBoYXNpczogTWRFbXBoYXNpcyxcbiAgc3Ryb25nOiBNZFN0cm9uZyxcbiAgZGVsZXRlOiBNZERlbGV0ZSxcbiAgbGluazogTWRMaW5rLFxuICBwYXJhZ3JhcGg6IE1kUGFyYWdyYXBoLFxuICBjb2RlOiBNZENvZGUsXG4gIGJsb2NrcXVvdGU6IE1kQmxvY2tRdW90ZSxcbiAgbGlzdDogTWRMaXN0LFxuICBsaXN0SXRlbTogTWRMaXN0SXRlbSxcbiAgYnJlYWs6IE1kQnJlYWssXG4gIHRoZW1hdGljQnJlYWs6IE1kVGhlbWF0aWNCcmVhayxcbiAgaW1hZ2U6IE1kSW1hZ2UsXG4gIGh0bWw6ICgpID0+IHtcbiAgICAvLyBUT0RPOiB3aGF0IHRvIGRvP1xuICB9LFxufVxuXG5mdW5jdGlvbiB0ZXh0Q29udGVudChub2RlOiBOb2RlKSB7XG4gIHJldHVybiBzZWxlY3RBbGwoXCJ0ZXh0XCIsIG5vZGUpXG4gICAgLm1hcCgoeCkgPT4gKHggYXMgVGV4dCkudmFsdWUpXG4gICAgLmpvaW4oKVxuICAgIC50cmltKClcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRW1wdHlUYWJsZVJvd3Mobm9kZTogVGFibGUpIHtcbiAgdmlzaXQobm9kZSwgKG4sIGluZGV4LCBwYXJlbnQpID0+IHtcbiAgICBpZiAobi50eXBlID09IFwidGFibGVSb3dcIikge1xuICAgICAgY29uc3QgdGFibGVSb3cgPSBuIGFzIFRhYmxlUm93XG4gICAgICBpZiAoIXRleHRDb250ZW50KHRhYmxlUm93KSkge1xuICAgICAgICBjb25zdCB0YWJsZSA9IHBhcmVudCBhcyBUYWJsZVxuICAgICAgICB0YWJsZS5jaGlsZHJlbi5zcGxpY2UoaW5kZXghLCAxKVxuICAgICAgfVxuICAgIH1cbiAgfSlcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRW1wdHlMaXN0SXRlbXMobm9kZTogTGlzdCkge1xuICB2aXNpdChub2RlLCAobiwgaW5kZXgsIHBhcmVudCkgPT4ge1xuICAgIGlmIChuLnR5cGUgPT0gXCJsaXN0SXRlbVwiKSB7XG4gICAgICBjb25zdCBsaXN0SXRlbSA9IG4gYXMgTGlzdEl0ZW1cbiAgICAgIGlmICghdGV4dENvbnRlbnQobGlzdEl0ZW0pKSB7XG4gICAgICAgIGNvbnN0IGxpc3QgPSBwYXJlbnQgYXMgTGlzdFxuICAgICAgICBsaXN0LmNoaWxkcmVuLnNwbGljZShpbmRleCEsIDEpXG4gICAgICB9XG4gICAgfVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9JbmsodGV4dDogc3RyaW5nLCB0aGVtZTogVGhlbWUgPSBkZWZhdWx0VGhlbWUpIHtcbiAgY29uc3QgbWRhc3RUcmVlID0gbWQybWRhc3QodGV4dClcblxuICBjb25zdCB0b0pTWCA9IChub2RlOiBOb2RlLCBpOiBudW1iZXIpOiBSZWFjdEVsZW1lbnQgPT4ge1xuICAgIGlmIChub2RlLnR5cGUgPT0gXCJ0YWJsZVwiKSB7XG4gICAgICByZW1vdmVFbXB0eVRhYmxlUm93cyhub2RlIGFzIFRhYmxlKVxuICAgICAgLy8gZGVsZWdhdGUgdGFibGUgcmVuZGVyaW5nIHRvIG1kYXN0XG4gICAgICByZXR1cm4gPElua1RleHQga2V5PXtpfT57bWRhc3QybWQobm9kZSBhcyBNZGFzdE5vZGVzKX08L0lua1RleHQ+XG4gICAgfVxuXG4gICAgaWYgKG5vZGUudHlwZSA9PSBcImxpc3RcIikge1xuICAgICAgcmVtb3ZlRW1wdHlMaXN0SXRlbXMobm9kZSBhcyBMaXN0KVxuICAgIH1cblxuICAgIGlmIChub2RlLnR5cGUgaW4gbWRhc3RNYXApIHtcbiAgICAgIGNvbnN0IHsgdHlwZSwgY2hpbGRyZW4sIHBvc2l0aW9uLCAuLi5wcm9wcyB9ID0gbm9kZSBhcyBQYXJlbnRcbiAgICAgIGNvbnN0IGtleSA9IHR5cGUgYXMga2V5b2YgdHlwZW9mIG1kYXN0TWFwXG4gICAgICByZXR1cm4ganN4KFxuICAgICAgICBtZGFzdE1hcFtrZXldIGFzIEVsZW1lbnRUeXBlLFxuICAgICAgICB7IC4uLnByb3BzLCBjaGlsZHJlbjogY2hpbGRyZW4/Lm1hcCh0b0pTWCkgfSxcbiAgICAgICAgaSxcbiAgICAgIClcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHR5cGU6ICR7bm9kZS50eXBlfWApXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8VGhlbWVDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXt0aGVtZX0+XG4gICAgICB7bWRhc3RUcmVlLmNoaWxkcmVuLm1hcCh0b0pTWCl9XG4gICAgPC9UaGVtZUNvbnRleHQuUHJvdmlkZXI+XG4gIClcbn1cbiIsCiAgImltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIlxuaW1wb3J0IGNoYWxrIGZyb20gXCJjaGFsa1wiXG5pbXBvcnQgeyBpZGVudGl0eSB9IGZyb20gXCJsb2Rhc2gtZXNcIlxuXG4vLyBUT0RPOiBJbXByb3ZlIGRlZmF1bHQgdGhlbWVcblxuLy8gI2ZmNjI4Y1xuLy8gI2ZhZDAwMFxuLy8gI2ZmOWQwMFxuLy8gI2E1ZmY5MFxuLy8gI2E1OTllOVxuLy8gIzllZmZmZlxuLy8gIzJEMkI1NVxuXG5jb25zdCBjb2xvcnMgPSB7XG4gIHllbGxvdzogXCIjZmFkMDAwXCIsXG4gIHBpbms6IFwiI2ZmNjI4Y1wiLFxuICBwdXJwbGU6IFwiI2IzNjJmZlwiLFxuICBjeWFuOiBcIiM5ZWZmZmZcIixcbiAgZ3JlZW46IFwiI2E1ZmY5MFwiLFxuICBkaW1QdXJwbGU6IFwiI2E1OTllOVwiLFxuICBkYXJrUHVycGxlOiBcIiMyRDJCNTVcIixcbn1cblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRUaGVtZSA9IHtcbiAgdGV4dDogXCIjZmZmYmZmXCIsXG4gIG11dGVkOiBjb2xvcnMuZGltUHVycGxlLFxuXG4gIGhlYWRpbmc6IGNvbG9ycy55ZWxsb3csXG4gIGxpbms6IGNvbG9ycy5waW5rLFxuICBsaXN0SXRlbTogY29sb3JzLnB1cnBsZSxcbiAgaW5saW5lQ29kZTogY29sb3JzLmN5YW4sXG4gIGVtcGhhc2lzOiBjb2xvcnMuZ3JlZW4sXG4gIHN0cm9uZzogY29sb3JzLnllbGxvdyxcbiAgZGVsZXRlOiBjb2xvcnMuZGltUHVycGxlLFxuICBjb2RlOiBjb2xvcnMuZGFya1B1cnBsZSxcbiAgYmxvY2txdW90ZTogY29sb3JzLmRpbVB1cnBsZSxcbiAgdGhlbWF0aWNCcmVhazogY29sb3JzLmRhcmtQdXJwbGUsXG59XG5cbmV4cG9ydCBjb25zdCBoaWdobGlnaHRUaGVtZSA9IHtcbiAgXCJrZXl3b3JkXCI6IGNoYWxrLmhleChkZWZhdWx0VGhlbWUuaW5saW5lQ29kZSksXG4gIFwiYnVpbHRfaW5cIjogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5pbmxpbmVDb2RlKSxcbiAgXCJ0eXBlXCI6IGNoYWxrLmhleChkZWZhdWx0VGhlbWUuaW5saW5lQ29kZSksXG4gIFwibGl0ZXJhbFwiOiBjaGFsay5oZXgoZGVmYXVsdFRoZW1lLmVtcGhhc2lzKSxcbiAgXCJudW1iZXJcIjogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5lbXBoYXNpcyksXG4gIFwicmVnZXhwXCI6IGNoYWxrLmhleChkZWZhdWx0VGhlbWUuZW1waGFzaXMpLFxuICBcInN0cmluZ1wiOiBjaGFsay5oZXgoZGVmYXVsdFRoZW1lLmVtcGhhc2lzKSxcbiAgXCJzdWJzdFwiOiBjaGFsay5oZXgoZGVmYXVsdFRoZW1lLmVtcGhhc2lzKSxcbiAgXCJzeW1ib2xcIjogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5pbmxpbmVDb2RlKSxcbiAgXCJjbGFzc1wiOiBjaGFsay5oZXgoZGVmYXVsdFRoZW1lLmlubGluZUNvZGUpLFxuICBcImZ1bmN0aW9uXCI6IGNoYWxrLmhleChkZWZhdWx0VGhlbWUuaW5saW5lQ29kZSksXG4gIFwidGl0bGVcIjogaWRlbnRpdHksXG4gIFwicGFyYW1zXCI6IGlkZW50aXR5LFxuICBcImNvbW1lbnRcIjogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5tdXRlZCksXG4gIFwiZG9jdGFnXCI6IGNoYWxrLmhleChkZWZhdWx0VGhlbWUubGluayksXG4gIFwibWV0YVwiOiBjaGFsay5oZXgoZGVmYXVsdFRoZW1lLmxpbmspLFxuICBcIm1ldGEta2V5d29yZFwiOiBjaGFsay5oZXgoZGVmYXVsdFRoZW1lLmxpbmspLFxuICBcIm1ldGEtc3RyaW5nXCI6IGNoYWxrLmhleChkZWZhdWx0VGhlbWUubGluayksXG4gIFwic2VjdGlvblwiOiBjaGFsay5oZXgoZGVmYXVsdFRoZW1lLmxpbmspLFxuICBcInRhZ1wiOiBjaGFsay5oZXgoZGVmYXVsdFRoZW1lLmxpbmspLFxuICBcIm5hbWVcIjogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5lbXBoYXNpcyksXG4gIFwiYnVpbHRpbi1uYW1lXCI6IGNoYWxrLmhleChkZWZhdWx0VGhlbWUuZW1waGFzaXMpLFxuICBcImF0dHJcIjogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5saXN0SXRlbSksXG4gIFwiYXR0cmlidXRlXCI6IGNoYWxrLmhleChkZWZhdWx0VGhlbWUubGlzdEl0ZW0pLFxuICBcInZhcmlhYmxlXCI6IGNoYWxrLmhleChkZWZhdWx0VGhlbWUubGlzdEl0ZW0pLFxuICBcImJ1bGxldFwiOiBjaGFsay5oZXgoZGVmYXVsdFRoZW1lLmxpc3RJdGVtKSxcbiAgXCJjb2RlXCI6IGNoYWxrLmhleChkZWZhdWx0VGhlbWUuY29kZSksXG4gIFwiZW1waGFzaXNcIjogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5lbXBoYXNpcyksXG4gIFwic3Ryb25nXCI6IGNoYWxrLmhleChkZWZhdWx0VGhlbWUuc3Ryb25nKSxcbiAgXCJmb3JtdWxhXCI6IGNoYWxrLmhleChkZWZhdWx0VGhlbWUuaW5saW5lQ29kZSksXG4gIFwibGlua1wiOiBjaGFsay5oZXgoZGVmYXVsdFRoZW1lLmxpbmspLFxuICBcInF1b3RlXCI6IGNoYWxrLmhleChkZWZhdWx0VGhlbWUuYmxvY2txdW90ZSksXG4gIFwic2VsZWN0b3ItdGFnXCI6IGNoYWxrLmhleChkZWZhdWx0VGhlbWUubGluayksXG4gIFwic2VsZWN0b3ItaWRcIjogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5saW5rKSxcbiAgXCJzZWxlY3Rvci1jbGFzc1wiOiBjaGFsay5oZXgoZGVmYXVsdFRoZW1lLmxpbmspLFxuICBcInNlbGVjdG9yLWF0dHJcIjogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5saW5rKSxcbiAgXCJzZWxlY3Rvci1wc2V1ZG9cIjogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5saW5rKSxcbiAgXCJ0ZW1wbGF0ZS10YWdcIjogY2hhbGsuaGV4KGRlZmF1bHRUaGVtZS5saW5rKSxcbiAgXCJ0ZW1wbGF0ZS12YXJpYWJsZVwiOiBjaGFsay5oZXgoZGVmYXVsdFRoZW1lLmxpbmspLFxuICBcImFkZGl0aW9uXCI6IGNoYWxrLmhleChkZWZhdWx0VGhlbWUuc3Ryb25nKSxcbiAgXCJkZWxldGlvblwiOiBjaGFsay5oZXgoZGVmYXVsdFRoZW1lLmxpbmspLFxuICBcImRlZmF1bHRcIjogaWRlbnRpdHksXG59XG5cbmV4cG9ydCB0eXBlIFRoZW1lID0gdHlwZW9mIGRlZmF1bHRUaGVtZVxuZXhwb3J0IGNvbnN0IFRoZW1lQ29udGV4dCA9IFJlYWN0LmNyZWF0ZUNvbnRleHQ8VGhlbWU+KGRlZmF1bHRUaGVtZSlcblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVRoZW1lKCkge1xuICByZXR1cm4gUmVhY3QudXNlQ29udGV4dChUaGVtZUNvbnRleHQpXG59XG4iLAogICJpbXBvcnQge1xuICBCb3ggYXMgSW5rQm94LFxuICBUZXh0IGFzIElua1RleHQsXG4gIFRyYW5zZm9ybSxcbiAgdHlwZSBUZXh0UHJvcHMsXG4gIHR5cGUgQm94UHJvcHMsXG59IGZyb20gXCJpbmtcIlxuXG5pbXBvcnQgdHlwZSB7XG4gIExpc3QsXG4gIExpc3RJdGVtLFxuICBOb2RlcyBhcyBNZGFzdE5vZGVzLFxuICBOb2RlLFxuICBQYXJlbnQsXG4gIFRhYmxlLFxuICBUYWJsZVJvdyxcbiAgVGV4dCxcbn0gZnJvbSBcIm1kYXN0XCJcblxuaW1wb3J0IHtcbiAgVGhlbWUsXG4gIGRlZmF1bHRUaGVtZSxcbiAgdXNlVGhlbWUsXG4gIGhpZ2hsaWdodFRoZW1lLFxuICBUaGVtZUNvbnRleHQsXG59IGZyb20gXCIuL3RoZW1pbmdcIlxuXG5pbXBvcnQgeyBjb21wYWN0IH0gZnJvbSBcIm1kYXN0LXV0aWwtY29tcGFjdFwiXG5pbXBvcnQgeyBmcm9tTWFya2Rvd24gfSBmcm9tIFwibWRhc3QtdXRpbC1mcm9tLW1hcmtkb3duXCJcbmltcG9ydCB7IGdmbSB9IGZyb20gXCJtaWNyb21hcmstZXh0ZW5zaW9uLWdmbVwiXG5pbXBvcnQgeyBnZm1Gcm9tTWFya2Rvd24sIGdmbVRvTWFya2Rvd24gfSBmcm9tIFwibWRhc3QtdXRpbC1nZm1cIlxuaW1wb3J0IHsgaGlnaGxpZ2h0LCBzdXBwb3J0c0xhbmd1YWdlIH0gZnJvbSBcImNsaS1oaWdobGlnaHRcIlxuaW1wb3J0IHsganN4IH0gZnJvbSBcInJlYWN0L2pzeC1ydW50aW1lXCJcbmltcG9ydCB7IHNlbGVjdEFsbCB9IGZyb20gXCJ1bmlzdC11dGlsLXNlbGVjdFwiXG5pbXBvcnQgeyB0b01hcmtkb3duIH0gZnJvbSBcIm1kYXN0LXV0aWwtdG8tbWFya2Rvd25cIlxuaW1wb3J0IHsgdW5pZmllZCB9IGZyb20gXCJ1bmlmaWVkXCJcbmltcG9ydCB7IHZpc2l0IH0gZnJvbSBcInVuaXN0LXV0aWwtdmlzaXRcIlxuaW1wb3J0IElua0xpbmsgZnJvbSBcImluay1saW5rXCJcbmltcG9ydCBSZWFjdCwgeyB1c2VDb250ZXh0IH0gZnJvbSBcInJlYWN0XCJcbmltcG9ydCByZWh5cGVQYXJzZSBmcm9tIFwicmVoeXBlLXBhcnNlXCJcbmltcG9ydCByZWh5cGVSZW1hcmsgZnJvbSBcInJlaHlwZS1yZW1hcmtcIlxuaW1wb3J0IHJlbWFya0Vtb2ppIGZyb20gXCJyZW1hcmstZW1vamlcIlxuaW1wb3J0IHJlbWFya0dmbSBmcm9tIFwicmVtYXJrLWdmbVwiXG5pbXBvcnQgcmVtYXJrTWF0aCBmcm9tIFwicmVtYXJrLW1hdGhcIlxuaW1wb3J0IHJlbWFya1N0cmluZ2lmeSBmcm9tIFwicmVtYXJrLXN0cmluZ2lmeVwiXG5pbXBvcnQgdGlueWNvbG9yIGZyb20gXCJ0aW55Y29sb3IyXCJcbmltcG9ydCB0eXBlIHsgRWxlbWVudFR5cGUsIFJlYWN0RWxlbWVudCwgUmVhY3ROb2RlIH0gZnJvbSBcInJlYWN0XCJcblxuZXhwb3J0IGZ1bmN0aW9uIGh0bWwybWQoY29ycHVzOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gU3RyaW5nKFxuICAgIHVuaWZpZWQoKVxuICAgICAgLnVzZShyZWh5cGVQYXJzZSlcbiAgICAgIC51c2UocmVoeXBlUmVtYXJrKVxuICAgICAgLnVzZShyZW1hcmtHZm0pXG4gICAgICAudXNlKHJlbWFya0Vtb2ppKVxuICAgICAgLnVzZShyZW1hcmtNYXRoKVxuICAgICAgLnVzZShyZW1hcmtTdHJpbmdpZnkpXG4gICAgICAucHJvY2Vzc1N5bmMoY29ycHVzKSxcbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWRhc3QybWQodHJlZTogTWRhc3ROb2Rlcykge1xuICByZXR1cm4gdG9NYXJrZG93bih0cmVlLCB7IGV4dGVuc2lvbnM6IFtnZm1Ub01hcmtkb3duKCldIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZDJtZGFzdChjb3JwdXM6IHN0cmluZykge1xuICBjb25zdCB0cmVlID0gZnJvbU1hcmtkb3duKGNvcnB1cywge1xuICAgIGV4dGVuc2lvbnM6IFtnZm0oKV0sXG4gICAgbWRhc3RFeHRlbnNpb25zOiBbZ2ZtRnJvbU1hcmtkb3duKCldLFxuICB9KVxuICBjb21wYWN0KHRyZWUpXG4gIHJldHVybiB0cmVlXG59XG5cbmNvbnN0IFRleHRTdHlsZUNvbnRleHQgPSBSZWFjdC5jcmVhdGVDb250ZXh0PFRleHRQcm9wcz4oe30pXG5jb25zdCBUZXh0U3R5bGUgPSAoeyBjaGlsZHJlbiwgLi4ucHJvcHMgfTogVGV4dFByb3BzKSA9PiAoXG4gIDxUZXh0U3R5bGVDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXtwcm9wc30+XG4gICAge2NoaWxkcmVufVxuICA8L1RleHRTdHlsZUNvbnRleHQuUHJvdmlkZXI+XG4pXG5cbmNvbnN0IHN0eWxlZCA9XG4gIChcbiAgICBmbjogKHsgdGhlbWUsIGNvbnRleHQgfTogeyB0aGVtZTogVGhlbWU7IGNvbnRleHQ6IFRleHRQcm9wcyB9KSA9PiBUZXh0UHJvcHMsXG4gICkgPT5cbiAgKHsgY2hpbGRyZW4gfTogeyBjaGlsZHJlbjogUmVhY3ROb2RlIH0pID0+IHtcbiAgICBjb25zdCB0aGVtZSA9IHVzZVRoZW1lKClcbiAgICBjb25zdCBjb250ZXh0ID0gdXNlQ29udGV4dChUZXh0U3R5bGVDb250ZXh0KVxuICAgIGNvbnN0IHByb3BzID0gZm4oeyB0aGVtZSwgY29udGV4dCB9KVxuICAgIHJldHVybiA8VGV4dFN0eWxlIHsuLi5wcm9wc30+e2NoaWxkcmVufTwvVGV4dFN0eWxlPlxuICB9XG5cbmNvbnN0IE1kVGV4dCA9ICh7IHZhbHVlLCAuLi5wcm9wcyB9OiB7IHZhbHVlOiBzdHJpbmcgfSkgPT4ge1xuICBjb25zdCBjb250ZXh0UHJvcHMgPSB1c2VDb250ZXh0KFRleHRTdHlsZUNvbnRleHQpXG4gIHJldHVybiAoXG4gICAgPElua1RleHQgey4uLmNvbnRleHRQcm9wc30gey4uLnByb3BzfT5cbiAgICAgIHt2YWx1ZX1cbiAgICA8L0lua1RleHQ+XG4gIClcbn1cblxuZXhwb3J0IGNvbnN0IE1kUm9vdCA9ICh7XG4gIGNoaWxkcmVuLFxuICAuLi5wcm9wc1xufTogeyBjaGlsZHJlbjogUmVhY3ROb2RlIH0gJiBCb3hQcm9wcykgPT4ge1xuICByZXR1cm4gKFxuICAgIDxUZXh0U3R5bGUgY29sb3I9e3VzZVRoZW1lKCkudGV4dH0+XG4gICAgICA8SW5rQm94IHsuLi5wcm9wc30gZmxleERpcmVjdGlvbj1cImNvbHVtblwiIGdhcD17MX0+XG4gICAgICAgIHtjaGlsZHJlbn1cbiAgICAgIDwvSW5rQm94PlxuICAgIDwvVGV4dFN0eWxlPlxuICApXG59XG5cbmNvbnN0IE1kSW5saW5lQ29kZSA9ICh7IHZhbHVlIH06IHsgdmFsdWU6IHN0cmluZyB9KSA9PiAoXG4gIDxJbmtUZXh0IGNvbG9yPXt1c2VUaGVtZSgpLmlubGluZUNvZGV9PmB7dmFsdWV9YDwvSW5rVGV4dD5cbilcbmNvbnN0IE1kRW1waGFzaXMgPSBzdHlsZWQoKHsgY29udGV4dCB9KSA9PiAoe1xuICBpdGFsaWM6IHRydWUsXG4gIGNvbG9yOiB0aW55Y29sb3IoY29udGV4dC5jb2xvcikuYnJpZ2h0ZW4oMjUpLnRvU3RyaW5nKCksXG59KSlcbmNvbnN0IE1kU3Ryb25nID0gc3R5bGVkKCh7IGNvbnRleHQgfSkgPT4ge1xuICByZXR1cm4ge1xuICAgIGJvbGQ6IHRydWUsXG4gICAgY29sb3I6IHRpbnljb2xvcihjb250ZXh0LmNvbG9yKS5kYXJrZW4oNSkudG9IZXhTdHJpbmcoKSxcbiAgfVxufSlcbmNvbnN0IE1kRGVsZXRlID0gc3R5bGVkKCgpID0+ICh7XG4gIHN0cmlrZXRocm91Z2g6IHRydWUsXG4gIGRpbUNvbG9yOiB0cnVlLFxufSkpXG5cbmNvbnN0IE1kSGVhZGluZyA9ICh7IGRlcHRoLCAuLi5uIH06IHsgZGVwdGg6IG51bWJlcjsgY2hpbGRyZW46IFJlYWN0Tm9kZSB9KSA9PiB7XG4gIGNvbnN0IHRoZW1lID0gdXNlVGhlbWUoKVxuICBjb25zdCBzdHlsZSA9IHsgYm9sZDogdHJ1ZSwgdW5kZXJsaW5lOiB0cnVlLCBjb2xvcjogdGhlbWUuaGVhZGluZyB9XG4gIHJldHVybiAoXG4gICAgPElua0JveD5cbiAgICAgIDxUZXh0U3R5bGUgey4uLnN0eWxlfT5cbiAgICAgICAgPElua1RleHQgey4uLnN0eWxlfT57XCIjXCIucmVwZWF0KGRlcHRoKX0gPC9JbmtUZXh0PlxuICAgICAgICB7bi5jaGlsZHJlbn1cbiAgICAgIDwvVGV4dFN0eWxlPlxuICAgIDwvSW5rQm94PlxuICApXG59XG5cbmNvbnN0IE1kTGluayA9ICh7XG4gIHVybCxcbiAgLi4ubm9kZVxufTogeyB1cmw6IHN0cmluZyB9ICYgeyBjaGlsZHJlbjogUmVhY3ROb2RlIH0pID0+IHtcbiAgY29uc3QgdGhlbWUgPSB1c2VUaGVtZSgpXG4gIHJldHVybiAoXG4gICAgPElua0xpbmsgdXJsPXt1cmx9PlxuICAgICAgPFRleHRTdHlsZSBjb2xvcj17dGhlbWUubGlua30+e25vZGUuY2hpbGRyZW59PC9UZXh0U3R5bGU+XG4gICAgPC9JbmtMaW5rPlxuICApXG59XG5cbmNvbnN0IE1kUGFyYWdyYXBoID0gKHsgY2hpbGRyZW4gfTogeyBjaGlsZHJlbjogUmVhY3ROb2RlIH0pID0+IHtcbiAgY29uc3Qgc3R5bGUgPSB1c2VDb250ZXh0KFRleHRTdHlsZUNvbnRleHQpXG4gIHJldHVybiAoXG4gICAgPElua1RleHQgey4uLnN0eWxlfT5cbiAgICAgIDxUcmFuc2Zvcm0gdHJhbnNmb3JtPXsoeCkgPT4geC50cmltKCl9PntjaGlsZHJlbn08L1RyYW5zZm9ybT5cbiAgICA8L0lua1RleHQ+XG4gIClcbn1cblxuY29uc3QgTWRMaXN0ID0gKHsgY2hpbGRyZW4sIC4uLnByb3BzIH06IHsgY2hpbGRyZW46IFJlYWN0Tm9kZSB9KSA9PiB7XG4gIHJldHVybiAoXG4gICAgPElua0JveCB7Li4ucHJvcHN9IHBhZGRpbmdMZWZ0PXsyfSBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCI+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9JbmtCb3g+XG4gIClcbn1cblxuY29uc3QgTWRMaXN0SXRlbSA9ICh7IGNoaWxkcmVuIH06IHsgY2hpbGRyZW46IFJlYWN0Tm9kZSB9KSA9PiB7XG4gIGNvbnN0IHRoZW1lID0gdXNlVGhlbWUoKVxuXG4gIHJldHVybiAoXG4gICAgPElua0JveD5cbiAgICAgIDxJbmtUZXh0IGNvbG9yPXt0aGVtZS5saXN0SXRlbX0+4oCiIDwvSW5rVGV4dD5cbiAgICAgIDxJbmtCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiPntjaGlsZHJlbn08L0lua0JveD5cbiAgICA8L0lua0JveD5cbiAgKVxufVxuXG5jb25zdCBNZEJsb2NrUXVvdGUgPSAoeyBjaGlsZHJlbiB9OiB7IGNoaWxkcmVuOiBSZWFjdE5vZGUgfSkgPT4ge1xuICBjb25zdCB0aGVtZSA9IHVzZVRoZW1lKClcblxuICByZXR1cm4gKFxuICAgIDxUZXh0U3R5bGVDb250ZXh0LlByb3ZpZGVyXG4gICAgICB2YWx1ZT17e1xuICAgICAgICBjb2xvcjogdGhlbWUuYmxvY2txdW90ZSxcbiAgICAgIH19XG4gICAgPlxuICAgICAgPElua0JveFxuICAgICAgICBmbGV4RGlyZWN0aW9uPVwicm93XCJcbiAgICAgICAgZmxleEdyb3c9ezB9XG4gICAgICAgIGZsZXhTaHJpbms9ezF9XG4gICAgICAgIGZsZXhXcmFwPVwid3JhcFwiXG4gICAgICAgIHBhZGRpbmdMZWZ0PXsxfVxuICAgICAgICBib3JkZXJDb2xvcj17dGhlbWUuYmxvY2txdW90ZX1cbiAgICAgICAgYm9yZGVyUmlnaHQ9e2ZhbHNlfVxuICAgICAgICBib3JkZXJCb3R0b209e2ZhbHNlfVxuICAgICAgICBib3JkZXJUb3A9e2ZhbHNlfVxuICAgICAgICBib3JkZXJTdHlsZT17XCJib2xkXCJ9XG4gICAgICA+XG4gICAgICAgIDxUZXh0U3R5bGUgY29sb3I9e3RoZW1lLmJsb2NrcXVvdGV9PntjaGlsZHJlbn08L1RleHRTdHlsZT5cbiAgICAgIDwvSW5rQm94PlxuICAgIDwvVGV4dFN0eWxlQ29udGV4dC5Qcm92aWRlcj5cbiAgKVxufVxuXG5jb25zdCBNZENvZGUgPSAoeyBsYW5nLCB2YWx1ZSB9OiB7IGxhbmc6IHN0cmluZzsgdmFsdWU6IHN0cmluZyB9KSA9PiB7XG4gIGNvbnN0IHRoZW1lID0gdXNlVGhlbWUoKVxuICBjb25zdCBsYW5ndWFnZSA9IHN1cHBvcnRzTGFuZ3VhZ2UobGFuZykgPyBsYW5nIDogXCJ0ZXh0XCJcblxuICByZXR1cm4gKFxuICAgIDxJbmtCb3ggZmxleERpcmVjdGlvbj1cImNvbHVtblwiIG1hcmdpbkxlZnQ9ezF9PlxuICAgICAge2xhbmd1YWdlICE9IFwidGV4dFwiICYmIChcbiAgICAgICAgPElua0JveCBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCIgbWFyZ2luTGVmdD17MX0+XG4gICAgICAgICAgPElua1RleHQgY29sb3I9e3RoZW1lLm11dGVkfSBkaW1Db2xvcj5cbiAgICAgICAgICAgIHtsYW5ndWFnZX1cbiAgICAgICAgICA8L0lua1RleHQ+XG4gICAgICAgIDwvSW5rQm94PlxuICAgICAgKX1cbiAgICAgIDxJbmtCb3hcbiAgICAgICAgZmxleERpcmVjdGlvbj1cImNvbHVtblwiXG4gICAgICAgIHBhZGRpbmdYPXsxfVxuICAgICAgICBib3JkZXJTdHlsZT1cInJvdW5kXCJcbiAgICAgICAgYm9yZGVyQ29sb3I9e3RoZW1lLmNvZGV9XG4gICAgICA+XG4gICAgICAgIDxJbmtUZXh0PlxuICAgICAgICAgIHtoaWdobGlnaHQodmFsdWUsIHtcbiAgICAgICAgICAgIGxhbmd1YWdlLFxuICAgICAgICAgICAgdGhlbWU6IGhpZ2hsaWdodFRoZW1lLFxuICAgICAgICAgIH0pLnRyaW0oKX1cbiAgICAgICAgPC9JbmtUZXh0PlxuICAgICAgPC9JbmtCb3g+XG4gICAgPC9JbmtCb3g+XG4gIClcbn1cblxuY29uc3QgTWRUaGVtYXRpY0JyZWFrID0gKCkgPT4ge1xuICByZXR1cm4gKFxuICAgIDxJbmtCb3hcbiAgICAgIGJvcmRlckNvbG9yPXt1c2VUaGVtZSgpLnRoZW1hdGljQnJlYWt9XG4gICAgICBib3JkZXJTdHlsZT17XCJib2xkXCJ9XG4gICAgICBib3JkZXJCb3R0b209e2ZhbHNlfVxuICAgICAgYm9yZGVyUmlnaHQ9e2ZhbHNlfVxuICAgICAgYm9yZGVyTGVmdD17ZmFsc2V9XG4gICAgLz5cbiAgKVxufVxuXG5jb25zdCBNZEJyZWFrID0gKCkgPT4ge1xuICByZXR1cm4gPElua1RleHQ+e1wiXFxuXCJ9PC9JbmtUZXh0PlxufVxuXG5jb25zdCBNZEltYWdlID0gKHsgYWx0IH06IHsgdXJsOiBzdHJpbmc7IGFsdD86IHN0cmluZyB9KSA9PiB7XG4gIC8vIFRPRE86IFNJR1NFR1YsIG5lZWQgdG8gaW52ZXN0aWdhdGVcbiAgLy8gaWYgKGZzLmV4aXN0c1N5bmModXJsKSkge1xuICAvLyAgIHJldHVybiA8SW1hZ2UgcHJlc2VydmVBc3BlY3RSYXRpbyBzcmM9e3VybH0gYWx0PXthbHR9IHdpZHRoPVwiNTAlXCIgLz5cbiAgLy8gfVxuICBpZiAoYWx0KVxuICAgIHJldHVybiA8SW5rVGV4dCBjb2xvcj17dXNlVGhlbWUoKS5tdXRlZH0+e2AoPGltYWdlPiAke2FsdH0pYH08L0lua1RleHQ+XG5cbiAgcmV0dXJuIG51bGxcbn1cblxuY29uc3QgbWRhc3RNYXAgPSB7XG4gIHJvb3Q6IE1kUm9vdCxcbiAgdGV4dDogTWRUZXh0LFxuICBpbmxpbmVDb2RlOiBNZElubGluZUNvZGUsXG4gIGhlYWRpbmc6IE1kSGVhZGluZyxcbiAgZW1waGFzaXM6IE1kRW1waGFzaXMsXG4gIHN0cm9uZzogTWRTdHJvbmcsXG4gIGRlbGV0ZTogTWREZWxldGUsXG4gIGxpbms6IE1kTGluayxcbiAgcGFyYWdyYXBoOiBNZFBhcmFncmFwaCxcbiAgY29kZTogTWRDb2RlLFxuICBibG9ja3F1b3RlOiBNZEJsb2NrUXVvdGUsXG4gIGxpc3Q6IE1kTGlzdCxcbiAgbGlzdEl0ZW06IE1kTGlzdEl0ZW0sXG4gIGJyZWFrOiBNZEJyZWFrLFxuICB0aGVtYXRpY0JyZWFrOiBNZFRoZW1hdGljQnJlYWssXG4gIGltYWdlOiBNZEltYWdlLFxuICBodG1sOiAoKSA9PiB7XG4gICAgLy8gVE9ETzogd2hhdCB0byBkbz9cbiAgfSxcbn1cblxuZnVuY3Rpb24gdGV4dENvbnRlbnQobm9kZTogTm9kZSkge1xuICByZXR1cm4gc2VsZWN0QWxsKFwidGV4dFwiLCBub2RlKVxuICAgIC5tYXAoKHgpID0+ICh4IGFzIFRleHQpLnZhbHVlKVxuICAgIC5qb2luKClcbiAgICAudHJpbSgpXG59XG5cbmZ1bmN0aW9uIHJlbW92ZUVtcHR5VGFibGVSb3dzKG5vZGU6IFRhYmxlKSB7XG4gIHZpc2l0KG5vZGUsIChuLCBpbmRleCwgcGFyZW50KSA9PiB7XG4gICAgaWYgKG4udHlwZSA9PSBcInRhYmxlUm93XCIpIHtcbiAgICAgIGNvbnN0IHRhYmxlUm93ID0gbiBhcyBUYWJsZVJvd1xuICAgICAgaWYgKCF0ZXh0Q29udGVudCh0YWJsZVJvdykpIHtcbiAgICAgICAgY29uc3QgdGFibGUgPSBwYXJlbnQgYXMgVGFibGVcbiAgICAgICAgdGFibGUuY2hpbGRyZW4uc3BsaWNlKGluZGV4ISwgMSlcbiAgICAgIH1cbiAgICB9XG4gIH0pXG59XG5cbmZ1bmN0aW9uIHJlbW92ZUVtcHR5TGlzdEl0ZW1zKG5vZGU6IExpc3QpIHtcbiAgdmlzaXQobm9kZSwgKG4sIGluZGV4LCBwYXJlbnQpID0+IHtcbiAgICBpZiAobi50eXBlID09IFwibGlzdEl0ZW1cIikge1xuICAgICAgY29uc3QgbGlzdEl0ZW0gPSBuIGFzIExpc3RJdGVtXG4gICAgICBpZiAoIXRleHRDb250ZW50KGxpc3RJdGVtKSkge1xuICAgICAgICBjb25zdCBsaXN0ID0gcGFyZW50IGFzIExpc3RcbiAgICAgICAgbGlzdC5jaGlsZHJlbi5zcGxpY2UoaW5kZXghLCAxKVxuICAgICAgfVxuICAgIH1cbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvSW5rKHRleHQ6IHN0cmluZywgdGhlbWU6IFRoZW1lID0gZGVmYXVsdFRoZW1lKSB7XG4gIGNvbnN0IG1kYXN0VHJlZSA9IG1kMm1kYXN0KHRleHQpXG5cbiAgY29uc3QgdG9KU1ggPSAobm9kZTogTm9kZSwgaTogbnVtYmVyKTogUmVhY3RFbGVtZW50ID0+IHtcbiAgICBpZiAobm9kZS50eXBlID09IFwidGFibGVcIikge1xuICAgICAgcmVtb3ZlRW1wdHlUYWJsZVJvd3Mobm9kZSBhcyBUYWJsZSlcbiAgICAgIC8vIGRlbGVnYXRlIHRhYmxlIHJlbmRlcmluZyB0byBtZGFzdFxuICAgICAgcmV0dXJuIDxJbmtUZXh0IGtleT17aX0+e21kYXN0Mm1kKG5vZGUgYXMgTWRhc3ROb2Rlcyl9PC9JbmtUZXh0PlxuICAgIH1cblxuICAgIGlmIChub2RlLnR5cGUgPT0gXCJsaXN0XCIpIHtcbiAgICAgIHJlbW92ZUVtcHR5TGlzdEl0ZW1zKG5vZGUgYXMgTGlzdClcbiAgICB9XG5cbiAgICBpZiAobm9kZS50eXBlIGluIG1kYXN0TWFwKSB7XG4gICAgICBjb25zdCB7IHR5cGUsIGNoaWxkcmVuLCBwb3NpdGlvbiwgLi4ucHJvcHMgfSA9IG5vZGUgYXMgUGFyZW50XG4gICAgICBjb25zdCBrZXkgPSB0eXBlIGFzIGtleW9mIHR5cGVvZiBtZGFzdE1hcFxuICAgICAgcmV0dXJuIGpzeChcbiAgICAgICAgbWRhc3RNYXBba2V5XSBhcyBFbGVtZW50VHlwZSxcbiAgICAgICAgeyAuLi5wcm9wcywgY2hpbGRyZW46IGNoaWxkcmVuPy5tYXAodG9KU1gpIH0sXG4gICAgICAgIGksXG4gICAgICApXG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biB0eXBlOiAke25vZGUudHlwZX1gKVxuICB9XG4gIHJldHVybiAoXG4gICAgPFRoZW1lQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17dGhlbWV9PlxuICAgICAge21kYXN0VHJlZS5jaGlsZHJlbi5tYXAodG9KU1gpfVxuICAgIDwvVGhlbWVDb250ZXh0LlByb3ZpZGVyPlxuICApXG59XG4iLAogICJpbXBvcnQgeyBodG1sMm1kIH0gZnJvbSBcIi4vbWFya2Rvd25cIlxuaW1wb3J0IHsgY3JlYXRlUmVhZFN0cmVhbSB9IGZyb20gXCJub2RlOmZzXCJcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYWRTdHJlYW0oXG4gIHN0cmVhbTogTm9kZUpTLlJlYWRhYmxlU3RyZWFtLFxuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgY2h1bmtzOiBzdHJpbmdbXSA9IFtdXG4gIGZvciBhd2FpdCAoY29uc3QgY2h1bmsgb2Ygc3RyZWFtKSB7XG4gICAgY2h1bmtzLnB1c2goY2h1bmsudG9TdHJpbmcoKSlcbiAgfVxuICByZXR1cm4gY2h1bmtzLmpvaW4oXCJcIikudHJpbSgpXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkVFRZU3RyZWFtKFxuICBzdHJlYW06IHR5cGVvZiBwcm9jZXNzLnN0ZGluLFxuICBodG1sOiBib29sZWFuLFxuKTogUHJvbWlzZTxzdHJpbmcgfCB1bmRlZmluZWQ+IHtcbiAgY29uc3Qgb3V0cHV0ID0gc3RyZWFtLmlzVFRZID8gdW5kZWZpbmVkIDogYXdhaXQgcmVhZFN0cmVhbShzdHJlYW0pXG4gIGlmIChvdXRwdXQgJiYgaHRtbCkgcmV0dXJuIGh0bWwybWQob3V0cHV0KVxuICByZXR1cm4gb3V0cHV0XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkU3RkSW5PckZpbGUoXG4gIGZpbGU6IHN0cmluZyxcbiAgaHRtbDogYm9vbGVhbixcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIGxldCBvdXRwdXQgPSBhd2FpdCByZWFkU3RyZWFtKHByb2Nlc3Muc3RkaW4pXG4gIGlmICghb3V0cHV0KSB7XG4gICAgb3V0cHV0ID0gYXdhaXQgcmVhZFN0cmVhbShjcmVhdGVSZWFkU3RyZWFtKGZpbGUpKVxuICB9XG4gIGlmIChodG1sKSByZXR1cm4gaHRtbDJtZChvdXRwdXQpXG4gIHJldHVybiBvdXRwdXRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhcGl0YWxpemUoc3RyOiBzdHJpbmcpIHtcbiAgaWYgKHN0ci5sZW5ndGggPCAyKSByZXR1cm4gc3RyXG4gIHJldHVybiBzdHJbMF0hLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGR1bWJGb3JtYXQoeG1sTGlrZTogc3RyaW5nKSB7XG4gIHZhciBmb3JtYXR0ZWQgPSBcIlwiXG4gIHZhciByZWcgPSAvKD4pKDwpKFxcLyopL2dcbiAgeG1sTGlrZSA9IHhtbExpa2UucmVwbGFjZShyZWcsIFwiJDFcXHJcXG4kMiQzXCIpXG4gIHZhciBwYWQgPSAwXG4gIGNvbnN0IHBhcnRzID0geG1sTGlrZS5zcGxpdChcIlxcclxcblwiKVxuICBwYXJ0cy5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgdmFyIGluZGVudCA9IDBcbiAgICBpZiAobm9kZS5tYXRjaCgvLis8XFwvXFx3W14+XSo+JC8pKSB7XG4gICAgICBpbmRlbnQgPSAwXG4gICAgfSBlbHNlIGlmIChub2RlLm1hdGNoKC9ePFxcL1xcdy8pKSB7XG4gICAgICBpZiAocGFkICE9IDApIHtcbiAgICAgICAgcGFkIC09IDFcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG5vZGUubWF0Y2goL148XFx3W14+XSpbXlxcL10+LiokLykpIHtcbiAgICAgIGluZGVudCA9IDFcbiAgICB9IGVsc2Uge1xuICAgICAgaW5kZW50ID0gMFxuICAgIH1cblxuICAgIHZhciBwYWRkaW5nID0gXCJcIlxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFkOyBpKyspIHtcbiAgICAgIHBhZGRpbmcgKz0gXCIgIFwiXG4gICAgfVxuXG4gICAgZm9ybWF0dGVkICs9IHBhZGRpbmcgKyBub2RlICsgXCJcXHJcXG5cIlxuICAgIHBhZCArPSBpbmRlbnRcbiAgfSlcblxuICByZXR1cm4gZm9ybWF0dGVkXG59XG4iLAogICJpbXBvcnQgeyB0eXBlIFJlYWN0Tm9kZSB9IGZyb20gXCJyZWFjdFwiXG5pbXBvcnQgeyBCb3gsIFRleHQgfSBmcm9tIFwiaW5rXCJcbmltcG9ydCB7IGNhcGl0YWxpemUgfSBmcm9tIFwiLi4vc3VwcG9ydC91dGlsXCJcbmltcG9ydCB7IHVzZVRoZW1lIH0gZnJvbSBcIi4uL3N1cHBvcnQvdGhlbWluZ1wiXG5pbXBvcnQgY29sb3IgZnJvbSBcInRpbnljb2xvcjJcIlxuXG5leHBvcnQgdHlwZSBNZXNzYWdlUHJvcHMgPSB7XG4gIHJvbGU6IHN0cmluZ1xuICBtb2RlbD86IHN0cmluZ1xuICBjaGlsZHJlbjogUmVhY3ROb2RlXG59XG5cbmV4cG9ydCBjb25zdCBNZXNzYWdlID0gKHsgcm9sZSwgbW9kZWwsIGNoaWxkcmVuIH06IE1lc3NhZ2VQcm9wcykgPT4ge1xuICBjb25zdCB0aGVtZSA9IHVzZVRoZW1lKClcbiAgcmV0dXJuIChcbiAgICA8Qm94IHBhZGRpbmc9ezF9IGdhcD17MX0gZmxleERpcmVjdGlvbj1cImNvbHVtblwiIHdpZHRoPVwiMTAwJVwiPlxuICAgICAgPEJveCBnYXA9ezF9IGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiPlxuICAgICAgICA8VGV4dCBib2xkIGNvbG9yPXtjb2xvcih0aGVtZS50ZXh0KS5kYXJrZW4oNSkudG9IZXhTdHJpbmcoKX0+XG4gICAgICAgICAge2NhcGl0YWxpemUocm9sZSl9OlxuICAgICAgICA8L1RleHQ+XG4gICAgICAgIHtyb2xlID09IFwiYXNzaXN0YW50XCIgJiYgPFRleHQgY29sb3I9e3RoZW1lLm11dGVkfT57bW9kZWx9PC9UZXh0Pn1cbiAgICAgIDwvQm94PlxuICAgICAgPEJveFxuICAgICAgICBmbGV4RGlyZWN0aW9uPVwiY29sdW1uXCJcbiAgICAgICAgYm9yZGVyU3R5bGU9XCJyb3VuZFwiXG4gICAgICAgIGJvcmRlckNvbG9yPXt0aGVtZS5tdXRlZH1cbiAgICAgICAgcGFkZGluZ1g9ezJ9XG4gICAgICAgIHBhZGRpbmdZPXsxfVxuICAgICAgPlxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L0JveD5cbiAgICA8L0JveD5cbiAgKVxufVxuIiwKICAiaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIlxuaW1wb3J0IHsgbGFzdCwgc29ydEJ5IH0gZnJvbSBcImxvZGFzaC1lc1wiXG5pbXBvcnQgbGFuZ3VhZ2VkZXRlY3Rpb24gZnJvbSBcIkB2c2NvZGUvdnNjb2RlLWxhbmd1YWdlZGV0ZWN0aW9uXCJcblxuZXhwb3J0IGNvbnN0IG9wcyA9IG5ldyBsYW5ndWFnZWRldGVjdGlvbi5Nb2RlbE9wZXJhdGlvbnMoKVxuXG5leHBvcnQgY29uc3QgdXNlTWltZSA9IChzdHI6IHN0cmluZywgbWluTGVuZ3RoID0gNTApOiBzdHJpbmcgfCB1bmRlZmluZWQgPT4ge1xuICBjb25zdCBtaW1lID0gdXNlUmVmPHN0cmluZz4oKVxuICBjb25zdCBuID0gdXNlUmVmKDApXG5cbiAgY29uc3QgcnVuID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmIChzdHIubGVuZ3RoID49IG1pbkxlbmd0aCAqIG4uY3VycmVudCkge1xuICAgICAgY29uc3QgbSA9IGF3YWl0IGd1ZXNzTWltZShzdHIpXG4gICAgICBuLmN1cnJlbnQgKz0gMVxuICAgICAgaWYgKG0pIG1pbWUuY3VycmVudCA9IG1cbiAgICB9XG4gIH1cblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHJ1bigpXG4gIH0sIFtzdHJdKVxuXG4gIHJldHVybiBtaW1lLmN1cnJlbnRcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGd1ZXNzTWltZShzdHI6IHN0cmluZywgbWluQ29uZmlkZW5jZSA9IDAuMDUpIHtcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgb3BzLnJ1bk1vZGVsKHN0cilcbiAgcmV0dXJuIGxhc3QoXG4gICAgc29ydEJ5KFxuICAgICAgcmVzdWx0LmZpbHRlcigocikgPT4gci5jb25maWRlbmNlID4gbWluQ29uZmlkZW5jZSksXG4gICAgICAocikgPT4gci5jb25maWRlbmNlLFxuICAgICksXG4gICk/Lmxhbmd1YWdlSWRcbn1cbiIsCiAgImltcG9ydCB7IEJveCwgU3RhdGljLCBUZXh0LCByZW5kZXIgfSBmcm9tIFwiaW5rXCJcbmltcG9ydCB7IENvbW1hbmQgfSBmcm9tIFwiY29tbWFuZGVyXCJcbmltcG9ydCB7IE1lc3NhZ2UsIHR5cGUgTWVzc2FnZVByb3BzIH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvTWVzc2FnZVwiXG5pbXBvcnQgeyByZWFkVFRZU3RyZWFtIH0gZnJvbSBcIi4uL3N1cHBvcnQvdXRpbFwiXG5pbXBvcnQgeyBndWVzc01pbWUsIHVzZU1pbWUgfSBmcm9tIFwiLi4vc3VwcG9ydC9taW1lXCJcbmltcG9ydCB7IE1kUm9vdCwgdG9JbmsgfSBmcm9tIFwiLi4vc3VwcG9ydC9tYXJrZG93blwiXG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCJcbmltcG9ydCBvbGxhbWEsIHsgdHlwZSBNb2RlbFJlc3BvbnNlIH0gZnJvbSBcIm9sbGFtYVwiXG5pbXBvcnQgU3Bpbm5lciBmcm9tIFwiaW5rLXNwaW5uZXJcIlxuaW1wb3J0IHsgaGlnaGxpZ2h0LCBzdXBwb3J0c0xhbmd1YWdlIH0gZnJvbSBcImNsaS1oaWdobGlnaHRcIlxuXG50eXBlIFJlbmRlcmVyUHJvcHMgPSB7IGNvbnRlbnQ6IHN0cmluZzsgbWltZT86IHN0cmluZyB9XG5jb25zdCBSZW5kZXJlciA9ICh7IGNvbnRlbnQsIG1pbWUgfTogUmVuZGVyZXJQcm9wcykgPT4ge1xuICBpZiAobWltZSA9PSBcIm1kXCIpIHtcbiAgICByZXR1cm4gPE1kUm9vdD57dG9JbmsoY29udGVudCl9PC9NZFJvb3Q+XG4gIH1cbiAgaWYgKG1pbWUgJiYgc3VwcG9ydHNMYW5ndWFnZShtaW1lKSkge1xuICAgIHJldHVybiA8VGV4dD57aGlnaGxpZ2h0KGNvbnRlbnQsIHsgbGFuZ3VhZ2U6IG1pbWUgfSl9PC9UZXh0PlxuICB9XG4gIHJldHVybiA8VGV4dD57Y29udGVudH08L1RleHQ+XG59XG5cbnR5cGUgUnVuT3B0aW9ucyA9IHtcbiAgbW9kZWw6IHN0cmluZ1xuICBzeXN0ZW0/OiBzdHJpbmdcbiAganNvbj86IGJvb2xlYW5cbiAgaHRtbD86IGJvb2xlYW5cbiAgcmVzcG9uc2U/OiBib29sZWFuXG4gIHRlbXA/OiBudW1iZXJcbiAgbnVtUHJlZD86IG51bWJlclxuICBjdHg/OiBudW1iZXJcbiAgcHJpbnRXaWR0aD86IG51bWJlclxufVxuXG50eXBlIFJ1blByb3BzID0ge1xuICBzdGRpbjogUmVuZGVyZXJQcm9wcyB8IHVuZGVmaW5lZFxuICBwcm9tcHQ6IHN0cmluZ1xuICBvcHRpb25zOiBSdW5PcHRpb25zXG4gIG1vZGVsczogTW9kZWxSZXNwb25zZVtdXG59XG5cbmNvbnN0IFJ1bkNvbW1hbmQgPSAoeyBzdGRpbiwgcHJvbXB0LCBvcHRpb25zLCBtb2RlbHMgfTogUnVuUHJvcHMpID0+IHtcbiAgbGV0IGNvbnZlcnNhdGlvbjogKFJlbmRlcmVyUHJvcHMgJiBQaWNrPE1lc3NhZ2VQcm9wcywgXCJyb2xlXCI+KVtdID0gW11cbiAgbGV0IFtidWZmZXIsIHNldEJ1ZmZlcl0gPSB1c2VTdGF0ZShcIlwiKVxuXG4gIGlmIChvcHRpb25zLnN5c3RlbSlcbiAgICBjb252ZXJzYXRpb24ucHVzaCh7IHJvbGU6IFwic3lzdGVtXCIsIGNvbnRlbnQ6IG9wdGlvbnMuc3lzdGVtISB9KVxuXG4gIGNvbnZlcnNhdGlvbi5wdXNoKHtcbiAgICByb2xlOiBcInVzZXJcIixcbiAgICBjb250ZW50OiBwcm9tcHQsXG4gIH0pXG5cbiAgaWYgKHN0ZGluKSBjb252ZXJzYXRpb24ucHVzaCh7IHJvbGU6IFwidXNlclwiLCAuLi5zdGRpbiB9KVxuXG4gIGNvbnN0IG1hdGNoID0gbW9kZWxzXG4gICAgLm1hcCgoeyBuYW1lIH0pID0+IG5hbWUpXG4gICAgLmZpbmQoKG5hbWUpID0+IG5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhvcHRpb25zLm1vZGVsPy50b0xvd2VyQ2FzZSgpKSlcblxuICBsZXQgbW9kZWw6IHN0cmluZ1xuICBpZiAobWF0Y2gpIHtcbiAgICBtb2RlbCA9IG1hdGNoXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxUZXh0PlxuICAgICAgICB7b3B0aW9ucy5tb2RlbFxuICAgICAgICAgID8gYE5vIG1vZGVsIG1hdGNoZXMgJHtvcHRpb25zLm1vZGVsfWBcbiAgICAgICAgICA6IGBObyBtb2RlbCBzcGVjaWZpZWRgfVxuICAgICAgPC9UZXh0PlxuICAgIClcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIHJ1bigpIHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IG9sbGFtYS5jaGF0KHtcbiAgICAgIG1lc3NhZ2VzOiBjb252ZXJzYXRpb24sXG4gICAgICBtb2RlbCxcbiAgICAgIGZvcm1hdDogb3B0aW9ucy5qc29uID8gXCJqc29uXCIgOiB1bmRlZmluZWQsXG4gICAgICBvcHRpb25zOiB7XG4gICAgICAgIHRlbXBlcmF0dXJlOiBvcHRpb25zLnRlbXAsXG4gICAgICAgIG51bV9wcmVkaWN0OiBvcHRpb25zLm51bVByZWQsXG4gICAgICAgIG51bV9jdHg6IG9wdGlvbnMuY3R4LFxuICAgICAgfSxcbiAgICAgIHN0cmVhbTogdHJ1ZSxcbiAgICB9KVxuXG4gICAgZm9yIGF3YWl0IChjb25zdCBjaHVuayBvZiByZXNwb25zZSkge1xuICAgICAgc2V0QnVmZmVyKChidWZmZXI6IHN0cmluZykgPT4gYnVmZmVyICsgY2h1bmsubWVzc2FnZS5jb250ZW50KVxuICAgIH1cbiAgfVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcnVuKClcbiAgfSwgW10pXG5cbiAgY29uc3QgYnVmZmVyTWltZSA9IHVzZU1pbWUoYnVmZmVyKVxuICBpZiAob3B0aW9ucy5yZXNwb25zZSB8fCBvcHRpb25zLmpzb24pXG4gICAgcmV0dXJuIDxSZW5kZXJlciBjb250ZW50PXtidWZmZXJ9IG1pbWU9e2J1ZmZlck1pbWV9IC8+XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IGZsZXhEaXJlY3Rpb249XCJjb2x1bW5cIiBmbGV4V3JhcD1cIndyYXBcIiB3aWR0aD17b3B0aW9ucy5wcmludFdpZHRofT5cbiAgICAgIDxTdGF0aWMgaXRlbXM9e2NvbnZlcnNhdGlvbn0+XG4gICAgICAgIHsocHJvcHMsIGkpID0+IChcbiAgICAgICAgICA8TWVzc2FnZSBrZXk9e2l9IHsuLi5wcm9wc30gey4uLm9wdGlvbnN9PlxuICAgICAgICAgICAgPFJlbmRlcmVyIHsuLi5wcm9wc30gLz5cbiAgICAgICAgICA8L01lc3NhZ2U+XG4gICAgICAgICl9XG4gICAgICA8L1N0YXRpYz5cblxuICAgICAgPE1lc3NhZ2Uga2V5PVwiYnVmZmVyXCIgcm9sZT1cImFzc2lzdGFudFwiIHsuLi5vcHRpb25zfT5cbiAgICAgICAge2J1ZmZlciA/IChcbiAgICAgICAgICA8UmVuZGVyZXIgY29udGVudD17YnVmZmVyfSBtaW1lPXtidWZmZXJNaW1lfSAvPlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxUZXh0PlxuICAgICAgICAgICAgPFNwaW5uZXIgdHlwZT1cInNpbXBsZURvdHNTY3JvbGxpbmdcIiAvPlxuICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgKX1cbiAgICAgIDwvTWVzc2FnZT5cbiAgICA8L0JveD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCAob2xsYW1hcms6IENvbW1hbmQpID0+XG4gIG9sbGFtYXJrXG4gICAgLmNvbW1hbmQoXCJydW5cIiwgeyBpc0RlZmF1bHQ6IHRydWUgfSlcbiAgICAuZGVzY3JpcHRpb24oXCJFeGVjdXRlIGEgcHJvbXB0XCIpXG4gICAgLmFyZ3VtZW50KFwiPHByb21wdC4uLj5cIilcbiAgICAub3B0aW9uKFwiLS1odG1sXCIsIFwidHJlYXQgaW5wdXQgYXMgaHRtbFwiKVxuICAgIC5vcHRpb24oXCItLWpzb25cIiwgXCJvdXRwdXQgaW4ganNvblwiKVxuICAgIC5vcHRpb24oXCItbSwgLS1tb2RlbCA8c3RyaW5nPlwiLCBcIm1vZGVsIG5hbWUgKHBhcnRpYWwgbWF0Y2ggc3VwcG9ydGVkKVwiKVxuICAgIC5vcHRpb24oXCItcywgLS1zeXN0ZW0gPHN0cmluZz5cIiwgXCJzeXN0ZW0gcHJvbXB0XCIpXG4gICAgLm9wdGlvbihcIi10LCAtLXRlbXAgPHZhbHVlPlwiLCBcInRlbXBlcmF0dXJlXCIpXG4gICAgLm9wdGlvbihcIi1uLCAtLW51bS1wcmVkIDx2YWx1ZT5cIiwgXCJudW1iZXIgb2YgcHJlZGljdGlvbnNcIilcbiAgICAub3B0aW9uKFwiLUMsIC0tY3R4IDx2YWx1ZT5cIiwgXCJjb250ZXh0IGxlbmd0aFwiKVxuICAgIC5vcHRpb24oXCItciwgLS1yZXNwb25zZVwiLCBcIm9ubHkgcHJpbnQgcmVzcG9uc2VcIilcbiAgICAub3B0aW9uKFwiLVcsIC0tcHJpbnQtd2lkdGggPGNoYXJzPlwiLCBcInByaW50IHdpZHRoXCIsIFwiMTAwXCIpXG4gICAgLmFjdGlvbihhc3luYyAocGFydHM6IHN0cmluZ1tdLCBvcHRpb25zOiBSdW5PcHRpb25zKSA9PiB7XG4gICAgICBjb25zdCBtb2RlbHMgPSBhd2FpdCBvbGxhbWEubGlzdCgpXG4gICAgICBjb25zdCBzdGRpbiA9IGF3YWl0IHJlYWRUVFlTdHJlYW0ocHJvY2Vzcy5zdGRpbiwgISFvcHRpb25zLmh0bWwpXG4gICAgICByZW5kZXIoXG4gICAgICAgIDxSdW5Db21tYW5kXG4gICAgICAgICAgbW9kZWxzPXttb2RlbHMubW9kZWxzfVxuICAgICAgICAgIHN0ZGluPXtcbiAgICAgICAgICAgIHN0ZGluID8geyBjb250ZW50OiBzdGRpbiwgbWltZTogYXdhaXQgZ3Vlc3NNaW1lKHN0ZGluKSB9IDogdW5kZWZpbmVkXG4gICAgICAgICAgfVxuICAgICAgICAgIHByb21wdD17cGFydHMuam9pbihcIiBcIil9XG4gICAgICAgICAgb3B0aW9ucz17e1xuICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgIHRlbXA6IE51bWJlcihvcHRpb25zLnRlbXApLFxuICAgICAgICAgICAgbnVtUHJlZDogTnVtYmVyKG9wdGlvbnMubnVtUHJlZCksXG4gICAgICAgICAgICBjdHg6IE51bWJlcihvcHRpb25zLmN0eCksXG4gICAgICAgICAgICBwcmludFdpZHRoOiBOdW1iZXIob3B0aW9ucy5wcmludFdpZHRoKSxcbiAgICAgICAgICB9fVxuICAgICAgICAvPixcbiAgICAgIClcbiAgICB9KVxuIiwKICAiaW1wb3J0IHsgcmVuZGVyIH0gZnJvbSBcImlua1wiXG5pbXBvcnQgeyBDb21tYW5kIH0gZnJvbSBcImNvbW1hbmRlclwiXG5pbXBvcnQgeyByZWFkU3RkSW5PckZpbGUgfSBmcm9tIFwiLi4vc3VwcG9ydC91dGlsXCJcbmltcG9ydCB7IE1kUm9vdCwgdG9JbmsgfSBmcm9tIFwiLi4vc3VwcG9ydC9tYXJrZG93blwiXG5cbnR5cGUgUmVuZGVyT3B0aW9ucyA9IHtcbiAgcHJpbnRXaWR0aD86IHN0cmluZ1xuICBodG1sPzogYm9vbGVhblxufVxuXG5leHBvcnQgZGVmYXVsdCAob2xsYW1hcms6IENvbW1hbmQpID0+XG4gIG9sbGFtYXJrXG4gICAgLmRlc2NyaXB0aW9uKFwiUmVuZGVyIG1hcmtkb3duXCIpXG4gICAgLmNvbW1hbmQoXCJyZW5kZXJcIilcbiAgICAuYXJndW1lbnQoXCJbZmlsZV1cIiwgXCJmaWxlIHRvIHJlbmRlclwiKVxuICAgIC5vcHRpb24oXCItLWh0bWxcIiwgXCJ0cmVhdCBpbnB1dCBhcyBodG1sXCIpXG4gICAgLm9wdGlvbihcIi0tcHJpbnQtd2lkdGggPGNoYXJzPlwiLCBcInByaW50IHdpZHRoXCIsIFwiMTIwXCIpXG4gICAgLmFjdGlvbihhc3luYyAoZmlsZTogc3RyaW5nLCBvcHRpb25zOiBSZW5kZXJPcHRpb25zKSA9PiB7XG4gICAgICBsZXQgaW5wdXQgPSBhd2FpdCByZWFkU3RkSW5PckZpbGUoZmlsZSwgISFvcHRpb25zLmh0bWwpXG4gICAgICByZW5kZXIoPE1kUm9vdCB3aWR0aD17TnVtYmVyKG9wdGlvbnMucHJpbnRXaWR0aCl9Pnt0b0luayhpbnB1dCl9PC9NZFJvb3Q+KVxuICAgIH0pXG4iLAogICJpbXBvcnQgeyByZW5kZXIgfSBmcm9tIFwiaW5rXCJcbmltcG9ydCB7IENvbW1hbmQgfSBmcm9tIFwiY29tbWFuZGVyXCJcbmltcG9ydCB7IHJlYWRTdGRJbk9yRmlsZSB9IGZyb20gXCIuLi9zdXBwb3J0L3V0aWxcIlxuaW1wb3J0IHsgTWRSb290LCB0b0luayB9IGZyb20gXCIuLi9zdXBwb3J0L21hcmtkb3duXCJcblxudHlwZSBSZW5kZXJPcHRpb25zID0ge1xuICBwcmludFdpZHRoPzogc3RyaW5nXG4gIGh0bWw/OiBib29sZWFuXG59XG5cbmV4cG9ydCBkZWZhdWx0IChvbGxhbWFyazogQ29tbWFuZCkgPT5cbiAgb2xsYW1hcmtcbiAgICAuZGVzY3JpcHRpb24oXCJSZW5kZXIgbWFya2Rvd25cIilcbiAgICAuY29tbWFuZChcInJlbmRlclwiKVxuICAgIC5hcmd1bWVudChcIltmaWxlXVwiLCBcImZpbGUgdG8gcmVuZGVyXCIpXG4gICAgLm9wdGlvbihcIi0taHRtbFwiLCBcInRyZWF0IGlucHV0IGFzIGh0bWxcIilcbiAgICAub3B0aW9uKFwiLS1wcmludC13aWR0aCA8Y2hhcnM+XCIsIFwicHJpbnQgd2lkdGhcIiwgXCIxMjBcIilcbiAgICAuYWN0aW9uKGFzeW5jIChmaWxlOiBzdHJpbmcsIG9wdGlvbnM6IFJlbmRlck9wdGlvbnMpID0+IHtcbiAgICAgIGxldCBpbnB1dCA9IGF3YWl0IHJlYWRTdGRJbk9yRmlsZShmaWxlLCAhIW9wdGlvbnMuaHRtbClcbiAgICAgIHJlbmRlcig8TWRSb290IHdpZHRoPXtOdW1iZXIob3B0aW9ucy5wcmludFdpZHRoKX0+e3RvSW5rKGlucHV0KX08L01kUm9vdD4pXG4gICAgfSlcbiIsCiAgImltcG9ydCB7IENvbW1hbmQgfSBmcm9tIFwiY29tbWFuZGVyXCJcbmltcG9ydCB7IGhpZ2hsaWdodFRoZW1lIH0gZnJvbSBcIi4uL3N1cHBvcnQvdGhlbWluZ1wiXG5pbXBvcnQgeyByZWFkU3RkSW5PckZpbGUsIGR1bWJGb3JtYXQgfSBmcm9tIFwiLi4vc3VwcG9ydC91dGlsXCJcbmltcG9ydCB7IHJlbmRlclRvU3RhdGljTWFya3VwIH0gZnJvbSBcInJlYWN0LWRvbS9zZXJ2ZXJcIlxuaW1wb3J0IHsgdG9JbmsgfSBmcm9tIFwiLi4vc3VwcG9ydC9tYXJrZG93blwiXG5pbXBvcnQgeyBoaWdobGlnaHQgfSBmcm9tIFwiY2xpLWhpZ2hsaWdodFwiXG5cbnR5cGUgUmVuZGVyT3B0aW9ucyA9IHtcbiAgcHJpbnRXaWR0aD86IHN0cmluZ1xuICBodG1sPzogYm9vbGVhblxufVxuXG5leHBvcnQgZGVmYXVsdCAob2xsYW1hcms6IENvbW1hbmQpID0+XG4gIG9sbGFtYXJrXG4gICAgLmNvbW1hbmQoXCJhc3RcIilcbiAgICAuZGVzY3JpcHRpb24oXCJJbnNwZWN0IHRoZSByZW5kZXJlZCBBU1Qgb2YgYSBtYXJrZG93biBmaWxlXCIpXG4gICAgLmFyZ3VtZW50KFwiW2ZpbGVdXCIsIFwiZmlsZSB0byByZW5kZXJcIilcbiAgICAub3B0aW9uKFwiLS1odG1sXCIsIFwidHJlYXQgaW5wdXQgYXMgaHRtbFwiKVxuICAgIC5vcHRpb24oXCItLXByaW50LXdpZHRoIDxjaGFycz5cIiwgXCJwcmludCB3aWR0aFwiLCBcIjEyMFwiKVxuICAgIC5hY3Rpb24oYXN5bmMgKGZpbGU6IHN0cmluZywgb3B0aW9uczogUmVuZGVyT3B0aW9ucykgPT4ge1xuICAgICAgbGV0IGlucHV0ID0gYXdhaXQgcmVhZFN0ZEluT3JGaWxlKGZpbGUsICEhb3B0aW9ucy5odG1sKVxuICAgICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoXG4gICAgICAgIGhpZ2hsaWdodChkdW1iRm9ybWF0KHJlbmRlclRvU3RhdGljTWFya3VwKHRvSW5rKGlucHV0KSkpLCB7XG4gICAgICAgICAgbGFuZ3VhZ2U6IFwieG1sXCIsXG4gICAgICAgICAgdGhlbWU6IGhpZ2hsaWdodFRoZW1lLFxuICAgICAgICB9KSxcbiAgICAgIClcbiAgICB9KVxuIiwKICAiaW1wb3J0IHsgQ29tbWFuZCB9IGZyb20gXCJjb21tYW5kZXJcIlxuaW1wb3J0IHsgaGlnaGxpZ2h0VGhlbWUgfSBmcm9tIFwiLi4vc3VwcG9ydC90aGVtaW5nXCJcbmltcG9ydCB7IHJlYWRTdGRJbk9yRmlsZSwgZHVtYkZvcm1hdCB9IGZyb20gXCIuLi9zdXBwb3J0L3V0aWxcIlxuaW1wb3J0IHsgcmVuZGVyVG9TdGF0aWNNYXJrdXAgfSBmcm9tIFwicmVhY3QtZG9tL3NlcnZlclwiXG5pbXBvcnQgeyB0b0luayB9IGZyb20gXCIuLi9zdXBwb3J0L21hcmtkb3duXCJcbmltcG9ydCB7IGhpZ2hsaWdodCB9IGZyb20gXCJjbGktaGlnaGxpZ2h0XCJcblxudHlwZSBSZW5kZXJPcHRpb25zID0ge1xuICBwcmludFdpZHRoPzogc3RyaW5nXG4gIGh0bWw/OiBib29sZWFuXG59XG5cbmV4cG9ydCBkZWZhdWx0IChvbGxhbWFyazogQ29tbWFuZCkgPT5cbiAgb2xsYW1hcmtcbiAgICAuY29tbWFuZChcImFzdFwiKVxuICAgIC5kZXNjcmlwdGlvbihcIkluc3BlY3QgdGhlIHJlbmRlcmVkIEFTVCBvZiBhIG1hcmtkb3duIGZpbGVcIilcbiAgICAuYXJndW1lbnQoXCJbZmlsZV1cIiwgXCJmaWxlIHRvIHJlbmRlclwiKVxuICAgIC5vcHRpb24oXCItLWh0bWxcIiwgXCJ0cmVhdCBpbnB1dCBhcyBodG1sXCIpXG4gICAgLm9wdGlvbihcIi0tcHJpbnQtd2lkdGggPGNoYXJzPlwiLCBcInByaW50IHdpZHRoXCIsIFwiMTIwXCIpXG4gICAgLmFjdGlvbihhc3luYyAoZmlsZTogc3RyaW5nLCBvcHRpb25zOiBSZW5kZXJPcHRpb25zKSA9PiB7XG4gICAgICBsZXQgaW5wdXQgPSBhd2FpdCByZWFkU3RkSW5PckZpbGUoZmlsZSwgISFvcHRpb25zLmh0bWwpXG4gICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShcbiAgICAgICAgaGlnaGxpZ2h0KGR1bWJGb3JtYXQocmVuZGVyVG9TdGF0aWNNYXJrdXAodG9JbmsoaW5wdXQpKSksIHtcbiAgICAgICAgICBsYW5ndWFnZTogXCJ4bWxcIixcbiAgICAgICAgICB0aGVtZTogaGlnaGxpZ2h0VGhlbWUsXG4gICAgICAgIH0pLFxuICAgICAgKVxuICAgIH0pXG4iLAogICIjIS91c3IvYmluL2VudiBub2RlXG5cbmltcG9ydCBvbGxhbWEgZnJvbSBcIm9sbGFtYVwiXG5cbmltcG9ydCB7IENvbW1hbmQgfSBmcm9tIFwiY29tbWFuZGVyXCJcbmltcG9ydCB7IG5hbWUsIGRlc2NyaXB0aW9uLCB2ZXJzaW9uIH0gZnJvbSBcIi4uL3BhY2thZ2UuanNvblwiXG5cbmltcG9ydCByZWdpc3RlclJ1bkNvbW1hbmQgZnJvbSBcIi4vY29tbWFuZHMvcnVuXCJcbmltcG9ydCByZWdpc3RlclJlbmRlckNvbW1hbmQgZnJvbSBcIi4vY29tbWFuZHMvcmVuZGVyXCJcbmltcG9ydCByZWdpc3RlckFzdENvbW1hbmQgZnJvbSBcIi4vY29tbWFuZHMvYXN0XCJcblxuY29uc3QgcHJvZ3JhbSA9IG5ldyBDb21tYW5kKClcbnByb2dyYW0ubmFtZShuYW1lKS5kZXNjcmlwdGlvbihkZXNjcmlwdGlvbikudmVyc2lvbih2ZXJzaW9uKVxuXG5yZWdpc3RlclJ1bkNvbW1hbmQocHJvZ3JhbSlcbnJlZ2lzdGVyUmVuZGVyQ29tbWFuZChwcm9ncmFtKVxucmVnaXN0ZXJBc3RDb21tYW5kKHByb2dyYW0pXG5cbnByb2dyYW0ucGFyc2UoKVxuXG5wcm9jZXNzLm9uKFwiU0lHSU5UXCIsIHNodXRkb3duKVxucHJvY2Vzcy5vbihcImV4aXRcIiwgc2h1dGRvd24pXG5cbmZ1bmN0aW9uIHNodXRkb3duKCkge1xuICBvbGxhbWEuYWJvcnQoKVxuICBwcm9jZXNzLnN0ZG91dC53cml0ZShcIlxceDFiWz8yNWhcIikgLy8gcmVzZXQgY3Vyc29yXG59XG4iCiAgXSwKICAibWFwcGluZ3MiOiAiOzs7QUFFQTtBQUVBOzs7QUNIRSxJQURGLE9BQ1U7QUFDUixJQUZGLFVBRWE7QUFDWCxJQUhGLGNBR2lCOzs7QUNIakIsZUFBUyxzQkFBYTs7O0FDQ3RCOzs7QUNEQTtBQUFBLE9BQ0U7QUFBQSxRQUNBO0FBQUE7QUFBQTs7O0FDRkY7QUFDQTtBQUNBO0FBc0ZPLFNBQVMsUUFBUSxHQUFHO0FBQ3pCLFNBQU8sTUFBTSxXQUFXLFlBQVk7QUFBQTtBQTNFdEMsSUFBTSxTQUFTO0FBQUEsRUFDYixRQUFRO0FBQUEsRUFDUixNQUFNO0FBQUEsRUFDTixRQUFRO0FBQUEsRUFDUixNQUFNO0FBQUEsRUFDTixPQUFPO0FBQUEsRUFDUCxXQUFXO0FBQUEsRUFDWCxZQUFZO0FBQ2Q7QUFFTyxJQUFNLGVBQWU7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFDTixPQUFPLE9BQU87QUFBQSxFQUVkLFNBQVMsT0FBTztBQUFBLEVBQ2hCLE1BQU0sT0FBTztBQUFBLEVBQ2IsVUFBVSxPQUFPO0FBQUEsRUFDakIsWUFBWSxPQUFPO0FBQUEsRUFDbkIs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QSxHQUNSO0FBRUQsU0FBTztBQUFBOzs7QUNwRVQ7QUFDQTtBQUNBO0FBdUJBLGVBQXNCLFNBQVMsQ0FBQyxLQUFhLGdCQUFnQixNQUFNO0FBQ2pFLFFBQU0sU0FBUyxNQUFNLElBQUksU0FBUyxHQUFHO0FBQ3JDLFNBQU8sS0FDTCxPQUNFLE9BQU8sT0FBTyxDQUFDLE1BQU0sRUFBRSxhQUFhLGFBQWEsR0FDakQsQ0FBQyxNQUFNLEVBQUUsVUFDWCxDQUNGLEdBQUc7QUFBQTtBQTVCRSxJQUFNLE1BQU0sSUFBSSxrQkFBa0I7QUFFbEMsSUFBTSxVQUFVLENBQUMsS0FBYSxZQUFZLE9BQTJCO0FBQzFFLFFBQU0sT0FBTyxPQUFlO0FBQzVCLFFBQU0sSUFBSSxPQUFPLENBQUM7QUFFbEIsUUFBTSxNQUFNLFlBQVk7QUFDdEIsUUFBSSxJQUFJLFVBQVUsWUFBWSxFQUFFLFNBQVM7QUFDdkMsWUFBTSxJQUFJLE1BQU0sVUFBVSxHQUFHO0FBQzdCLFFBQUUsV0FBVztBQUNiLFVBQUk7QUFBRyxhQUFLLFVBQVU7QUFBQSxJQUN4QjtBQUFBO0FBR0YsWUFBVSxNQUFNO0FBQ2QsUUFBSTtBQUFBLEtBQ0gsQ0FBQyxHQUFHLENBQUM7QUFFUixTQUFPLEtBQUs7QUFBQTs7O0FDdEJkLGtCQUFTOzs7QUNHVDsiLAogICJkZWJ1Z0lkIjogIjVBNTIzNjZEQTBGOEE5MjA2NDc1NmUyMTY0NzU2ZTIxIiwKICAibmFtZXMiOiBbXQp9
