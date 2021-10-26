import { initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import * as functions from "firebase-functions";
import * as hash from "hash.js";
import logo from "./logo";

const TWITCH_WEBHOOK_SECRET: string = functions.config().twitch.secret;

initializeApp();

function checkMethod(
  req: functions.https.Request,
  res: functions.Response,
  allow: string
) {
  if (req.method !== allow) {
    res.set("Allow", allow).status(405).send("Method Not Allowed");
    return false;
  }
  return true;
}

function encloseParentheses(str: string) {
  return str ? ` (${str})` : "";
}

async function subUnsub(
  req: functions.https.Request,
  res: functions.Response,
  subscribe: boolean
) {
  if (!checkMethod(req, res, "POST")) return;
  try {
    const messaging = getMessaging();
    const result = subscribe
      ? await messaging.subscribeToTopic(req.body.token, req.body.topic)
      : await messaging.unsubscribeFromTopic(req.body.token, req.body.topic);
    if (result.failureCount) throw result.errors[0].error;
    res.send({ status: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "error", error });
  }
}

exports.subscribe = functions.https.onRequest(async (req, res) =>
  subUnsub(req, res, true)
);
exports.unsubscribe = functions.https.onRequest(async (req, res) =>
  subUnsub(req, res, false)
);

exports.twitch_callback = functions.https.onRequest(async (req, res) => {
  if (!checkMethod(req, res, "POST")) return;
  const messageId = req.get("Twitch-Eventsub-Message-Id");
  if (!messageId) {
    res.status(403).send("Forbidden");
    return;
  }
  const h = hash
    // @ts-ignore
    .hmac(hash.sha256, TWITCH_WEBHOOK_SECRET)
    .update(messageId)
    .update(req.get("Twitch-Eventsub-Message-Timestamp"))
    .update(req.rawBody)
    .digest("hex");
  if (req.get("Twitch-Eventsub-Message-Signature") !== `sha256=${h}`) {
    res.status(403).send("Forbidden");
    return;
  }

  try {
    if (req.body.challenge) {
      res.send(req.body.challenge);
    } else if (req.body.event) {
      const event = req.body.event;
      await getMessaging().send({
        notification: {
          title: `${event.broadcaster_user_name}${encloseParentheses(
            event.broadcaster_user_login
          )}`,
          body: `${event.title}${encloseParentheses(event.category_name)}`,
        },
        topic: `update.${event.broadcaster_user_id}`,
        webpush: {
          notification: {
            badge: `/badge.png`,
            icon: logo[event.broadcaster_user_id],
          },
          fcmOptions: {
            link: `/t/${event.broadcaster_user_login}`,
          },
        },
      });
      res.send({ status: "success" });
    }
  } catch (error: any) {
    console.error(error);
    // XXX: do not retry if 'messaging/internal-error'
    res
      .status(error.code === "messaging/internal-error" ? 200 : 500)
      .send({ status: "error", error });
  }
});
