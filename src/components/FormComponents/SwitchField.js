export default function SwitchField({ checked, onChange, ...props }) {
  return (
    <label className="reusable-switch">
      <input type="checkbox" checked={checked} onChange={onChange} {...props} />
      <span className="slider"></span>
    </label>
  );
}
