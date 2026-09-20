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
      className="flex items-center"
      title={isReadOnly ? t('sheet.readOnly') : undefined}
    >
      {isReadOnly && (
        <div className="relative mr-3 h-5 w-5">
          <XMarkIcon className="text-hello-csv-text-subtle absolute top-0 left-0 h-5 w-5" />

          <PencilIcon className="text-hello-csv-text-muted absolute top-0 left-0 h-5 w-5" />
        </div>
      )}
      {column.label} {fieldIsRequired(column) && '*'}
    </div>
  );
}
