import * as React from 'react';
import { DisplayMode } from '@microsoft/sp-core-library';

import styles from './QuickLinksCustomWp.module.scss';
import { IQuickLinksCustomWpProps } from './IQuickLinksCustomWpProps';
import QuickLinkBulkEditModal, {
  IQuickLinkBulkEditValues
} from './QuickLinkBulkEditModal/QuickLinkBulkEditModal';
import QuickLinkModal from './QuickLinkModal/QuickLinkModal';
import QuickLinkTile from './QuickLinkTile/QuickLinkTile';
import { IQuickLinkItem } from '../models/IQuickLinkItem';
import { createEmptyQuickLink } from '../models/quickLinkDefaults';
import {
  getLayoutAlignmentStyle,
  getLayoutContainerStyle,
  resolveAppearanceSettings,
  resolveLayoutSettings
} from '../models/IQuickLinkWebPartSettings';
import { QuickLinksService } from '../services/QuickLinksService';

interface IQuickLinksCustomWpState {
  items: IQuickLinkItem[];
  loading: boolean;
  error?: string;
  isModalOpen: boolean;
  editingLink?: IQuickLinkItem;
  isSaving: boolean;
  isBulkModalOpen: boolean;
  bulkEdit: IQuickLinkBulkEditValues;
  isBulkSaving: boolean;
}

function createDefaultBulkEditValues(
  defaults: IQuickLinksCustomWpProps['defaults']
): IQuickLinkBulkEditValues {
  return {
    linkWidth: defaults.width,
    linkHeight: defaults.height,
    fontSize: defaults.fontSize,
    linkShade: defaults.shade
  };
}

export default class QuickLinksCustomWp extends React.Component<IQuickLinksCustomWpProps, IQuickLinksCustomWpState> {
  private _service: QuickLinksService;

  constructor(props: IQuickLinksCustomWpProps) {
    super(props);
    this._service = new QuickLinksService(props.context);
    this.state = {
      items: [],
      loading: false,
      isModalOpen: false,
      editingLink: undefined,
      isSaving: false,
      isBulkModalOpen: false,
      bulkEdit: createDefaultBulkEditValues(props.defaults),
      isBulkSaving: false
    };
  }

  public componentDidMount(): void {
    this._loadItems().catch((err) => {
      console.error('Initialization data load failed', err);
    });
  }

  public componentDidUpdate(prevProps: IQuickLinksCustomWpProps): void {
    const prevSort = prevProps.data?.sortBy ?? 'Title';
    const nextSort = this.props.data?.sortBy ?? 'Title';

    if (
      prevProps.listName !== this.props.listName ||
      prevProps.category !== this.props.category ||
      prevSort !== nextSort
    ) {
      this._loadItems().catch((err) => {
        console.error('Property change data load failed', err);
      });
    }
  }

  private async _loadItems(): Promise<void> {
    const listName = this.props.listName?.trim() ?? '';
    if (!listName) {
      this.setState({ items: [], loading: false, error: undefined });
      return;
    }

    this.setState({ loading: true, error: undefined });

    try {
      const sortBy = this.props.data?.sortBy ?? 'Title';
      const category = this.props.category?.trim() || undefined;
      const items = await this._service.getItems(listName, category, sortBy);
      this.setState({ items, loading: false });
    } catch (err) {
      console.error('Failed to load quick links', err);
      const target = this._service.parseListTarget(listName);
      this.setState({
        items: [],
        loading: false,
        error: target
          ? `Could not load list '${target.listTitle}'. Please verify it exists at: ${target.baseUrl}`
          : 'Invalid list name or URL.'
      });
    }
  }

  private _openAddModal = (): void => {
    this.setState({
      isModalOpen: true,
      isBulkModalOpen: false,
      editingLink: createEmptyQuickLink(this.props.defaults)
    });
  };

  private _openEditModal = (item: IQuickLinkItem): void => {
    this.setState({
      isModalOpen: true,
      isBulkModalOpen: false,
      editingLink: { ...item }
    });
  };

  private _openBulkModal = (): void => {
    const { items } = this.state;
    const first = items[0];
    this.setState({
      isBulkModalOpen: true,
      isModalOpen: false,
      editingLink: undefined,
      bulkEdit: {
        linkWidth: first?.LinkWidth ?? this.props.defaults.width,
        linkHeight: first?.LinkHeight ?? this.props.defaults.height,
        fontSize: first?.FontSize ?? this.props.defaults.fontSize,
        linkShade: first?.LinkShade ?? this.props.defaults.shade
      }
    });
  };

  private _closeModal = (): void => {
    this.setState({ isModalOpen: false, editingLink: undefined, isSaving: false });
  };

  private _closeBulkModal = (): void => {
    this.setState({ isBulkModalOpen: false, isBulkSaving: false });
  };

  private _handleLinkChange = (link: IQuickLinkItem): void => {
    this.setState({ editingLink: link });
  };

  private _handleBulkEditChange = (bulkEdit: IQuickLinkBulkEditValues): void => {
    this.setState({ bulkEdit });
  };

  private _handleSave = async (): Promise<void> => {
    const { listName, editingLink } = { listName: this.props.listName, editingLink: this.state.editingLink };
    if (!editingLink) {
      return;
    }

    const trimmedList = listName?.trim() ?? '';
    if (!trimmedList) {
      alert('Please specify a list name or URL in the web part properties first.');
      return;
    }

    this.setState({ isSaving: true });

    try {
      await this._service.saveItem(trimmedList, editingLink);
      this._closeModal();
      await this._loadItems();
    } catch (error) {
      console.error('SharePoint write operation failed', error);
      alert('Failed to save changes. Check the browser console (F12) for details.');
      this.setState({ isSaving: false });
    }
  };

  private _handleBulkSave = async (): Promise<void> => {
    const listName = this.props.listName?.trim() ?? '';
    if (!listName) {
      alert('Please specify a list name or URL in the web part properties first.');
      return;
    }

    const { items, bulkEdit } = this.state;
    const toUpdate = items.filter((item) => item.Id);
    if (toUpdate.length === 0) {
      alert('No saved list items to update in the current view.');
      return;
    }

    const categoryLabel = this.props.category?.trim() || 'all categories';
    const confirmed = window.confirm(
      `Update width, height, font size, and shadow for ${toUpdate.length} link(s) in "${categoryLabel}"?`
    );
    if (!confirmed) {
      return;
    }

    this.setState({ isBulkSaving: true });

    try {
      const updated: IQuickLinkItem[] = toUpdate.map((item) => ({
        ...item,
        LinkWidth: bulkEdit.linkWidth,
        LinkHeight: bulkEdit.linkHeight,
        FontSize: bulkEdit.fontSize,
        LinkShade: bulkEdit.linkShade
      }));

      await this._service.saveItems(listName, updated);
      this._closeBulkModal();
      await this._loadItems();
    } catch (error) {
      console.error('Bulk update failed', error);
      alert('Bulk update failed. Check the browser console (F12) for details.');
      this.setState({ isBulkSaving: false });
    }
  };

  public render(): React.ReactElement<IQuickLinksCustomWpProps> {
    const { listName, displayMode, category } = this.props;
    const activeCategory = category?.trim();
    const categoryLabel = activeCategory || 'all categories';
    const layout = this.props.layout ?? resolveLayoutSettings({});
    const appearance = this.props.appearance ?? resolveAppearanceSettings({});
    const {
      items,
      loading,
      error,
      isModalOpen,
      editingLink,
      isSaving,
      isBulkModalOpen,
      bulkEdit,
      isBulkSaving
    } = this.state;
    const isEditMode = displayMode === DisplayMode.Edit;
    const modalMode = editingLink?.Id ? 'edit' : 'add';
    const containerStyle = getLayoutContainerStyle(layout);
    const alignmentStyle = getLayoutAlignmentStyle(layout.alignment);
    const editableCount = items.filter((item) => item.Id).length;

    return (
      <section className={styles.quickLinksCustomWp}>
        {appearance.showTitle && (
          <h2 className={appearance.useSiteTheme ? `${styles.header} ${styles.headerTheme}` : styles.header}>
            {appearance.titleText}
          </h2>
        )}

        <span className={styles.toolbar}>
          {!listName?.trim() ? (
            <p className={styles.emptyConfig}>
              Please open the web part settings panel and provide a target SharePoint List Name.
            </p>
          ) : (
            isEditMode && (
              <span className={styles.toolbarActions}>
                <button type="button" className={styles.toolbarButton} onClick={this._openAddModal}>
                  Add New Link to List
                </button>
                <button
                  type="button"
                  className={`${styles.toolbarButton} ${styles.toolbarButtonSecondary}`}
                  onClick={this._openBulkModal}
                  disabled={loading || editableCount === 0}
                  title={
                    editableCount === 0
                      ? 'No links loaded to edit'
                      : `Edit all links in ${categoryLabel}`
                  }
                >
                  Edit all in <span className={styles.toolbarCategoryName}>{categoryLabel}</span> (
                  {editableCount})
                </button>
              </span>
            )
          )}
        </span>

        {editingLink && (
          <QuickLinkModal
            isOpen={isModalOpen}
            mode={modalMode}
            link={editingLink}
            isSaving={isSaving}
            onChange={this._handleLinkChange}
            onSave={() => {
              this._handleSave().catch((err) => console.error(err));
            }}
            onCancel={this._closeModal}
          />
        )}

        <QuickLinkBulkEditModal
          isOpen={isBulkModalOpen}
          itemCount={editableCount}
          categoryLabel={categoryLabel}
          values={bulkEdit}
          isSaving={isBulkSaving}
          onChange={this._handleBulkEditChange}
          onSave={() => {
            this._handleBulkSave().catch((err) => console.error(err));
          }}
          onCancel={this._closeBulkModal}
        />

        {loading && <p className={styles.loading}>Loading quick links...</p>}
        {error && !loading && <p className={styles.error}>{error}</p>}

        {!loading && !error && listName?.trim() && items.length === 0 && (
          <p className={styles.emptyConfig}>
            {activeCategory
              ? `No links found in category "${activeCategory}".`
              : 'No links in this list yet.'}
          </p>
        )}

        {!loading && !error && items.length > 0 && (
          <span className={styles.layoutWrapper} style={alignmentStyle}>
            <ul style={containerStyle}>
              {items.map((item) => (
                <QuickLinkTile
                  key={item.Id ?? item.Title}
                  item={item}
                  defaults={this.props.defaults}
                  displayMode={displayMode}
                  appearance={appearance}
                  layoutMode={layout.layoutMode}
                  onEdit={this._openEditModal}
                />
              ))}
            </ul>
          </span>
        )}
      </section>
    );
  }
}
