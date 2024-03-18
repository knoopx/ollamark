import { html2md } from "./markdown"
import { createReadStream } from "node:fs"

export async function readStream(
  stream: NodeJS.ReadableStream,
): Promise<string> {
  const chunks: string[] = []
  for await (const chunk of stream) {
    chunks.push(chunk.toString())
  }
  return chunks.join("").trim()
}

export async function readTTYStream(
  stream: typeof process.stdin,
  html: boolean,
): Promise<string | undefined> {
  const output = stream.isTTY ? undefined : await readStream(stream)
  if (output && html) return html2md(output)
  return output
}

export async function readStdInOrFile(
  file: string,
  html: boolean,
): Promise<string> {
  let output = await readStream(process.stdin)
  if (!output) {
    output = await readStream(createReadStream(file))
  }
  if (html) return html2md(output)
  return output
}

export function capitalize(str: string) {
  if (str.length < 2) return str
  return str[0]!.toUpperCase() + str.slice(1)
}

export function dumbFormat(xmlLike: string) {
  var formatted = ""
  var reg = /(>)(<)(\/*)/g
  xmlLike = xmlLike.replace(reg, "$1\r\n$2$3")
  var pad = 0
  const parts = xmlLike.split("\r\n")
  parts.forEach((node) => {
    var indent = 0
    if (node.match(/.+<\/\w[^>]*>$/)) {
      indent = 0
    } else if (node.match(/^<\/\w/)) {
      if (pad != 0) {
        pad -= 1
      }
    } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
      indent = 1
    } else {
      indent = 0
    }

    var padding = ""
    for (var i = 0; i < pad; i++) {
      padding += "  "
    }

    formatted += padding + node + "\r\n"
    pad += indent
  })

  return formatted
}
