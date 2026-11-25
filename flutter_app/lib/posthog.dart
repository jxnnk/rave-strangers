import 'package:flutter/foundation.dart';
import 'package:posthog_flutter/posthog_flutter.dart';

/// Build-time PostHog configuration supplied with `--dart-define`.
class PosthogEnv {
  static const projectToken = String.fromEnvironment('POSTHOG_PROJECT_TOKEN');
  static const host = String.fromEnvironment('POSTHOG_HOST');
}

/// Configures the shared PostHog client before the Flutter application starts.
Future<void> setupPostHog() async {
  if (PosthogEnv.projectToken.isEmpty || PosthogEnv.host.isEmpty) {
    if (kDebugMode) {
      final missingVariable = PosthogEnv.projectToken.isEmpty
          ? 'POSTHOG_PROJECT_TOKEN'
          : 'POSTHOG_HOST';
      throw StateError(
        '$missingVariable variable required by PostHog is missing or '
        'un-configured, this causes events to be silently missed. This error '
        'stops appearing once $missingVariable is configured',
      );
    }
    return;
  }

  final config = PostHogConfig(PosthogEnv.projectToken);
  config.host = PosthogEnv.host;
  config.debug = kDebugMode;

  // The SDK's native Logs pipeline batches and flushes only the records sent
  // through [capturePostHogLog]; existing application debug output stays local.
  config.logsConfig.serviceName = 'rave_strangers_flutter';

  // Capture uncaught framework, Dart runtime, and native platform exceptions
  // through PostHog Error Tracking from this single global SDK configuration.
  config.errorTrackingConfig.captureFlutterErrors = true;
  config.errorTrackingConfig.capturePlatformDispatcherErrors = true;
  config.errorTrackingConfig.captureNativeExceptions = true;
  config.errorTrackingConfig.inAppIncludes.add('package:rave_strangers');

  await Posthog().setup(config);
}

/// Emits an allow-listed, structured application log through PostHog Logs.
///
/// This intentionally does not attach to [debugPrint] or another root logger:
/// only call sites added for this integration are exported.
void capturePostHogLog(String body, {Map<String, Object>? attributes}) {
  if (PosthogEnv.projectToken.isEmpty || PosthogEnv.host.isEmpty) return;

  try {
    Posthog().logger.info(body, attributes);
  } catch (_) {
    // Log delivery must never interrupt the app action that produced it.
  }
}
