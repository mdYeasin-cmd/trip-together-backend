import { ZodError, ZodIssue } from "zod";
import { TErrorSources, TGenericErrorResponse } from "../interfaces/error";

const handleZodError = (err: ZodError): TGenericErrorResponse => {
  const statusCode = 400;

  const messages: string[] = [];

  err.issues.forEach((issue: ZodIssue) => {
    messages.push(issue.message);
  });

  const message: string = messages.join(" ");

  const issues: TErrorSources = err.issues.map((issue: ZodIssue) => {
    return {
      field: issue?.path[issue.path.length - 1],
      message: issue.message,
    };
  });

  return {
    statusCode,
    message,
    errorDetails: {
      issues,
    },
  };
};

export default handleZodError;
