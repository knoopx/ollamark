import React from "react"
import chalk from "chalk"
import { identity } from "lodash-es"

// TODO: Improve default theme

// #ff628c
// #fad000
// #ff9d00
// #a5ff90
// #a599e9
// #9effff
// #2D2B55

const colors = {
  yellow: "#fad000",
  pink: "#ff628c",
  purple: "#b362ff",
  cyan: "#9effff",
  green: "#a5ff90",
  dimPurple: "#a599e9",
  darkPurple: "#2D2B55",
}

export const defaultTheme = {
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
  thematicBreak: colors.darkPurple,
}

export const highlightTheme = {
  "keyword": chalk.hex(defaultTheme.inlineCode),
  "built_in": chalk.hex(defaultTheme.inlineCode),
  "type": chalk.hex(defaultTheme.inlineCode),
  "literal": chalk.hex(defaultTheme.emphasis),
  "number": chalk.hex(defaultTheme.emphasis),
  "regexp": chalk.hex(defaultTheme.emphasis),
  "string": chalk.hex(defaultTheme.emphasis),
  "subst": chalk.hex(defaultTheme.emphasis),
  "symbol": chalk.hex(defaultTheme.inlineCode),
  "class": chalk.hex(defaultTheme.inlineCode),
  "function": chalk.hex(defaultTheme.inlineCode),
  "title": identity,
  "params": identity,
  "comment": chalk.hex(defaultTheme.muted),
  "doctag": chalk.hex(defaultTheme.link),
  "meta": chalk.hex(defaultTheme.link),
  "meta-keyword": chalk.hex(defaultTheme.link),
  "meta-string": chalk.hex(defaultTheme.link),
  "section": chalk.hex(defaultTheme.link),
  "tag": chalk.hex(defaultTheme.link),
  "name": chalk.hex(defaultTheme.emphasis),
  "builtin-name": chalk.hex(defaultTheme.emphasis),
  "attr": chalk.hex(defaultTheme.listItem),
  "attribute": chalk.hex(defaultTheme.listItem),
  "variable": chalk.hex(defaultTheme.listItem),
  "bullet": chalk.hex(defaultTheme.listItem),
  "code": chalk.hex(defaultTheme.code),
  "emphasis": chalk.hex(defaultTheme.emphasis),
  "strong": chalk.hex(defaultTheme.strong),
  "formula": chalk.hex(defaultTheme.inlineCode),
  "link": chalk.hex(defaultTheme.link),
  "quote": chalk.hex(defaultTheme.blockquote),
  "selector-tag": chalk.hex(defaultTheme.link),
  "selector-id": chalk.hex(defaultTheme.link),
  "selector-class": chalk.hex(defaultTheme.link),
  "selector-attr": chalk.hex(defaultTheme.link),
  "selector-pseudo": chalk.hex(defaultTheme.link),
  "template-tag": chalk.hex(defaultTheme.link),
  "template-variable": chalk.hex(defaultTheme.link),
  "addition": chalk.hex(defaultTheme.strong),
  "deletion": chalk.hex(defaultTheme.link),
  "default": identity,
}

export type Theme = typeof defaultTheme
export const ThemeContext = React.createContext<Theme>(defaultTheme)

export function useTheme() {
  return React.useContext(ThemeContext)
}
