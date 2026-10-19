export default function Avatar({ user, size = 40 }) {
  return (
    <img
      className="avatar"
      src={user.photoUrl}
      alt={user.fullName}
      width={size}
      height={size}
    />
  );
}
