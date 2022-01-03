import path from "path";
import { ApiClient } from "@twurple/api";
import { ClientCredentialsAuthProvider } from "@twurple/auth";
import { promises as fsPromises } from "fs";

import type { HelixUser } from "@twurple/api";

const infoPath = path.join(__dirname, "..", "src", "info.ts");
const logoPath = path.join(__dirname, "..", "functions", "src", "logo.ts");

let apiClient: ApiClient | null = null;
if (process.env.TWITCH_CLIENT_SECRET) {
  const authProvider = new ClientCredentialsAuthProvider(
    process.env.TWITCH_CLIENT_ID ?? "",
    process.env.TWITCH_CLIENT_SECRET
  );
  apiClient = new ApiClient({ authProvider });
}

const streamers = (process.env.REACT_APP_STREAMER_LIST ?? "")
  .split(",")
  .map((s) => s.trim());

(async function () {
  const users: HelixUser[] = apiClient
    ? await apiClient.users.getUsersByIds(streamers)
    : streamers.map((s) => ({ id: s } as HelixUser));
  const info: {
    [key: string]: { logo: string; displayName: string; name: string };
  } = {};
  const logo: { [key: string]: string } = {};
  for (const u of users) {
    info[u.id] = {
      logo: u.profilePictureUrl || "",
      displayName: u.displayName || "",
      name: u.name || "",
    };
    logo[u.id] = u.profilePictureUrl || "";
  }

  await fsPromises.writeFile(
    infoPath,
    `const info: {[key: string]: {logo: string; displayName: string; name: string}} = ${JSON.stringify(
      info,
      null,
      2
    )};\nexport default info;\n`
  );

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
