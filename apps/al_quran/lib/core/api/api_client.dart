import 'package:dio/dio.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../../config/constants.dart';

class ApiClient {
  late final Dio _dio;
  final Connectivity _connectivity = Connectivity();

  ApiClient({String? baseUrl}) {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl ?? AppConstants.alQuranCloudBaseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio.interceptors.addAll([
      _LoggingInterceptor(),
      _ErrorInterceptor(),
      _RetryInterceptor(dio: _dio, connectivity: _connectivity),
    ]);
  }

  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    CancelToken? cancelToken,
  }) async {
    return _dio.get(
      path,
      queryParameters: queryParameters,
      cancelToken: cancelToken,
    );
  }

  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    CancelToken? cancelToken,
  }) async {
    return _dio.post(
      path,
      data: data,
      queryParameters: queryParameters,
      cancelToken: cancelToken,
    );
  }
}

class _LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    // ignore: avoid_print
    print('[API] ${options.method} ${options.path}');
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    // ignore: avoid_print
    print('[API] Response ${response.statusCode}');
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // ignore: avoid_print
    print('[API] Error ${err.response?.statusCode}: ${err.message}');
    handler.next(err);
  }
}

class _ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    switch (err.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        throw ApiException('Connection timed out. Please try again.');
      case DioExceptionType.badResponse:
        throw ApiException(
          'Server error (${err.response?.statusCode}). Please try again.',
        );
      case DioExceptionType.cancel:
        break;
      default:
        throw ApiException('Network error. Please check your connection.');
    }
    handler.next(err);
  }
}

class _RetryInterceptor extends Interceptor {
  final Dio dio;
  final Connectivity connectivity;
  static const int maxRetries = 2;

  _RetryInterceptor({required this.dio, required this.connectivity});

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final retryCount = err.requestOptions.extra['retryCount'];
    final currentRetries = (retryCount is int ? retryCount : 0);
    if (_shouldRetry(err) && currentRetries < maxRetries) {
      final result = await connectivity.checkConnectivity();
      if (result.contains(ConnectivityResult.none)) {
        handler.next(err);
        return;
      }
      err.requestOptions.extra['retryCount'] = currentRetries + 1;
      await Future.delayed(Duration(seconds: currentRetries + 1));
      try {
        final response = await dio.fetch(err.requestOptions);
        handler.resolve(response);
        return;
      } catch (e) {
        handler.next(err);
        return;
      }
    }
    handler.next(err);
  }

  bool _shouldRetry(DioException err) {
    return err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.connectionError ||
        err.type == DioExceptionType.sendTimeout ||
        err.type == DioExceptionType.receiveTimeout;
  }
}

class ApiException implements Exception {
  final String message;
  const ApiException(this.message);

  @override
  String toString() => message;
}
