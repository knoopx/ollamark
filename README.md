# ollamark

ollamark is a command-line client for [Ollama](https://ollama.com/) with markdown support.

Install ollamark using your preferred package manager (`bun` is recommended).

### Installation

#### Using npm/bun
```bash
npm install -g https://github.com/knoopx/ollamark
```

#### Using Nix Flakes
```bash
# Try without installing
nix run github:knoopx/ollamark -- --help

# Install globally
nix profile install github:knoopx/ollamark
```

#### NixOS Integration

Add to your flake inputs:
```nix
{
  inputs.ollamark.url = "github:knoopx/ollamark";
}
```

**Using the overlay:**
```nix
{
  nixpkgs.overlays = [ inputs.ollamark.overlays.default ];
  environment.systemPackages = [ pkgs.ollamark ];
}
```

**Using the NixOS module:**
```nix
{
  imports = [ inputs.ollamark.nixosModules.default ];
  programs.ollamark.enable = true;
}
```

### Usage

```text
Usage: ollamark run [options] <prompt...>

Execute a prompt

Options:
  --html                     treat input as html
  --json                     output in json
  -m, --model <string>       model name (partial match supported)
  -s, --system <string>      system prompt
  -t, --temp <value>         temperature
  -n, --num-pred <value>     number of predictions
  -C, --ctx <value>          context length
  -r, --raw                  output the raw response
  -W, --print-width <chars>  print width (default: "100")
  -w, --whole                print the whole conversation
  -h, --help                 display help for command
```

### Examples

```bash
# coding assistance
ollamark -m magicoder "how to loop a javascript array"

# parsing text
ollamark -m hermes "2x eggs, 1x chicken breast" --json -s "{ items: {name: string; quantity: number }[] }"

# git commit message
git diff | ollamark -t 0.3  -m hermes "one-line summary of the changes" --raw
```

### Demo

[![asciicast](https://asciinema.org/a/fE9LzZxhJeaFeI5sHIu2lrYc0.svg)](https://asciinema.org/a/fE9LzZxhJeaFeI5sHIu2lrYc0)
