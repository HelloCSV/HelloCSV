import { Select, Badge } from '../../components';
import { ColumnMapping, MapperOption, MapperOptionValue } from '../../types';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

interface Props {
  csvHeader: string;
  currentMapping: MapperOptionValue | null;
  setMapping: (header: MapperOptionValue | null) => void;
  mappingSelectionOptions: MapperOption[];
  onMouseEnter: () => void;
}

export default function HeaderMapperSelection({
  csvHeader,
  setMapping,
  currentMapping,
  mappingSelectionOptions,
  onMouseEnter,
}: Props) {
  const currentHeaderOption =
    currentMapping == null
      ? null
      : (mappingSelectionOptions.find(
          (option) =>
            option.value.sheetId === currentMapping.sheetId &&
            option.value.sheetColumnId === currentMapping.sheetColumnId
        )?.value ?? null);

  return (
    <div
      className="hover:bg-hello-csv-muted rounded-sm"
      onMouseEnter={onMouseEnter}
    >
      <div className="flex items-center py-2.5">
        <div className="mx-2.5 flex flex-1 justify-between">
          <div>
            <Badge>{csvHeader.slice(0, 30)}</Badge>
          </div>
          <div className="mx-5">
            <ArrowRightIcon className="h-4 w-4" />
          </div>
        </div>

        <div className="mx-2.5 flex-1">
          <Select
            aria-label={`column mapping for ${csvHeader}`}
            searchable
            clearable
            compareFunction={(a, b) => {
              if (a == null || b == null) {
                return false;
              }

              return (
                a.sheetColumnId === b.sheetColumnId && a.sheetId === b.sheetId
              );
            }}
            value={currentHeaderOption}
            options={mappingSelectionOptions}
            onChange={(mapping) => setMapping(mapping as ColumnMapping | null)}
          />
        </div>
      </div>
    </div>
  );
}
