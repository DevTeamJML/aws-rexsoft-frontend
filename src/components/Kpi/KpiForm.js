import { useState } from "react";
import KpiMemberSelector from "./KpiMemberSelector";
import KpiMetricBuilder from "./KpiMetricBuilder";
import { PlainTextField } from "../FormComponents/PlainTextField";
import { MultilineField } from "../FormComponents/MultilineField";
import { v4 } from "uuid";

export default function KpiForm({ kpis, setKpis, updateMembers }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeKpi = kpis[activeIndex];

  const updateField = (field, value) => {
    setKpis((prev) => {
      const next = [...prev];
      next[activeIndex] = {
        ...next[activeIndex],
        [field]: value,
      };
      return next;
    });
  };

  const addKpi = () => {
    setKpis((prev) => [
      ...prev,
      {
        kpi_id: v4(),
        title: "",
        definition: "",

        data_source_type: "group",
        data_source_id: "",

        metric_value_id: "",
        measurement_rule: "total",
        measurement_unit: "",

        target_value: "",
        start_date: null,
        due_date: null,

        members: [],
        team_contribution: true,
      },
    ]);

    setActiveIndex(kpis.length);
  };

  return (
    <div className="kpi-form-container">
      <div className="kpi-tabs">
        {kpis.map((_, idx) => (
          <button
            key={idx}
            className={`kpi-tab ${idx === activeIndex ? "active" : ""}`}
            onClick={() => setActiveIndex(idx)}
          >
            KPI {idx + 1}
          </button>
        ))}

        <button className="kpi-tab add" onClick={addKpi}>
          + Add KPI
        </button>
      </div>

      <div className="kpi-form">
        <strong><span>KPI Definition</span></strong>

        <PlainTextField
          placeholder="KPI Title"
          value={activeKpi.title}
          onChange={(value) => updateField("title", value)}
        />

        <MultilineField
          placeholder="Definition"
          value={activeKpi.definition}
          onChange={(value) => updateField("definition", value)}
        />

        {/* MEMBERS */}
        <KpiMemberSelector
          members={activeKpi.members}
          onChange={(members) => updateMembers(activeIndex, members)}
        />

        {/* METRIC */}
        <KpiMetricBuilder kpi={activeKpi} onChange={updateField} />
      </div>
    </div>
  );
}
