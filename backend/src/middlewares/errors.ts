import type { Request, Response, NextFunction } from "express";
const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err.name === "CastError") {
    return res
      .status(400)
      .json({ message: `Invalid ${err.path || "ID format"}: ${err.value}` });
  }
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  return res.status(statusCode).json({ message: err.message });
};

const sendError = (res: Response, statusCode: number, errorMessage: string) => {
  return res
    .status(statusCode)
    .json({
      success: false,
      message: "Request failed",
      data: { message: errorMessage },
    });
};
export { notFound, errorHandler, sendError };
