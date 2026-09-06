import {
  BarChart3,
  Briefcase,
  Building2,
  FileText,
  Gauge,
  HelpCircle,
  History,
  Image as ImageIcon,
  Inbox,
  Layers,
  LayoutTemplate,
  Mail,
  Plug,
  Plus,
  Quote,
  Search,
  Settings,
  Shuffle,
  Users,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  gauge: Gauge,
  'bar-chart': BarChart3,
  inbox: Inbox,
  briefcase: Briefcase,
  'file-text': FileText,
  layers: Layers,
  building: Building2,
  quote: Quote,
  'help-circle': HelpCircle,
  layout: LayoutTemplate,
  image: ImageIcon,
  mail: Mail,
  search: Search,
  shuffle: Shuffle,
  users: Users,
  plug: Plug,
  settings: Settings,
  history: History,
  plus: Plus,
};

export function AdminIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Gauge;
  return <Icon className={className} aria-hidden="true" />;
}
