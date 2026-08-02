import { cva, VariantProps } from 'class-variance-authority';
import { Avatar, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';

const avatarVairants = cva('', {
  variants: {
    size: {
      default: 'h-9 w-9',
      xs: 'h-4 w-4',
      sm: 'h-6 w-6',
      lg: 'h-10 w-10',
      xl: 'h-[160px] w-[160px]',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

interface UserAvatarProps extends VariantProps<typeof avatarVairants> {
  imageUrl: string;
  name: string;
  className?: string;
  onClick?: () => void;
}

const UserAvatar = ({
  imageUrl,
  name,
  size,
  className,
  onClick,
}: UserAvatarProps) => {
  return (
    <Avatar
      className={cn(avatarVairants({ size, className }))}
      onClick={onClick}
    >
      <AvatarImage src={imageUrl} alt={name} />
    </Avatar>
  );
};

export default UserAvatar;
