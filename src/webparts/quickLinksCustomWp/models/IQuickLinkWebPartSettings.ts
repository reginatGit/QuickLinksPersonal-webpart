import * as React from 'react';

import { DescriptionPlacement, FontSizePreset } from './IQuickLinkItem';

export type LayoutMode = 'Grid' | 'Scroll' | 'List';
export type SortBy = 'Title' | 'SortOrder' | 'Created';
export type GridColumns = 'Auto' | '1' | '2' | '3' | '4' | '5' | '6';
export type LayoutGap = '8' | '12' | '16' | '24';
export type LayoutAlignment = 'Left' | 'Center' | 'FullWidth';
export type StylePreset = 'Filled' | 'Outlined' | 'Soft' | 'Glass';
export type BorderRadiusPreset = '4' | '8' | '12' | '16' | 'Full';
export type HoverEffect = 'Lift' | 'Glow' | 'Scale' | 'None';

export type { DescriptionPlacement, FontSizePreset };

export interface IQuickLinkLayoutSettings {
  layoutMode: LayoutMode;
  columns: GridColumns;
  tileMinWidth: number;
  gap: LayoutGap;
  alignment: LayoutAlignment;
}

export interface IQuickLinkAppearanceSettings {
  stylePreset: StylePreset;
  borderRadius: BorderRadiusPreset;
  hoverEffect: HoverEffect;
  useSiteTheme: boolean;
  showTitle: boolean;
  titleText: string;
  fontSize: FontSizePreset;
  descriptionPlacement: DescriptionPlacement;
  descriptionFontColor: string;
  descriptionFontSize: FontSizePreset;
  isDarkTheme: boolean;
}

export interface IQuickLinkDataSettings {
  sortBy: SortBy;
}

const layoutModes: LayoutMode[] = ['Grid', 'Scroll', 'List'];
const sortOptions: SortBy[] = ['Title', 'SortOrder', 'Created'];
const columnOptions: GridColumns[] = ['Auto', '1', '2', '3', '4', '5', '6'];
const gapOptions: LayoutGap[] = ['8', '12', '16', '24'];
const alignmentOptions: LayoutAlignment[] = ['Left', 'Center', 'FullWidth'];
const stylePresets: StylePreset[] = ['Filled', 'Outlined', 'Soft', 'Glass'];
const radiusPresets: BorderRadiusPreset[] = ['4', '8', '12', '16', 'Full'];
const hoverEffects: HoverEffect[] = ['Lift', 'Glow', 'Scale', 'None'];
const fontSizes: FontSizePreset[] = ['Small', 'Medium', 'Large'];
const descriptionPlacements: DescriptionPlacement[] = ['BelowTitle', 'AboveTitle', 'Bottom', 'Hidden'];

function pickEnum<T extends string>(value: string | undefined, allowed: T[], fallback: T): T {
  return allowed.indexOf(value as T) >= 0 ? (value as T) : fallback;
}

export function resolveLayoutSettings(props: {
  layoutMode?: string;
  columns?: string;
  tileMinWidth?: string | number;
  gap?: string;
  alignment?: string;
}): IQuickLinkLayoutSettings {
  return {
    layoutMode: pickEnum(props.layoutMode, layoutModes, 'Grid'),
    columns: pickEnum(props.columns, columnOptions, 'Auto'),
    tileMinWidth: Number(props.tileMinWidth) || 180,
    gap: pickEnum(props.gap, gapOptions, '16'),
    alignment: pickEnum(props.alignment, alignmentOptions, 'Left')
  };
}

export function resolveAppearanceSettings(props: {
  stylePreset?: string;
  borderRadius?: string;
  hoverEffect?: string;
  useSiteTheme?: boolean;
  showTitle?: boolean;
  titleText?: string;
  defaultFontSize?: string;
  defaultDescriptionPlacement?: string;
  defaultDescriptionFontColor?: string;
  defaultDescriptionFontSize?: string;
  isDarkTheme?: boolean;
}): IQuickLinkAppearanceSettings {
  return {
    stylePreset: pickEnum(props.stylePreset, stylePresets, 'Soft'),
    borderRadius: pickEnum(props.borderRadius, radiusPresets, '12'),
    hoverEffect: pickEnum(props.hoverEffect, hoverEffects, 'Lift'),
    useSiteTheme: props.useSiteTheme !== false,
    showTitle: props.showTitle !== false,
    titleText: props.titleText?.trim() || 'Quick Links',
    fontSize: pickEnum(props.defaultFontSize, fontSizes, 'Medium'),
    descriptionPlacement: pickEnum(props.defaultDescriptionPlacement, descriptionPlacements, 'BelowTitle'),
    descriptionFontColor: props.defaultDescriptionFontColor?.trim() || '#605e5c',
    descriptionFontSize: pickEnum(props.defaultDescriptionFontSize, fontSizes, 'Small'),
    isDarkTheme: !!props.isDarkTheme
  };
}

export function resolveDataSettings(props: { sortBy?: string }): IQuickLinkDataSettings {
  return {
    sortBy: pickEnum(props.sortBy, sortOptions, 'Title')
  };
}

export function getBorderRadiusPx(radius: BorderRadiusPreset): string {
  if (radius === 'Full') {
    return '999px';
  }
  return `${radius}px`;
}

export function getFontSizePx(size: FontSizePreset): string {
  switch (size) {
    case 'Small':
      return '13px';
    case 'Large':
      return '17px';
    default:
      return '15px';
  }
}

export function getDescriptionFontSizePx(size: FontSizePreset): string {
  switch (size) {
    case 'Small':
      return '11px';
    case 'Large':
      return '13px';
    default:
      return '12px';
  }
}

export function getLayoutContainerStyle(layout: IQuickLinkLayoutSettings): React.CSSProperties {
  const gap = `${layout.gap}px`;
  const base: React.CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    gap
  };

  switch (layout.layoutMode) {
    case 'Scroll':
      return {
        ...base,
        display: 'flex',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        paddingBottom: '4px'
      };
    case 'List':
      return {
        ...base,
        display: 'flex',
        flexDirection: 'column',
        width: layout.alignment === 'FullWidth' ? '100%' : undefined
      };
    default:
      if (layout.columns === 'Auto') {
        return {
          ...base,
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(${layout.tileMinWidth}px, 1fr))`,
          width: '100%'
        };
      }
      return {
        ...base,
        display: 'grid',
        gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
        width: '100%'
      };
  }
}

export function getLayoutAlignmentStyle(alignment: LayoutAlignment): React.CSSProperties {
  switch (alignment) {
    case 'Center':
      return { display: 'flex', flexDirection: 'column', alignItems: 'center' };
    case 'FullWidth':
      return { width: '100%' };
    default:
      return {};
  }
}
