interface BulletProps {
  extraClassName?: string;
}

export const Bullet = ({ extraClassName }: BulletProps) => (
  <span
    dangerouslySetInnerHTML={{ __html: "&bull;" }}
    className={`text-[0.75rem] ${extraClassName}`}
  ></span>
);
