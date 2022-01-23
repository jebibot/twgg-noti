const API_URL = "https://api.twgg.workers.dev/";

const MAX_RETRIES = 5;

export type ChannelData = {
  title: string;
  game: string;
};
export type Channels = { [id: string]: ChannelData };

class Twitch {
  signal?: AbortSignal;
  keepalive?: boolean;

  constructor(signal?: AbortSignal) {
    this.signal = signal;
    this.keepalive = true;
  }

  async getWithRetry<T>(input: RequestInfo) {
    let body;
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const res = await fetch(input, {
          method: "GET",
          keepalive: this.keepalive,
          signal: this.signal,
        });
        body = await res.json();
        if (!res.ok) {
          throw new Error(
            `HTTP ${res.status}: ${res.statusText}
  
${JSON.stringify(body, null, 2)}`
          );
        }
        break;
      } catch (err: any) {
        if (i === MAX_RETRIES - 1 || err.name === "AbortError") {
          throw err;
        }
        if (err instanceof TypeError) {
          this.keepalive = undefined;
        }
        await new Promise((r) => setTimeout(r, Math.pow(2, i) * 200));
      }
    }
    return body as T;
  }

  async getChannels(userIds: string[]) {
    const params = new URLSearchParams();
    for (const id of userIds) {
      params.append("broadcaster_id", id);
    }
    return this.getWithRetry<Channels>(`${API_URL}channels?${params}`);
  }
}

export default Twitch;
