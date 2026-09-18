import { useSelector } from "react-redux";
import Hours from "../Fees/Hours";

export default function OnlineStatus() {
  const user = useSelector((state) => state.session.user);
  return <Hours id={user.restaurant_id} />;
}
