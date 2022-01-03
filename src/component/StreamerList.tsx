import Streamer from "./Streamer";
import streamerInfo from "../info";

type StreamerListProps = {
  streamers: string[];
};

function SteamerList({ streamers }: StreamerListProps) {
  return (
    <ul className="list-group">
      {streamers.map((userId: string) => (
        <Streamer key={userId} userId={userId} info={streamerInfo[userId]} />
      ))}
    </ul>
  );
}

export default SteamerList;
