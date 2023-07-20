import chalk from "chalk";
import dotenv from "dotenv";
import path from "path";
import { ApiClient } from "@twurple/api";
import { ClientCredentialsAuthProvider } from "@twurple/auth";
import { program } from "commander";

import type { HelixEventSubSubscription } from "@twurple/api";

const TAG = `[${chalk.bold.cyan("eventsub")}]`;

const logSubscription = (sub: HelixEventSubSubscription) =>
  console.log(TAG, sub.id, sub.type, sub.condition, sub.status);

async function setupEventSub(url?: string) {
  if (url) {
    console.log(TAG, "Setting EventSub for", url);
  } else {
    console.log(TAG, "Removing EventSub");
  }

  const authProvider = new ClientCredentialsAuthProvider(
    process.env.TWITCH_CLIENT_ID ?? "",
    process.env.TWITCH_CLIENT_SECRET ?? "",
  );
  const apiClient = new ApiClient({ authProvider });

  const streamers = new Set(
    (process.env.REACT_APP_STREAMER_LIST ?? "").split(",").map((s) => s.trim()),
  );
  const secret = process.env.TWITCH_WEBHOOK_SECRET;

  const subscriptions = await apiClient.eventSub.getSubscriptions();

  for (const sub of subscriptions.data) {
    logSubscription(sub);
    const broadcaster_user_id = sub.condition.broadcaster_user_id as string;
    if (
      streamers.has(broadcaster_user_id) &&
      sub._transport.method === "webhook" &&
      sub._transport.callback === url
    ) {
      streamers.delete(broadcaster_user_id);
    } else {
      console.log(TAG, "Removing", sub.id);
      await sub.unsubscribe();
    }
  }

  if (!url || !secret) {
    return;
  }
  for (const streamer of streamers) {
    const sub = await apiClient.eventSub.subscribeToChannelUpdateEvents(
      streamer,
      {
        method: "webhook",
        callback: url,
        secret,
      },
    );
    logSubscription(sub);
  }
}

if (require.main === module) {
  program.option("-p, --production", "Use production environment").parse();
  const options = program.opts();

  dotenv.config({
    path: path.resolve(
      process.cwd(),
      options.production ? ".env.production" : ".env.development",
    ),
  });

  setupEventSub().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export default setupEventSub;
