/// Base class for all API-related exceptions in Cinephile.
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic details;

  const ApiException(this.message, {this.statusCode, this.details});

  @override
  String toString() =>
      statusCode != null ? 'ApiException ($statusCode): $message' : 'ApiException: $message';
}

/// Thrown when there is no network connection or the server cannot be reached.
class NetworkException extends ApiException {
  const NetworkException([super.message = 'Unable to connect to the Cinephile server. Please check your network connection.']);
}

/// Thrown when an authenticated endpoint returns 401 Unauthorized.
class UnauthorizedException extends ApiException {
  const UnauthorizedException([super.message = 'Your session has expired. Please log in again.'])
      : super(statusCode: 401);
}

/// Thrown when an endpoint returns 403 Forbidden.
class ForbiddenException extends ApiException {
  const ForbiddenException([super.message = 'You do not have permission to perform this action.'])
      : super(statusCode: 403);
}

/// Thrown when an endpoint returns 404 Not Found.
class NotFoundException extends ApiException {
  const NotFoundException([super.message = 'The requested resource was not found.'])
      : super(statusCode: 404);
}

/// Thrown when input validation fails (HTTP 400).
class ValidationException extends ApiException {
  const ValidationException(super.message, {super.details})
      : super(statusCode: 400);
}

/// Thrown when a 500-level server error occurs.
class ServerException extends ApiException {
  const ServerException([super.message = 'An unexpected server error occurred. Please try again later.'])
      : super(statusCode: 500);
}
