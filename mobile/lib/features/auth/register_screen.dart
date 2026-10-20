import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/routing/route_names.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../services/auth_service.dart';

/// Cinephile Registration Screen supporting Firebase email verification and Spring Boot persistence.
class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();

  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _obscurePassword = true;
  bool _emailVerificationSent = false;
  bool _isCheckingVerification = false;
  String? _errorMessage;
  String? _successMessage;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleSendVerification() async {
    if (!_formKey.currentState!.validate()) return;

    if (_passwordController.text != _confirmPasswordController.text) {
      setState(() => _errorMessage = 'Passwords do not match.');
      return;
    }

    setState(() {
      _errorMessage = null;
      _successMessage = null;
    });

    final authService = context.read<AuthService>();

    try {
      await authService.sendFirebaseVerificationEmail(
        _emailController.text.trim(),
        _passwordController.text,
      );

      setState(() {
        _emailVerificationSent = true;
        _successMessage =
            'Verification email sent to ${_emailController.text.trim()}. Please click the link in your email, then tap "Complete Registration".';
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  Future<void> _handleCompleteRegistration() async {
    setState(() {
      _isCheckingVerification = true;
      _errorMessage = null;
      _successMessage = null;
    });

    final authService = context.read<AuthService>();

    try {
      // 1. Check if email was verified in Firebase and get ID Token
      final idToken = await authService.checkFirebaseEmailVerified(
        _emailController.text.trim(),
        _passwordController.text,
      );

      // 2. Submit account creation request to Spring Boot backend
      await authService.verifyEmailAndCreateAccount(
        firstname: _firstNameController.text.trim(),
        lastname: _lastNameController.text.trim(),
        emailaddress: _emailController.text.trim(),
        password: _passwordController.text,
        confirmPassword: _confirmPasswordController.text,
        firebaseIdToken: idToken,
      );

      // 3. Automatically log in
      await authService.login(
        _emailController.text.trim(),
        _passwordController.text,
      );

      if (mounted) {
        Navigator.of(context).pushNamedAndRemoveUntil(RouteNames.main, (route) => false);
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('ApiException: ', '').replaceFirst('Exception: ', '');
        _isCheckingVerification = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final authService = context.watch<AuthService>();
    final isLoading = authService.isLoading || _isCheckingVerification;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Account'),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Center(
                    child: Text(
                      'Cinephile',
                      style: AppTypography.brandWordmark,
                    ),
                  ),

                  const SizedBox(height: 20),

                  const Text(
                    'Join the Film Community',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'Georgia',
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Track, rate, and discover unforgettable cinema.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                    ),
                  ),

                  const SizedBox(height: 24),

                  if (_errorMessage != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.error.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.error.withValues(alpha: 0.4)),
                      ),
                      child: Text(
                        _errorMessage!,
                        style: const TextStyle(color: AppColors.error, fontSize: 12),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  if (_successMessage != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.success.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.success.withValues(alpha: 0.5)),
                      ),
                      child: Text(
                        _successMessage!,
                        style: const TextStyle(color: AppColors.success, fontSize: 12),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // First and Last Name row
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _firstNameController,
                          enabled: !_emailVerificationSent,
                          style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                          decoration: const InputDecoration(labelText: 'First Name'),
                          validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextFormField(
                          controller: _lastNameController,
                          enabled: !_emailVerificationSent,
                          style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                          decoration: const InputDecoration(labelText: 'Last Name'),
                          validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 14),

                  // Email
                  TextFormField(
                    controller: _emailController,
                    enabled: !_emailVerificationSent,
                    keyboardType: TextInputType.emailAddress,
                    style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                    decoration: const InputDecoration(
                      labelText: 'Email Address',
                      prefixIcon: Icon(Icons.email_outlined, color: AppColors.textMuted, size: 20),
                    ),
                    validator: (v) => v == null || !v.contains('@') ? 'Enter a valid email' : null,
                  ),

                  const SizedBox(height: 14),

                  // Password
                  TextFormField(
                    controller: _passwordController,
                    enabled: !_emailVerificationSent,
                    obscureText: _obscurePassword,
                    style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                    decoration: InputDecoration(
                      labelText: 'Password',
                      prefixIcon: const Icon(Icons.lock_outline_rounded, color: AppColors.textMuted, size: 20),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                          color: AppColors.textMuted,
                          size: 20,
                        ),
                        onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                      ),
                    ),
                    validator: (v) => v == null || v.length < 6 ? 'Minimum 6 characters' : null,
                  ),

                  const SizedBox(height: 14),

                  // Confirm Password
                  TextFormField(
                    controller: _confirmPasswordController,
                    enabled: !_emailVerificationSent,
                    obscureText: _obscurePassword,
                    style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                    decoration: const InputDecoration(
                      labelText: 'Confirm Password',
                      prefixIcon: Icon(Icons.lock_outline_rounded, color: AppColors.textMuted, size: 20),
                    ),
                    validator: (v) => v != _passwordController.text ? 'Passwords do not match' : null,
                  ),

                  const SizedBox(height: 24),

                  if (!_emailVerificationSent)
                    ElevatedButton(
                      onPressed: isLoading ? null : _handleSendVerification,
                      child: isLoading
                          ? const SizedBox(
                              height: 18,
                              width: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.background),
                            )
                          : const Text('Send Verification Email'),
                    )
                  else
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        ElevatedButton(
                          onPressed: isLoading ? null : _handleCompleteRegistration,
                          child: isLoading
                              ? const SizedBox(
                                  height: 18,
                                  width: 18,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.background),
                                )
                              : const Text('I Verified My Email — Complete Registration'),
                        ),
                        const SizedBox(height: 10),
                        OutlinedButton(
                          onPressed: isLoading ? null : _handleSendVerification,
                          child: const Text('Resend Verification Email'),
                        ),
                      ],
                    ),

                  const SizedBox(height: 20),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        'Already have an account?',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                      ),
                      const SizedBox(width: 4),
                      TextButton(
                        onPressed: () => Navigator.of(context).pop(),
                        child: const Text('Sign In'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
