function __fish_complete_ollama_list
    ollama list 2>/dev/null | tail -n +2 | string replace --regex "\s.*" ""
end

complete -c ollamark -f -a "(__fish_complete_ollama_list)" --condition '__fish_seen_subcommand_from -m'
complete -c ollamark -f -a "(__fish_complete_ollama_list)" --condition '__fish_seen_subcommand_from --model'

# TODO: add further completions
