import { store } from "react-notifications-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faBellSlash } from "@fortawesome/free-solid-svg-icons";
import { subUnsub } from "../api/Firebase";

import type { ChannelData } from "../api/Twitch";

type StreamerProps = {
  userId: string;
  info: {
    logo: string;
    displayName: string;
    name: string;
  };
  channel?: ChannelData;
};

const encloseParentheses = (str: string | undefined) =>
  str ? ` (${str})` : "";

function Streamer({ userId, info, channel }: StreamerProps) {
  const showNotification = (err: any, subscribe: boolean) => {
    store.addNotification({
      title: err ? "실패" : "성공",
      message: err
        ? `오류가 발생하였습니다. ${err.name}: ${err.message}`
        : `성공적으로 ${subscribe ? "구독" : "취소"}하였습니다.`,
      type: err ? "danger" : "success",
      insert: "top",
      container: "top-right",
      dismiss: {
        duration: 5000,
      },
    });
  };

  return (
    <li className="list-group-item py-4">
      <div className="row">
        <div className="col-12 col-lg-9">
          <div className="row no-gutters">
            <div className="col-3 col-lg-2 px-0">
              <a
                href={`/t/${info.name}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  className="rounded img-fluid"
                  src={info.logo}
                  alt={info.displayName}
                />
              </a>
            </div>
            <div className="col-9 col-lg-10 px-3">
              <div className="row no-gutters mb-2">
                <a
                  href={`/t/${info.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <h5>
                    {info.displayName}
                    {encloseParentheses(info.name)}
                  </h5>
                </a>
              </div>
              <div className="row no-gutters">
                {channel?.title}
                {encloseParentheses(channel?.game)}
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-3 pt-2">
          <button
            type="button"
            className="btn btn-primary mr-2"
            onClick={() => subUnsub(userId, true, showNotification)}
          >
            <FontAwesomeIcon icon={faBell} /> 알림 받기
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            aria-label="취소"
            title="취소"
            onClick={() => subUnsub(userId, false, showNotification)}
          >
            <FontAwesomeIcon icon={faBellSlash} />
          </button>
        </div>
      </div>
    </li>
  );
}

export default Streamer;
