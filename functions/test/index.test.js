const { assert } = require("chai");
const sinon = require("sinon");

const app = require("firebase-admin/app");
const _messaging = require("firebase-admin/messaging");
const test = require("firebase-functions-test")();

test.mockConfig({ twitch: { secret: "1234567890" } });

describe("Functions", () => {
  const GET_REQUEST = { method: "GET" };
  const token = "1234";
  const topic = "update.574792191";
  const messaging = {};

  let functions, logo;

  before(() => {
    sinon.stub(console, "error");
    sinon.stub(app, "initializeApp");
    sinon.replace(_messaging, "getMessaging", () => messaging);
    functions = require("../lib/index");
    logo = require("../lib/logo").default;
  });

  after(() => {
    sinon.restore();
    test.cleanup();
  });

  describe("subscribe", () => {
    it("should return 405 if not POST", (done) => {
      const res = {
        set(field, value) {
          assert.equal(field, "Allow");
          assert.equal(value, "POST");
          return this;
        },
        status(code) {
          assert.equal(code, 405);
          return this;
        },
        send(result) {
          assert.equal(result, "Method Not Allowed");
          done();
        },
      };
      functions.subscribe(GET_REQUEST, res);
    });

    it("should subscribe to topic", (done) => {
      messaging.subscribeToTopic = sinon.fake.resolves({
        failureCount: 0,
        successCount: 1,
        errors: [],
      });
      const req = {
        method: "POST",
        body: { token, topic },
      };
      const res = {
        status(code) {
          assert.equal(messaging.subscribeToTopic.callCount, 1);
          assert.equal(messaging.subscribeToTopic.firstArg, token);
          assert.equal(messaging.subscribeToTopic.lastArg, topic);

          assert.equal(code, 200);
          return this;
        },
        send(result) {
          assert.equal(result.status, "success");
          delete messaging.subscribeToTopic;
          done();
        },
      };
      functions.subscribe(req, res);
    });

    it("should return 500 on failure", (done) => {
      messaging.subscribeToTopic = sinon.fake.resolves({
        failureCount: 1,
        successCount: 0,
        errors: [{ error: "error" }],
      });
      const req = {
        method: "POST",
        body: { token, topic },
      };
      const res = {
        status(code) {
          assert.equal(messaging.subscribeToTopic.callCount, 1);
          assert.equal(code, 500);
          return this;
        },
        send(result) {
          assert.equal(result.status, "error");
          delete messaging.subscribeToTopic;
          done();
        },
      };
      functions.subscribe(req, res);
    });
  });

  describe("unsubscribe", () => {
    it("should return 405 if not POST", (done) => {
      const res = {
        set(field, value) {
          assert.equal(field, "Allow");
          assert.equal(value, "POST");
          return this;
        },
        status(code) {
          assert.equal(code, 405);
          return this;
        },
        send(result) {
          assert.equal(result, "Method Not Allowed");
          done();
        },
      };
      functions.unsubscribe(GET_REQUEST, res);
    });

    it("should unsubscribe from topic", (done) => {
      messaging.unsubscribeFromTopic = sinon.fake.resolves({
        failureCount: 0,
        successCount: 1,
        errors: [],
      });
      const req = {
        method: "POST",
        body: { token, topic },
      };
      const res = {
        status(code) {
          assert.equal(messaging.unsubscribeFromTopic.callCount, 1);
          assert.equal(messaging.unsubscribeFromTopic.firstArg, token);
          assert.equal(messaging.unsubscribeFromTopic.lastArg, topic);

          assert.equal(code, 200);
          return this;
        },
        send(result) {
          assert.equal(result.status, "success");
          delete messaging.unsubscribeFromTopic;
          done();
        },
      };
      functions.unsubscribe(req, res);
    });

    it("should return 500 on failure", (done) => {
      messaging.unsubscribeFromTopic = sinon.fake.resolves({
        failureCount: 1,
        successCount: 0,
        errors: [{ error: "error" }],
      });
      const req = {
        method: "POST",
        body: { token, topic },
      };
      const res = {
        status(code) {
          assert.equal(messaging.unsubscribeFromTopic.callCount, 1);
          assert.equal(code, 500);
          return this;
        },
        send(result) {
          assert.equal(result.status, "error");
          delete messaging.unsubscribeFromTopic;
          done();
        },
      };
      functions.unsubscribe(req, res);
    });
  });

  describe("twitch callback", () => {
    const HEADERS = {
      "Twitch-Eventsub-Message-Id":
        "94ePbUaF9ckrHZvMO9a8zlLSBwTtWpFluLkNDHCeS24=",
      "Twitch-Eventsub-Message-Timestamp": "2021-06-28T03:23:02.989270951Z",
      "Twitch-Eventsub-Message-Signature":
        "sha256=220504996a3affd216ba59c8536e2abeb42b6cb36e1baf9a2e64fce49c22ef2e",
    };
    const BODY = {
      subscription: {
        id: "2d8c5029-6f60-4d81-a301-fa98cb495f70",
        status: "enabled",
        type: "channel.update",
        version: "1",
        condition: {
          broadcaster_user_id: "574792191",
        },
        transport: {
          method: "webhook",
          callback:
            "https://c22ad9fa1ee8.ngrok.io/twitchgg-noti-test/us-central1/twitch_callback",
        },
        created_at: "2021-06-28T03:21:18.251266517Z",
        cost: 1,
      },
      event: {
        broadcaster_user_id: "574792191",
        broadcaster_user_login: "asynw",
        broadcaster_user_name: "asynw",
        title: "테스트",
        language: "ko",
        category_id: "21779",
        category_name: "League of Legends",
        is_mature: false,
      },
    };

    it("should return 405 if not POST", (done) => {
      const res = {
        set(field, value) {
          assert.equal(field, "Allow");
          assert.equal(value, "POST");
          return this;
        },
        status(code) {
          assert.equal(code, 405);
          return this;
        },
        send(result) {
          assert.equal(result, "Method Not Allowed");
          done();
        },
      };
      functions.twitch_callback(GET_REQUEST, res);
    });

    it("should return 403 if no Twitch headers", (done) => {
      const req = {
        method: "POST",
        headers: {},
        get(name) {
          return this.headers[name];
        },
      };
      const res = {
        status(code) {
          assert.equal(code, 403);
          return this;
        },
        send(result) {
          assert.equal(result, "Forbidden");
          done();
        },
      };
      functions.twitch_callback(req, res);
    });

    it("should return 403 if signature is invalid", (done) => {
      const body = {};
      const req = {
        method: "POST",
        headers: HEADERS,
        get(name) {
          return this.headers[name];
        },
        body,
        rawBody: Buffer.from(JSON.stringify(body)),
      };
      const res = {
        status(code) {
          assert.equal(code, 403);
          return this;
        },
        send(result) {
          assert.equal(result, "Forbidden");
          done();
        },
      };
      functions.twitch_callback(req, res);
    });

    it("should return challenge on verification", (done) => {
      const body = {
        subscription: {
          id: "2d8c5029-6f60-4d81-a301-fa98cb495f70",
          status: "webhook_callback_verification_pending",
          type: "channel.update",
          version: "1",
          condition: {
            broadcaster_user_id: "574792191",
          },
          transport: {
            method: "webhook",
            callback:
              "https://c22ad9fa1ee8.ngrok.io/twitchgg-noti-test/us-central1/twitch_callback",
          },
          created_at: "2021-06-28T03:21:18.251266517Z",
          cost: 1,
        },
        challenge: "Gvn7I6bVEY-HB3FvRNfOSExDcfKXNTj3rK9XT032HYQ",
      };
      const req = {
        method: "POST",
        headers: {
          "Twitch-Eventsub-Message-Id": "8068ce0f-a6af-4980-b13c-d9a1fc921438",
          "Twitch-Eventsub-Message-Timestamp": "2021-06-28T03:21:18.256172743Z",
          "Twitch-Eventsub-Message-Signature":
            "sha256=203b00276d535b9a64ff5e9f168e13d392489260effb4eaff619a3ad02cbc20c",
        },
        get(name) {
          return this.headers[name];
        },
        body,
        rawBody: Buffer.from(JSON.stringify(body)),
      };
      const res = {
        status(code) {
          assert.equal(code, 200);
          return this;
        },
        send(result) {
          assert.equal(result, body.challenge);
          done();
        },
      };
      functions.twitch_callback(req, res);
    });

    it("should send message on event", (done) => {
      messaging.send = sinon.fake.resolves("1234");
      const req = {
        method: "POST",
        headers: HEADERS,
        get(name) {
          return this.headers[name];
        },
        body: BODY,
        rawBody: Buffer.from(JSON.stringify(BODY)),
      };
      const res = {
        status(code) {
          assert.equal(code, 200);
          return this;
        },
        send(result) {
          assert.equal(result.status, "success");
          assert.equal(messaging.send.callCount, 1);
          assert.deepEqual(messaging.send.firstArg, {
            notification: {
              title: "asynw (asynw)",
              body: "테스트 (League of Legends)",
            },
            topic: "update.574792191",
            webpush: {
              notification: {
                badge: "/badge.png",
                icon: logo["574792191"],
              },
              fcmOptions: { link: "/t/asynw" },
            },
          });

          delete messaging.send;
          done();
        },
      };
      functions.twitch_callback(req, res);
    });

    it("should return 500 on error", (done) => {
      messaging.send = sinon.fake.rejects("error");
      const req = {
        method: "POST",
        headers: HEADERS,
        get(name) {
          return this.headers[name];
        },
        body: BODY,
        rawBody: Buffer.from(JSON.stringify(BODY)),
      };
      const res = {
        status(code) {
          assert.equal(messaging.send.callCount, 1);
          assert.equal(code, 500);
          return this;
        },
        send(result) {
          assert.equal(result.status, "error");
          delete messaging.send;
          done();
        },
      };
      functions.twitch_callback(req, res);
    });

    it("should return 200 on messaging/internal-error", (done) => {
      const error = new Error("error");
      error.code = "messaging/internal-error";
      messaging.send = sinon.fake.rejects(error);
      const req = {
        method: "POST",
        headers: HEADERS,
        get(name) {
          return this.headers[name];
        },
        body: BODY,
        rawBody: Buffer.from(JSON.stringify(BODY)),
      };
      const res = {
        status(code) {
          assert.equal(messaging.send.callCount, 1);
          assert.equal(code, 200);
          return this;
        },
        send(result) {
          assert.equal(result.status, "error");
          delete messaging.send;
          done();
        },
      };
      functions.twitch_callback(req, res);
    });
  });
});
