import Streamer from "./Streamer";

type StreamerListProps = {
  streamers: string[];
};

function SteamerList({ streamers }: StreamerListProps) {
  return (
    <ul className="list-group">
      {streamers.map((userId: string) => (
        <Streamer key={userId} userId={userId} />
      ))}
    </ul>
  );
}

export default SteamerList;
