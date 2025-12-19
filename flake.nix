{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    systems.url = "github:nix-systems/default";
    flake-parts.url = "github:hercules-ci/flake-parts";
    process-compose-flake.url = "github:Platonic-Systems/process-compose-flake";
  };
  outputs =
    inputs:
    inputs.flake-parts.lib.mkFlake { inherit inputs; } {
      systems = import inputs.systems;
      imports = [ inputs.process-compose-flake.flakeModule ];
      perSystem =
        { config, pkgs, ... }:
        {
          devShells.default = pkgs.mkShell {
            packages = with pkgs; [
              python3
              uv
              gallery-dl
              nodejs
            ];
            shellHook = ''
              unset PYTHONPATH
              uv sync
              . .venv/bin/activate
            '';
          };
          process-compose.default = {
            cli.environment.PC_DISABLE_TUI = true;
            cli.options.no-server = true;
            settings.processes = {
              backend = {
                command = "${pkgs.uv}/bin/uv run flask run --host=0.0.0.0 --debug";
              };
              frontend = {
                command = "${pkgs.nodejs}/bin/npx vite --host 0.0.0.0";
              };
            };
          };
        };
    };
}
