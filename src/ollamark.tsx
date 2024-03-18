#!/usr/bin/env node

import ollama from "ollama"

import { Command } from "commander"
import { name, description, version } from "../package.json"

import registerRunCommand from "./commands/run"
import registerRenderCommand from "./commands/render"
import registerAstCommand from "./commands/ast"

const program = new Command()
program.name(name).description(description).version(version)

registerRunCommand(program)
registerRenderCommand(program)
registerAstCommand(program)

program.parse()

process.on("SIGINT", shutdown)
process.on("exit", shutdown)

function shutdown() {
  ollama.abort()
  process.stdout.write("\x1b[?25h") // reset cursor
}
