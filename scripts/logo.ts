import { ApiClient } from "@twurple/api";
import { ClientCredentialsAuthProvider } from "@twurple/auth";
import { promises as fsPromises } from "fs";
import * as path from "path";

const logoPath = path.join(__dirname, "..", "functions", "src", "logo.ts");

const authProvider = new ClientCredentialsAuthProvider(
  process.env.REACT_APP_TWITCH_CLIENT_ID ?? "",
  process.env.TWITCH_CLIENT_SECRET ?? ""
);
const apiClient = new ApiClient({ authProvider });

const streamers = (process.env.REACT_APP_STREAMER_LIST ?? "")
  .split(",")
  .map((s) => s.trim());

(async function () {
  const users = await apiClient.users.getUsersByIds(streamers);
  const logo = {};
  for (const u of users) {
    logo[u.id] = u.profilePictureUrl;
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
