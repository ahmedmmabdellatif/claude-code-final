import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { Button, ProgressBar } from '@/components';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import hapticFeedback from '@/utils/haptics';
import { Check } from 'lucide-react-native';

export default function QuestionnaireScreen() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});

  const { data: templateData, isLoading } = trpc.questionnaires.getTemplate.useQuery({
    type: 'monthly',
  });

  const submitMutation = trpc.questionnaires.submit.useMutation({
    onSuccess: () => {
      showToast({ message: 'Questionnaire submitted successfully! 🎉', type: 'success' });
      hapticFeedback.success();
      router.back();
    },
    onError: () => {
      showToast({ message: 'Failed to submit questionnaire', type: 'error' });
      hapticFeedback.error();
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
        <Text style={styles.loadingText}>Loading questionnaire...</Text>
      </SafeAreaView>
    );
  }

  if (!templateData?.success || !templateData.data) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load questionnaire</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const template = templateData.data;
  const questions = template.questions;
  const currentQuestion = questions[currentStep];
  const totalSteps = questions.length;

  const handleResponse = (value: any) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
    hapticFeedback.light();
  };

  const handleNext = () => {
    if (currentQuestion.required && !responses[currentQuestion.id]) {
      showToast({ message: 'Please answer this question', type: 'error' });
      hapticFeedback.warning();
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      hapticFeedback.light();
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      hapticFeedback.light();
    } else {
      router.back();
    }
  };

  const handleSubmit = () => {
    if (!user?.id) {
      showToast({ message: 'User not found', type: 'error' });
      return;
    }

    submitMutation.mutate({
      clientId: user.id.toString(),
      questionnaireId: template.id,
      questionnaireName: template.name,
      responses,
    });
  };

  const renderQuestion = () => {
    const currentValue = responses[currentQuestion.id];

    switch (currentQuestion.type) {
      case 'scale':
        return (
          <View style={styles.scaleContainer}>
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleLabel}>{currentQuestion.min}</Text>
              <Text style={styles.scaleLabel}>{currentQuestion.max}</Text>
            </View>
            <View style={styles.scaleButtons}>
              {Array.from(
                { length: (currentQuestion.max || 10) - (currentQuestion.min || 1) + 1 },
                (_, i) => (currentQuestion.min || 1) + i
              ).map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.scaleButton,
                    currentValue === num && styles.scaleButtonActive,
                  ]}
                  onPress={() => handleResponse(num)}
                >
                  <Text
                    style={[
                      styles.scaleButtonText,
                      currentValue === num && styles.scaleButtonTextActive,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'radio':
        return (
          <View style={styles.optionsContainer}>
            {currentQuestion.options?.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionCard,
                  currentValue === option && styles.optionCardActive,
                ]}
                onPress={() => handleResponse(option)}
              >
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionText,
                      currentValue === option && styles.optionTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                  {currentValue === option && (
                    <Check size={20} color={colors.accent.primary} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'checkbox':
        const selectedOptions = currentValue || [];
        return (
          <View style={styles.optionsContainer}>
            {currentQuestion.options?.map((option) => {
              const isSelected = selectedOptions.includes(option);
              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardActive,
                  ]}
                  onPress={() => {
                    if (isSelected) {
                      handleResponse(selectedOptions.filter((o: string) => o !== option));
                    } else {
                      handleResponse([...selectedOptions, option]);
                    }
                  }}
                >
                  <View style={styles.optionContent}>
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                    {isSelected && (
                      <Check size={20} color={colors.accent.primary} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case 'text':
        return (
          <TextInput
            style={styles.textInput}
            value={currentValue || ''}
            onChangeText={handleResponse}
            placeholder="Type your answer here..."
            placeholderTextColor={colors.text.disabled}
            multiline
            numberOfLines={4}
          />
        );

      case 'number':
        return (
          <TextInput
            style={styles.textInput}
            value={currentValue?.toString() || ''}
            onChangeText={(text) => {
              const num = parseFloat(text);
              handleResponse(isNaN(num) ? '' : num);
            }}
            placeholder="Enter a number..."
            placeholderTextColor={colors.text.disabled}
            keyboardType="numeric"
          />
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{template.name}</Text>
          <Text style={styles.stepText}>
            Question {currentStep + 1} of {totalSteps}
          </Text>
        </View>

        <ProgressBar current={currentStep + 1} total={totalSteps} />

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          {currentQuestion.required && (
            <Text style={styles.requiredText}>* Required</Text>
          )}
        </View>

        {renderQuestion()}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="BACK"
          onPress={handleBack}
          variant="secondary"
          style={styles.backButton}
        />
        <Button
          title={currentStep === totalSteps - 1 ? 'SUBMIT' : 'NEXT'}
          onPress={handleNext}
          loading={submitMutation.isPending}
          style={styles.nextButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.dark,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bg.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.bg.dark,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorText: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.semibold,
    color: colors.semantic.error,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.size.h1,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  stepText: {
    fontSize: typography.size.small,
    color: colors.text.secondary,
  },
  questionContainer: {
    marginVertical: spacing.xl,
  },
  questionText: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  requiredText: {
    fontSize: typography.size.small,
    color: colors.semantic.error,
  },
  scaleContainer: {
    marginTop: spacing.md,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  scaleLabel: {
    fontSize: typography.size.body,
    color: colors.text.secondary,
  },
  scaleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  scaleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bg.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.bg.surface,
  },
  scaleButtonActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  scaleButtonText: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text.secondary,
  },
  scaleButtonTextActive: {
    color: colors.text.primary,
  },
  optionsContainer: {
    gap: spacing.md,
  },
  optionCard: {
    backgroundColor: colors.bg.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.bg.surface,
  },
  optionCardActive: {
    borderColor: colors.accent.primary,
    backgroundColor: `${colors.accent.primary}15`,
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: typography.size.body,
    color: colors.text.primary,
    flex: 1,
  },
  optionTextActive: {
    color: colors.accent.primary,
    fontWeight: typography.weight.semibold,
  },
  textInput: {
    backgroundColor: colors.bg.surface,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: typography.size.body,
    color: colors.text.primary,
    borderWidth: 2,
    borderColor: colors.bg.surface,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.bg.dark,
    borderTopWidth: 1,
    borderTopColor: colors.bg.surface,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});
