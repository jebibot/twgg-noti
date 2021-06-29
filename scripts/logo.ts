import { ApiClient } from "twitch";
import { StaticAuthProvider } from "twitch-auth";
import { promises as fsPromises } from "fs";
import * as path from "path";

const logoPath = path.join(__dirname, "..", "functions", "src", "logo.ts");

const authProvider = new StaticAuthProvider(
  process.env.REACT_APP_TWITCH_CLIENT_ID ?? ""
);
const apiClient = new ApiClient({ authProvider });

const streamers = (process.env.REACT_APP_STREAMER_LIST ?? "")
  .split(",")
  .map((s) => s.trim());

(async function () {
  const logo = {};
  for (const streamer of streamers) {
    const user = await apiClient.kraken.users.getUser(streamer);
    logo[streamer] = user.logoUrl;
  }

  await fsPromises.writeFile(
    logoPath,
    `const logo: {[key: string]: string} = ${JSON.stringify(
      logo,
      null,
      2
    )};\nexport default logo;\n`
  );
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
