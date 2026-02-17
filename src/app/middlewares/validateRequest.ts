import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

const validateRequest =
  (schema: ZodObject<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let parsedBody: any = {};

      console.log("first", req.body);

      if (req.body) {
        if (typeof req.body === "string") {
          parsedBody = JSON.parse(req.body);
        } else if (req.body.data && typeof req.body.data === "string") {
          parsedBody = JSON.parse(req.body.data);
        } else {
          parsedBody = req.body;
        }
      }
      await schema.parseAsync(parsedBody);

      req.body = parsedBody;
      next();
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

export default validateRequest;
