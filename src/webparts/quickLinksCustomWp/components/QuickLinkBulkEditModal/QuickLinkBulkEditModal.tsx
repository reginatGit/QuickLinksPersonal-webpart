import * as React from 'react';

import { FontSizePreset, LinkShade } from '../../models/IQuickLinkItem';
import styles from './QuickLinkBulkEditModal.module.scss';

export interface IQuickLinkBulkEditValues {
  linkWidth: number;
  linkHeight: number;
  fontSize: FontSizePreset;
  linkShade: LinkShade;
}

export interface IQuickLinkBulkEditModalProps {
  isOpen: boolean;
  itemCount: number;
  categoryLabel: string;
  values: IQuickLinkBulkEditValues;
  isSaving: boolean;
  onChange: (values: IQuickLinkBulkEditValues) => void;
  onSave: () => void;
  onCancel: () => void;
}

const QuickLinkBulkEditModal: React.FC<IQuickLinkBulkEditModalProps> = ({
  isOpen,
  itemCount,
  categoryLabel,
  values,
  isSaving,
  onChange,
  onSave,
  onCancel
}) => {
  if (!isOpen) {
    return null;
  }

  const update = (partial: Partial<IQuickLinkBulkEditValues>): void => {
    onChange({ ...values, ...partial });
  };

  return (
    <div className={styles.overlay} role="presentation" onClick={onCancel}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-edit-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="bulk-edit-title" className={styles.title}>
          Edit links in bulk
        </h3>
        <p className={styles.subtitle}>
          Applies to <strong>{itemCount}</strong> link{itemCount === 1 ? '' : 's'} in{' '}
          <strong>{categoryLabel}</strong>. Width, height, font size, and shadow will be updated on each
          item when you save.
        </p>

        <div className={styles.fields}>
          <div className={styles.row}>
            <label className={`${styles.field} ${styles.rowField}`}>
              Width (px)
              <input
                type="number"
                className={styles.input}
                min={1}
                value={values.linkWidth}
                onChange={(e) => update({ linkWidth: Number(e.target.value) || 1 })}
              />
            </label>
            <label className={`${styles.field} ${styles.rowField}`}>
              Height (px)
              <input
                type="number"
                className={styles.input}
                min={1}
                value={values.linkHeight}
                onChange={(e) => update({ linkHeight: Number(e.target.value) || 1 })}
              />
            </label>
          </div>

          <label className={styles.field}>
            Font size
            <select
              className={styles.input}
              value={values.fontSize}
              onChange={(e) => update({ fontSize: e.target.value as FontSizePreset })}
            >
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
          </label>

          <label className={styles.field}>
            Shadow
            <select
              className={styles.input}
              value={values.linkShade}
              onChange={(e) => update({ linkShade: e.target.value as LinkShade })}
            >
              <option value="None">None</option>
              <option value="Light">Light</option>
              <option value="Medium">Medium</option>
              <option value="Heavy">Heavy</option>
            </select>
          </label>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            style={{ padding: '8px 14px', backgroundColor: '#f3f2f1', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || itemCount === 0}
            style={{
              padding: '8px 14px',
              backgroundColor: '#107c41',
              color: '#fff',
              border: 'none',
              cursor: isSaving || itemCount === 0 ? 'wait' : 'pointer',
              borderRadius: '4px',
              fontWeight: 600,
              opacity: isSaving || itemCount === 0 ? 0.7 : 1
            }}
          >
            {isSaving ? 'Saving...' : `Update ${itemCount} link${itemCount === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickLinkBulkEditModal;
