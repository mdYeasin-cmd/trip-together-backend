import type { NextFunction, Request, Response } from "express";
import chalk from "chalk";

const getStatusColor = (statusCode: number) => {
  if (statusCode >= 500) return chalk.bgRed.white(` ${statusCode} `);

  if (statusCode >= 400) return chalk.bgYellow.black(` ${statusCode} `);

  if (statusCode >= 300) return chalk.bgCyan.black(` ${statusCode} `);

  return chalk.bgGreen.black(` ${statusCode} `);
};

const logger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  const time = chalk.bgBlue.white.bold(` ${new Date().toLocaleTimeString()} `);

  const method = chalk.blue.bold(req.method);

  const url = chalk.white(req.originalUrl);

  // START LOG
  console.log(`${time} ${chalk.bgMagenta.white(" START ")} ${method} ${url}`);

  res.on("finish", () => {
    const duration = Date.now() - startTime;

    const statusCode = getStatusColor(res.statusCode);

    const responseTime = chalk.bgGray.white(` ${duration}ms `);

    const endTime = chalk.bgBlue.white.bold(
      ` ${new Date().toLocaleTimeString()} `,
    );

    // END LOG
    console.log(
      `${endTime} ${chalk.bgGreen.black(" END ")} ${method} ${url} ${statusCode} ${responseTime}`,
    );
  });

  next();
};

export default logger;
