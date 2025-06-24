{ pkgs }: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_20
    pkgs.yarn
    (pkgs.python312.withPackages (ps:
      with ps; [
        fastapi
        pydantic
        uvicorn
        # Dependencies for uvicorn[standard]
        httptools
        uvloop
        websockets
        watchfiles
      ]))
  ];
  idx.extensions = [
    "svelte.svelte-vscode"
    "vue.volar"
  ];
  # Expose secrets managed by IDX to the environment.
  # Add these secrets in the IDX UI (wrench icon > Secrets).
  env = {
    VITE_SUPABASE_URL = pkgs.lib.getEnv "VITE_SUPABASE_URL";
    VITE_SUPABASE_ANON_KEY = pkgs.lib.getEnv "VITE_SUPABASE_ANON_KEY";
    VITE_SUPABASE_SERVICE_ROLE_KEY = pkgs.lib.getEnv "VITE_SUPABASE_SERVICE_ROLE_KEY";
    VITE_GOOGLE_AI_API_KEY = pkgs.lib.getEnv "VITE_GOOGLE_AI_API_KEY";
  };
  idx.previews = {
    web = {
      command = ["yarn" "run" "dev" "--" "--port" "8080" "--host" "0.0.0.0"];
      manager = "web";
    };
  };
}