import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const [test, setTest] = useState();
  useEffect(() => {}, []);
  return <div>dashboard</div>;
}
