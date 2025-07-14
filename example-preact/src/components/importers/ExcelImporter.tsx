import { useState } from 'preact/hooks';
import Importer, { ImporterState } from 'hello-csv/preact';
import Content from '../Content';
import * as XLSX from 'xlsx';
import DocumentContainer from '../DocumentContainer';
import example3 from '../../assets/datasets/example-3.xlsx?url';
const XLSX_FILE_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export default function ExcelImporter() {
  const [ready, setReady] = useState(false);

  const onComplete = async (
    data: ImporterState,
    onProgress: (progress: number) => void
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    onProgress(20);
    await new Promise((resolve) => setTimeout(resolve, 200));
    onProgress(50);
    await new Promise((resolve) => setTimeout(resolve, 200));
    onProgress(100);
    console.log(data);
    setReady(true);

    const totalRows = data.sheetData.reduce(
      (acc, sheet) => acc + sheet.rows.length,
      0
    );

    return {
      totalRows: totalRows,
      imported: totalRows,
      failed: 0,
      skipped: 0,
    };
  };

  return (
    <Content>
      <a id="custom-file-loader"></a>
      <DocumentContainer>
        <h3 className="mb-6 text-2xl font-bold lg:text-4xl">
          XLSX Support & Custom Data Formats
        </h3>
        <div className="container leading-8">
          <p>
            HelloCSV supports importing XLSX, PDF files, and anything else you
            can parse by implementing a{' '}
            <code className="rounded-md bg-gray-200 p-1 hover:underline">
              <a
                href="https://hellocsv.mintlify.app/v0.3.4/api-reference/importer-props#customfileloaders"
                target="_blank"
              >
                CustomFileLoader
              </a>
            </code>
            .
          </p>
        </div>
        <p className="mt-8 text-lg underline decoration-blue-500 decoration-4 underline-offset-6">
          Try uploading{' '}
          <a className="text-blue-500 hover:text-blue-600" href={example3}>
            this excel file
          </a>
          .
        </p>
      </DocumentContainer>
      <div className="mt-4 flex h-[800px] rounded-lg border border-gray-200 bg-white px-2 py-6 sm:px-8">
        <Importer
          allowManualDataEntry
          maxFileSizeInBytes={10 * 1024 * 1024} // 10MB
          sheets={[
            {
              id: 'employees',
              label: 'Employees',
              columns: [
                {
                  label: 'Employee ID',
                  id: 'employee.id',
                  type: 'number',
                  validators: [
                    { validate: 'required' },
                    {
                      validate: 'unique',
                      error: 'This employee ID is not unique',
                    },
                    {
                      validate: 'is_integer',
                      error: 'This value must be a number',
                    },
                  ],
                },
                {
                  label: 'Email',
                  id: 'email',
                  type: 'string',
                  validators: [
                    { validate: 'required' },
                    { validate: 'unique', error: 'This email is not unique' },
                    {
                      validate: 'email',
                      error: 'This email is not valid',
                    },
                  ],
                },
                {
                  label: 'Phone Number',
                  id: 'phone_number',
                  type: 'string',
                  validators: [
                    { validate: 'required' },
                    { validate: 'phone_number' },
                  ],
                },
                {
                  label: 'Address',
                  id: 'address',
                  type: 'string',
                  validators: [{ validate: 'required' }],
                },
                { label: 'City', id: 'city', type: 'string' },
                {
                  label: 'State',
                  id: 'state',
                  type: 'string',
                  transformers: [{ transformer: 'state_code' }],
                },
                {
                  label: 'Zip Code',
                  id: 'zip_code',
                  type: 'string',
                  validators: [
                    { validate: 'required' },
                    { validate: 'postal_code' },
                  ],
                },
                {
                  label: 'Full address',
                  id: 'full_address',
                  type: 'calculated',
                  typeArguments: {
                    getValue: (row) =>
                      `${row.address}, ${row.city}, ${row.state} ${row.zip_code}`,
                  },
                },
              ],
            },
          ]}
          onDataColumnsMapped={(dataColumns) => {
            return dataColumns;
          }}
          customFileLoaders={[
            {
              mimeType: XLSX_FILE_MIME_TYPE,
              label: 'XLSX',
              convert: (loadEvent, file) => {
                const data = new Uint8Array(
                  loadEvent.target?.result as ArrayBuffer
                );
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const csvData = XLSX.utils.sheet_to_csv(firstSheet);

                return { fileName: file.name, csvData };
              },
            },
          ]}
          onComplete={onComplete}
          persistenceConfig={{
            enabled: true,
            customKey: 'excel-importer',
          }}
        />
      </div>
      {ready && (
        <div>
          <h4>Check the console for the output!</h4>
        </div>
      )}
    </Content>
  );
}
