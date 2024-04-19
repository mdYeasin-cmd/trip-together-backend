import { Prisma } from "@prisma/client";

const handleClientError = (error: Prisma.PrismaClientKnownRequestError) => {
  const statusCode = 404;
  let message;
  let errorDetails;

  if (error.code === "P2025") {
    message = (error.meta?.cause as string) || "Record not found!";
    errorDetails = error;
  }

  return {
    statusCode,
    message,
    errorDetails,
  };
};

export default handleClientError;
