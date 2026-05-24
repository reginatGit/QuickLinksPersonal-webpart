import {
  DescriptionPlacement,
  FontSizePreset,
  IQuickLinkDefaults,
  IQuickLinkItem,
  ImageAlignment,
  ImagePlacement,
  LinkPlacement,
  LinkShade,
  TextAlignment
} from './IQuickLinkItem';

export const DEFAULT_QUICK_LINK_DEFAULTS: IQuickLinkDefaults = {
  width: 150,
  height: 50,
  shade: 'None',
  fontColor: '#000000',
  backColor: '#f3f2f1',
  fontSize: 'Medium',
  imageAlignment: 'Left',
  imagePlacement: 'Middle',
  linkPlacement: 'Middle',
  textAlignment: 'Left',
  description: '',
  descriptionPlacement: 'BelowTitle',
  descriptionFontColor: '#605e5c',
  descriptionFontSize: 'Small',
  category: '',
  sortOrder: 0
};

export function resolveQuickLinkDefaults(
  partial?: Partial<IQuickLinkDefaults>
): IQuickLinkDefaults {
  return { ...DEFAULT_QUICK_LINK_DEFAULTS, ...partial };
}

export function createEmptyQuickLink(defaults?: Partial<IQuickLinkDefaults>): IQuickLinkItem {
  const d = resolveQuickLinkDefaults(defaults);
  return {
    Title: '',
    LinkURL: { Url: '', Description: '' },
    ImageURL: '',
    LinkFontColor: d.fontColor,
    LinkBackColor: d.backColor,
    LinkPlacement: d.linkPlacement,
    TextAlignment: d.textAlignment,
    LinkWidth: d.width,
    LinkHeight: d.height,
    ImageAlignment: d.imageAlignment,
    ImagePlacement: d.imagePlacement,
    LinkShade: d.shade,
    FontSize: d.fontSize,
    Description: d.description,
    DescriptionPlacement: d.descriptionPlacement,
    DescriptionFontColor: d.descriptionFontColor,
    DescriptionFontSize: d.descriptionFontSize,
    Category: d.category || undefined,
    SortOrder: d.sortOrder
  };
}

function asSortOrder(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function asLinkShade(value: unknown): LinkShade {
  const shades: LinkShade[] = ['None', 'Light', 'Medium', 'Heavy'];
  return shades.indexOf(value as LinkShade) >= 0 ? (value as LinkShade) : 'Light';
}

function asImageAlignment(value: unknown): ImageAlignment {
  const alignments: ImageAlignment[] = ['Left', 'Center', 'Right'];
  return alignments.indexOf(value as ImageAlignment) >= 0 ? (value as ImageAlignment) : 'Left';
}

function asImagePlacement(value: unknown): ImagePlacement {
  const placements: ImagePlacement[] = ['Top', 'Middle', 'Bottom'];
  return placements.indexOf(value as ImagePlacement) >= 0 ? (value as ImagePlacement) : 'Middle';
}

function asFontSize(value: unknown): FontSizePreset | undefined {
  const sizes: FontSizePreset[] = ['Small', 'Medium', 'Large'];
  return sizes.indexOf(value as FontSizePreset) >= 0 ? (value as FontSizePreset) : undefined;
}

function asDescriptionPlacement(value: unknown): DescriptionPlacement | undefined {
  const placements: DescriptionPlacement[] = ['BelowTitle', 'AboveTitle', 'Bottom', 'Hidden'];
  return placements.indexOf(value as DescriptionPlacement) >= 0
    ? (value as DescriptionPlacement)
    : undefined;
}

function asVerticalPlacement(value: unknown): LinkPlacement | undefined {
  const placements: LinkPlacement[] = ['Top', 'Middle', 'Bottom'];
  return placements.indexOf(value as LinkPlacement) >= 0 ? (value as LinkPlacement) : undefined;
}

function asHorizontalAlignment(value: unknown): TextAlignment | undefined {
  const alignments: TextAlignment[] = ['Left', 'Center', 'Right'];
  return alignments.indexOf(value as TextAlignment) >= 0 ? (value as TextAlignment) : undefined;
}

/** Maps list values; supports legacy LinkPlacement used for horizontal alignment. */
export function parseTextAndLinkPlacement(
  linkPlacementRaw: unknown,
  textAlignmentRaw: unknown
): { linkPlacement: LinkPlacement; textAlignment: TextAlignment } {
  const textFromColumn = asHorizontalAlignment(textAlignmentRaw);
  const verticalFromColumn = asVerticalPlacement(linkPlacementRaw);

  if (textFromColumn) {
    return {
      textAlignment: textFromColumn,
      linkPlacement: verticalFromColumn ?? 'Middle'
    };
  }

  const legacy = typeof linkPlacementRaw === 'string' ? linkPlacementRaw : '';
  if (legacy === 'Left' || legacy === 'Right') {
    return { textAlignment: legacy as TextAlignment, linkPlacement: 'Middle' };
  }
  if (legacy === 'Middle') {
    return { textAlignment: 'Center', linkPlacement: 'Middle' };
  }
  if (verticalFromColumn) {
    return { textAlignment: 'Left', linkPlacement: verticalFromColumn };
  }

  return { textAlignment: 'Left', linkPlacement: 'Middle' };
}

export function quickLinkFromListItem(raw: Record<string, unknown>): IQuickLinkItem {
  const linkUrl = raw.LinkURL as IQuickLinkItem['LinkURL'] | undefined;
  const { linkPlacement, textAlignment } = parseTextAndLinkPlacement(
    raw.LinkPlacement,
    raw.TextAlignment
  );

  return {
    Id: typeof raw.Id === 'number' ? raw.Id : undefined,
    Title: typeof raw.Title === 'string' ? raw.Title : '',
    LinkURL: {
      Url: linkUrl?.Url ?? '',
      Description: linkUrl?.Description
    },
    ImageURL: typeof raw.ImageURL === 'string' ? raw.ImageURL : '',
    LinkFontColor: typeof raw.LinkFontColor === 'string' ? raw.LinkFontColor : undefined,
    LinkBackColor: typeof raw.LinkBackColor === 'string' ? raw.LinkBackColor : undefined,
    LinkPlacement: linkPlacement,
    TextAlignment: textAlignment,
    LinkWidth: typeof raw.LinkWidth === 'number' ? raw.LinkWidth : undefined,
    LinkHeight: typeof raw.LinkHeight === 'number' ? raw.LinkHeight : undefined,
    ImageAlignment: asImageAlignment(raw.ImageAlignment),
    ImagePlacement: asImagePlacement(raw.ImagePlacement),
    LinkShade: asLinkShade(raw.LinkShade),
    FontSize: asFontSize(raw.FontSize),
    Description: typeof raw.Description === 'string' ? raw.Description : undefined,
    DescriptionPlacement: asDescriptionPlacement(raw.DescriptionPlacement),
    DescriptionFontColor:
      typeof raw.DescriptionFontColor === 'string' ? raw.DescriptionFontColor : undefined,
    DescriptionFontSize: asFontSize(raw.DescriptionFontSize),
    Category: typeof raw.Category === 'string' ? raw.Category : undefined,
    SortOrder: asSortOrder(raw.SortOrder)
  };
}

export function quickLinkToListPayload(link: IQuickLinkItem): Record<string, unknown> {
  return {
    Title: link.Title || 'Untitled Link',
    ImageURL: link.ImageURL ? link.ImageURL.trim() : '',
    LinkFontColor: link.LinkFontColor,
    LinkBackColor: link.LinkBackColor,
    LinkPlacement: link.LinkPlacement,
    TextAlignment: link.TextAlignment,
    LinkWidth: Number(link.LinkWidth),
    LinkHeight: Number(link.LinkHeight),
    ImageAlignment: link.ImageAlignment,
    ImagePlacement: link.ImagePlacement,
    LinkShade: link.LinkShade,
    FontSize: link.FontSize,
    Description: link.Description?.trim() ?? '',
    DescriptionPlacement: link.DescriptionPlacement,
    DescriptionFontColor: link.DescriptionFontColor,
    DescriptionFontSize: link.DescriptionFontSize,
    Category: link.Category,
    SortOrder: Number(link.SortOrder ?? 0),
    LinkURL: {
      Url: link.LinkURL?.Url ? link.LinkURL.Url.trim() : '',
      Description: link.Title || 'Link URL'
    }
  };
}
