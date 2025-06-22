{pkgs}: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_20
    pkgs.yarn
  ];
  idx.extensions = [
    "svelte.svelte-vscode"
    "vue.volar"
  ];
  idx.previews = {
    previews = {
      web = {
        command = [
          "yarn"
          "run"
          "dev"
          "--"
          "--port"
          "8080"
          "--host"
          "0.0.0.0"
        ];
        manager = "web";
      };
    };
  };
}