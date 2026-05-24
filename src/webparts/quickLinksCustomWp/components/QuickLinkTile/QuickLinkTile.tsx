import * as React from 'react';
import { DisplayMode } from '@microsoft/sp-core-library';

import styles from './QuickLinkTile.module.scss';
import {
  DescriptionPlacement,
  IQuickLinkDefaults,
  IQuickLinkItem,
  LinkPlacement,
  SHADOW_MAP,
  TextAlignment
} from '../../models/IQuickLinkItem';
import {
  getBorderRadiusPx,
  getDescriptionFontSizePx,
  getFontSizePx,
  HoverEffect,
  IQuickLinkAppearanceSettings,
  LayoutMode,
  StylePreset
} from '../../models/IQuickLinkWebPartSettings';

export interface IQuickLinkTileProps {
  item: IQuickLinkItem;
  defaults?: IQuickLinkDefaults;
  displayMode: DisplayMode;
  appearance: IQuickLinkAppearanceSettings;
  layoutMode: LayoutMode;
  onEdit: (item: IQuickLinkItem) => void;
}

function getHorizontalAlignClass(alignment: TextAlignment): string {
  switch (alignment) {
    case 'Center':
      return styles.alignHCenter;
    case 'Right':
      return styles.alignHRight;
    default:
      return styles.alignHLeft;
  }
}

function getVerticalAlignClass(placement: LinkPlacement): string {
  switch (placement) {
    case 'Top':
      return styles.alignVTop;
    case 'Bottom':
      return styles.alignVBottom;
    default:
      return styles.alignVMiddle;
  }
}

function getPresetClass(preset: StylePreset): string {
  switch (preset) {
    case 'Outlined':
      return styles.presetOutlined;
    case 'Glass':
      return styles.presetGlass;
    case 'Soft':
      return styles.presetSoft;
    default:
      return styles.presetFilled;
  }
}

function getHoverClass(effect: HoverEffect): string | undefined {
  switch (effect) {
    case 'Glow':
      return styles.hoverGlow;
    case 'Scale':
      return styles.hoverScale;
    case 'None':
      return undefined;
    default:
      return styles.hoverLift;
  }
}

function resolveDescriptionPlacement(
  item: IQuickLinkItem,
  appearance: IQuickLinkAppearanceSettings
): DescriptionPlacement {
  return item.DescriptionPlacement ?? appearance.descriptionPlacement ?? 'BelowTitle';
}

const QuickLinkTile: React.FC<IQuickLinkTileProps> = ({
  item,
  defaults,
  displayMode,
  appearance,
  layoutMode,
  onEdit
}) => {
  const imageUrl = item.ImageURL ? item.ImageURL.trim() : '';
  const backColor = item.LinkBackColor || '#f3f2f1';
  const fontColor = appearance.useSiteTheme ? undefined : (item.LinkFontColor || '#000000');
  const imgAlign = item.ImageAlignment || 'Left';
  const imgPlace = item.ImagePlacement || 'Middle';
  const appliedShadow = SHADOW_MAP[item.LinkShade ?? 'Light'] ?? SHADOW_MAP.Light;
  const hoverClass = getHoverClass(appearance.hoverEffect);

  const placement = resolveDescriptionPlacement(item, appearance);
  const descriptionText = item.Description?.trim() ?? '';
  const showDescription = placement !== 'Hidden' && descriptionText.length > 0;
  const descriptionColor =
    item.DescriptionFontColor ?? appearance.descriptionFontColor ?? '#605e5c';
  const descriptionSize = item.DescriptionFontSize ?? appearance.descriptionFontSize ?? 'Small';

  const textAlignment: TextAlignment = item.TextAlignment ?? defaults?.textAlignment ?? 'Left';
  const linkPlacement: LinkPlacement = item.LinkPlacement ?? defaults?.linkPlacement ?? 'Middle';

  const tileClasses = [
    styles.tileLink,
    displayMode === DisplayMode.Edit ? styles.tileLinkWithEdit : undefined,
    getHorizontalAlignClass(textAlignment),
    getVerticalAlignClass(linkPlacement),
    getPresetClass(appearance.stylePreset),
    appearance.useSiteTheme ? styles.themeAware : undefined,
    hoverClass,
    layoutMode === 'List' ? styles.listModeTile : undefined,
    layoutMode === 'Scroll' ? styles.scrollModeTile : undefined
  ]
    .filter(Boolean)
    .join(' ');

  const imageBadgeStyle: React.CSSProperties = {
    left: imgAlign === 'Left' ? '5px' : imgAlign === 'Center' ? '50%' : 'auto',
    right: imgAlign === 'Right' ? '5px' : 'auto',
    top: imgPlace === 'Top' ? '5px' : imgPlace === 'Middle' ? '50%' : 'auto',
    bottom: imgPlace === 'Bottom' ? '5px' : 'auto',
    transform: `${imgAlign === 'Center' ? 'translateX(-50%)' : ''} ${imgPlace === 'Middle' ? 'translateY(-50%)' : ''}`.trim() || 'none'
  };

  const cleanHref = item.LinkURL?.Url ? item.LinkURL.Url : '#';
  const tileWidth = layoutMode === 'List' ? '100%' : item.LinkWidth ? `${item.LinkWidth}px` : '220px';
  const tileHeight = item.LinkHeight ? `${item.LinkHeight}px` : '100px';

  const descriptionEl = showDescription ? (
    <span
      className={`${styles.descriptionText} ${placement === 'Bottom' ? styles.descriptionBottom : ''}`}
      style={{
        color: appearance.useSiteTheme ? undefined : descriptionColor,
        fontSize: getDescriptionFontSizePx(descriptionSize)
      }}
    >
      {descriptionText}
    </span>
  ) : null;

  return (
    <li className={styles.quickLinkTile}>
      <div
        className={styles.tileWrapper}
        style={{
          width: tileWidth,
          height: tileHeight,
          minWidth: layoutMode === 'List' ? undefined : '80px',
          minHeight: '48px'
        }}
      >
        {displayMode === DisplayMode.Edit && (
          <button
            type="button"
            className={styles.editButton}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(item);
            }}
            title="Edit Link Settings"
            aria-label="Edit link"
          >
            Edit
          </button>
        )}

        <a
          href={cleanHref}
          target="_blank"
          rel="noopener noreferrer"
          className={tileClasses}
          style={{
            backgroundColor: appearance.stylePreset === 'Outlined' ? 'transparent' : backColor,
            color: fontColor,
            width: '100%',
            height: '100%',
            borderRadius: getBorderRadiusPx(appearance.borderRadius),
            boxShadow: appliedShadow,
            fontSize: getFontSizePx(item.FontSize ?? appearance.fontSize)
          }}
        >
          {imageUrl && (
            <span className={styles.imageBadge} style={imageBadgeStyle}>
              <img
                src={imageUrl}
                alt=""
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </span>
          )}

          <span
            className={[
              styles.contentStack,
              placement === 'Bottom' ? styles.contentStackBottom : undefined
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {placement === 'AboveTitle' && descriptionEl}
            <span className={styles.titleText}>{item.Title}</span>
            {placement === 'BelowTitle' && descriptionEl}
            {placement === 'Bottom' && descriptionEl}
          </span>
        </a>
      </div>
    </li>
  );
};

export default QuickLinkTile;
