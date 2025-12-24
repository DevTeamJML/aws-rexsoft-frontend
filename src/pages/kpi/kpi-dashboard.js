import { KpiGroupCard } from "@/components/Kpi/Dashboard/KpiGroupCard";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  getPublishedKpi,
  useSelectPublishedKpis,
} from "../../../redux/slices/kpiSlice";
import { useSelectCurrCompanyId } from "../../../redux/slices/companySlice";
import { useSelectUser } from "../../../redux/slices/authSlice";

const sampleKpiGroup = {
  kpi_group_id: "group-1",
  kpi_group_name: "Sales Performance",
  overall: {
    current: 82000,
    target: 120000,
    percentage: 68,
  },

  kpis: [
    {
      kpi_id: "kpi-1",
      title: "Total Revenue",
      chart_type: "bar",
      data: [
        { x: "Week 1", y: 12000 },
        { x: "Week 2", y: 18000 },
        { x: "Week 3", y: 22000 },
        { x: "Week 4", y: 30000 },
      ],
      current_value: 82000,
      target_value: 120000,
      percentage: 68,

      team_contribution: true,
      my_contribution: 24000,
      unit: "RM",

      start_date: "2025-12-01",
      due_date: "2025-12-31",

      members: [
        { user_id: "u1", first_name: "Alice" },
        { user_id: "u2", first_name: "Ben" },
        { user_id: "u3", first_name: "Chris" },
        { user_id: "u4", first_name: "Diana" },
      ],
    },

    {
      kpi_id: "kpi-2",
      title: "New Clients",
      chart_type: "area",
      data: [
        { x: "Week 1", y: 8 },
        { x: "Week 2", y: 12 },
        { x: "Week 3", y: 18 },
        { x: "Week 4", y: 25 },
      ],
      current_value: 25,
      target_value: 40,
      percentage: 62,

      team_contribution: false,
      my_contribution: 25,
      unit: "clients",

      start_date: "2025-12-01",
      due_date: "2025-12-31",

      members: [{ user_id: "u1", first_name: "Alice" }],
    },

    {
      kpi_id: "kpi-3",
      title: "Conversion Rate",
      chart_type: "line",
      data: [
        { x: "Week 1", y: 2.1 },
        { x: "Week 2", y: 2.6 },
        { x: "Week 3", y: 3.2 },
        { x: "Week 4", y: 3.8 },
      ],
      current_value: 3.8,
      target_value: 5,
      percentage: 76,

      team_contribution: true,
      my_contribution: 1.4,
      unit: "%",

      start_date: "2025-12-01",
      due_date: "2025-12-31",

      members: [
        { user_id: "u1", first_name: "Alice" },
        { user_id: "u2", first_name: "Ben" },
      ],
    },

    {
      kpi_id: "kpi-4",
      title: "Upsell Revenue",
      chart_type: "bar",
      data: [
        { x: "Week 1", y: 4000 },
        { x: "Week 2", y: 6000 },
        { x: "Week 3", y: 7000 },
        { x: "Week 4", y: 9000 },
      ],
      current_value: 26000,
      target_value: 50000,
      percentage: 52,

      team_contribution: true,
      my_contribution: 9000,
      unit: "RM",

      start_date: "2025-12-01",
      due_date: "2025-12-31",

      members: [
        { user_id: "u2", first_name: "Ben" },
        { user_id: "u3", first_name: "Chris" },
      ],
    },
  ],
};

export default function KpiDashboardSample() {
  const dispatch = useDispatch();
  const currCompanyId = useSelectCurrCompanyId();
  const user = useSelectUser();
  const publishedKpi = useSelectPublishedKpis();

  useEffect(() => {
    if (currCompanyId && user?.uid) {
      dispatch(
        getPublishedKpi({ company_id: currCompanyId, user_id: user?.uid })
      );
    }
  }, [currCompanyId, user]);

  console.log(publishedKpi)

  return (
    <div className="kpi-dashboard-container">
      <strong>
        <span>KPI Dashboard</span>
      </strong>
      <div className="kpi-dashboard-body">
        {publishedKpi.map((kpi) => {
          return <KpiGroupCard group={kpi} />;
        })}
      </div>
    </div>
  );
}
