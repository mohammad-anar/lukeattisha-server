import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

const validateRequest =
  (schema: any) =>
    async (req: Request, res: Response, next: NextFunction) => {
      console.log(req.body);
      try {
        let parsedBody: any = {};

        if (req.body) {
          if (typeof req.body === "string") {
            parsedBody = JSON.parse(req.body);
          } else if (req.body.data && typeof req.body.data === "string") {
            parsedBody = JSON.parse(req.body.data);
          } else {
            parsedBody = req.body;
          }
        }
        console.log(parsedBody);
        const validatedData = await schema.parseAsync(parsedBody);
        req.body = validatedData;
        next();
      } catch (error) {
        next(error);
      }
    };

export default validateRequest;
