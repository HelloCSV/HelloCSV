import { ImporterOutputFieldType } from '../../types';
import { useTranslations } from '../../i18';
import { Badge } from '../../../src/components';

interface Props {
  examples: ImporterOutputFieldType[] | null;
  csvHeader: string | null;
}

export default function HeaderMapperDataPreview({
  examples,
  csvHeader,
}: Props) {
  const { t, tHtml } = useTranslations();

  return (
    csvHeader && (
      <div className="border-hello-csv-border-strong bg-hello-csv-surface m-4 rounded-sm border px-4 sm:px-6 lg:px-8">
        <div className="mt-6 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="divide-hello-csv-border-strong min-w-full divide-y">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="text-hello-csv-text py-3.5 pr-3 pl-4 text-left text-sm font-semibold sm:pl-6 lg:pl-8"
                    >
                      {tHtml('mapper.dataPreview', {
                        csvHeader: <Badge>{csvHeader}</Badge>,
                      })}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-hello-csv-border-strong divide-y">
                  {examples?.map((example, idx) => (
                    <tr key={idx}>
                      <td className="text-hello-csv-text h-12 py-4 pr-3 pl-4 text-sm font-medium sm:pl-6 lg:pl-8">
                        {example ||
                          (idx === 0 && (
                            <span className="text-hello-csv-text-muted italic">
                              {t('mapper.noData')}
                            </span>
                          ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
