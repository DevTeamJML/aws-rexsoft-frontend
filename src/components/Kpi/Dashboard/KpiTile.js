import { KpiHoverDetails } from "./KpiHoverDetails";
import { KpiMiniChart } from "./KpiMiniChart";

export function KpiTile({ kpi }) {
  const isTeam = kpi.team_contribution;

  return (
    <div className="kpi-tile">
      {/* Header */}
      <div className="kpi-tile-header">
        <span className="kpi-title">{kpi.title}</span>

        <div className="kpi-header-right">
          <span className={`kpi-type ${isTeam ? "team" : "individual"}`}>
            {isTeam ? "👥 Team" : "👤 Individual"}
          </span>
          <span className="kpi-pill">{kpi.percentage}%</span>
        </div>
      </div>

      {/* Chart */}
      <div className="kpi-chart-wrap">
        <KpiMiniChart
          type={kpi.chart_type}
          data={kpi.data}
        />
      </div>

      {/* Footer */}
      <div className="kpi-footer">
        <div className="kpi-progress">
          <div
            className="kpi-progress-fill"
            style={{ width: `${kpi.percentage}%` }}
          />
        </div>

        <span className="kpi-meta">
          {isTeam ? (
            <>
              You <strong>{kpi.my_contribution}</strong> / {kpi.target_value}
            </>
          ) : (
            <>
              Progress <strong>{kpi.current_value}</strong> / {kpi.target_value}
            </>
          )}
        </span>
      </div>

      <KpiHoverDetails kpi={kpi} />
    </div>
  );
}
