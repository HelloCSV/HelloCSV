import { useEffect, useState } from 'preact/hooks';
import Importer, {
  CsvImporterStateBuilder,
  ImporterDefinition,
  ImporterState,
} from 'hello-csv/preact';
import Content from '../Content';
import DocumentContainer from '../DocumentContainer';
import example1 from '../../assets/datasets/example-1.csv?url';

export default function EmployeeImporter() {
  const [ready, setReady] = useState(false);
  const [initialState, setInitialState] = useState<ImporterState | undefined>(
    undefined
  );

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
  };

  const importerDefinition: ImporterDefinition = {
    allowManualDataEntry: true,
    maxFileSizeInBytes: 10 * 1024 * 1024, // 10MB
    sheets: [
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
            validators: [{ validate: 'required' }, { validate: 'postal_code' }],
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
    ],
    onDataColumnsMapped: (dataColumns) => {
      return dataColumns;
    },
    onComplete,
    preventUploadOnValidationErrors: true,
    persistenceConfig: {
      enabled: true,
    },
  };

  useEffect(() => {
    const run = async () => {
      const stateBuilder = new CsvImporterStateBuilder(importerDefinition);

      const csvContent = `employee_id,email,phone_number,address,city,state,zip_code
  1234567,john.smith@company.com,555-123-4567,123 Main Street,Seattle,WA,98101
  2345678,emma.wilson@company.com,555-234-5678,456 Oak Avenue,Portland,OR,97201
  3456789,michael.brown@company.com,555-345-6789,789 Pine Road,San Francisco,CA,94102
  4567890,sarah.davis@company.com,555-456-7890,321 Maple Lane,Los Angeles,CA,90001
  5678901,david.miller@company.com,555-567-8901,654 Cedar Street,Denver,CO,80201
  6789012,lisa.taylor@company.com,555-678-9012,987 Birch Boulevard,Austin,TX,78701
  7890123,robert.johnson@company.com,555-789-0123,147 Elm Court,Chicago,IL,60601
  8901234,jennifer.anderson@company.com,555-890-1234,258 Spruce Way,Boston,MA,02108
  9012345,william.martinez@company.com,555-901-2345,369 Willow Drive,Miami,FL,33101
  1123456,rachel.thompson@company.com,555-012-3456,741 Ash Street,Phoenix,AZ,85001
  2234567,thomas.garcia@company.com,555-123-4567,852 Palm Avenue,Houston,TX,77001
  3345678,patricia.lee@company.com,555-234-5678,963 Beach Road,San Diego,CA,92101
  4456789,james.white@company.com,555-345-6789,159 Mountain View,Las Vegas,NV,89101
  5567890,elizabeth.hall@company.com,555-456-7890,753 Valley Lane,Atlanta,GA,30301
  6678901,christopher.clark@company.com,555-567-8901,951 River Road,Nashville,TN,37201
  7789012,michelle.rodriguez@company.com,555-678-9012,357 Lake Drive,Minneapolis,MN,55401
  8890123,daniel.lewis@company.com,555-789-0123,246 Forest Path,Detroit,MI,48201
  9901234,nicole.walker@company.com,555-890-1234,135 Sunset Boulevard,Philadelphia,PA,19101
  1012345,kevin.allen@company.com,555-901-2345,468 Harbor View,Seattle,WA,98102
  2123456,amanda.young@company.com,555-012-3456,791 Ocean Drive,San Francisco,CA,94103`;

      const file = new File([csvContent], 'example-1.csv', {
        type: 'text/csv',
      });

      await stateBuilder.uploadFile(file);
      await stateBuilder.confirmMappings();

      setInitialState(stateBuilder.getState());
    };

    run();
  }, []);

  if (initialState == null) {
    return <div>Loading...</div>;
  }

  return (
    <Content>
      <a id="basic-example"></a>
      <DocumentContainer>
        <h3 className="mb-6 text-2xl font-bold lg:text-4xl">Basic Example</h3>
        <div className="container leading-8">
          <p>
            Imagine we are trying to set up an uploader that uploads a CSV of{' '}
            <code className="rounded-md bg-gray-200 p-1">employees</code>.
          </p>
          <p>HelloCSV makes this a breeze.</p>
        </div>
        <p className="mt-8 text-lg underline decoration-blue-500 decoration-4 underline-offset-6">
          Try uploading{' '}
          <a className="text-blue-500 hover:text-blue-600" href={example1}>
            this file
          </a>
          .
        </p>
      </DocumentContainer>
      <div className="mt-4 flex max-h-[800px] rounded-lg border border-gray-200 bg-white px-2 py-6 sm:px-8">
        <Importer {...importerDefinition} initialState={initialState} />
      </div>
      <div className="mt-4 text-sm font-semibold italic">
        Tip: You can refresh the page while using the importer, and you won't
        lose your progress!
      </div>
      {ready && (
        <div>
          <h4>Check the console for the output!</h4>
        </div>
      )}
    </Content>
  );
}
