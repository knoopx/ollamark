import {
  Box as InkBox,
  Text as InkText,
  Transform,
  type TextProps,
  type BoxProps,
} from "ink"

import type {
  List,
  ListItem,
  Nodes as MdastNodes,
  Node,
  Parent,
  Table,
  TableRow,
  Text,
} from "mdast"

import {
  Theme,
  defaultTheme,
  useTheme,
  highlightTheme,
  ThemeContext,
} from "./theming"

import { compact } from "mdast-util-compact"
import { fromMarkdown } from "mdast-util-from-markdown"
import { gfm } from "micromark-extension-gfm"
import { gfmFromMarkdown, gfmToMarkdown } from "mdast-util-gfm"
import { highlight, supportsLanguage } from "cli-highlight"
import { jsx } from "react/jsx-runtime"
import { selectAll } from "unist-util-select"
import { toMarkdown } from "mdast-util-to-markdown"
import { unified } from "unified"
import { visit } from "unist-util-visit"
import InkLink from "ink-link"
import React, { useContext } from "react"
import rehypeParse from "rehype-parse"
import rehypeRemark from "rehype-remark"
import remarkEmoji from "remark-emoji"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import remarkStringify from "remark-stringify"
import tinycolor from "tinycolor2"
import type { ElementType, ReactElement, ReactNode } from "react"

export function html2md(corpus: string): string {
  return String(
    unified()
      .use(rehypeParse)
      .use(rehypeRemark)
      .use(remarkGfm)
      .use(remarkEmoji)
      .use(remarkMath)
      .use(remarkStringify)
      .processSync(corpus),
  )
}

export function mdast2md(tree: MdastNodes) {
  return toMarkdown(tree, { extensions: [gfmToMarkdown()] })
}

export function md2mdast(corpus: string) {
  const tree = fromMarkdown(corpus, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  })
  compact(tree)
  return tree
}

const TextStyleContext = React.createContext<TextProps>({})
const TextStyle = ({ children, ...props }: TextProps) => (
  <TextStyleContext.Provider value={props}>
    {children}
  </TextStyleContext.Provider>
)

const styled =
  (
    fn: ({ theme, context }: { theme: Theme; context: TextProps }) => TextProps,
  ) =>
  ({ children }: { children: ReactNode }) => {
    const theme = useTheme()
    const context = useContext(TextStyleContext)
    const props = fn({ theme, context })
    return <TextStyle {...props}>{children}</TextStyle>
  }

const MdText = ({ value, ...props }: { value: string }) => {
  const contextProps = useContext(TextStyleContext)
  return (
    <InkText {...contextProps} {...props}>
      {value}
    </InkText>
  )
}

export const MdRoot = ({
  children,
  ...props
}: { children: ReactNode } & BoxProps) => {
  return (
    <TextStyle color={useTheme().text}>
      <InkBox {...props} flexDirection="column" gap={1}>
        {children}
      </InkBox>
    </TextStyle>
  )
}

const MdInlineCode = ({ value }: { value: string }) => (
  <InkText color={useTheme().inlineCode}>`{value}`</InkText>
)
const MdEmphasis = styled(({ context }) => ({
  italic: true,
  color: tinycolor(context.color).brighten(25).toString(),
}))
const MdStrong = styled(({ context }) => {
  return {
    bold: true,
    color: tinycolor(context.color).darken(5).toHexString(),
  }
})
const MdDelete = styled(() => ({
  strikethrough: true,
  dimColor: true,
}))

const MdHeading = ({ depth, ...n }: { depth: number; children: ReactNode }) => {
  const theme = useTheme()
  const style = { bold: true, underline: true, color: theme.heading }
  return (
    <InkBox>
      <TextStyle {...style}>
        <InkText {...style}>{"#".repeat(depth)} </InkText>
        {n.children}
      </TextStyle>
    </InkBox>
  )
}

const MdLink = ({
  url,
  ...node
}: { url: string } & { children: ReactNode }) => {
  const theme = useTheme()
  return (
    <InkLink url={url}>
      <TextStyle color={theme.link}>{node.children}</TextStyle>
    </InkLink>
  )
}

const MdParagraph = ({ children }: { children: ReactNode }) => {
  const style = useContext(TextStyleContext)
  return (
    <InkText {...style}>
      <Transform transform={(x) => x.trim()}>{children}</Transform>
    </InkText>
  )
}

const MdList = ({ children, ...props }: { children: ReactNode }) => {
  return (
    <InkBox {...props} paddingLeft={2} flexDirection="column">
      {children}
    </InkBox>
  )
}

const MdListItem = ({ children }: { children: ReactNode }) => {
  const theme = useTheme()

  return (
    <InkBox>
      <InkText color={theme.listItem}>• </InkText>
      <InkBox flexDirection="column">{children}</InkBox>
    </InkBox>
  )
}

const MdBlockQuote = ({ children }: { children: ReactNode }) => {
  const theme = useTheme()

  return (
    <TextStyleContext.Provider
      value={{
        color: theme.blockquote,
      }}
    >
      <InkBox
        flexDirection="row"
        flexGrow={0}
        flexShrink={1}
        flexWrap="wrap"
        paddingLeft={1}
        borderColor={theme.blockquote}
        borderRight={false}
        borderBottom={false}
        borderTop={false}
        borderStyle={"bold"}
      >
        <TextStyle color={theme.blockquote}>{children}</TextStyle>
      </InkBox>
    </TextStyleContext.Provider>
  )
}

const MdCode = ({ lang, value }: { lang: string; value: string }) => {
  const theme = useTheme()
  const language = supportsLanguage(lang) ? lang : "text"

  return (
    <InkBox flexDirection="column" marginLeft={1}>
      {language != "text" && (
        <InkBox flexDirection="column" marginLeft={1}>
          <InkText color={theme.muted} dimColor>
            {language}
          </InkText>
        </InkBox>
      )}
      <InkBox
        flexDirection="column"
        paddingX={1}
        borderStyle="round"
        borderColor={theme.code}
      >
        <InkText>
          {highlight(value, {
            language,
            theme: highlightTheme,
          }).trim()}
        </InkText>
      </InkBox>
    </InkBox>
  )
}

const MdThematicBreak = () => {
  return (
    <InkBox
      borderColor={useTheme().thematicBreak}
      borderStyle={"bold"}
      borderBottom={false}
      borderRight={false}
      borderLeft={false}
    />
  )
}

const MdBreak = () => {
  return <InkText>{"\n"}</InkText>
}

const MdImage = ({ alt }: { url: string; alt?: string }) => {
  // TODO: SIGSEGV, need to investigate
  // if (fs.existsSync(url)) {
  //   return <Image preserveAspectRatio src={url} alt={alt} width="50%" />
  // }
  if (alt)
    return <InkText color={useTheme().muted}>{`(<image> ${alt})`}</InkText>

  return null
}

const mdastMap = {
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
    // TODO: what to do?
  },
}

function textContent(node: Node) {
  return selectAll("text", node)
    .map((x) => (x as Text).value)
    .join()
    .trim()
}

function removeEmptyTableRows(node: Table) {
  visit(node, (n, index, parent) => {
    if (n.type == "tableRow") {
      const tableRow = n as TableRow
      if (!textContent(tableRow)) {
        const table = parent as Table
        table.children.splice(index!, 1)
      }
    }
  })
}

function removeEmptyListItems(node: List) {
  visit(node, (n, index, parent) => {
    if (n.type == "listItem") {
      const listItem = n as ListItem
      if (!textContent(listItem)) {
        const list = parent as List
        list.children.splice(index!, 1)
      }
    }
  })
}

export function toInk(text: string, theme: Theme = defaultTheme) {
  const mdastTree = md2mdast(text)

  const toJSX = (node: Node, i: number): ReactElement => {
    if (node.type == "table") {
      removeEmptyTableRows(node as Table)
      // delegate table rendering to mdast
      return <InkText key={i}>{mdast2md(node as MdastNodes)}</InkText>
    }

    if (node.type == "list") {
      removeEmptyListItems(node as List)
    }

    if (node.type in mdastMap) {
      const { type, children, position, ...props } = node as Parent
      const key = type as keyof typeof mdastMap
      return jsx(
        mdastMap[key] as ElementType,
        { ...props, children: children?.map(toJSX) },
        i,
      )
    }
    throw new Error(`Unknown type: ${node.type}`)
  }
  return (
    <ThemeContext.Provider value={theme}>
      {mdastTree.children.map(toJSX)}
    </ThemeContext.Provider>
  )
}
