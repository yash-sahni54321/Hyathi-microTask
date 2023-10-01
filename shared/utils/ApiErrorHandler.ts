import { ErrorHandler } from "../types";

export class ApiErrorHandler extends Error {
  code: number;
  constructor(args: ErrorHandler) {
    super(args.message);
    this.message = args.message ?? "";
    this.code = args.code;
  }
}
