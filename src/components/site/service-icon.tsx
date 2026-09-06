import {
  Code2,
  Layers,
  Palette,
  Search,
  ShoppingCart,
  Smartphone,
  Target,
  Globe,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  code: Code2,
  layers: Layers,
  smartphone: Smartphone,
  wordpress: Globe,
  'shopping-cart': ShoppingCart,
  palette: Palette,
  search: Search,
  target: Target,
};

export function ServiceIcon({
  iconKey,
  className,
}: {
  iconKey: string | null;
  className?: string;
}) {
  const Icon = (iconKey && ICONS[iconKey]) || Code2;
  return <Icon className={className} aria-hidden="true" />;
}
