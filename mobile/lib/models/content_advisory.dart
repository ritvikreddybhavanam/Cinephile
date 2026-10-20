/// Represents a movie content advisory item.
class ContentAdvisory {
  final String categoryId;
  final String label;
  final String emoji;
  final String description;
  final String severity; // NONE, MILD, MODERATE, STRONG, EXTREME

  const ContentAdvisory({
    required this.categoryId,
    required this.label,
    required this.emoji,
    required this.description,
    required this.severity,
  });

  factory ContentAdvisory.fromJson(Map<String, dynamic> json) {
    return ContentAdvisory(
      categoryId: json['category'] as String? ?? json['id'] as String? ?? 'OTHER',
      label: json['label'] as String? ?? 'Advisory',
      emoji: json['emoji'] as String? ?? '⚠️',
      description: json['description'] as String? ?? json['details'] as String? ?? '',
      severity: json['severity'] as String? ?? 'MILD',
    );
  }

  String get category => label;
}
