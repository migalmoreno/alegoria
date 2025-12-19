interface UserAvatarProps {
  thumbnail: string;
  extraClassNames?: string;
}

export const UserAvatar = ({ thumbnail, extraClassNames }: UserAvatarProps) => {
  return (
    <img
      className={`rounded-full object-cover ${extraClassNames} border border-neutral-800`}
      src={`${import.meta.env.VITE_API_URL}/api/v1/proxy?url=${encodeURIComponent(thumbnail)}`}
    />
  );
};
