import ReactNotification from "react-notifications-component";
import SteamerList from "./component/StreamerList";
import "react-notifications-component/dist/theme.css";

function App() {
  const streamers = (process.env.REACT_APP_STREAMER_LIST ?? "")
    .split(",")
    .map((s) => s.trim());

  return (
    <div>
      <ReactNotification />
      <div className="container">
        <div className="row py-4">
          <div className="col-12">
            <SteamerList streamers={streamers} />
          </div>
        </div>
        <div className="row px-4">
          <ul>
            <li>
              "알림 받기"를 누른 후 알림 권한을 허용하면{" "}
              <strong>방제와 카테고리</strong>가 변경되었을 때 알림을 받습니다.
            </li>
            <li>
              <strong>Chrome, Firefox, Edge, Whale 등</strong>을 지원합니다. iOS
              (iPhone, iPad) 및 Safari는 지원하지 않습니다.
            </li>
            <li>
              본 창 또는 탭이 열려있으면 알림이 여기에 표시됩니다. 시스템 알림을
              받으려면 <strong>본 창 또는 탭을 닫아주세요.</strong>
            </li>
            <li>
              사이트 데이터 등 인터넷 사용 기록을 삭제한 경우, 다시 "알림
              받기"를 해주어야 합니다.
            </li>
            <li>
              만약 정상적으로 알림이 오지 않으면 인터넷 사용 기록을 삭제한 후
              다시 시도해보세요.
            </li>
            <li>
              본 서비스는 트위치 또는 스트리머와 관련이 없으며, 단순한 정보성
              목적을 위해 알림을 전송합니다. 본 사이트에 보이는 상표와 이미지는
              각각 해당 소유자의 자산입니다.
            </li>
            <li>
              <a
                href="https://twgg.notion.site/0b3f4f254d424f92a54fe448c7b61680"
                target="_blank"
                rel="noopener noreferrer"
              >
                공지사항
              </a>
              {" | "}
              <a
                href="https://twgg.notion.site/8f9d79d606b34da68e532a78314decfc"
                target="_blank"
                rel="noopener noreferrer"
              >
                개인정보처리방침
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
