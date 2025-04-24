/**
 * Classes de erro personalizadas para a aplicação
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class AuthenticationError extends AppError {
  constructor(message) {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message) {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

class DatabaseError extends AppError {
  constructor(message) {
    super(message, 500);
    this.name = 'DatabaseError';
  }
}

class CloudProviderError extends AppError {
  constructor(message, providerName) {
    super(`${providerName}: ${message}`, 500);
    this.name = 'CloudProviderError';
    this.provider = providerName;
  }
}

class TerraformError extends AppError {
  constructor(message) {
    super(message, 500);
    this.name = 'TerraformError';
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  DatabaseError,
  CloudProviderError,
  TerraformError
};