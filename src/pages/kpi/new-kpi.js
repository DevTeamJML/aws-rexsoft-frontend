import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import KpiForm from "@/components/Kpi/KpiForm";
import KpiGroupVisualization from "@/components/Kpi/KpiGroupVisualization";
import KpiTabs from "@/components/Kpi/KpiTabs";

import { saveKpi } from "../../../redux/slices/kpiSlice";
import { useSelectCurrCompanyId } from "../../../redux/slices/companySlice";
import { ActionButton } from "@/components/Misc/ActionButton";
import { PlainTextField } from "@/components/FormComponents/PlainTextField";
import { v4 } from "uuid";
import { useRouter } from "next/router";
import { useSelectUser } from "../../../redux/slices/authSlice";

export default function NewKpiGroup() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelectUser();
  const currCompanyId = useSelectCurrCompanyId();

  /* =========================
     UI TABS
  ========================= */
  const [activeTab, setActiveTab] = useState("kpi");

  /* =========================
     KPI GROUP (maps to KpiGroup)
  ========================= */
  const [kpiGroup, setKpiGroup] = useState({
    kpi_group_id: v4(),
    created_by: user?.uid,
    company_id: currCompanyId,
    kpi_group_name: "",
    status: "draft",
  });

  const [visualization, setVisualization] = useState({
    x_axis: "member", // or time later
    series: [],
  });

  /* =========================
     KPIs (maps to Kpi + KpiUser)
  ========================= */
  const [kpis, setKpis] = useState([
    {
      kpi_id: v4(),
      title: "",
      definition: "",

      data_source_type: "group", // group | form
      data_source_id: "",

      metric_value_id: "",
      measurement_rule: "total", // total | per_entry
      measurement_unit: "",

      target_value: "",
      start_date: null,
      due_date: null,

      members: [], // -> KpiUser
      team_contribution: true, // auto-enforced
    },
  ]);

  useEffect(() => {
    if (!kpis.length) return;

    setVisualization((prev) => {
      const map = new Map((prev.series || []).map((s) => [s.kpi_id, s]));

      const nextSeries = kpis.map((kpi, index) => {
        return (
          map.get(kpi.kpi_id) || {
            kpi_id: kpi.kpi_id,
            label: kpi.title || `KPI ${index + 1}`,
            chart_type: "bar",
            color: "#4F46E5",
            visible: true,
          }
        );
      });

      return {
        ...prev,
        series: nextSeries,
      };
    });
  }, [kpis]);

  /* =========================
     MEMBER RULE (important)
  ========================= */
  const updateMembers = (kpiIndex, members) => {
    setKpis((prev) => {
      const next = [...prev];

      next[kpiIndex] = {
        ...next[kpiIndex],
        members,
        team_contribution: members.length > 1 ? true : false,
      };

      return next;
    });
  };

  /* =========================
     SAVE HANDLER
  ========================= */
  const handleSaveKpiGroup = () => {
    const test = {
      group: {
        kpi_group_id: "4c373673-985d-42b6-8b3e-4489a0a42df6",
        created_by: "0ExDpovfelMsLwHSINgeGzOBz8G2",
        company_id: "f967f22f-6778-4403-9b01-e12b53cc3e6a",
        kpi_group_name: "",
        status: "draft",
      },
      kpis: [
        {
          kpi_id: "efd973a7-7602-433f-92ee-316b68684bd3",
          title: "Kpi 1",
          definition: "test",
          data_source_type: "group",
          data_source_id: "4a19f344-57e1-4474-b38c-6d3d6de38648",
          metric_value_id: "897fbb21-004a-435d-a3b5-a9f99e741cc1",
          measurement_rule: "total",
          measurement_unit: "RM",
          target_value: "50000",
          start_date: "2025-12-19",
          due_date: "2025-12-27",
          members: ["0ExDpovfelMsLwHSINgeGzOBz8G2"],
          team_contribution: false,
        },
        {
          kpi_id: "28cf5d0e-4d68-48a8-9958-55e9ad57aee1",
          title: "KPI 2",
          definition: "test",
          data_source_type: "group",
          data_source_id: "4a19f344-57e1-4474-b38c-6d3d6de38648",
          metric_value_id: "897fbb21-004a-435d-a3b5-a9f99e741cc1",
          measurement_rule: "total",
          measurement_unit: "RM",
          target_value: "50000",
          start_date: null,
          due_date: null,
          members: [
            "0ExDpovfelMsLwHSINgeGzOBz8G2",
            "PvYxASUm3tZNLbVhLWLTXPsrNhW2",
          ],
          team_contribution: true,
        },
      ],
      visualization: {
        x_axis: "member",
        series: [
          {
            kpi_id: "efd973a7-7602-433f-92ee-316b68684bd3",
            label: "KPI 1",
            chart_type: "bar",
            color: "#4F46E5",
            visible: true,
          },
          {
            kpi_id: "28cf5d0e-4d68-48a8-9958-55e9ad57aee1",
            label: "KPI 2",
            chart_type: "bar",
            color: "#4F46E5",
            visible: true,
          },
        ],
      },
    };
    dispatch(saveKpi({ ...test, router }));
  };

  return (
    <div className="new-kpi-container">
      {/* ================= HEADER ================= */}
      <div className="title-container">
        <PlainTextField
          value={kpiGroup.kpi_group_name}
          onChange={(value) =>
            setKpiGroup((p) => ({
              ...p,
              kpi_group_name: value,
            }))
          }
          placeholder="Your Group Name here"
        />
      </div>

      {/* ================= TABS ================= */}
      <KpiTabs active={activeTab} onChange={setActiveTab} />

      {/* ================= CONTENT ================= */}
      {activeTab === "kpi" && (
        <KpiForm kpis={kpis} setKpis={setKpis} updateMembers={updateMembers} />
      )}

      {activeTab === "settings" && (
        <KpiGroupVisualization
          kpis={kpis}
          visualization={visualization}
          setVisualization={setVisualization}
        />
      )}

      {/* ================= ACTIONS ================= */}
      <div className="page-actions">
        <ActionButton
          type="primary"
          label={"Save KPI Group"}
          onClick={handleSaveKpiGroup}
        />
      </div>
    </div>
  );
}
