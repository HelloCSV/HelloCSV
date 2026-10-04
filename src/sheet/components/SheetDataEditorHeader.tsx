import { useTranslations } from '../../i18';
import { fieldIsRequired } from '../../validators';
import { SheetColumnDefinition } from '../types';
import { PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { isColumnReadOnly } from '../utils';

interface Props {
  column: SheetColumnDefinition;
}

export default function SheetDataEditorHeader({ column }: Props) {
  const { t } = useTranslations();
  const isReadOnly = isColumnReadOnly(column);

  return (
    <div
      className="hc:flex hc:items-center"
      title={isReadOnly ? t('sheet.readOnly') : undefined}
    >
      {isReadOnly && (
        <div className="hc:relative hc:mr-3 hc:h-5 hc:w-5">
          <XMarkIcon className="hc:text-hello-csv-text-subtle hc:absolute hc:top-0 hc:left-0 hc:h-5 hc:w-5" />

          <PencilIcon className="hc:text-hello-csv-text-muted hc:absolute hc:top-0 hc:left-0 hc:h-5 hc:w-5" />
        </div>
      )}
      {column.label} {fieldIsRequired(column) && '*'}
    </div>
  );
}
