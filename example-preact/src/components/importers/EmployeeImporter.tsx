import { useState } from 'preact/hooks';
import Importer, { ImporterState } from 'hello-csv/preact';
import Content from '../Content';
import DocumentContainer from '../DocumentContainer';
import example1 from '../../assets/datasets/example-1.csv?url';

export default function EmployeeImporter() {
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
  };
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
          onComplete={onComplete}
          preventUploadOnValidationErrors
          persistenceConfig={{
            enabled: true,
          }}
        />
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
