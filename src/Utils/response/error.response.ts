import { Request, Response, NextFunction } from "express";

export interface IError extends Error {
    statusCode?: number;
}

export class ApplicationErrors extends Error {
    constructor(message: string, options?: ErrorOptions, public statusCode: number = 400) {
        super(message, options);
        this.name = this.constructor.name;
    }
}

export class BadRequestException extends ApplicationErrors {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options, 400);
    }
}

export class NotFoundException extends ApplicationErrors {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options, 404);
    }
}

export class UnauthorizedException extends ApplicationErrors {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options, 401);
    }
}

export class ForbiddenException extends ApplicationErrors {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options, 403);
    }
}

export class ConflictException extends ApplicationErrors {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options, 409);
    }
}

export class InternalServerErrorException extends ApplicationErrors {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options, 500);
    }
}

export const globalErrorHandler = (err: IError, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Something went wrong!",
        stack: err.stack,
        cause: err.cause,
    });
};