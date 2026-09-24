module.exports = {
  apps: [
    {
      name: "valqore-backend",
      script: "npm",
      args: "start",
      cwd: "./backend",
      env: {
        NODE_ENV: "production",
      }
    },
    {
      name: "valqore-frontend",
      script: "npx",
      args: "-y serve -s dist -l 5173",
      cwd: "./frontend",
      env: {
        NODE_ENV: "production",
      }
    }
  ]
};
