import {
  AppWindow,
  ArrowLeft,
  ArrowRight,
  Award,
  Bath,
  Bell,
  Boxes,
  Briefcase,
  Building2,
  Calendar,
  CalendarX,
  Check,
  CircleAlert,
  CircleCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  CookingPot,
  CreditCard,
  Fence,
  FileText,
  Headset,
  House,
  Info,
  Leaf,
  LoaderCircle,
  Lock,
  Mail,
  MapPin,
  Menu,
  Minus,
  MousePointerClick,
  MoveHorizontal,
  PaintRoller,
  Phone,
  Plus,
  Receipt,
  Refrigerator,
  Repeat,
  Ruler,
  Sofa,
  Sparkles,
  Star,
  Truck,
  UserCheck,
  Users,
  Wallet,
  X,
  type LucideProps,
} from 'lucide-react';

const icons = {
  appWindow: AppWindow,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  award: Award,
  bath: Bath,
  bell: Bell,
  boxes: Boxes,
  briefcase: Briefcase,
  building: Building2,
  calendar: Calendar,
  calendarX: CalendarX,
  check: Check,
  checkCircle: CircleCheck,
  alert: CircleAlert,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  clock: Clock,
  oven: CookingPot,
  card: CreditCard,
  fence: Fence,
  file: FileText,
  headset: Headset,
  house: House,
  info: Info,
  leaf: Leaf,
  loader: LoaderCircle,
  lock: Lock,
  mail: Mail,
  mapPin: MapPin,
  menu: Menu,
  minus: Minus,
  pointer: MousePointerClick,
  moveHorizontal: MoveHorizontal,
  paintRoller: PaintRoller,
  phone: Phone,
  plus: Plus,
  receipt: Receipt,
  fridge: Refrigerator,
  repeat: Repeat,
  ruler: Ruler,
  sofa: Sofa,
  sparkles: Sparkles,
  star: Star,
  truck: Truck,
  userCheck: UserCheck,
  users: Users,
  wallet: Wallet,
  x: X,
} as const;

export type IconName = keyof typeof icons;

export function Icon({ name, size = 20, strokeWidth = 1.85, ...props }: { name: IconName } & LucideProps) {
  const Component = icons[name];
  return <Component size={size} strokeWidth={strokeWidth} aria-hidden="true" focusable="false" {...props} />;
}

/** Brand marks (Lucide v1 ships no brand icons). */
export function FacebookIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M13.5 21v-7.5h2.53l.38-2.94H13.5V8.69c0-.85.24-1.43 1.46-1.43h1.56V4.63a20.9 20.9 0 0 0-2.27-.12c-2.25 0-3.79 1.37-3.79 3.9v2.16H7.9v2.94h2.56V21h3.04Z" />
    </svg>
  );
}

export function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
