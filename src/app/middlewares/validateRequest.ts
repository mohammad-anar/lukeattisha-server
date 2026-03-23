import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

const validateRequest =
  (schema: ZodObject<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
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
      const parsedData = await schema.parseAsync({
        body: parsedBody,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      });

      req.body = parsedData.body;
      req.query = parsedData.query as any;
      req.params = parsedData.params as any;

      next();
    } catch (error) {
      next(error);
    }
  };

export default validateRequest;
