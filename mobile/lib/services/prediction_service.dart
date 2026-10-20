import '../core/network/api_client.dart';
import '../core/network/api_endpoints.dart';
import '../models/prediction_result.dart';

/// Service interfacing with the Machine Learning Box Office Revenue Prediction pipeline.
class PredictionService {
  final ApiClient _apiClient;

  PredictionService({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient();

  /// Run real box office revenue prediction
  Future<PredictionResult> predict(PredictionRequest request) async {
    final response = await _apiClient.post(
      ApiEndpoints.prediction,
      body: request.toJson(),
    );

    if (response is Map<String, dynamic>) {
      return PredictionResult.fromJson(response, request.budget);
    }
    throw Exception('Invalid prediction output format from machine learning service.');
  }
}
