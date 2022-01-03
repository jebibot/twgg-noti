import { useState, useEffect } from "react";
import * as Sentry from "@sentry/browser";
import Streamer from "./Streamer";
import streamerInfo from "../info";
import Twitch from "../api/Twitch";

import type { Channels } from "../api/Twitch";

type StreamerListProps = {
  streamers: string[];
};

function SteamerList({ streamers }: StreamerListProps) {
  const [channels, setChannels] = useState<Channels>({});

  useEffect(() => {
    let abortController: AbortController | undefined;
    if ("AbortController" in window) {
      abortController = new AbortController();
    }

    const twitch = new Twitch(abortController?.signal);
    twitch
      .getChannels(streamers)
      .then(setChannels)
      .catch((err) => {
        Sentry.captureException(err);
      });

    return () => {
      abortController?.abort();
    };
  }, [streamers]);

  return (
    <ul className="list-group">
      {streamers.map((userId: string) => (
        <Streamer
          key={userId}
          userId={userId}
          info={streamerInfo[userId]}
          channel={channels[userId]}
        />
      ))}
    </ul>
  );
}

export default SteamerList;
