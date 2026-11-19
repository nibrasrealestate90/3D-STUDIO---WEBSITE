'use client';

import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import type { IconSvgElement } from '@hugeicons/react';
import {
  AlertCircleIcon as HAlertCircle,
  ArrowLeft01Icon as HArrowLeft,
  ArrowRight01Icon as HArrowRight,
  BubbleChatIcon as HBubbleChat,
  Call02Icon as HPhone,
  Cancel01Icon as HCancel,
  CheckmarkCircle02Icon as HCheckCircle,
  ChevronLeftIcon as HChevronLeft,
  ChevronRightIcon as HChevronRight,
  Clock01Icon as HClock,
  Compass01Icon as HCompass,
  FavouriteIcon as HFavourite,
  File01Icon as HFile,
  InformationCircleIcon as HInfo,
  InstagramIcon as HInstagram,
  Layers01Icon as HLayers,
  LinkSquare01Icon as HExternalLink,
  Loading03Icon as HLoading,
  Location01Icon as HLocation,
  Mail01Icon as HMail,
  Maximize01Icon as HMaximize,
  Menu01Icon as HMenu,
  MinusSignIcon as HMinus,
  Package01Icon as HPackage,
  PackageXIcon as HPackageX,
  PlusSignIcon as HPlus,
  RotateLeft01Icon as HRotateLeft,
  RulerIcon as HRuler,
  Search01Icon as HSearch,
  ShieldCheckIcon as HShieldCheck,
  SlidersHorizontalIcon as HSliders,
  SparklesIcon as HSparkles,
  Tick01Icon as HTick,
  ViewIcon as HView,
  WeightScale01Icon as HWeightScale,
  WhatsappIcon as HWhatsapp,
  Wrench01Icon as HWrench,
} from '@hugeicons/core-free-icons';

export interface HugeIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  fill?: string;
}

function createIcon(iconData: IconSvgElement) {
  const IconComponent = function HugeiconComponent({
    className = 'w-5 h-5',
    size = 24,
    color = 'currentColor',
    strokeWidth = 1.5,
    ...props
  }: HugeIconProps) {
    return (
      <HugeiconsIcon
        icon={iconData}
        className={className}
        size={size}
        color={color}
        strokeWidth={strokeWidth}
        {...props}
      />
    );
  };
  IconComponent.displayName = 'Hugeicon';
  return IconComponent;
}

// ----------------------------------------------------------------------------
// Hugeicons Design System Export
// ----------------------------------------------------------------------------

export const SearchIcon = createIcon(HSearch);
export const MenuIcon = createIcon(HMenu);
export const CloseIcon = createIcon(HCancel);
export const ArrowRightIcon = createIcon(HArrowRight);
export const ArrowLeftIcon = createIcon(HArrowLeft);
export const ChevronRightIcon = createIcon(HChevronRight);
export const ChevronLeftIcon = createIcon(HChevronLeft);
export const HeartIcon = createIcon(HFavourite);
export const EyeIcon = createIcon(HView);
export const MapPinIcon = createIcon(HLocation);
export const MessageCircleIcon = createIcon(HBubbleChat);
export const PhoneIcon = createIcon(HPhone);
export const MailIcon = createIcon(HMail);
export const ClockIcon = createIcon(HClock);
export const CheckIcon = createIcon(HTick);
export const CheckCircleIcon = createIcon(HCheckCircle);
export const AlertCircleIcon = createIcon(HAlertCircle);
export const InfoIcon = createIcon(HInfo);
export const SparklesIcon = createIcon(HSparkles);
export const LayersIcon = createIcon(HLayers);
export const RulerIcon = createIcon(HRuler);
export const WeightIcon = createIcon(HWeightScale);
export const WrenchIcon = createIcon(HWrench);
export const ShieldCheckIcon = createIcon(HShieldCheck);
export const SlidersIcon = createIcon(HSliders);
export const RotateLeftIcon = createIcon(HRotateLeft);
export const MaximizeIcon = createIcon(HMaximize);
export const MinusIcon = createIcon(HMinus);
export const PlusIcon = createIcon(HPlus);
export const LoadingIcon = createIcon(HLoading);
export const PackageIcon = createIcon(HPackage);
export const PackageXIcon = createIcon(HPackageX);
export const FileIcon = createIcon(HFile);
export const CompassIcon = createIcon(HCompass);
export const ExternalLinkIcon = createIcon(HExternalLink);
export const InstagramIcon = createIcon(HInstagram);
export const WhatsAppIcon = createIcon(HWhatsapp);
