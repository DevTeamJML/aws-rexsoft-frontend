import moment from "moment";
import { MemberAvatars } from "./MemberAvatars";

export function KpiHoverDetails({ kpi }) {
  const isTeamContribution = kpi?.team_contribution;
  const isPerEntry = kpi?.measurement_rule === "per_entry";
  const valueSuffix = isPerEntry ? "submissions" : kpi?.unit;
  return (
    <div className="kpi-hover">
      {/* Header */}
      <div className="kpi-hover-header">
        <span className="badge">KPI Details</span>
      </div>
      {/* Stats */}

      <div className="kpi-hover-stats">
        <div className="row">
          <span>🎯 Target</span>
          <strong>
            {kpi.target_value} {valueSuffix}
          </strong>
        </div>

        <div className="row">
          <span>{`📈 ${isTeamContribution ? "Team" : "Your"} Total`}</span>
          <strong>
            {kpi.current_value} {valueSuffix}
          </strong>
        </div>

        {kpi.team_contribution && (
          <div className="row highlight">
            <span>👤 You</span>
            <strong>
              {kpi.my_contribution} {valueSuffix}
            </strong>
          </div>
        )}
      </div>
      {/* Progress */}
      <div className="kpi-hover-progress">
        <div className="progress-bar">
          <div className="fill" style={{ width: `${kpi.percentage}%` }} />
        </div>
        <span className="percent">{kpi.percentage}% completed</span>
      </div>
      {/* Dates */}
      <div className="kpi-hover-dates">
        🗓 {moment(kpi.start_date).format("YYYY-MM-DD") || "N/A"} →{" "}
        {moment(kpi.due_date).format("YYYY-MM-DD") || "N/A"}
      </div>
      {/* Members */}
      <div className="kpi-hover-members">
        <span className="label">Members</span>
        <MemberAvatars members={kpi.members} />
      </div>
    </div>
  );
}
