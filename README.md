# hello-csv

> A modern CSV importer written in Preact

[![NPM](https://img.shields.io/npm/v/hello-csv.svg)](https://www.npmjs.com/package/hello-csv)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Build Status](https://github.com/HelloCSV/HelloCSV/actions/workflows/run-tests.yml/badge.svg)](https://github.com/HelloCSV/HelloCSV/actions/workflows/run-tests.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

# Contents

- [Why?](#why)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Documentation](#documentation)

### Why?

Every single project I've worked on needed some hacked together CSV importer. React Importer tries to fix this by implementing a modern CSV import flow for React projects!

### Demo

Visit [here](https://HelloCSV.github.io/HelloCSV/) to see what React Importer looks like in action!

### Installation

```bash
npm install --save hello-csv
```

#### React and [Vite](https://vite.dev/)

- Since this project uses [Preact](https://preactjs.com/), it is necesary to add the following code to your `vite.config.ts` to ensure compatibility if your project relies on React
- Detailed documenation on aliasing React to Preact can be found [here](https://preactjs.com/guide/v10/getting-started/#aliasing-react-to-preact)

```
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    },
  },
});
```

### Usage

```jsx
import Importer from 'hello-csv/peer';
import 'hello-csv/peer/index.css';

<Importer
  sheets={[
    {
      id: 'employees',
      label: 'Employees',
      columns: [
        {
          label: 'Name',
          id: 'name',
          type: 'string',
          validators: [{ validate: 'required' }],
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
        { label: 'City', id: 'city', type: 'string' },
        {
          label: 'State',
          id: 'state',
          type: 'string',
          isReadOnly: true,
          transformers: [{ transformer: 'state_code' }],
        },
      ],
    },
    {
      id: 'companies',
      label: 'Companies',
      columns: [
        {
          label: 'Company',
          id: 'company',
          type: 'string',
          validators: [{ validate: 'required' }],
        },
        {
          label: 'Industry',
          id: 'industry',
          type: 'enum',
          typeArguments: {
            values: [
              { label: 'Tech', value: 'tech' },
              { label: 'Finance', value: 'finance' },
            ],
          },
          validators: [{ validate: 'required' }],
        },
        {
          label: 'Name',
          id: 'name',
          type: 'reference',
          typeArguments: {
            sheetId: 'employees',
            sheetColumnId: 'name',
          },
          validators: [{ validate: 'required' }],
        },
      ],
    },
  ]}
  onComplete={(data) => {
    console.log(data);
  }}
/>;
```

### Documentation

#### Props

| Prop Name                       | Default Value   | Available Values                                                                                             | Required | Description                                                                                                                                                                    |
| ------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| sheets                          | -               | `SheetDefinition[]`                                                                                          | Yes      | Array of sheet definitions that describe the structure of data to be imported                                                                                                  |
| onComplete                      | -               | `(data: ImporterState, onProgress: (progress: number) => void) => Promise<void>`                             | Yes      | Callback function called when the import process is completed. Receives the final data and a progress callback                                                                 |
| theme                           | 'default'       | 'default' \| 'theme-1' \| 'theme-2'                                                                          | No       | Visual theme variant for the importer component                                                                                                                                |
| onDataColumnsMapped             | -               | `(data: SheetState) => Promise<SheetState> \| SheetState`                                                    | No       | Callback function called after columns are mapped to sheet definitions by the user                                                                                             |
| allowManualDataEntry            | false           | boolean                                                                                                      | No       | Whether to allow users to manually enter data during the preview phase                                                                                                         |
| locale                          | en              | 'en' \| 'fr'                                                                                                 | No       | Locale string for internationalization                                                                                                                                         |
| preventUploadOnValidationErrors | false           | boolean \| `(errors: ImporterValidationError[]) => boolean`                                                  | No       | Controls whether to prevent upload when validation errors occur. Can be a boolean or a function that returns a boolean based on the errors                                     |
| maxFileSizeInBytes              | 20971520 (20MB) | number                                                                                                       | No       | Maximum allowed file size in bytes (optional). When specified, files larger than this size will be rejected. Example: 204800 for 200KB                                         |
| customSuggestedMapper           | -               | `(sheetDefinitions: SheetDefinition[], csvHeaders: string[]) => ColumnMapping[] \| Promise<ColumnMapping[]>` | No       | Function to apply custom suggested mappings based on uploaded csv headers. Mappings replace built-in suggested mappings, including sheet's `suggestedMappingKeywords` argument |

##### SheetDefinition Props

| Prop Name | Default Value | Available Values          | Required | Description                                                               |
| --------- | ------------- | ------------------------- | -------- | ------------------------------------------------------------------------- |
| id        | -             | string                    | Yes      | Unique identifier for the sheet                                           |
| label     | -             | string                    | Yes      | Display name for the sheet                                                |
| columns   | -             | `SheetColumnDefinition[]` | Yes      | Array of column definitions that describe the structure of the sheet data |

##### Column Types

| Type       | Description                                                                                                                                                                                                                                                                                           | Additional Props                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| string     | Basic string column                                                                                                                                                                                                                                                                                   | -                                                                         |
| number     | Numeric column                                                                                                                                                                                                                                                                                        | -                                                                         |
| reference  | References data from another sheet. Referenced columns are automatically filled and are not available for the user to select in the mapping phase                                                                                                                                                     | `typeArguments: { sheetId: string, sheetColumnId: string }`               |
| calculated | Value of the column is calculated based on the value of the whole row of data. The value is automatically calculated based on passed callback and cannot be selected by the user in the mapping state. Column is readOnly and is recalculated anytime the value of any column in the data row changes | `typeArguments: { getValue: (row: SheetRow) => ImporterOutputFieldType }` |
| enum       | Column with predefined values                                                                                                                                                                                                                                                                         | `typeArguments: { values: SelectOption<string>[] }`                       |

##### Common Column Props

All column types share these base properties:

- `id: string` - Unique identifier for the column
- `type: ColumnType` - Type of the column (described above)
- `label: string` - Display name for the column
- `suggestedMappingKeywords?: string[]` - Keywords to help with automatic column mapping
- `isReadOnly?: boolean` - Whether the column can be edited
- `validators?: ImporterValidatorDefinition[]` - Array of validation rules
- `transformers?: ImporterTransformerDefinition[]` - Array of data transformation rules

##### ImporterState

| Prop Name        | Type                        | Required | Description                                                                                               |
| ---------------- | --------------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| sheetDefinitions | `SheetDefinition[]`         | Yes      | Array of sheet definitions that define the structure of the import                                        |
| currentSheetId   | string                      | Yes      | ID of the currently selected sheet                                                                        |
| mode             | ImporterMode                | Yes      | Current state of the importer ('upload' \| 'mapping' \| 'preview' \| 'submit' \| 'completed' \| 'failed') |
| validationErrors | `ImporterValidationError[]` | Yes      | Array of validation errors found in the data                                                              |
| sheetData        | `SheetState[]`              | Yes      | Array containing the actual data for each sheet                                                           |
| parsedFile       | `ParsedFile`                | No       | Contains the parsed CSV file data if a file has been uploaded                                             |
| rowFile          | `File`                      | No       | The original uploaded file object                                                                         |
| columnMappings   | `ColumnMapping[]`           | No       | Array of mappings between CSV columns and sheet columns                                                   |
| importProgress   | number                      | Yes      | Progress of the import operation (0-100)                                                                  |

Example:

```typescript
{
  sheetDefinitions: [...],
  currentSheetId: "employees",
  mode: "preview",
  validationErrors: [],
  sheetData: [...],
  columnMappings: [
    { csvColumnName: "Name", sheetId: "employees", sheetColumnId: "name" }
  ],
  importProgress: 0
}
```

##### SheetState Props

| Prop Name | Default Value | Available Values | Required | Description                                                                  |
| --------- | ------------- | ---------------- | -------- | ---------------------------------------------------------------------------- |
| sheetId   | -             | string           | Yes      | Unique identifier matching the corresponding SheetDefinition                 |
| rows      | -             | `SheetRow[]`     | Yes      | Array of data rows, where each row is a record of column IDs to their values |

##### Validators

| Type           | Description                                                                                                                                                            | Additional Props                                                                                           | Example                                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| required       | Ensures the field is not empty                                                                                                                                         | `error?: string`                                                                                           | `{ validate: 'required', error: 'This field is required' }`                                                |
| unique         | Ensures the value is unique across all rows                                                                                                                            | `error?: string`                                                                                           | `{ validate: 'unique', error: 'This value must be unique' }`                                               |
| regex_matches  | Validates against a regular expression                                                                                                                                 | `regex: string \| RegExp, error?: string`                                                                  | `{ validate: 'regex_matches', regex: /^[A-Z]+$/, error: 'Must be uppercase' }`                             |
| includes       | Checks if value is in a predefined list                                                                                                                                | `values: ImporterOutputFieldType[], error?: string`                                                        | `{ validate: 'includes', values: ['A', 'B', 'C'] }`                                                        |
| multi_includes | Checks if all values in a delimited string are in a predefined list                                                                                                    | `values: ImporterOutputFieldType[], delimiter?: string \| RegExp, error?: string`                          | `{ validate: 'multi_includes', values: ['A', 'B'], delimiter: ',' }`                                       |
| is_integer     | Validates that the value is an integer                                                                                                                                 | `error?: string`                                                                                           | `{ validate: 'is_integer' }`                                                                               |
| phone_number   | Validates phone number format                                                                                                                                          | `error?: string`                                                                                           | `{ validate: 'phone_number' }`                                                                             |
| email          | Validates email format                                                                                                                                                 | `error?: string`                                                                                           | `{ validate: 'email' }`                                                                                    |
| postal_code    | Validates postal code format                                                                                                                                           | `error?: string`                                                                                           | `{ validate: 'postal_code' }`                                                                              |
| custom         | Custom validation function. Returning string means the validation failed and the string returned is the message. Returning null/undefined means that validation passed | `key: string, validateFn: (fieldValue: ImporterOutputFieldType, row: SheetRow) => ImporterValidatorOutput` | `{ validate: 'custom', key: 'myValidator', validateFn: (value) => value.length > 5 ? null : 'Too short' }` |

##### Transformers

| Type         | Description                                | Example                                                                                        |
| ------------ | ------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| phone_number | Formats phone numbers to a standard format | `{ transformer: 'phone_number' }`                                                              |
| postal_code  | Formats postal codes to a standard format  | `{ transformer: 'postal_code' }`                                                               |
| state_code   | Formats state codes to a standard format   | `{ transformer: 'state_code' }`                                                                |
| strip        | Removes leading and trailing whitespace    | `{ transformer: 'strip' }`                                                                     |
| custom       | Custom transformation function             | `{ transformer: 'custom', key: 'myTransformer', transformFn: (value) => value.toUpperCase() }` |

##### ImporterValidationError

| Prop Name | Type   | Required | Description                                                    |
| --------- | ------ | -------- | -------------------------------------------------------------- |
| sheetId   | string | Yes      | ID of the sheet where the validation error occurred            |
| rowIndex  | number | Yes      | Index of the row where the validation error occurred (0-based) |
| columnId  | string | Yes      | ID of the column where the validation error occurred           |
| message   | string | Yes      | Error message describing what went wrong                       |

Example:

```typescript
{
  sheetId: "employees",
  rowIndex: 2,
  columnId: "email",
  message: "Invalid email format"
}
```

#### Peer vs Bundled

This package ships with 2 versions you can use:

- `/peer` - this version is meant to be used with React/Preact - it defines `preact` as peer dependency
- `/bundled` - this version is meant to be used without React/Preact - it ships with `preact` bundled. The user should then use `renderImporter` function, exported as named export

#### Customization

##### Height and Width

You can customize the dimensions by setting `height`, `max-height`, `width`, or `max-width`. To ensure proper scaling and responsiveness, it's important to include `flex`.

```jsx
<div style={{ display: 'flex', height: '80vh' }}>
  <Importer .../>
</div>
```

##### Theme Styles

You can further customize theme styles by overriding the following CSS variables in your `index.css` file:

```css
:root {
  --hello-csv-color-primary: #007bff;
  --hello-csv-color-primary-light: #66b3ff;
  --hello-csv-color-primary-extra-light: #cce7ff;
  --hello-csv-color-secondary: #6c757d;
  --hello-csv-color-tertiary: #17a2b8;
  --hello-csv-color-tertiary-light: #5bc0de;
  --hello-csv-color-success: #28a745;
  --hello-csv-color-danger: #dc3545;
  --hello-csv-color-danger-light: #f5c6cb;
  --hello-csv-color-danger-extra-light: #f8d7da;
  --hello-csv-color-warning: #ffc107;
  --hello-csv-color-info: #17a2b8;
  --hello-csv-color-muted: #f9fafb;
  --hello-csv-color-muted-light: #f3f4f6;
}
```

These variables allow you to adjust the color scheme for primary, secondary, and tertiary elements, as well as status indicators such as success, danger, warning, and info.

## License

MIT © [HelloCSV](https://github.com/HelloCSV)

## Development setup

- Run `npm i && npm run watch` - this watches for changes in main plugin and rebuilds if needed
- Run `cd example && npm i && npm run dev` - this runs example application

To run no build example you could run

- `npx http-server .`
