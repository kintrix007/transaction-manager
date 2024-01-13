let
  url = "https://github.com/NixOS/nixpkgs/archive/08d0afbbdf91192d8753bca6c0f492bd58070400.tar.gz";
in
{ pkgs ? import (fetchTarball url) { } }:

pkgs.mkShell {
  nativeBuildInputs = with pkgs; [
    nodePackages.typescript-language-server
    supabase-cli
  ];

  buildInputs = with pkgs; [
    nodejs
  ];
}
