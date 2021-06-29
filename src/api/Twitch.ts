/** @license Twitch.js
 * https://github.com/twurple/twurple
 *
 * MIT License
 *
 * Copyright (c) 2017-2021 Daniel Fischer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
const API_URL = "https://api.twitch.tv/kraken/";

const MAX_RETRIES = 5;

export type ChannelData = {
  _id: string;
  broadcaster_language: string;
  broadcaster_type: string;
  created_at: string;
  description: string;
  display_name: string;
  followers: number;
  game: string;
  language: string;
  logo: string;
  mature: boolean;
  name: string;
  partner: boolean;
  profile_banner: string | null;
  profile_banner_background_color: string | null;
  status: string;
  updated_at: string;
  url: string;
  video_banner: string;
  views: number;
};

class Twitch {
  signal?: AbortSignal;
  keepalive?: boolean;

  constructor(signal?: AbortSignal) {
    this.signal = signal;
    this.keepalive = true;
  }

  async getWithRetry<T>(input: RequestInfo, headers: Record<string, string>) {
    let body;
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        const res = await fetch(input, {
          method: "GET",
          headers,
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
      } catch (err) {
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

  async callApi<T>(path: string) {
    return this.getWithRetry<T>(`${API_URL}${path}`, {
      Accept: "application/vnd.twitchtv.v5+json",
      "Client-ID": process.env.REACT_APP_TWITCH_CLIENT_ID ?? "",
    });
  }

  async getChannel(userId: string) {
    return this.callApi<ChannelData>(`channels/${userId}`);
  }
}

export default Twitch;
