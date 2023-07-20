import { initializeApp } from "firebase/app";
import {
  isSupported,
  getMessaging,
  getToken,
  onMessage,
} from "firebase/messaging";
import * as Sentry from "@sentry/browser";
import type { FirebaseApp } from "firebase/app";

let firebaseApp: FirebaseApp;

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

  ${JSON.stringify(await res.json(), null, 2)}`,
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
  callback: (err: any, subscribe: boolean) => void,
) {
  if (!(await isSupported()) || firebaseApp == null) {
    callback(new Error("지원하지 않는 브라우저입니다!"), subscribe);
    return;
  }

  const messaging = getMessaging(firebaseApp);
  try {
    const token = await getToken(messaging, {
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

export async function setMessageListener(listener: (payload: any) => void) {
  try {
    const response = await fetch("/__/firebase/init.json");
    const options = await response.json();
    firebaseApp = initializeApp(options);
  } catch (err: any) {
    listener({
      notification: {
        title: "오류",
        body: `오류가 발생하였습니다. ${err.name}: ${err.message}`,
      },
    });
    return;
  }

  if (!(await isSupported())) {
    listener({
      notification: { title: "오류", body: "지원하지 않는 브라우저입니다!" },
    });

    if (
      navigator.userAgent.indexOf("Android") !== -1 &&
      /inapp|KAKAOTALK|Line\/|FB_IAB\/FB4A|Instagram|DaumDevice\/mobile|everytimeApp/i.test(
        navigator.userAgent,
      )
    ) {
      window.location.href =
        "intent://noti.twitchgg.tv/#Intent;scheme=https;package=com.android.chrome;end";
    }
    return;
  }

  const messaging = getMessaging(firebaseApp);
  onMessage(messaging, listener);
}
