import { renderImporter } from 'hello-csv/bundled';
import 'hello-csv/bundled/index.css';

const onComplete = async (data, onProgress) => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  onProgress(20);
  await new Promise((resolve) => setTimeout(resolve, 200));
  onProgress(50);
  await new Promise((resolve) => setTimeout(resolve, 200));
  onProgress(100);
  console.log(data);
  setReady(true);
};

document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.querySelector('#app');

  if (!appElement) {
    console.error('Could not find #app element!');
    return;
  }

  try {
    renderImporter(appElement, {
      sheets: [
        {
          id: 'employees',
          label: 'Employees',
          columns: [
            {
              label: 'Employee ID',
              id: 'employee_id',
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
                  validate: 'regex_matches',
                  regex:
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                  error: 'This email is not valid',
                },
              ],
            },
            {
              label: 'Phone Number',
              id: 'phone_number',
              type: 'string',
              validators: [{ validate: 'required' }],
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
              validators: [{ validate: 'required' }],
            },
          ],
        },
      ],
      onDataColumnsMapped: (dataColumns) => {
        console.log('Data columns mapped:', dataColumns);
        return dataColumns;
      },
      onComplete: onComplete,
      preventUploadOnValidationErrors: true,
      persistenceConfig: { enabled: true },
    });
  } catch (error) {
    console.error('Error calling renderImporter:', error);
  }
});
