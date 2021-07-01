import firebase from "firebase/app";
import * as Sentry from "@sentry/browser";

declare global {
  interface Window {
    firebase: typeof firebase;
  }
}

const MAX_RETRIES = 5;

async function postWithRetry(input: RequestInfo, body: any) {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const res = await fetch(input, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error(
          `HTTP ${res.status}: ${res.statusText}

  ${JSON.stringify(await res.json(), null, 2)}`
        );
      }
      break;
    } catch (err) {
      if (i === MAX_RETRIES - 1) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, Math.pow(2, i) * 200));
    }
  }
}

export async function subUnsub(
  userId: string,
  subscribe: boolean,
  callback: (err: any, subscribe: boolean) => void
) {
  if (!window.firebase?.messaging.isSupported()) {
    callback(new Error("지원하지 않는 브라우저입니다!"), subscribe);
    return;
  }

  const messaging = window.firebase.messaging();
  try {
    const token = await messaging.getToken({
      vapidKey: process.env.REACT_APP_VAPID_KEY ?? "",
    });
    await postWithRetry(subscribe ? "/api/subscribe" : "/api/unsubscribe", {
      token,
      topic: `update.${userId}`,
    });
    callback(null, subscribe);
  } catch (err) {
    Sentry.captureException(err);
    callback(err, subscribe);
  }
}

export function setMessageListener(listener: (payload: any) => void) {
  if (!window.firebase?.messaging.isSupported()) {
    listener({
      notification: { title: "오류", body: "지원하지 않는 브라우저입니다!" },
    });

    if (
      navigator.userAgent.indexOf("Android") !== -1 &&
      /inapp|KAKAOTALK|Line\/|FB_IAB\/FB4A|Instagram|DaumDevice\/mobile|everytimeApp/i.test(
        navigator.userAgent
      )
    ) {
      window.location.href =
        "intent://noti.twitchgg.tv/#Intent;scheme=https;package=com.android.chrome;end";
    }
    return;
  }

  const messaging = window.firebase.messaging();
  messaging.onMessage(listener);
}
