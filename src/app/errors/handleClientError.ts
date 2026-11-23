import type { StructuredError } from "@prisma/orm-postgres/utils/structured-error";
import httpStatus from "http-status";

const handleClientError = (error: StructuredError) => {
  let statusCode: number = httpStatus.BAD_REQUEST;
  let message = error.message;

  if (error.code === "RUNTIME.NO_ROWS") {
    statusCode = httpStatus.NOT_FOUND;
    message = "Record not found!";
  }

  const errorDetails = {
    code: error.code,
    why: error.why,
    meta: error.meta,
  };

  return {
    statusCode,
    message,
    errorDetails,
  };
};

export default handleClientError;
