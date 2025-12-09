import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { AppButton } from '@/components/atoms/app-button';
import { AppText } from '@/components/atoms/app-text';
import { InputField } from '@/components/atoms/input-field';
import { useAppTheme } from '@/hooks/use-app-theme';
import { loanAssistantClient, LoanAssistantMessage, LoanContext } from '@/services/ai/loanAssistant';

export interface LoanAssistantProps extends LoanContext {
  variant?: 'embedded' | 'full';
  style?: StyleProp<ViewStyle>;
}

export const LoanAssistantPanel = ({ beneficiaryName, loanAmount, bankName, variant = 'embedded', style }: LoanAssistantProps) => {
  const theme = useAppTheme();
  const [messages, setMessages] = useState<LoanAssistantMessage[]>(() => [
    {
      role: 'assistant',
      content: `Namaste ${beneficiaryName ?? 'mitra'}! Main aapka NIDHI SETU loan copilot hoon. Ask me anything about your MSME loan process, required documents, or next milestones.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string>();
  const scrollViewRef = useRef<ScrollView>(null);

  const context = useMemo(
    () => ({ beneficiaryName, loanAmount, bankName }),
    [bankName, beneficiaryName, loanAmount]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 50);

    return () => clearTimeout(timeout);
  }, [messages, isSending]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }
    setInput('');
    setError(undefined);

    const nextMessages: LoanAssistantMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setIsSending(true);

    try {
      const reply = await loanAssistantClient.sendMessage(nextMessages, context);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to contact loan assistant.');
    } finally {
      setIsSending(false);
    }
  };

  const cardStyles = [
    styles.card,
    variant === 'full' ? styles.cardFull : null,
    { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
    style,
  ];

  const messagesStyles = [
    styles.messages,
    variant === 'embedded' ? styles.messagesEmbedded : styles.messagesFull,
  ];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={variant === 'full' ? styles.fullHeight : undefined}>
      <View style={cardStyles}
        accessibilityHint="Loan guidance chat"
      >
        <AppText variant="titleMedium" color="text">
          Loan Copilot
        </AppText>
        <AppText variant="bodySmall" color="muted">
          Personalised answers based on your sanction details. Focused strictly on loan-related help.
        </AppText>
        <ScrollView
          ref={scrollViewRef}
          style={messagesStyles}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={variant === 'full'}
        >
          {messages.map((message, index) => {
            const isAssistant = message.role === 'assistant';
            const bubbleColors = isAssistant
              ? {
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.border,
                  borderWidth: 1,
                }
              : {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.primary,
                  borderWidth: 1,
                };

            return (
              <View
                key={`${message.role}-${index}`}
                style={[styles.bubble, isAssistant ? styles.assistantBubble : styles.userBubble, bubbleColors]}
                accessibilityLabel={`${message.role} message`}
              >
                <AppText variant="bodyMedium" color="text">
                  {message.content}
                </AppText>
              </View>
            );
          })}
          {isSending ? (
            <View
              style={[
                styles.bubble,
                styles.assistantBubble,
                { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border, borderWidth: 1 },
              ]}
              accessibilityLabel="Assistant typing"
            >
              <ActivityIndicator color={theme.colors.primary} size="small" />
            </View>
          ) : null}
        </ScrollView>
        <InputField
          placeholder="Ask about disbursement, documents, timelines..."
          value={input}
          onChangeText={setInput}
          leftIcon="chat"
          multiline
          numberOfLines={2}
          containerStyle={{ width: '100%' }}
        />
        {error ? (
          <AppText variant="labelSmall" color="error">
            {error}
          </AppText>
        ) : null}
        <AppButton
          label={isSending ? 'Sending...' : 'Ask Copilot'}
          icon="send"
          onPress={handleSend}
          disabled={isSending}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  fullHeight: {
    width: '100%',
    flex: 1,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardFull: {
    flex: 1,
  },
  messages: {
    width: '100%',
  },
  messagesEmbedded: {
    maxHeight: 280,
  },
  messagesFull: {
    flex: 1,
  },
  messagesContent: {
    gap: 8,
    paddingVertical: 8,
  },
  bubble: {
    padding: 12,
    borderRadius: 12,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
});
