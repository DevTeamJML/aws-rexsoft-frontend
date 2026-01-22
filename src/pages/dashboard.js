import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  getDashboard,
  useSelectDashboardActivityLogs,
  useSelectDashboardUpcomingAppointments,
} from "../../redux/slices/dashboardSlice";
import {
  useSelectCurrCompanyId,
  useSelectIsAdmin,
} from "../../redux/slices/companySlice";
import { useSelectUser } from "../../redux/slices/authSlice";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const [test, setTest] = useState();
  const currCompanyId = useSelectCurrCompanyId();
  const user = useSelectUser();
  const isAdmin = useSelectIsAdmin();
  const dashboardLogs = useSelectDashboardActivityLogs();
  const dashboardAppointment = useSelectDashboardUpcomingAppointments();

  useEffect(() => {
    if (currCompanyId && user) {
      dispatch(
        getDashboard({
          company_id: currCompanyId,
          user_id: user?.uid,
          isAdmin: isAdmin,
        })
      );
    }
  }, [currCompanyId, user]);
  return <div>dashboard</div>;
}
