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

        # Dependencies derivation - installs node_modules
        deps = pkgs.stdenvNoCC.mkDerivation {
          name = "ollamark-deps";
          outputHashAlgo = "sha256";
          outputHashMode = "recursive";
          outputHash = "sha256-vtJOQgt+JG4hUdCJ+5b/68OSqg01w4ATaNBj9C0M3ng=";

          src = ./package.json;

          dontUnpack = true;

          buildPhase = ''
            cp $src package.json
            ${lib.getExe pkgs.bun} install --frozen-lockfile
          '';

          installPhase = ''
            mkdir -p $out
            cp -r node_modules $out/
            rm -rf $out/node_modules/.bin
          '';
        };

        # Build derivation - builds the application using the deps
        pkg = pkgs.stdenvNoCC.mkDerivation {
          name = "ollamark";

          nativeBuildInputs = [pkgs.installShellFiles];

          src = ./.;

          buildPhase = ''
            # Link dependencies
            ln -s ${deps}/node_modules ./node_modules

            # Build the application
            ${lib.getExe pkgs.bun} run dist
          '';

          installPhase = ''
            mkdir -p $out/share/ollamark
            cp -r dist/ollamark.* $out/share/ollamark/
            cp -r ${deps}/node_modules $out/share/ollamark/
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
