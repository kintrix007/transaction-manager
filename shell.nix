let
  url = "https://github.com/NixOS/nixpkgs/archive/617eb5eea32297200e99166795e42c23a5389b1a.tar.gz";
in
{ pkgs ? import (fetchTarball url) { } }:

pkgs.mkShell {
  nativeBuildInputs = with pkgs; [
    nodePackages.typescript-language-server
    supabase-cli
    terraform-ls
    azure-cli
  ];

  buildInputs = with pkgs; [
    nodejs
  ];
}
