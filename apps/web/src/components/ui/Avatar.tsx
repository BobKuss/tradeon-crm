interface AvatarProps {
  initials: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  title?: string;
}

const sizeClasses = { sm: 'h-7 w-7 text-xs', md: 'h-8 w-8 text-sm', lg: 'h-10 w-10 text-base' };

export function Avatar({ initials, color = '#333838', size = 'md', title }: AvatarProps) {
  return (
    <span
      title={title}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${sizeClasses[size]}`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </span>
  );
}
