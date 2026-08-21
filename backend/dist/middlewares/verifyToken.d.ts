import type { Request, Response, NextFunction } from "express";
declare const verifyToken: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
declare const verifyAuthorizedToken: (req: Request, res: Response, next: NextFunction) => void;
declare const verifyAdminToken: (req: Request, res: Response, next: NextFunction) => void;
declare const verifySuperAdminToken: (req: Request, res: Response, next: NextFunction) => void;
declare const verifyPostOwner: (req: Request, res: Response, next: NextFunction) => void;
declare const verifyCommentOwner: (req: Request, res: Response, next: NextFunction) => void;
export { verifyToken, verifyAuthorizedToken, verifyAdminToken, verifySuperAdminToken, verifyPostOwner, verifyCommentOwner, };
//# sourceMappingURL=verifyToken.d.ts.map