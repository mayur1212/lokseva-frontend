import { spawnSync } from "node:child_process";

// Workers Builds needs the OpenNext bundle before Wrangler starts deployment.
const script = process.env.WORKERS_CI === "1" ? "build:worker" : "build:next";
const result = spawnSync(process.execPath, [process.env.npm_execpath, "run", script], {
  stdio: "inherit",
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
