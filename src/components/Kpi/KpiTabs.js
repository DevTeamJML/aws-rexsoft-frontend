export default function KpiTabs({ active, onChange }) {
  return (
    <div className="tabs">
      <button
        className={active === "kpi" ? "tab active" : "tab"}
        onClick={() => onChange("kpi")}
      >
        KPIs
      </button>

      <button
        className={active === "settings" ? "tab active" : "tab"}
        onClick={() => onChange("settings")}
      >
        Settings
      </button>
    </div>
  );
}
