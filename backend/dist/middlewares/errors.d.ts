import type { Request, Response, NextFunction } from "express";
declare const notFound: (req: Request, res: Response, next: NextFunction) => void;
declare const errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export { notFound, errorHandler };
//# sourceMappingURL=errors.d.ts.map