export const EmptyState = ({
    icon,
    title = "",
    message = "",
}) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{message}</p>
  </div>
);
