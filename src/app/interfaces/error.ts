export type TErrorSources = {
  field: string | number;
  message: string;
}[];

export type TGenericErrorResponse = {
  statusCode: number;
  message: string;
  errorDetails: {
    issues: TErrorSources;
  };
};
