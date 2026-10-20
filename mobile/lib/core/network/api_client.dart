import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/env.dart';
import 'api_exception.dart';

/// Centralized HTTP client managing authentication headers, request formatting,
/// JSON decoding, and status code translation.
class ApiClient {
  final http.Client _httpClient;
  static const Duration timeoutDuration = Duration(seconds: 15);
  static const String tokenKey = 'cinephile_jwt_token';

  ApiClient({http.Client? httpClient}) : _httpClient = httpClient ?? http.Client();

  /// Retrieve stored JWT token
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(tokenKey);
  }

  /// Persist JWT token
  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(tokenKey, token);
  }

  /// Remove stored JWT token
  Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(tokenKey);
  }

  /// Build request headers
  Future<Map<String, String>> _headers({Map<String, String>? extraHeaders}) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    final token = await getToken();
    if (token != null && token.trim().isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    if (extraHeaders != null) {
      headers.addAll(extraHeaders);
    }

    return headers;
  }

  /// Build complete URI
  Uri _buildUri(String path, [Map<String, dynamic>? queryParams]) {
    final baseUrl = Env.apiBaseUrl;
    final cleanPath = path.startsWith('/') ? path : '/$path';
    final fullUrl = '$baseUrl$cleanPath';

    if (queryParams == null || queryParams.isEmpty) {
      return Uri.parse(fullUrl);
    }

    // Filter out null or empty string query parameters
    final filteredParams = <String, String>{};
    queryParams.forEach((key, value) {
      if (value != null && value.toString().trim().isNotEmpty) {
        filteredParams[key] = value.toString();
      }
    });

    return Uri.parse(fullUrl).replace(queryParameters: filteredParams.isNotEmpty ? filteredParams : null);
  }

  /// Execute GET request
  Future<dynamic> get(
    String path, {
    Map<String, dynamic>? queryParams,
    Map<String, String>? headers,
  }) async {
    final uri = _buildUri(path, queryParams);
    return _sendRequest(() async {
      final reqHeaders = await _headers(extraHeaders: headers);
      if (kDebugMode) {
        debugPrint('GET -> $uri');
      }
      return await _httpClient.get(uri, headers: reqHeaders).timeout(timeoutDuration);
    });
  }

  /// Execute POST request
  Future<dynamic> post(
    String path, {
    dynamic body,
    Map<String, dynamic>? queryParams,
    Map<String, String>? headers,
  }) async {
    final uri = _buildUri(path, queryParams);
    return _sendRequest(() async {
      final reqHeaders = await _headers(extraHeaders: headers);
      final encodedBody = body != null ? jsonEncode(body) : null;
      if (kDebugMode) {
        debugPrint('POST -> $uri | Body: $encodedBody');
      }
      return await _httpClient
          .post(uri, headers: reqHeaders, body: encodedBody)
          .timeout(timeoutDuration);
    });
  }

  /// Execute PUT request
  Future<dynamic> put(
    String path, {
    dynamic body,
    Map<String, dynamic>? queryParams,
    Map<String, String>? headers,
  }) async {
    final uri = _buildUri(path, queryParams);
    return _sendRequest(() async {
      final reqHeaders = await _headers(extraHeaders: headers);
      final encodedBody = body != null ? jsonEncode(body) : null;
      if (kDebugMode) {
        debugPrint('PUT -> $uri | Body: $encodedBody');
      }
      return await _httpClient
          .put(uri, headers: reqHeaders, body: encodedBody)
          .timeout(timeoutDuration);
    });
  }

  /// Execute DELETE request
  Future<dynamic> delete(
    String path, {
    dynamic body,
    Map<String, dynamic>? queryParams,
    Map<String, String>? headers,
  }) async {
    final uri = _buildUri(path, queryParams);
    return _sendRequest(() async {
      final reqHeaders = await _headers(extraHeaders: headers);
      final encodedBody = body != null ? jsonEncode(body) : null;
      if (kDebugMode) {
        debugPrint('DELETE -> $uri');
      }
      return await _httpClient
          .delete(uri, headers: reqHeaders, body: encodedBody)
          .timeout(timeoutDuration);
    });
  }

  /// Common request processor with error translation
  Future<dynamic> _sendRequest(Future<http.Response> Function() action) async {
    try {
      final response = await action();
      return _handleResponse(response);
    } on SocketException catch (e) {
      debugPrint('Network error: $e');
      throw const NetworkException();
    } on TimeoutException {
      throw const NetworkException('Connection timed out. Cinephile backend may be offline.');
    } on http.ClientException catch (e) {
      debugPrint('Client exception: $e');
      throw NetworkException(e.message);
    }
  }

  dynamic _handleResponse(http.Response response) {
    final statusCode = response.statusCode;
    final bodyString = response.body;

    dynamic parsedBody;
    if (bodyString.trim().isNotEmpty) {
      try {
        parsedBody = jsonDecode(bodyString);
      } catch (_) {
        // If the response is plain text (e.g., success message string)
        parsedBody = bodyString;
      }
    }

    if (statusCode >= 200 && statusCode < 300) {
      return parsedBody;
    }

    String errorMessage = 'Request failed with status $statusCode';
    if (parsedBody is Map) {
      if (parsedBody['message'] != null) {
        errorMessage = parsedBody['message'].toString();
      } else if (parsedBody['error'] != null) {
        errorMessage = parsedBody['error'].toString();
      }
    } else if (parsedBody is String && parsedBody.isNotEmpty) {
      errorMessage = parsedBody;
    }

    switch (statusCode) {
      case 400:
        throw ValidationException(errorMessage, details: parsedBody);
      case 401:
        clearToken();
        throw UnauthorizedException(errorMessage);
      case 403:
        throw ForbiddenException(errorMessage);
      case 404:
        throw NotFoundException(errorMessage);
      case 500:
      case 502:
      case 503:
        throw ServerException(errorMessage);
      default:
        throw ApiException(errorMessage, statusCode: statusCode, details: parsedBody);
    }
  }

  void dispose() {
    _httpClient.close();
  }
}
