export type ImageAlignment = 'Left' | 'Center' | 'Right';
export type ImagePlacement = 'Top' | 'Middle' | 'Bottom';
/** Vertical position of link text block inside the tile */
export type LinkPlacement = 'Top' | 'Middle' | 'Bottom';
/** Horizontal alignment of link text inside the tile */
export type TextAlignment = 'Left' | 'Center' | 'Right';
export type LinkShade = 'None' | 'Light' | 'Medium' | 'Heavy';
export type FontSizePreset = 'Small' | 'Medium' | 'Large';
export type DescriptionPlacement = 'BelowTitle' | 'AboveTitle' | 'Bottom' | 'Hidden';

export interface IQuickLinkHyperlink {
  Url: string;
  Description?: string;
}

export interface IQuickLinkItem {
  Id?: number;
  Title: string;
  LinkURL: IQuickLinkHyperlink;
  ImageURL?: string;
  LinkFontColor?: string;
  LinkBackColor?: string;
  LinkPlacement?: LinkPlacement;
  TextAlignment?: TextAlignment;
  LinkWidth?: number;
  LinkHeight?: number;
  ImageAlignment?: ImageAlignment;
  ImagePlacement?: ImagePlacement;
  LinkShade?: LinkShade;
  FontSize?: FontSizePreset;
  Description?: string;
  DescriptionPlacement?: DescriptionPlacement;
  DescriptionFontColor?: string;
  DescriptionFontSize?: FontSizePreset;
  Category?: string;
  SortOrder?: number;
}

export interface IQuickLinkDefaults {
  width: number;
  height: number;
  shade: LinkShade;
  fontColor: string;
  backColor: string;
  fontSize: FontSizePreset;
  imageAlignment: ImageAlignment;
  imagePlacement: ImagePlacement;
  linkPlacement: LinkPlacement;
  textAlignment: TextAlignment;
  description: string;
  descriptionPlacement: DescriptionPlacement;
  descriptionFontColor: string;
  descriptionFontSize: FontSizePreset;
  category: string;
  sortOrder: number;
}

export const FONT_COLORS: string[] = ['#000000', '#323130', '#0078d4', '#107c41', '#a4262c', '#ffffff'];
export const BACK_COLORS: string[] = ['#f3f2f1', '#eef7f2', '#fff4ce', '#fde7e9', '#dff6dd', '#e5f3ff', '#ffffff'];
export const DESCRIPTION_FONT_COLORS: string[] = [
  '#605e5c',
  '#323130',
  '#0078d4',
  '#107c41',
  '#a4262c',
  '#666666',
  '#ffffff'
];

export const SHADOW_MAP: Record<LinkShade, string> = {
  None: 'none',
  Light: '0 2px 4px rgba(0,0,0,0.1)',
  Medium: '0 4px 10px rgba(0,0,0,0.2)',
  Heavy: '0 8px 24px rgba(0,0,0,0.3)'
};
