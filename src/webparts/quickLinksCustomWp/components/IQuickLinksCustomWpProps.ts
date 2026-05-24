import { WebPartContext } from '@microsoft/sp-webpart-base';
import { DisplayMode } from '@microsoft/sp-core-library';

import { IQuickLinkDefaults } from '../models/IQuickLinkItem';
import {
  IQuickLinkAppearanceSettings,
  IQuickLinkDataSettings,
  IQuickLinkLayoutSettings
} from '../models/IQuickLinkWebPartSettings';

export interface IQuickLinksCustomWpProps {
  listName: string;
  category?: string;
  defaults: IQuickLinkDefaults;
  layout: IQuickLinkLayoutSettings;
  appearance: IQuickLinkAppearanceSettings;
  data: IQuickLinkDataSettings;
  context: WebPartContext;
  displayMode: DisplayMode;
}
