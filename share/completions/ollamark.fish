function __fish_complete_ollama_list
    ollama list 2>/dev/null | tail -n +2 | string replace --regex "\s.*" ""
end

# Define the command
complete -c ollamark -f

# Treat 'run' as both an explicit subcommand and the default command
# This means options should be completed regardless of whether 'run' is specified
complete -c ollamark -l "html" -d "treat input as html"
complete -c ollamark -l "json" -d "output in json"
complete -c ollamark -s "m" -l "model" -xa "(__fish_complete_ollama_list)" -d "model name (partial match supported)"
complete -c ollamark -s "s" -l "system" -d "system prompt"
complete -c ollamark -s "t" -l "temp" -d "temperature"
complete -c ollamark -s "n" -l "num-pred" -d "number of predictions"
complete -c ollamark -s "C" -l "ctx" -d "context length"
complete -c ollamark -s "r" -l "raw" -d "output the raw response"
complete -c ollamark -s "W" -l "print-width" -d "print width (default: 100)"
complete -c ollamark -s "w" -l "whole" -d "print the whole conversation"
complete -c ollamark -s "h" -l "help" -d "display help for command"

# Add 'run' as an explicit subcommand for clarity
complete -c ollamark -n "__fish_use_subcommand" -xa "run" -d "Execute a prompt"