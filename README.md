# Twgg Noti

[![CI](https://github.com/jebibot/twgg-noti/actions/workflows/main.yml/badge.svg?branch=main&event=push)](https://github.com/jebibot/twgg-noti/actions/workflows/main.yml)

## Setup

| Local                                    | GitHub Actions                                          | Description     |
| ---------------------------------------- | ------------------------------------------------------- | --------------- |
| `.env.development` and `.env.production` | `staging` and `production` environment                  | See `.env`      |
| `service-account-key.json`               | `GCP_SERVICE_ACCOUNT`, `GCP_WORKLOAD_IDENTITY_PROVIDER` |                 |
| `.firebaserc`                            | `.firebaserc`                                           | Project aliases |

## Generate Webhook Secret

```sh
tr -dc A-Za-z0-9 </dev/urandom | head -c 20 | firebase functions:secrets:access TWITCH_WEBHOOK_SECRET --data-file -
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
