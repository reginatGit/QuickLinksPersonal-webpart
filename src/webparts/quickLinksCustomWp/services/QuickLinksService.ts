import { WebPartContext } from '@microsoft/sp-webpart-base';
import { spfi, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';

import { IQuickLinkItem } from '../models/IQuickLinkItem';
import { SortBy } from '../models/IQuickLinkWebPartSettings';
import { quickLinkFromListItem, quickLinkToListPayload } from '../models/quickLinkDefaults';

export interface IListTarget {
  baseUrl: string;
  listTitle: string;
}

const FULL_SELECT_FIELDS = [
  'Id',
  'Title',
  'ImageURL',
  'LinkFontColor',
  'LinkBackColor',
  'LinkPlacement',
  'TextAlignment',
  'LinkWidth',
  'LinkHeight',
  'LinkShade',
  'FontSize',
  'ImageAlignment',
  'ImagePlacement',
  'LinkURL',
  'Description',
  'DescriptionPlacement',
  'DescriptionFontColor',
  'DescriptionFontSize',
  'Category',
  'Created',
  'SortOrder'
];

const CORE_SELECT_FIELDS = ['Id', 'Title', 'LinkURL', 'Created'];

export class QuickLinksService {
  constructor(private readonly context: WebPartContext) {}

  public parseListTarget(listNameOrUrl: string): IListTarget | undefined {
    const input = listNameOrUrl.trim();
    if (!input) {
      return undefined;
    }

    let baseUrl = this.context.pageContext.web.absoluteUrl;
    let listTitle = input;

    if (input.toLowerCase().indexOf('http://') === 0 || input.toLowerCase().indexOf('https://') === 0) {
      try {
        const urlObj = new URL(input);
        const pathSegments = urlObj.pathname.split('/');
        const listsIndex = pathSegments.findIndex(segment => segment.toLowerCase() === 'lists');

        if (listsIndex > -1 && pathSegments[listsIndex + 1]) {
          listTitle = decodeURIComponent(pathSegments[listsIndex + 1]);
          baseUrl = `${urlObj.origin}${pathSegments.slice(0, listsIndex).join('/')}`;
        } else {
          return undefined;
        }
      } catch {
        return undefined;
      }
    }

    const halfLength = listTitle.length / 2;
    if (listTitle.substring(0, halfLength) === listTitle.substring(halfLength)) {
      listTitle = listTitle.substring(0, halfLength);
    }

    return { baseUrl, listTitle };
  }

  public async getItems(listNameOrUrl: string, category?: string, sortBy: SortBy = 'Title'): Promise<IQuickLinkItem[]> {
    const target = this.parseListTarget(listNameOrUrl);
    if (!target) {
      return [];
    }

    try {
      const rawItems = await this._queryItems(target, FULL_SELECT_FIELDS, category);
      const items = rawItems.map((item: Record<string, unknown>) => quickLinkFromListItem(item));
      return this._sortItems(items, rawItems, sortBy);
    } catch (err) {
      if (sortBy === 'SortOrder') {
        return this.getItems(listNameOrUrl, category, 'Title');
      }

      console.warn('QuickLinksService: full list query failed, retrying core fields.', err);
      const rawItems = await this._queryItems(target, CORE_SELECT_FIELDS, category);
      const items = rawItems.map((item: Record<string, unknown>) => quickLinkFromListItem(item));
      return this._sortItems(items, rawItems, sortBy);
    }
  }

  private async _queryItems(
    target: IListTarget,
    selectFields: string[],
    category?: string
  ): Promise<Record<string, unknown>[]> {
    const targetWeb = spfi(target.baseUrl).using(SPFx(this.context)).web;
    let query = targetWeb.lists.getByTitle(target.listTitle).items.select(...selectFields);

    const trimmedCategory = category?.trim();
    if (trimmedCategory) {
      const escaped = trimmedCategory.replace(/'/g, "''");
      query = query.filter(`Category eq '${escaped}'`);
    }

    return query();
  }

  private _sortItems(
    items: IQuickLinkItem[],
    rawItems: Record<string, unknown>[],
    sortBy: SortBy
  ): IQuickLinkItem[] {
    const pairs = items.map((item, index) => ({
      item,
      raw: rawItems[index]
    }));

    pairs.sort((a, b) => {
      if (sortBy === 'Created') {
        const aDate = new Date(String(a.raw.Created ?? 0)).getTime();
        const bDate = new Date(String(b.raw.Created ?? 0)).getTime();
        return bDate - aDate;
      }

      if (sortBy === 'SortOrder') {
        const aOrder = Number(a.raw.SortOrder ?? a.item.SortOrder ?? 0);
        const bOrder = Number(b.raw.SortOrder ?? b.item.SortOrder ?? 0);
        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }
      }

      return (a.item.Title || '').localeCompare(b.item.Title || '');
    });

    return pairs.map(pair => pair.item);
  }

  public async saveItem(listNameOrUrl: string, link: IQuickLinkItem): Promise<void> {
    const target = this.parseListTarget(listNameOrUrl);
    if (!target) {
      throw new Error('Invalid list name or URL.');
    }

    const payload = quickLinkToListPayload(link);
    const targetWeb = spfi(target.baseUrl).using(SPFx(this.context)).web;
    const list = targetWeb.lists.getByTitle(target.listTitle);

    if (link.Id) {
      await list.items.getById(link.Id).update(payload);
    } else {
      await list.items.add(payload);
    }
  }

  public async saveItems(listNameOrUrl: string, links: IQuickLinkItem[]): Promise<void> {
    for (const link of links) {
      if (!link.Id) {
        continue;
      }
      await this.saveItem(listNameOrUrl, link);
    }
  }
}
