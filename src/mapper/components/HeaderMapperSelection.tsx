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
      className="hc:hover:bg-hello-csv-muted hc:rounded-sm"
      onMouseEnter={onMouseEnter}
    >
      <div className="hc:flex hc:items-center hc:py-2.5">
        <div className="hc:mx-2.5 hc:flex hc:flex-1 hc:justify-between">
          <div>
            <Badge>{csvHeader.slice(0, 30)}</Badge>
          </div>
          <div className="hc:mx-5">
            <ArrowRightIcon className="hc:h-4 hc:w-4" />
          </div>
        </div>

        <div className="hc:mx-2.5 hc:flex-1">
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
