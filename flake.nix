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

        deps = pkgs.stdenvNoCC.mkDerivation {
          name = "ollamark-deps";
          outputHashAlgo = "sha256";
          outputHashMode = "recursive";
          outputHash = "sha256-GKgUW7U7zEMrzryfeIIIcpC1tTAYtx1eSr6PecekqIU=";

          src = ./.;

          dontUnpack = true;

          buildPhase = ''
            cp $src/package.json .
            cp $src/bun.lockb .
            ${lib.getExe pkgs.bun} install --frozen-lockfile
          '';

          installPhase = ''
            mkdir -p $out
            cp -r node_modules $out/
            rm -rf $out/node_modules/.bin
          '';
        };

        pkg = pkgs.stdenvNoCC.mkDerivation {
          name = "ollamark";

          nativeBuildInputs = [pkgs.installShellFiles];

          src = ./.;

          buildPhase = ''
            ln -s ${deps}/node_modules ./node_modules
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
