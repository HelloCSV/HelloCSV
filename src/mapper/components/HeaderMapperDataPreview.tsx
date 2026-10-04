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
      <div className="hc:border-hello-csv-border-strong hc:bg-hello-csv-surface hc:m-4 hc:rounded-sm hc:border hc:px-4 hc:sm:px-6 hc:lg:px-8">
        <div className="hc:mt-6 hc:flow-root">
          <div className="hc:-mx-4 hc:-my-2 hc:overflow-x-auto hc:sm:-mx-6 hc:lg:-mx-8">
            <div className="hc:inline-block hc:min-w-full hc:py-2 hc:align-middle">
              <table className="hc:divide-hello-csv-border-strong hc:min-w-full hc:divide-y">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="hc:text-hello-csv-text hc:py-3.5 hc:pr-3 hc:pl-4 hc:text-left hc:text-sm hc:font-semibold hc:sm:pl-6 hc:lg:pl-8"
                    >
                      {tHtml('mapper.dataPreview', {
                        csvHeader: <Badge>{csvHeader}</Badge>,
                      })}
                    </th>
                  </tr>
                </thead>
                <tbody className="hc:divide-hello-csv-border-strong hc:divide-y">
                  {examples?.map((example, idx) => (
                    <tr key={idx}>
                      <td className="hc:text-hello-csv-text hc:h-12 hc:py-4 hc:pr-3 hc:pl-4 hc:text-sm hc:font-medium hc:sm:pl-6 hc:lg:pl-8">
                        {example ||
                          (idx === 0 && (
                            <span className="hc:text-hello-csv-text-muted hc:italic">
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
