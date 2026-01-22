import { useState } from "react";

export function ClientLogsDrawer({ open, onClose, loading, logs }) {
  const [expandedLogId, setExpandedLogId] = useState(null);

  const toggleLog = (id) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  // Always return array of strings
  const normalizeValue = (value) => {
    if (value === null || value === undefined) return [];

    if (Array.isArray(value)) return value.map(String);

    if (typeof value === "string") {
      return value.trim() === "" ? [] : [value];
    }

    if (typeof value === "number") {
      return [String(value)];
    }

    return [String(value)];
  };

  const localeDate = (d) => {
    try {
      const dt = d ? new Date(d) : new Date();
      return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(dt);
    } catch {
      return String(d);
    }
  };

  const formatLogValue = (value) => {
    if (value === null || value === undefined) return <em>(empty)</em>;

    // Array → comma list
    if (Array.isArray(value)) {
      return value.length ? value.join(", ") : <em>(empty)</em>;
    }

    // Object → structured display
    if (typeof value === "object") {
      // Timeout Reminder / Reminder-like object
      if ("date" in value) {
        return (
          <>
            {value.date}
            {value.is_complete === false && (
              <span> (Incomplete)</span>
            )}
          </>
        );
      }

      // Fallback object display
      return Object.values(value).join(", ");
    }

    // Empty string
    if (typeof value === "string" && value.trim() === "") {
      return <em>(empty)</em>;
    }

    // Number / string
    return String(value);
  };

  const renderLogRow = (log) => {
    const meta = log.metadata ?? {};
    const prettyMeta =
      typeof meta === "string"
        ? (() => {
            try {
              return JSON.parse(meta);
            } catch {
              return {};
            }
          })()
        : meta;

    const isExpanded = expandedLogId === log.log_id;
    const isBulkUpdate = prettyMeta.type === "bulk_update";

    const changes = Array.isArray(prettyMeta.changes) ? prettyMeta.changes : [];

    const title = `${log.action ?? "Action"}${
      prettyMeta.client_name ? ` — ${prettyMeta.client_name}` : ""
    }`;

    return (
      <div
        key={log.log_id}
        className={`drawerLogRow clickable ${isExpanded ? "expanded" : ""}`}
        onClick={() => toggleLog(log.log_id)}
      >
        <div className="drawerLogHeader">
          <div className="drawerLogTitle">{title}</div>
          <div className="drawerLogDate">{localeDate(log.created_at)}</div>
        </div>

        <div className="drawerLogBody">
          <div>{log.text ?? "-"}</div>

          {isExpanded && !isBulkUpdate && changes.length > 0 && (
            <div className="drawerChanges">
              {changes.map((c, i) => {
                const oldValues = normalizeValue(c.old);
                const newValues = normalizeValue(c.new);

                return (
                  <div key={i} className="drawerChangeRow">
                    <div className="drawerChangeLabel">{c.label}</div>

                    <div className="drawerChangeValues">
                      <div className="old">
                        <span className="tag old">Old:</span>{" "}
                        {formatLogValue(c.old)}
                      </div>

                      <div className="new">
                        <span className="tag new">New:</span>{" "}
                        {formatLogValue(c.new)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {isExpanded && isBulkUpdate && (
            <>
              {/* Fields updated */}
              <div className="drawerBulkFields">
                <h4>Fields updated</h4>

                {prettyMeta.fields?.map((f, i) => (
                  <div className="drawerBulkFieldRow">
                    <div className="label">{f.label}</div>
                    <div className="value">{formatLogValue(f.value)}</div>
                  </div>
                ))}
              </div>

              {/* Affected clients */}
              <div className="drawerAffected">
                <h4>Affected clients ({prettyMeta.affected?.length || 0})</h4>

                <div className="drawerAffectedList">
                  {prettyMeta.affected?.map((a, i) => (
                    <div key={i} className="affectedItem">
                      {a.client_name?.trim() ? a.client_name : a.serial_number}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`client-logs-drawer ${open ? "open" : ""}`}>
      <div className="drawerHeader">
        <h3>Client Logs</h3>
        <button onClick={onClose}>✕</button>
      </div>

      <div className="drawerContent">
        {loading ? (
          <div>Loading…</div>
        ) : logs.length === 0 ? (
          <div>No logs found</div>
        ) : (
          logs.map(renderLogRow)
        )}
      </div>
    </div>
  );
}
