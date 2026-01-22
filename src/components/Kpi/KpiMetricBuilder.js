import { useMemo } from "react";
import { useSelectAllClientGroups } from "../../../redux/slices/clientGroupSlice";
import { useSelectAllFormTemplates } from "../../../redux/slices/formTemplateSlice";
import { DropdownField } from "../FormComponents/DropdownField";
import { PlainTextField } from "../FormComponents/PlainTextField";
import { DateField } from "../FormComponents/DateField";

export default function KpiMetricBuilder({ kpi, onChange }) {
  const {
    data_source_type,
    data_source_id,
    metric_value_id,

    measurement_rule,
    measurement_unit,
    target_value,
    start_date,
    due_date,
    team_contribution,
  } = kpi;

  const allClientGroups = useSelectAllClientGroups();
  const allFormTemplates = useSelectAllFormTemplates();

  const sourceOptions = useMemo(() => {
    return data_source_type === "form"
      ? allFormTemplates.map((f) => ({
          id: f.form_template_id,
          label: f.template_name,
          raw: f,
        }))
      : allClientGroups.map((g) => ({
          id: g.client_group_id,
          label: g.client_group_name,
          raw: g,
        }));
  }, [data_source_type, allClientGroups, allFormTemplates]);

  const selectedSource = sourceOptions.find((s) => s.id === data_source_id);

  const metricValueOptions = useMemo(() => {
    if (!selectedSource) return [];

    // FORM → questions
    if (data_source_type === "form") {
      return (
        selectedSource.raw.questions
          ?.filter((q) => q.field_type === "number")
          .map((q) => ({
            id: q.form_question_id,
            label: q.label,
          })) || []
      );
    }

    // GROUP → columns
    return (
      selectedSource.raw.columns
        ?.filter((c) => c.field_type === "number")
        .map((c) => ({
          id: c.column_id,
          label: c.label,
        })) || []
    );
  }, [selectedSource, data_source_type]);

  return (
    <div className="section">
      <h4>Metric Definition</h4>

      <div className="settings-tabs">
        <button
          className={`tab ${data_source_type === "group" ? "active" : ""}`}
          onClick={() => {
            onChange("data_source_type", "group");
            onChange("data_source_id", "");
            onChange("metric_value_id", "");
          }}
        >
          Client Group
        </button>

        <button
          className={`tab ${data_source_type === "form" ? "active" : ""}`}
          onClick={() => {
            onChange("data_source_type", "form");
            onChange("data_source_id", "");
            onChange("metric_value_id", "");
          }}
        >
          Form
        </button>
      </div>

      <DropdownField
        label="Source"
        dropdownList={sourceOptions.map((s) => ({
          label: s.label,
          value: s.id,
        }))}
        value={data_source_id}
        onChange={(value) => {
          onChange("data_source_id", value);
          onChange("metric_value_id", "");
        }}
      />

      <DropdownField
        label="Metric Value"
        dropdownList={metricValueOptions.map((m) => ({
          label: m.label,
          value: m.id,
        }))}
        value={metric_value_id}
        onChange={(value) => onChange("metric_value_id", value)}
        disabled={!data_source_id}
      />

      <div className="row">
        <DropdownField
          label={"Measurement Rule"}
          dropdownList={[
            { label: "Per Entry", value: "per_entry" },
            { label: "Total (Sum)", value: "total" },
          ]}
          value={measurement_rule}
          onChange={(value) => onChange("measurement_rule", value)}
        />
        <PlainTextField
          label={"Measurement Unit"}
          placeholder="Unit (%, $, count)"
          value={measurement_unit}
          onChange={(value) => onChange("measurement_unit", value)}
        />
      </div>

      <div className="row">
        <PlainTextField
          label={"Target Value"}
          placeholder="Target Value"
          value={target_value}
          onChange={(value) => onChange("target_value", value)}
        />
        <DateField
          label={"Start Date"}
          value={start_date || ""}
          onChange={(value) => onChange("start_date", value || null)}
        />

        <DateField
          label={"End Date"}
          value={due_date || ""}
          onChange={(value) => onChange("due_date", value || null)}
        />
      </div>

      <div className="row">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={team_contribution}
            onChange={(e) => onChange("team_contribution", e.target.checked)}
          />
          Calculate as team KPI
        </label>
      </div>
    </div>
  );
}
