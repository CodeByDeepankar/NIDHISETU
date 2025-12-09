import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import type { AppTheme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useBeneficiaryData } from '@/hooks/use-beneficiary-data';
import {
  loanAssistantClient,
  type LoanAssistantMessage,
  type LoanContext,
} from '@/services/ai/loanAssistant';

const QUICK_PROMPTS = [
  'What are the next steps in my loan?',
  'How do I upload missing documents?',
  'When will I get the subsidy?',
  'Explain my repayment schedule.',
  'Can I update my bank details?',
];

const TypingIndicator = ({ theme }: { theme: AppTheme }) => {
  const pulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 500, useNativeDriver: true }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={typingStyles.container}>
      {[0, 1, 2].map((idx) => (
        <Animated.View
          key={idx}
          style={[
            typingStyles.dot,
            { backgroundColor: theme.colors.primary, opacity: pulse, transform: [{ translateY: idx % 2 ? -1 : 0 }] },
          ]}
        />
      ))}
    </View>
  );
};

const formatNow = () =>
  new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

export const BeneficiaryLoanAssistantScreen = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { profile, loan } = useBeneficiaryData();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<LoanAssistantMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const context = useMemo<LoanContext>(
    () => ({
      beneficiaryName: profile?.name,
      loanAmount: loan?.loanAmount,
      bankName: loan?.bank,
    }),
    [profile?.name, loan?.loanAmount, loan?.bank]
  );

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages.length, isSending]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) {
      return;
    }

    const userMessage: LoanAssistantMessage = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput('');
    setIsSending(true);

    try {
      const reply = await loanAssistantClient.sendMessage(nextMessages, context);
      const botMessage: LoanAssistantMessage = { role: 'assistant', content: reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Loan assistant error', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I could not respond right now. Please try again.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const renderWelcomeState = () => (
    <View style={styles.welcomeContainer}>
      <View style={styles.heroCard}>
        <View style={[styles.heroAvatarShadow, { shadowColor: `${theme.colors.primary}33` }]}>
          <LinearGradient
            colors={[theme.colors.primary, '#4b73ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroAvatar}
          >
            <AppIcon name="robot" size={32} color={theme.colors.onPrimary} />
          </LinearGradient>
        </View>
        <View style={styles.heroTextBlock}>
          <AppText style={[styles.heroTitle, { color: theme.colors.text }]}>Hi {profile?.name || 'there'} 👋</AppText>
          <AppText style={[styles.heroSubtitle, { color: theme.colors.subtext }]}>
            Ask about your loan, documents, subsidy timeline, or next steps.
          </AppText>
        </View>
      </View>

      <View style={styles.welcomeBubble}>
        <AppIcon name="shield-check-outline" size={20} color={theme.colors.primary} style={styles.welcomeIcon} />
        <AppText style={[styles.welcomeText, { color: theme.colors.text }]}>
          I can fetch details from your profile and loan to give quicker answers.
        </AppText>
      </View>

      <View style={styles.suggestionsContainer}>
        <View style={styles.suggestionHeader}>
          <AppIcon name="lightbulb-on-outline" size={18} color={theme.colors.primary} />
          <AppText style={[styles.suggestionTitle, { color: theme.colors.subtext }]}>Try asking</AppText>
        </View>
        <View style={styles.chipsGrid}>
          {QUICK_PROMPTS.map((prompt) => (
            <TouchableOpacity
              key={prompt}
              style={[styles.chip, { backgroundColor: '#fff' }]}
              onPress={() => handleSend(prompt)}
            >
              <AppText style={{ color: theme.colors.text }}>{prompt}</AppText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={130}
      >
        <LinearGradient
          colors={[`${theme.colors.primary}10`, '#f6f8ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.pageBackground}
        />

        <View style={styles.headerWrapper}>
          <LinearGradient
            colors={[theme.colors.primary, '#4b73ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View>
              <AppText style={styles.headerTitle}>NIDHI MITRA</AppText>
              <AppText style={[styles.headerSubtitle, { color: '#f8fbff' }]}>Ask anything about your loan journey</AppText>
            </View>
            <View style={[styles.headerIconButton, { backgroundColor: '#ffffff22', borderColor: '#ffffff55' }]}>
              <AppIcon name="chat-processing-outline" size={22} color="#fff" />
            </View>
          </LinearGradient>
        </View>

        <View style={styles.chatCard}>
          <View style={styles.messagesWrapper}>
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={styles.scrollContent}
              style={styles.scrollView}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {messages.length === 0 ? (
                renderWelcomeState()
              ) : (
                <View style={styles.messagesList}>
                  {messages.map((msg, idx) => (
                    <Animated.View
                      key={`${msg.role}-${idx}-${msg.content.slice(0, 6)}`}
                      style={[
                        styles.messageBubble,
                        msg.role === 'user' ? styles.userBubble : styles.botBubble,
                        msg.role === 'user'
                          ? { backgroundColor: theme.colors.primary }
                          : { backgroundColor: `${theme.colors.surface}F2`, borderColor: `${theme.colors.border}80` },
                      ]}
                    >
                      <AppText
                        style={[
                          styles.messageText,
                          msg.role === 'user'
                            ? { color: theme.colors.onPrimary, fontWeight: '600' }
                            : { color: theme.colors.text },
                        ]}
                      >
                        {msg.content}
                      </AppText>
                      <AppText style={styles.timestamp}>{formatNow()}</AppText>
                    </Animated.View>
                  ))}
                  {isSending && (
                    <View
                      style={[
                        styles.messageBubble,
                        styles.botBubble,
                        { backgroundColor: `${theme.colors.surface}F2`, borderColor: `${theme.colors.border}80` },
                      ]}
                    >
                      <TypingIndicator theme={theme} />
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </View>

          <View style={styles.inputWrapper}>
            <LinearGradient
              colors={['#f9fbff', '#eef3ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.inputBackdrop}
            />
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
              <TouchableOpacity style={[styles.avatarButton, { shadowColor: theme.colors.border }]}>
                <View style={[styles.avatarInner, { backgroundColor: `${theme.colors.primary}15` }]}>
                  <AppIcon name="robot" size={18} color={theme.colors.primary} />
                </View>
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Ask anything..."
                placeholderTextColor={theme.colors.subtext}
                value={input}
                onChangeText={setInput}
                returnKeyType="send"
                onSubmitEditing={() => handleSend(input)}
              />
              <TouchableOpacity style={styles.micButton}>
                <AppIcon name="microphone" size={22} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleSend(input)}
              >
                <AppIcon name="send" size={18} color={theme.colors.onPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f4f6fb',
    },
    pageBackground: {
      ...StyleSheet.absoluteFillObject,
      zIndex: -1,
      opacity: 0.9,
    },
    headerWrapper: {
      paddingHorizontal: 18,
      paddingTop: 8,
      paddingBottom: 12,
    },
    headerGradient: {
      borderRadius: 20,
      padding: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'transparent',
      shadowColor: '#2c3e5011',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#ffffff',
      letterSpacing: 0.4,
    },
    headerSubtitle: {
      marginTop: 4,
      fontSize: 13,
      color: '#e9efff',
    },
    headerIconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
    },
    chatCard: {
      flex: 1,
      marginHorizontal: 18,
      marginBottom: 0,
      backgroundColor: '#ffffff',
      borderRadius: 28,
      overflow: 'hidden',
      shadowColor: '#1a2b4415',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.35,
      shadowRadius: 24,
      elevation: 10,
      position: 'relative',
    },
    scrollView: {
      flex: 1,
      backgroundColor: '#ffffff',
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 120,
    },
    messagesWrapper: {
      flex: 1,
    },
    welcomeContainer: {
      alignItems: 'center',
      paddingTop: 32,
      paddingHorizontal: 20,
      gap: 18,
    },
    heroCard: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      padding: 18,
      borderRadius: 20,
      backgroundColor: '#f7f9ff',
      borderWidth: 1,
      borderColor: '#e6ecff',
      shadowColor: '#1a2b4410',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 14,
      elevation: 6,
      gap: 14,
    },
    heroAvatarShadow: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#1a2b4433',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
    },
    heroAvatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroTextBlock: {
      flex: 1,
      gap: 4,
    },
    heroTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#1e293b',
    },
    heroSubtitle: {
      fontSize: 14,
      color: '#6b7280',
    },
    welcomeBubble: {
      flexDirection: 'row',
      padding: 16,
      borderRadius: 18,
      alignItems: 'center',
      width: '100%',
      gap: 8,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      backgroundColor: '#fff',
    },
    welcomeIcon: {
      marginRight: 8,
    },
    welcomeText: {
      fontSize: 16,
      color: '#1f2937',
      flex: 1,
      lineHeight: 24,
    },
    suggestionsContainer: {
      width: '100%',
      marginTop: 6,
    },
    suggestionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 8,
    },
    suggestionTitle: {
      fontSize: 14,
      color: '#4b5563',
    },
    chipsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    chip: {
      borderWidth: 0,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      shadowColor: '#1a2b4416',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 6,
    },
    inputWrapper: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 12,
      paddingBottom: 12,
      paddingTop: 8,
      backgroundColor: 'transparent',
    },
    inputBackdrop: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 8,
      top: 8,
      borderRadius: 28,
      opacity: 0.9,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 28,
      shadowColor: '#1a2b4416',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 10,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      gap: 10,
      marginHorizontal: 16,
      backgroundColor: '#ffffff',
    },
    input: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 10,
      color: theme.colors.text,
    },
    avatarButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#e5e7eb',
      shadowColor: '#1a2b4411',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 6,
    },
    avatarInner: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    micButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f1f5f9',
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },
    messagesList: {
      padding: 20,
      gap: 14,
      flexGrow: 1,
      justifyContent: 'flex-start',
    },
    messageBubble: {
      padding: 16,
      borderRadius: 18,
      maxWidth: '82%',
      shadowColor: '#1a2b4412',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.16,
      shadowRadius: 12,
      elevation: 4,
    },
    userBubble: {
      alignSelf: 'flex-end',
      borderBottomRightRadius: 8,
    },
    botBubble: {
      alignSelf: 'flex-start',
      borderBottomLeftRadius: 8,
      borderWidth: 1,
      borderColor: '#e5e7eb',
    },
    messageText: {
      fontSize: 15,
      lineHeight: 22,
    },
    timestamp: {
      marginTop: 8,
      fontSize: 11,
      color: '#94a3b8',
    },
    typingContainer: {
      flexDirection: 'row',
      gap: 6,
      alignItems: 'center',
    },
    typingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
  });

export default BeneficiaryLoanAssistantScreen;
const typingStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
