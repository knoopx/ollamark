import { Box, Static, Text, render } from "ink";
import { Command } from "commander";
import { Message } from "../components/Message";
import { readTTYStream } from "../support/util";
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

abstract class BaseRunner {
  protected conversation: {
    role: "system" | "user" | "assistant";
    content: string;
  }[] = [];
  protected modelName: string;

  constructor(
    protected prompt: string,
    protected stdin: string | undefined,
    protected options: RunOptions,
    protected models: ModelResponse[]
  ) {
    this.prepareConversation();
    this.modelName = this.findModel();
  }

  private prepareConversation(): void {
    if (this.options.system) {
      let system = this.options.system;
      if (fs.existsSync(system)) {
        system = fs.readFileSync(system, "utf8");
      }
      this.conversation.push({ role: "system", content: system });
    }

    let prompt = this.prompt;
    if (fs.existsSync(prompt)) {
      prompt = fs.readFileSync(prompt, "utf8");
    }

    if (this.stdin) {
      if (prompt.length) {
        prompt = `${prompt}\n\n${this.stdin}`;
      } else {
        prompt = this.stdin;
      }
    }

    this.conversation.push({
      role: "user",
      content: prompt,
    });
  }

  private findModel(): string {
    const match = this.models
      .map(({ name }) => name)
      .find((name) =>
        name.toLowerCase().includes(this.options.model?.toLowerCase())
      );

    if (!match) {
      const message = this.options.model
        ? `No model matches ${this.options.model}`
        : `No model specified`;

      this.handleError(message);
    }

    return match!;
  }

  protected abstract handleError(message: string): void;

  protected async createChatResponse() {
    return await ollama.chat({
      messages: this.conversation,
      model: this.modelName,
      format: this.options.json ? "json" : undefined,
      options: {
        temperature: this.options.temp,
        num_predict: this.options.numPred,
        num_ctx: this.options.ctx,
      },
      stream: true,
    });
  }

  abstract run(): Promise<void>;
}

class RawRunner extends BaseRunner {
  protected handleError(message: string): void {
    process.stderr.write(`${message}\n`);
    process.exit(1);
  }

  async run(): Promise<void> {
    const response = await this.createChatResponse();

    for await (const chunk of response) {
      process.stdout.write(chunk.message.content);
    }
  }
}

type InteractiveRunnerProps = {
  runner: InteractiveRunner;
};

class InteractiveRunner extends BaseRunner {
  private setBuffer?: (buffer: string | ((prev: string) => string)) => void;

  constructor(
    prompt: string,
    stdin: string | undefined,
    options: RunOptions,
    models: ModelResponse[]
  ) {
    super(prompt, stdin, options, models);

    // Set up shutdown handler for interactive mode (with cursor reset)
    const shutdown = () => {
      process.stdout.write("\x1b[?25h"); // reset cursor
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("exit", shutdown);
  }

  protected handleError(message: string): void {
    throw new Error(message);
  }

  setBufferSetter(
    setBuffer: (buffer: string | ((prev: string) => string)) => void
  ) {
    this.setBuffer = setBuffer;
  }

  async run(): Promise<void> {
    const response = await this.createChatResponse();

    for await (const chunk of response) {
      if (this.setBuffer) {
        this.setBuffer((buffer: string) => buffer + chunk.message.content);
      }
    }
  }

  getConversation() {
    return this.conversation;
  }
}

const InteractiveRunnerComponent = ({ runner }: InteractiveRunnerProps) => {
  const [buffer, setBuffer] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      runner.setBufferSetter(setBuffer);
      runner.run().catch((err) => setError(err.message));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [runner]);

  if (error) {
    return <Text>{error}</Text>;
  }

  return (
    <Box
      flexDirection="column"
      flexWrap="wrap"
      width={runner["options"].printWidth}
    >
      {runner["options"].whole && (
        <Static items={runner.getConversation()}>
          {(props, i) => (
            <Message key={i} role={props.role} {...runner["options"]}>
              <Renderer content={props.content} />
            </Message>
          )}
        </Static>
      )}

      <Message key="buffer" role="assistant" {...runner["options"]}>
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
      const prompt = parts.join(" ");

      const normalizedOptions = {
        ...options,
        temp: Number(options.temp),
        numPred: Number(options.numPred),
        ctx: Number(options.ctx),
        printWidth: Number(options.printWidth),
      };

      // Handle raw mode without Ink to avoid ANSI codes
      if (options.raw || options.json) {
        const runner = new RawRunner(
          prompt,
          stdin,
          normalizedOptions,
          models.models
        );
        await runner.run();
        return;
      }

      // Handle interactive mode with Ink
      const runner = new InteractiveRunner(
        prompt,
        stdin,
        normalizedOptions,
        models.models
      );

      render(<InteractiveRunnerComponent runner={runner} />);
    });
