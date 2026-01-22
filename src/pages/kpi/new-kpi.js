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

  const [activeTab, setActiveTab] = useState("kpi");

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

  const handleSaveKpiGroup = () => {
   
    dispatch(saveKpi({ group: kpiGroup, visualization, kpis, router }));
  };

  return (
    <div className="new-kpi-container">

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

      <KpiTabs active={activeTab} onChange={setActiveTab} />

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
