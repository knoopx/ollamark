import { Box, Static, Text, render } from "ink";
import { Command } from "commander";
import { Message, type MessageProps } from "../components/Message";
import { readTTYStream } from "../support/util";
import { guessMime } from "../support/mime";
import { MdRoot, toInk } from "../support/markdown";
import { useEffect, useState } from "react";
import ollama, { type ModelResponse } from "ollama";
import Spinner from "ink-spinner";
import { highlight, supportsLanguage } from "cli-highlight";
import fs from "node:fs";

type RendererProps = { content: string; mime?: string };
const Renderer = ({ content, mime = "md" }: RendererProps) => {
  if (mime == "md") {
    return <MdRoot>{toInk(content)}</MdRoot>;
  }
  if (mime && supportsLanguage(mime)) {
    return <Text>{highlight(content, { language: mime })}</Text>;
  }
  return <Text>{content}</Text>;
};

type RunOptions = {
  model: string;
  system?: string;
  whole?: boolean;
  json?: boolean;
  html?: boolean;
  raw?: boolean;
  temp?: number;
  numPred?: number;
  ctx?: number;
  printWidth?: number;
};

type RunProps = {
  stdin: RendererProps | undefined;
  prompt: string;
  options: RunOptions;
  models: ModelResponse[];
};

const RunCommand = ({ stdin, prompt, options, models }: RunProps) => {
  let conversation: (RendererProps & Pick<MessageProps, "role">)[] = [];
  let [buffer, setBuffer] = useState("");

  if (options.system) {
    let system = options.system!;
    if (fs.existsSync(system)) {
      system = fs.readFileSync(system, "utf8");
    }
    conversation.push({ role: "system", content: system });
  }

  if (fs.existsSync(prompt)) {
    prompt = fs.readFileSync(prompt, "utf8");
  }

  if (stdin) {
    if (prompt.length) {
      prompt = `${prompt}\n\n${stdin.content}`;
    } else {
      prompt = stdin.content;
    }
  }

  conversation.push({
    role: "user",
    content: prompt,
  });

  const match = models
    .map(({ name }) => name)
    .find((name) => name.toLowerCase().includes(options.model?.toLowerCase()));

  if (match) {
    options.model = match;
  } else {
    return (
      <Text>
        {options.model
          ? `No model matches ${options.model}`
          : `No model specified`}
      </Text>
    );
  }

  async function run() {
    const response = await ollama.chat({
      messages: conversation,
      model: options.model,
      format: options.json ? "json" : undefined,
      options: {
        temperature: options.temp,
        num_predict: options.numPred,
        num_ctx: options.ctx,
      },
      stream: true,
    });

    for await (const chunk of response) {
      setBuffer((buffer: string) => buffer + chunk.message.content);
    }
  }

  useEffect(() => {
    run();
  }, []);

  if (options.raw || options.json) {
    return <Text>{buffer}</Text>;
  }

  return (
    <Box flexDirection="column" flexWrap="wrap" width={options.printWidth}>
      {options.whole && (
        <Static items={conversation}>
          {(props, i) => (
            <Message key={i} {...props} {...options}>
              <Renderer {...props} />
            </Message>
          )}
        </Static>
      )}

      <Message key="buffer" role="assistant" {...options}>
        {buffer ? (
          <Renderer content={buffer} />
        ) : (
          <Text>
            <Spinner type="simpleDotsScrolling" />
          </Text>
        )}
      </Message>
    </Box>
  );
};

export default (ollamark: Command) =>
  ollamark
    .command("run", { isDefault: true })
    .description("Execute a prompt")
    .argument("<prompt...>", "the prompt")
    .option("--html", "treat input as html")
    .option("--json", "output in json")
    .option("-m, --model <string>", "model name (partial match supported)")
    .option("-s, --system <string>", "system prompt")
    .option("-t, --temp <value>", "temperature")
    .option("-n, --num-pred <value>", "number of predictions")
    .option("-C, --ctx <value>", "context length")
    .option("-r, --raw", "output the raw response")
    .option("-W, --print-width <chars>", "print width", "100")
    .option("-w, --whole", "print the whole conversation", false)
    .action(async (parts: string[], options: RunOptions) => {
      const models = await ollama.list();
      const stdin = await readTTYStream(process.stdin, !!options.html);
      render(
        <RunCommand
          models={models.models}
          stdin={
            stdin ? { content: stdin, mime: await guessMime(stdin) } : undefined
          }
          prompt={parts.join(" ")}
          options={{
            ...options,
            temp: Number(options.temp),
            numPred: Number(options.numPred),
            ctx: Number(options.ctx),
            printWidth: Number(options.printWidth),
          }}
        />
      );
    });
