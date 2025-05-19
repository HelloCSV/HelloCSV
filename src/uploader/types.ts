export type ImporterRequirementType = {
  sheetId: string;
  columnId: string;
  columnLabel: string;
};

export type ImporterRequirementsType = {
  required: ImporterRequirementType[];
  optional: ImporterRequirementType[];
};


export interface CustomFileLoader {
  mimeType: string;
  label: string;
  convert: (loadEvent: ProgressEvent<FileReader>, file: File) => {
    fileName: string;
    csvData: string;
  };
}
