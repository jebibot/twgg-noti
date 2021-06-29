# Twitchgg Noti

[![CI](https://github.com/jebibot/twitchgg-noti/actions/workflows/main.yml/badge.svg?branch=main&event=push)](https://github.com/jebibot/twitchgg-noti/actions/workflows/main.yml)

## Setup

| Local                                    | GitHub Actions                         | Description                                                                                                                                                                                                                       |
| ---------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.env.development` and `.env.production` | `staging` and `production` environment | See `.env`                                                                                                                                                                                                                        |
| `service-account-key.json`               | `FIREBASE_SERVICE_ACCOUNT`             | **Roles:** Cloud RuntimeConfig Viewer<sup>1</sup>, Cloud Functions Developer, Service Account User of App Engine default service account<sup>2</sup>, Storage Object Admin of Container Registry Cloud Storage bucket<sup>3</sup> |
| `.firebaserc`                            | `.firebaserc`                          | Project aliases                                                                                                                                                                                                                   |

<sup>1</sup> A subset of Cloud RuntimeConfig Admin, https://console.cloud.google.com/iam-admin/roles \
<sup>2</sup> [Project ID]@appspot.gserviceaccount.com, https://console.cloud.google.com/iam-admin/serviceaccounts \
<sup>3</sup> us.artifacts.[Project ID].appspot.com, https://console.cloud.google.com/storage/browser

## Generate Webhook Secret

```sh
firebase functions:config:set twitch.secret=`tr -dc A-Za-z0-9 </dev/urandom | head -c 20`
```

## Development

```sh
NGROK_REGION=jp yarn start
```

See https://ngrok.com/docs#config_region for supported regions.

## Deploy

```sh
yarn deploy # -p for production
```
