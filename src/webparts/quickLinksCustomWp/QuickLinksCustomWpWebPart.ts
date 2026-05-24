import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import QuickLinksCustomWp from './components/QuickLinksCustomWp';
import QuickLinksErrorBoundary from './components/QuickLinksErrorBoundary';
import { IQuickLinksCustomWpProps } from './components/IQuickLinksCustomWpProps';
import {
  BACK_COLORS,
  DESCRIPTION_FONT_COLORS,
  DescriptionPlacement,
  FONT_COLORS,
  ImageAlignment,
  ImagePlacement,
  LinkPlacement,
  LinkShade,
  FontSizePreset,
  TextAlignment
} from './models/IQuickLinkItem';
import PropertyPaneColorField from './components/PropertyPaneColorField/PropertyPaneColorField';
import { createPropertyPaneCustomField } from './propertyPane/createPropertyPaneCustomField';
import {
  resolveAppearanceSettings,
  resolveDataSettings,
  resolveLayoutSettings
} from './models/IQuickLinkWebPartSettings';
import { resolveQuickLinkDefaults } from './models/quickLinkDefaults';
import {
  getWebPartPropertiesWithDefaults,
  initializeWebPartProperties
} from './webPartPropertyDefaults';

export interface IQuickLinksCustomWpWebPartProps {
  listName: string;
  Category?: string;
  sortBy: string;
  layoutMode: string;
  columns: string;
  tileMinWidth: string;
  gap: string;
  alignment: string;
  stylePreset: string;
  borderRadius: string;
  hoverEffect: string;
  useSiteTheme: boolean;
  showTitle: boolean;
  titleText: string;
  defaultWidth: string;
  defaultHeight: string;
  globalShade: string;
  defaultFontColor: string;
  defaultBackColor: string;
  defaultFontSize: string;
  defaultDescriptionPlacement: string;
  defaultDescriptionFontColor: string;
  defaultDescriptionFontSize: string;
  defaultLinkPlacement: string;
  defaultTextAlignment: string;
  defaultImageAlignment: string;
  defaultImagePlacement: string;
  defaultDescription: string;
  defaultCategory: string;
}

export default class QuickLinksCustomWpWebPart extends BaseClientSideWebPart<IQuickLinksCustomWpWebPartProps> {
  private _isDarkTheme: boolean = false;
  private _isReady: boolean = false;

  public async onInit(): Promise<void> {
    await super.onInit();
    try {
      initializeWebPartProperties(this.properties);
    } catch (err) {
      console.warn('QuickLinks: could not initialize all properties', err);
    }
    this._isReady = true;
    this.render();
  }

  public render(): void {
    if (!this._isReady) {
      this.domElement.innerHTML =
        '<div style="padding:12px;color:#605e5c;">Loading Quick Links...</div>';
      return;
    }

    try {
      const props = getWebPartPropertiesWithDefaults(this.properties);
      const shade = this._resolveShade(props.globalShade);
      const defaults = resolveQuickLinkDefaults({
        width: Number(props.defaultWidth) || 150,
        height: Number(props.defaultHeight) || 50,
        shade,
        fontColor: props.defaultFontColor || '#000000',
        backColor: props.defaultBackColor || '#f3f2f1',
        fontSize: this._resolveFontSize(props.defaultFontSize),
        description: props.defaultDescription?.trim() ?? '',
        descriptionPlacement: this._resolveDescriptionPlacement(props.defaultDescriptionPlacement),
        descriptionFontColor: props.defaultDescriptionFontColor || '#605e5c',
        descriptionFontSize: this._resolveFontSize(props.defaultDescriptionFontSize),
        linkPlacement: this._resolveLinkPlacement(props.defaultLinkPlacement),
        textAlignment: this._resolveTextAlignment(props.defaultTextAlignment),
        imageAlignment: this._resolveImageAlignment(props.defaultImageAlignment),
        imagePlacement: this._resolveImagePlacement(props.defaultImagePlacement),
        category: props.defaultCategory?.trim() ?? ''
      });

      const quickLinksElement = React.createElement(QuickLinksCustomWp, {
        listName: props.listName ?? '',
        category: props.Category?.trim() || undefined,
        defaults,
        layout: resolveLayoutSettings(props),
        appearance: resolveAppearanceSettings({
          ...props,
          isDarkTheme: this._isDarkTheme
        }),
        data: resolveDataSettings(props),
        context: this.context,
        displayMode: this.displayMode
      } as IQuickLinksCustomWpProps);

      const element: React.ReactElement = React.createElement(
        QuickLinksErrorBoundary,
        undefined,
        quickLinksElement
      );

      ReactDom.render(element, this.domElement);
    } catch (error) {
      console.error('Quick Links web part render failed', error);
      this.domElement.innerHTML =
        '<div style="padding:12px;color:#a80000;background:#fde7e9;border-radius:4px;">' +
        'Quick Links could not start. Check the browser console (F12), then remove and re-add the web part.' +
        '</div>';
    }
  }

  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: unknown, newValue: unknown): void {
    super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
    this.render();
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme || !this._isReady) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

    this.render();
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  private _resolveShade(value?: string): LinkShade {
    const shades: LinkShade[] = ['None', 'Light', 'Medium', 'Heavy'];
    return shades.indexOf(value as LinkShade) >= 0 ? (value as LinkShade) : 'None';
  }

  private _resolveFontSize(value?: string): FontSizePreset {
    const sizes: FontSizePreset[] = ['Small', 'Medium', 'Large'];
    return sizes.indexOf(value as FontSizePreset) >= 0 ? (value as FontSizePreset) : 'Medium';
  }

  private _resolveDescriptionPlacement(value?: string): DescriptionPlacement {
    const placements: DescriptionPlacement[] = ['BelowTitle', 'AboveTitle', 'Bottom', 'Hidden'];
    return placements.indexOf(value as DescriptionPlacement) >= 0
      ? (value as DescriptionPlacement)
      : 'BelowTitle';
  }

  private _resolveLinkPlacement(value?: string): LinkPlacement {
    const placements: LinkPlacement[] = ['Top', 'Middle', 'Bottom'];
    return placements.indexOf(value as LinkPlacement) >= 0 ? (value as LinkPlacement) : 'Middle';
  }

  private _resolveTextAlignment(value?: string): TextAlignment {
    const alignments: TextAlignment[] = ['Left', 'Center', 'Right'];
    return alignments.indexOf(value as TextAlignment) >= 0 ? (value as TextAlignment) : 'Left';
  }

  private _resolveImageAlignment(value?: string): ImageAlignment {
    const alignments: ImageAlignment[] = ['Left', 'Center', 'Right'];
    return alignments.indexOf(value as ImageAlignment) >= 0 ? (value as ImageAlignment) : 'Left';
  }

  private _resolveImagePlacement(value?: string): ImagePlacement {
    const placements: ImagePlacement[] = ['Top', 'Middle', 'Bottom'];
    return placements.indexOf(value as ImagePlacement) >= 0 ? (value as ImagePlacement) : 'Middle';
  }

  private _disposePropertyPaneField(element: HTMLElement): void {
    ReactDom.unmountComponentAtNode(element);
  }

  private _renderDefaultFontColorPicker(
    element: HTMLElement,
    _context?: unknown,
    changeCallback?: (targetProperty?: string, newValue?: unknown, isValidEntry?: boolean) => void
  ): void {
    const props = getWebPartPropertiesWithDefaults(this.properties);
    const field = React.createElement(PropertyPaneColorField, {
      label: 'Default font color',
      value: props.defaultFontColor,
      options: FONT_COLORS,
      onChange: (color: string) => {
        this.properties.defaultFontColor = color;
        changeCallback?.('defaultFontColor', color, true);
        this.render();
      }
    });
    ReactDom.render(field, element);
  }

  private _renderDefaultBackColorPicker(
    element: HTMLElement,
    _context?: unknown,
    changeCallback?: (targetProperty?: string, newValue?: unknown, isValidEntry?: boolean) => void
  ): void {
    const props = getWebPartPropertiesWithDefaults(this.properties);
    const field = React.createElement(PropertyPaneColorField, {
      label: 'Default background color',
      value: props.defaultBackColor,
      options: BACK_COLORS,
      onChange: (color: string) => {
        this.properties.defaultBackColor = color;
        changeCallback?.('defaultBackColor', color, true);
        this.render();
      }
    });
    ReactDom.render(field, element);
  }

  private _renderDefaultDescriptionColorPicker(
    element: HTMLElement,
    _context?: unknown,
    changeCallback?: (targetProperty?: string, newValue?: unknown, isValidEntry?: boolean) => void
  ): void {
    const props = getWebPartPropertiesWithDefaults(this.properties);
    const field = React.createElement(PropertyPaneColorField, {
      label: 'Default description color',
      value: props.defaultDescriptionFontColor,
      options: DESCRIPTION_FONT_COLORS,
      onChange: (color: string) => {
        this.properties.defaultDescriptionFontColor = color;
        changeCallback?.('defaultDescriptionFontColor', color, true);
        this.render();
      }
    });
    ReactDom.render(field, element);
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    try {
      const p = getWebPartPropertiesWithDefaults(this.properties);

      return {
        pages: [
          {
            header: {
              description: 'Configure quick links data, layout, and appearance.'
            },
            groups: [
              {
                groupName: 'Data',
                groupFields: [
                  PropertyPaneTextField('listName', {
                    label: 'List name or URL',
                    description: 'SharePoint list title or full list URL.',
                    placeholder: 'QuickLinks'
                  }),
                  PropertyPaneTextField('Category', {
                    label: 'Category filter',
                    description: 'Show only links in this category (leave empty for all).',
                    placeholder: 'IT'
                  }),
                  PropertyPaneDropdown('sortBy', {
                    label: 'Sort by',
                    selectedKey: p.sortBy,
                    options: [
                      { key: 'Title', text: 'Title (A-Z)' },
                      { key: 'Created', text: 'Newest first' },
                      { key: 'SortOrder', text: 'Manual (SortOrder column)' }
                    ]
                  })
                ]
              },
              {
                groupName: 'Layout',
                groupFields: [
                  PropertyPaneDropdown('layoutMode', {
                    label: 'Layout mode',
                    selectedKey: p.layoutMode,
                    options: [
                      { key: 'Grid', text: 'Grid' },
                      { key: 'Scroll', text: 'Horizontal scroll' },
                      { key: 'List', text: 'Compact list' }
                    ]
                  }),
                  PropertyPaneDropdown('columns', {
                    label: 'Columns',
                    selectedKey: p.columns,
                    options: [
                      { key: 'Auto', text: 'Auto-fit' },
                      { key: '1', text: '1' },
                      { key: '2', text: '2' },
                      { key: '3', text: '3' },
                      { key: '4', text: '4' },
                      { key: '5', text: '5' },
                      { key: '6', text: '6' }
                    ]
                  }),
                  PropertyPaneTextField('tileMinWidth', {
                    label: 'Min tile width (px)',
                    description: 'Used when columns is Auto-fit.'
                  }),
                  PropertyPaneDropdown('gap', {
                    label: 'Gap between tiles',
                    selectedKey: p.gap,
                    options: [
                      { key: '8', text: '8 px' },
                      { key: '12', text: '12 px' },
                      { key: '16', text: '16 px' },
                      { key: '24', text: '24 px' }
                    ]
                  }),
                  PropertyPaneDropdown('alignment', {
                    label: 'Alignment',
                    selectedKey: p.alignment,
                    options: [
                      { key: 'Left', text: 'Left' },
                      { key: 'Center', text: 'Center' },
                      { key: 'FullWidth', text: 'Full width' }
                    ]
                  })
                ]
              },
              {
                groupName: 'Appearance',
                groupFields: [
                  PropertyPaneDropdown('stylePreset', {
                    label: 'Tile style',
                    selectedKey: p.stylePreset,
                    options: [
                      { key: 'Filled', text: 'Filled' },
                      { key: 'Outlined', text: 'Outlined' },
                      { key: 'Soft', text: 'Soft' },
                      { key: 'Glass', text: 'Glass' }
                    ]
                  }),
                  PropertyPaneDropdown('borderRadius', {
                    label: 'Border radius',
                    selectedKey: p.borderRadius,
                    options: [
                      { key: '4', text: '4 px' },
                      { key: '8', text: '8 px' },
                      { key: '12', text: '12 px' },
                      { key: '16', text: '16 px' },
                      { key: 'Full', text: 'Pill' }
                    ]
                  }),
                  PropertyPaneDropdown('hoverEffect', {
                    label: 'Hover effect',
                    selectedKey: p.hoverEffect,
                    options: [
                      { key: 'Lift', text: 'Lift' },
                      { key: 'Glow', text: 'Glow' },
                      { key: 'Scale', text: 'Scale' },
                      { key: 'None', text: 'None' }
                    ]
                  }),
                  PropertyPaneToggle('useSiteTheme', {
                    label: 'Use site theme colors',
                    checked: p.useSiteTheme,
                    onText: 'On',
                    offText: 'Off'
                  }),
                  PropertyPaneToggle('showTitle', {
                    label: 'Show web part title',
                    checked: p.showTitle,
                    onText: 'On',
                    offText: 'Off'
                  }),
                  PropertyPaneTextField('titleText', {
                    label: 'Title text',
                    placeholder: 'Quick Links'
                  })
                ]
              },
              {
                groupName: 'Defaults (new links)',
                groupFields: [
                  PropertyPaneTextField('defaultWidth', {
                    label: 'Default width (px)'
                  }),
                  PropertyPaneTextField('defaultHeight', {
                    label: 'Default height (px)'
                  }),
                  PropertyPaneDropdown('globalShade', {
                    label: 'Default shadow',
                    selectedKey: p.globalShade,
                    options: [
                      { key: 'None', text: 'None' },
                      { key: 'Light', text: 'Light' },
                      { key: 'Medium', text: 'Medium' },
                      { key: 'Heavy', text: 'Heavy' }
                    ]
                  }),
                  createPropertyPaneCustomField({
                    key: 'defaultFontColorPicker',
                    onRender: this._renderDefaultFontColorPicker.bind(this),
                    onDispose: this._disposePropertyPaneField.bind(this)
                  }),
                  createPropertyPaneCustomField({
                    key: 'defaultBackColorPicker',
                    onRender: this._renderDefaultBackColorPicker.bind(this),
                    onDispose: this._disposePropertyPaneField.bind(this)
                  }),
                  PropertyPaneDropdown('defaultFontSize', {
                    label: 'Default font size',
                    selectedKey: p.defaultFontSize,
                    options: [
                      { key: 'Small', text: 'Small' },
                      { key: 'Medium', text: 'Medium' },
                      { key: 'Large', text: 'Large' }
                    ]
                  }),
                  PropertyPaneDropdown('defaultDescriptionPlacement', {
                    label: 'Default description placement',
                    selectedKey: p.defaultDescriptionPlacement,
                    options: [
                      { key: 'BelowTitle', text: 'Below title' },
                      { key: 'AboveTitle', text: 'Above title' },
                      { key: 'Bottom', text: 'Bottom of tile' },
                      { key: 'Hidden', text: 'Hidden' }
                    ]
                  }),
                  createPropertyPaneCustomField({
                    key: 'defaultDescriptionColorPicker',
                    onRender: this._renderDefaultDescriptionColorPicker.bind(this),
                    onDispose: this._disposePropertyPaneField.bind(this)
                  }),
                  PropertyPaneDropdown('defaultDescriptionFontSize', {
                    label: 'Default description size',
                    selectedKey: p.defaultDescriptionFontSize,
                    options: [
                      { key: 'Small', text: 'Small' },
                      { key: 'Medium', text: 'Medium' },
                      { key: 'Large', text: 'Large' }
                    ]
                  }),
                  PropertyPaneDropdown('defaultTextAlignment', {
                    label: 'Default text alignment (horizontal)',
                    selectedKey: p.defaultTextAlignment,
                    options: [
                      { key: 'Left', text: 'Left' },
                      { key: 'Center', text: 'Center' },
                      { key: 'Right', text: 'Right' }
                    ]
                  }),
                  PropertyPaneDropdown('defaultLinkPlacement', {
                    label: 'Default link placement (vertical)',
                    selectedKey: p.defaultLinkPlacement,
                    options: [
                      { key: 'Top', text: 'Top' },
                      { key: 'Middle', text: 'Middle' },
                      { key: 'Bottom', text: 'Bottom' }
                    ]
                  })
                ]
              }
            ]
          }
        ]
      };
    } catch (err) {
      console.error('Quick Links property pane failed', err);
      return {
        pages: [
          {
            header: { description: 'Quick Links settings' },
            groups: [
              {
                groupName: 'Data',
                groupFields: [
                  PropertyPaneTextField('listName', {
                    label: 'List name or URL',
                    placeholder: 'QuickLinks'
                  })
                ]
              }
            ]
          }
        ]
      };
    }
  }
}
