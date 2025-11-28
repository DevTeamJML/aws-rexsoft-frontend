export function ClientLogsDrawer({ open, onClose, loading, logs }) {
  // small helpers from your LogsPage or copy them
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

  const renderLogRow = (log) => {
    const meta = log.metadata ?? {};
    const prettyMeta =
      typeof meta === "string"
        ? (() => {
            try {
              return JSON.parse(meta);
            } catch {
              return meta;
            }
          })()
        : meta;

    const title = `${log.action ?? "Action"} ${
      prettyMeta.client_name ? `— ${prettyMeta.client_name}` : ""
    }`;
    return (
      <div key={log.log_id ?? log.id} className="drawerLogRow">
        <div className="drawerLogHeader">
          <div className="drawerLogTitle">{title}</div>
          <div className="drawerLogDate">{localeDate(log.created_at)}</div>
        </div>
        <div className="drawerLogBody">
          <div>{log.text ?? "-"}</div>
          {/* If bulk update metadata: show fields touched */}
          {prettyMeta?.type === "bulk_update" &&
            Array.isArray(prettyMeta.fields) && (
              <div className="drawerFields">
                <strong>Fields (New):</strong>
                <ul>
                  {prettyMeta.fields.map((f, i) => (
                    <li key={i}>
                      {f.label ?? f.column_id}:{" "}
                      {typeof f.value === "object"
                        ? JSON.stringify(f.value)
                        : String(f.value)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          {/* affected list */}
          {prettyMeta?.affected && Array.isArray(prettyMeta.affected) && (
            <div className="drawerAffected">
              <strong>Affected Client :</strong>
              <div>
                {prettyMeta.affected.slice(0, 20).map((a, i) => (
                  <div key={i}>
                    {a.client_name ?? a.serial_number ?? a.client_id}
                  </div>
                ))}
              </div>
            </div>
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
        {logs.length === 0 ? (
          <div>No logs found</div>
        ) : (
          logs.map(renderLogRow)
        )}
      </div>
    </div>
  );
}
