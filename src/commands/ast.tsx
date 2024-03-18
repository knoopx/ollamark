import { Command } from "commander"
import { highlightTheme } from "../support/theming"
import { readStdInOrFile, dumbFormat } from "../support/util"
import { renderToStaticMarkup } from "react-dom/server"
import { toInk } from "../support/markdown"
import { highlight } from "cli-highlight"

type RenderOptions = {
  printWidth?: string
  html?: boolean
}

export default (ollamark: Command) =>
  ollamark
    .command("ast")
    .description("Inspect the rendered AST of a markdown file")
    .argument("[file]", "file to render")
    .option("--html", "treat input as html")
    .option("--print-width <chars>", "print width", "120")
    .action(async (file: string, options: RenderOptions) => {
      let input = await readStdInOrFile(file, !!options.html)
      process.stdout.write(
        highlight(dumbFormat(renderToStaticMarkup(toInk(input))), {
          language: "xml",
          theme: highlightTheme,
        }),
      )
    })
