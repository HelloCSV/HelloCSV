import { useState } from 'preact/hooks';
import Importer, {
  SheetDefinition,
  SheetRow,
  ImporterState,
} from 'hello-csv/peer';
import Content from '../Content';
import studentsAndSchoolsExample from '../../assets/datasets/students_and_schools.csv?url';

const SCHOOLS_SHEET: SheetDefinition = {
  id: 'schools',
  label: 'Schools',
  columns: [
    { label: 'School Name', id: 'school_name', type: 'string' },
    { label: 'School Address 1', id: 'school_address_1', type: 'string' },
    { label: 'School Address 2', id: 'school_address_2', type: 'string' },
    { label: 'School County', id: 'school_county', type: 'string' },
    { label: 'School City', id: 'school_city', type: 'string' },
    { label: 'School State', id: 'school_state', type: 'string' },
    { label: 'School Zip Code', id: 'school_zip_code', type: 'string' },
  ],
};

const STUDENTS_SHEET: SheetDefinition = {
  id: 'students',
  label: 'Students',
  columns: [
    // Student specific
    {
      label: 'Student ID',
      id: 'id',
      type: 'string',
      validators: [
        { validate: 'required' },
        { validate: 'unique', error: 'This student ID is not unique' },
      ],
    },
    {
      label: 'Grade',
      id: 'grade',
      type: 'string',
      validators: [
        { validate: 'required' },
        {
          validate: 'includes',
          values: [
            'k',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            '11',
            '12',
          ],
        },
      ],
    },
    // Guardian
    {
      label: 'Parent/Guardian First Name',
      id: 'parent_guardian_first_name',
      type: 'string',
    },
    {
      label: 'Parent/Guardian Last Name',
      id: 'parent_guardian_last_name',
      type: 'string',
    },
    // Address
    { label: 'Address 1', id: 'address_1', type: 'string' },
    { label: 'Address 2', id: 'address_2', type: 'string' },
    { label: 'County', id: 'county', type: 'string' },
    { label: 'City', id: 'city', type: 'string' },
    { label: 'State', id: 'state', type: 'string' },
    { label: 'Zip Code', id: 'zip_code', type: 'string' },

    // Names
    { label: 'First Name', id: 'first_name', type: 'string' },
    { label: 'Middle Name', id: 'middle_name', type: 'string' },
    { label: 'Last Name', id: 'last_name', type: 'string' },
    { label: 'Preferred Name', id: 'preferred_name', type: 'string' },
    { label: 'Alias Names', id: 'alias_names', type: 'string' },

    // Contact
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
    // Demographics
    { label: 'Date of Birth', id: 'date_of_birth', type: 'string' },
    { label: 'Race', id: 'race', type: 'string' },
    { label: 'Ethnicity', id: 'ethnicity', type: 'string' },
    { label: 'Gender', id: 'gender', type: 'string' },

    // Insurance information
    {
      label: 'Insurance Group Number',
      id: 'insurance_group_number',
      type: 'string',
    },
    {
      label: 'Insurance Policy Holder',
      id: 'insurance_policy_holder',
      type: 'string',
    },
    {
      label: 'Insurance Primary Member Date of Birth',
      id: 'insurance_primary_member_date_of_birth',
      type: 'string',
    },
    {
      label: 'Insurance Primary Member First Name',
      id: 'insurance_primary_member_first_name',
      type: 'string',
    },
    {
      label: 'Insurance Primary Member Last Name',
      id: 'insurance_primary_member_last_name',
      type: 'string',
    },
    {
      label: 'Insurance Secondary Company',
      id: 'insurance_secondary_company',
      type: 'string',
    },
  ],
};

export default function ComplexImporter() {
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
      <h1>
        Want to see a demo? Try uploading{' '}
        <a
          className="text-blue-500 hover:text-blue-600"
          href={studentsAndSchoolsExample}
        >
          this file
        </a>
        .
      </h1>

      <div className="mt-4 flex h-[800px] rounded-lg border border-gray-200 bg-white p-6 px-8">
        <Importer
          sheets={[STUDENTS_SHEET, SCHOOLS_SHEET]}
          onDataColumnsMapped={(sheets) => {
            const sheet = sheets.find((sheet) => sheet.sheetId === 'schools')!;
            const seen = new Set();
            sheet.rows = [...sheet.rows].filter((row: SheetRow) => {
              // Remove duplicate names, don't validate yet...
              const hasSeen = !seen.has(row.school_name);
              seen.add(row.school_name);
              return hasSeen;
            });
            return sheets;
          }}
          onComplete={onComplete}
        />
        {ready && (
          <div style={{ margin: '0 auto', maxWidth: '1200px' }}>
            <h4>Check the console for the output!</h4>
          </div>
        )}
      </div>
    </Content>
  );
}
