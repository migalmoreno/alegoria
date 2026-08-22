interface UserAvatarProps {
  thumbnail?: string;
  extraClassNames?: string;
}

export const UserAvatar = ({ thumbnail, extraClassNames }: UserAvatarProps) => {
  return (
    <img
      alt=""
      className={`rounded-full object-cover ${extraClassNames}`}
      src={thumbnail ? `${import.meta.env.VITE_API_URL}/api/v1/proxy?url=${encodeURIComponent(thumbnail)}` : undefined}
    />
  );
};
