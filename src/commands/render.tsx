import { render } from "ink"
import { Command } from "commander"
import { readStdInOrFile } from "../support/util"
import { MdRoot, toInk } from "../support/markdown"

type RenderOptions = {
  printWidth?: string
  html?: boolean
}

export default (ollamark: Command) =>
  ollamark
    .description("Render markdown")
    .command("render")
    .argument("[file]", "file to render")
    .option("--html", "treat input as html")
    .option("--print-width <chars>", "print width", "120")
    .action(async (file: string, options: RenderOptions) => {
      let input = await readStdInOrFile(file, !!options.html)
      render(<MdRoot width={Number(options.printWidth)}>{toInk(input)}</MdRoot>)
    })
