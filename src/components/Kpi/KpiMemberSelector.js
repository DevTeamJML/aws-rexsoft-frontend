import { useSelectAllCompanyUsers } from "../../../redux/slices/companySlice";

export default function KpiMemberSelector({
  members = [],
  onChange,
}) {
  const allCompanyUsers = useSelectAllCompanyUsers();

  const isChecked = (userId) => members.includes(userId);

  const toggleMember = (userId) => {
    if (isChecked(userId)) {
      onChange(members.filter((id) => id !== userId));
    } else {
      onChange([...members, userId]);
    }
  };

  return (
    <div className="section">
      <h4>Who is measured?</h4>

      {allCompanyUsers.map((user) => {
        const name = `${user.first_name} ${user.last_name}`;

        return (
          <label key={user.user_id} className="checkbox">
            <input
              type="checkbox"
              checked={isChecked(user.user_id)}
              onChange={() => toggleMember(user.user_id)}
            />
            {name}
          </label>
        );
      })}
    </div>
  );
}
