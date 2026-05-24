import { IQuickLinksCustomWpWebPartProps } from './QuickLinksCustomWpWebPart';

export const WEB_PART_PROPERTY_DEFAULTS: IQuickLinksCustomWpWebPartProps = {
  listName: '',
  Category: '',
  sortBy: 'Title',
  layoutMode: 'Grid',
  columns: 'Auto',
  tileMinWidth: '180',
  gap: '16',
  alignment: 'Left',
  stylePreset: 'Soft',
  borderRadius: '12',
  hoverEffect: 'Lift',
  useSiteTheme: true,
  showTitle: true,
  titleText: 'Quick Links',
  defaultWidth: '150',
  defaultHeight: '50',
  globalShade: 'None',
  defaultFontColor: '#000000',
  defaultBackColor: '#f3f2f1',
  defaultFontSize: 'Medium',
  defaultDescriptionPlacement: 'BelowTitle',
  defaultDescriptionFontColor: '#605e5c',
  defaultDescriptionFontSize: 'Small',
  defaultLinkPlacement: 'Middle',
  defaultTextAlignment: 'Left',
  defaultImageAlignment: 'Left',
  defaultImagePlacement: 'Middle',
  defaultDescription: '',
  defaultCategory: ''
};

function normalizeNumericTextField(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Merge defaults without letting explicit `undefined` wipe manifest defaults. */
export function getWebPartPropertiesWithDefaults(
  properties: Partial<IQuickLinksCustomWpWebPartProps>
): IQuickLinksCustomWpWebPartProps {
  const merged: IQuickLinksCustomWpWebPartProps = { ...WEB_PART_PROPERTY_DEFAULTS };

  (Object.keys(properties) as Array<keyof IQuickLinksCustomWpWebPartProps>).forEach((key) => {
    const value = properties[key];
    if (value !== undefined && value !== null) {
      merged[key] = value as never;
    }
  });

  merged.tileMinWidth = String(normalizeNumericTextField(merged.tileMinWidth, 180));
  merged.defaultWidth = String(normalizeNumericTextField(merged.defaultWidth, 150));
  merged.defaultHeight = String(normalizeNumericTextField(merged.defaultHeight, 50));

  return merged;
}

/** Back-fill missing keys on the live property bag (onInit only). */
export function initializeWebPartProperties(properties: IQuickLinksCustomWpWebPartProps): void {
  const merged = getWebPartPropertiesWithDefaults(properties);

  (Object.keys(WEB_PART_PROPERTY_DEFAULTS) as Array<keyof IQuickLinksCustomWpWebPartProps>).forEach((key) => {
    const current = properties[key];
    if (current === undefined || current === null || current === '') {
      const defaultValue = merged[key];
      if (defaultValue !== undefined && defaultValue !== null && defaultValue !== '') {
        try {
          (properties as unknown as Record<string, unknown>)[key as string] = defaultValue;
        } catch {
          /* sealed property bag */
        }
      }
    }
  });
}
