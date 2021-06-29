import { program } from "commander";
import { spawn } from "child_process";
import * as dotenv from "dotenv";
import * as path from "path";
import * as chalk from "chalk";
import setupEventSub from "./eventsub";

function spawnProcess(command: string, args: string[]) {
  console.log(chalk.bold.green(`${command} ${args.join(" ")}`));
  return new Promise(function (resolve, reject) {
    const proc = spawn(command, args, { windowsHide: true });

    const chunks = [];
    proc.stdout.on("data", (data) => {
      const str = data.toString();
      process.stdout.write(str);
      chunks.push(str);
    });
    proc.stderr.on("data", (data) => {
      process.stderr.write(data.toString());
    });

    proc.addListener("error", reject);
    proc.addListener("exit", (code) => {
      if (code) reject(code);
      resolve(chunks.join(""));
    });
  });
}

program.option("-p, --production", "Use production environment").parse();
const options = program.opts();

dotenv.config({
  path: path.resolve(
    process.cwd(),
    options.production ? ".env.production" : ".env.development"
  ),
});

process.chdir(path.join(__dirname, ".."));

(async function () {
  const commands: [string, string[]][] = [
    ["firebase", ["use", options.production ? "production" : "staging"]],
    ["yarn", ["get:config"]],
    ["yarn", ["get:logo"]],
    ["firebase", ["deploy"]],
  ];

  let result;
  for (const command of commands) {
    result = await spawnProcess(...command);
  }

  const match = result.match(/\(twitch_callback.*\): (.*)$/m);
  if (!match) {
    throw new Error("Callback URL not found!");
  }
  await setupEventSub(match[1]);
})().catch((err) => {
  console.log(`[${chalk.yellow("noti")}]`, chalk.red("\u26a0"), err);
  process.exit(1);
});
