export function MemberAvatars({ members = [] }) {
  return (
    <div className="member-avatars">
      {members.slice(0, 3).map((m) => (
        <div key={m.user_id} className="avatar">
          {m.first_name?.[0] || "U"}
        </div>
      ))}

      {members.length > 3 && (
        <div className="avatar more">+{members.length - 3}</div>
      )}
    </div>
  );
}
