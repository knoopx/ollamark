{
  description = "Ollamark - A command-line client for Ollama with markdown support";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = nixpkgs.legacyPackages.${system};
        lib = pkgs.lib;

        pkg = pkgs.stdenvNoCC.mkDerivation {
          name = "ollamark";
          outputHashAlgo = "sha256";
          outputHashMode = "recursive";
          outputHash = "sha256-AFePRW+c100yZaPaQ94PjJNMSR7gBbP23kNGEZqSyfM=";

          nativeBuildInputs = [pkgs.installShellFiles];

          src = ./.;

          buildPhase = ''
            ${lib.getExe pkgs.bun} install
            ${lib.getExe pkgs.bun} run dist
          '';

          installPhase = ''
            mkdir -p $out/share/ollamark
            cp -r dist/ollamark.* $out/share/ollamark/
          '';

          postInstall = ''
            installShellCompletion share/completions/ollamark.fish
          '';
        };

        wrapper = pkgs.writeShellApplication {
          name = "ollamark";
          text = ''
            exec ${lib.getExe pkgs.bun} "${pkg}/share/ollamark/ollamark.js" "$@"
          '';
        };

        ollamark = pkgs.symlinkJoin {
          name = "ollamark";
          paths = [
            wrapper
            pkg
          ];
        };
      in {
        packages.default = ollamark;
        packages.ollamark = ollamark;

        apps.default = {
          type = "app";
          program = "${ollamark}/bin/ollamark";
        };
      }
    )
    // {
      overlays.default = final: prev: {
        ollamark = self.packages.${final.system}.ollamark;
      };
    };
}
