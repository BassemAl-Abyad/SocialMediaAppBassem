"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = exports.InternalServerErrorException = exports.ConflictException = exports.ForbiddenException = exports.UnauthorizedException = exports.NotFoundException = exports.BadRequestException = exports.ApplicationErrors = void 0;
class ApplicationErrors extends Error {
    statusCode;
    constructor(message, options, statusCode = 400) {
        super(message, options);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
    }
}
exports.ApplicationErrors = ApplicationErrors;
class BadRequestException extends ApplicationErrors {
    constructor(message, options) {
        super(message, options, 400);
    }
}
exports.BadRequestException = BadRequestException;
class NotFoundException extends ApplicationErrors {
    constructor(message, options) {
        super(message, options, 404);
    }
}
exports.NotFoundException = NotFoundException;
class UnauthorizedException extends ApplicationErrors {
    constructor(message, options) {
        super(message, options, 401);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends ApplicationErrors {
    constructor(message, options) {
        super(message, options, 403);
    }
}
exports.ForbiddenException = ForbiddenException;
class ConflictException extends ApplicationErrors {
    constructor(message, options) {
        super(message, options, 409);
    }
}
exports.ConflictException = ConflictException;
class InternalServerErrorException extends ApplicationErrors {
    constructor(message, options) {
        super(message, options, 500);
    }
}
exports.InternalServerErrorException = InternalServerErrorException;
const globalErrorHandler = (err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode).json({
        success: false,
        message: err.message || "Something went wrong!",
        stack: err.stack,
        cause: err.cause,
    });
};
exports.globalErrorHandler = globalErrorHandler;
