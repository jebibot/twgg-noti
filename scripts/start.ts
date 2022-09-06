import chalk from "chalk";
import dotenv from "dotenv";
import ngrok from "ngrok";
import path from "path";
import { spawn } from "child_process";
import setupEventSub from "./eventsub";

import type { ChildProcessWithoutNullStreams } from "child_process";

const split = (str: string) => str.trim().split(/\n/);
const b = (str: string) => `[${str}]`;

function spawnProcess(
  tag: string,
  command: string,
  args?: string[],
  env?: { [key: string]: string },
  onData?: (msg: string) => void
) {
  console.log(b(tag), chalk.bold.green(`${command} ${args?.join(" ")}`));
  const proc = spawn(command, args, {
    env: { ...process.env, ...env },
    windowsHide: true,
  });

  proc.stdout.on("data", (data) => {
    split(data.toString()).forEach((msg) => {
      console.log(b(tag), msg);
      onData?.(msg);
    });
  });

  proc.stderr.on("data", (data) => {
    split(data.toString()).forEach((msg) => {
      console.log(b(tag), chalk.bold.red("\u26a0"), msg);
    });
  });
  return proc;
}

const TAG = `[${chalk.bold.yellow("noti")}]`;
const PORTS = {
  devSever: 3000,
  functions: 5001,
};
const GOOGLE_APPLICATION_CREDENTIALS = path.resolve(
  __dirname,
  "..",
  "service-account-key.json"
);

dotenv.config({
  path: path.resolve(process.cwd(), ".env.development"),
});

process.chdir(path.join(__dirname, ".."));

let emulators: ChildProcessWithoutNullStreams;
let devServer: ChildProcessWithoutNullStreams;
process.on("SIGINT", () => {
  ngrok.kill();
  emulators?.kill("SIGINT");
  devServer?.kill("SIGINT");
});

(async function () {
  const devServerTunnel = await ngrok.connect({
    addr: PORTS.devSever,
    host_header: `${process.env.HOST ?? "localhost"}:${PORTS.devSever}`,
    region: (process.env.NGROK_REGION as ngrok.Ngrok.Region) ?? "us",
    onLogEvent: (data) =>
      split(data).forEach((msg) =>
        console.log(b(chalk.bold.blue("ngrok")), msg)
      ),
  });
  const functionsTunnel = await ngrok.connect({
    addr: PORTS.functions,
    bind_tls: true,
  });

  let resolve: (val: string) => void;
  const functionsUrl = new Promise<string>((r) => {
    resolve = r;
  });
  emulators = spawnProcess(
    chalk.bold.red("firebase"),
    "yarn",
    ["run", "start:emulators"],
    {
      GOOGLE_APPLICATION_CREDENTIALS,
    },
    (msg: string) => {
      const match = msg.match(
        /functions\[us-central1-twitch_callback\]:[^(]*\((.[^)]*)\)/
      );
      if (match) {
        resolve(match[1]);
      }
    }
  );
  const url = (await functionsUrl).replace(
    `http://localhost:${PORTS.functions}`,
    functionsTunnel
  );

  devServer = spawnProcess(
    chalk.bold.green("devserver"),
    "yarn",
    ["run", "start:server"],
    {
      BROWSER: "none",
    }
  );

  await setupEventSub(url);

  console.log(TAG, "Done!", devServerTunnel);
})().catch((err) => {
  console.log(TAG, chalk.bold.red("\u26a0"), err);
  process.exit(1);
});
