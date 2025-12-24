import { KpiTile } from "./KpiTile";

export function KpiGroupCard({ group }) {
  return (
    <div className="kpi-group-card">
      {/* Header */}
      <div className="group-header">
        <div className="group-title">
          <h3>{group.kpi_group_name}</h3>
          <span className="group-sub">
            {group.overall.current} / {group.overall.target}
          </span>
        </div>

        <div className="group-badge">
          {group.overall.percentage}%
        </div>
      </div>

      <div className="group-progress">
        <div
          className="group-progress-fill"
          style={{ width: `${group.overall.percentage}%` }}
        />
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        {group.kpis.map((kpi) => (
          <KpiTile key={kpi.kpi_id} kpi={kpi} />
        ))}
      </div>
    </div>
  );
}
