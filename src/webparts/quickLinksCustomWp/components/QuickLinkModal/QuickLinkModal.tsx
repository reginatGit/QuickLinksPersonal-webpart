import * as React from 'react';

import ColorPicker from '../ColorPicker/ColorPicker';
import {
  BACK_COLORS,
  DESCRIPTION_FONT_COLORS,
  DescriptionPlacement,
  FONT_COLORS,
  IQuickLinkItem,
  ImageAlignment,
  ImagePlacement,
  LinkPlacement,
  LinkShade,
  FontSizePreset,
  TextAlignment
} from '../../models/IQuickLinkItem';
import styles from './QuickLinkModal.module.scss';

export interface IQuickLinkModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  link: IQuickLinkItem;
  isSaving: boolean;
  onChange: (link: IQuickLinkItem) => void;
  onSave: () => void;
  onCancel: () => void;
}

const QuickLinkModal: React.FC<IQuickLinkModalProps> = ({
  isOpen,
  mode,
  link,
  isSaving,
  onChange,
  onSave,
  onCancel
}) => {
  if (!isOpen) {
    return null;
  }

  const update = (partial: Partial<IQuickLinkItem>): void => {
    onChange({ ...link, ...partial });
  };

  return (
    <div className={styles.overlay} role="presentation" onClick={onCancel}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-link-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="quick-link-modal-title" className={styles.title}>
          {mode === 'edit' ? 'Update List Item' : 'Create New List Item'}
        </h3>

        <div className={styles.grid}>
          <div className={styles.column}>
            <label className={styles.field}>
              Title *
              <input
                type="text"
                className={styles.input}
                value={link.Title}
                onChange={(e) => update({ Title: e.target.value })}
              />
            </label>

            <label className={styles.field}>
              Sort order
              <input
                type="number"
                className={styles.input}
                min={0}
                step={1}
                value={link.SortOrder ?? 0}
                onChange={(e) => update({ SortOrder: Number(e.target.value) || 0 })}
                title="Stored in the list SortOrder column; used when web part Sort by is Manual"
              />
            </label>

            <label className={styles.field}>
              Link URL *
              <input
                type="text"
                className={styles.input}
                value={link.LinkURL?.Url ?? ''}
                onChange={(e) => update({ LinkURL: { ...link.LinkURL, Url: e.target.value } })}
              />
            </label>

            <label className={styles.field}>
              Description
              <input
                type="text"
                className={styles.input}
                value={link.Description ?? ''}
                onChange={(e) => update({ Description: e.target.value })}
                placeholder="Text shown on the tile"
              />
            </label>

            <div className={styles.row}>
              <label className={`${styles.field} ${styles.rowField}`}>
                Description placement
                <select
                  className={styles.input}
                  value={link.DescriptionPlacement ?? 'BelowTitle'}
                  onChange={(e) =>
                    update({ DescriptionPlacement: e.target.value as DescriptionPlacement })
                  }
                >
                  <option value="BelowTitle">Below title</option>
                  <option value="AboveTitle">Above title</option>
                  <option value="Bottom">Bottom of tile</option>
                  <option value="Hidden">Hidden</option>
                </select>
              </label>
              <label className={`${styles.field} ${styles.rowField}`}>
                Description size
                <select
                  className={styles.input}
                  value={link.DescriptionFontSize ?? 'Small'}
                  onChange={(e) => update({ DescriptionFontSize: e.target.value as FontSizePreset })}
                >
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                </select>
              </label>
            </div>

            <ColorPicker
              label="Description color"
              value={link.DescriptionFontColor ?? '#605e5c'}
              options={DESCRIPTION_FONT_COLORS}
              shape="circle"
              onChange={(color) => update({ DescriptionFontColor: color })}
            />

            <label className={styles.field}>
              Image URL
              <input
                type="text"
                className={styles.input}
                value={link.ImageURL ?? ''}
                onChange={(e) => update({ ImageURL: e.target.value })}
              />
              {link.ImageURL && (
                <span className={styles.imagePreview}>
                  <span className={styles.imagePreviewLabel}>Preview</span>
                  <img
                    src={link.ImageURL}
                    alt="Preview"
                    style={{ maxWidth: '56px', maxHeight: '56px', objectFit: 'contain' }}
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </span>
              )}
            </label>
          </div>

          <div className={styles.column}>
            <ColorPicker
              label="Font color"
              value={link.LinkFontColor ?? '#000000'}
              options={FONT_COLORS}
              shape="circle"
              onChange={(color) => update({ LinkFontColor: color })}
            />

            <ColorPicker
              label="Background color"
              value={link.LinkBackColor ?? '#f3f2f1'}
              options={BACK_COLORS}
              shape="square"
              onChange={(color) => update({ LinkBackColor: color })}
            />

            <div className={styles.row}>
              <label className={`${styles.field} ${styles.rowField}`}>
                Font size
                <select
                  className={styles.input}
                  value={link.FontSize ?? 'Medium'}
                  onChange={(e) => update({ FontSize: e.target.value as FontSizePreset })}
                >
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                </select>
              </label>
              <label className={`${styles.field} ${styles.rowField}`}>
                Shadow
                <select
                  className={styles.input}
                  value={link.LinkShade ?? 'None'}
                  onChange={(e) => update({ LinkShade: e.target.value as LinkShade })}
                >
                  <option value="None">None</option>
                  <option value="Light">Light</option>
                  <option value="Medium">Medium</option>
                  <option value="Heavy">Heavy</option>
                </select>
              </label>
            </div>

            <div className={styles.row}>
              <label className={`${styles.field} ${styles.rowField}`}>
                Width (px)
                <input
                  type="number"
                  className={styles.input}
                  value={link.LinkWidth ?? 150}
                  onChange={(e) => update({ LinkWidth: Number(e.target.value) })}
                />
              </label>
              <label className={`${styles.field} ${styles.rowField}`}>
                Height (px)
                <input
                  type="number"
                  className={styles.input}
                  value={link.LinkHeight ?? 50}
                  onChange={(e) => update({ LinkHeight: Number(e.target.value) })}
                />
              </label>
            </div>

            <div className={styles.row}>
              <label className={`${styles.field} ${styles.rowField}`}>
                Text align (horizontal)
                <select
                  className={styles.input}
                  value={link.TextAlignment ?? 'Left'}
                  onChange={(e) => update({ TextAlignment: e.target.value as TextAlignment })}
                >
                  <option value="Left">Left</option>
                  <option value="Center">Center</option>
                  <option value="Right">Right</option>
                </select>
              </label>
              <label className={`${styles.field} ${styles.rowField}`}>
                Link place (vertical)
                <select
                  className={styles.input}
                  value={link.LinkPlacement ?? 'Middle'}
                  onChange={(e) => update({ LinkPlacement: e.target.value as LinkPlacement })}
                >
                  <option value="Top">Top</option>
                  <option value="Middle">Middle</option>
                  <option value="Bottom">Bottom</option>
                </select>
              </label>
            </div>

            <div className={styles.row}>
              <label className={`${styles.field} ${styles.rowField}`}>
                Image align
                <select
                  className={styles.input}
                  value={link.ImageAlignment ?? 'Left'}
                  onChange={(e) => update({ ImageAlignment: e.target.value as ImageAlignment })}
                >
                  <option value="Left">Left</option>
                  <option value="Center">Center</option>
                  <option value="Right">Right</option>
                </select>
              </label>
              <label className={`${styles.field} ${styles.rowField}`}>
                Image place
                <select
                  className={styles.input}
                  value={link.ImagePlacement ?? 'Middle'}
                  onChange={(e) => update({ ImagePlacement: e.target.value as ImagePlacement })}
                >
                  <option value="Top">Top</option>
                  <option value="Middle">Middle</option>
                  <option value="Bottom">Bottom</option>
                </select>
              </label>
            </div>
          </div>
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
            disabled={isSaving}
            style={{
              padding: '8px 14px',
              backgroundColor: '#107c41',
              color: '#fff',
              border: 'none',
              cursor: isSaving ? 'wait' : 'pointer',
              borderRadius: '4px',
              fontWeight: 600,
              opacity: isSaving ? 0.7 : 1
            }}
          >
            {isSaving ? 'Saving...' : mode === 'edit' ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickLinkModal;
