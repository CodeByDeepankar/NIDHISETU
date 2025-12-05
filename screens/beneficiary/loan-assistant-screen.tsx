import { useState, useRef, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { Chip } from '@/components/atoms/chip';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useBeneficiaryData } from '@/hooks/use-beneficiary-data';
import { useAuthStore } from '@/state/authStore';
import { loanAssistantClient, LoanAssistantMessage } from '@/services/ai/loanAssistant';
import type { AppTheme } from '@/constants/theme';

export const BeneficiaryLoanAssistantScreen = () => {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { profile, loan } = useBeneficiaryData();
  const storedProfile = useAuthStore((state) => state.profile);
  const beneficiaryName = profile?.name ?? storedProfile?.name;

  const [messages, setMessages] = useState<LoanAssistantMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const context = useMemo(
    () => ({
      beneficiaryName,
      loanAmount: loan?.loanAmount,
      bankName: loan?.bank
    }),
    [beneficiaryName, loan?.loanAmount, loan?.bank]
  );

  const suggestions = [
    'Loan Status',
    'Schemes',
    'Eligibility',
    'Documents',
    'Subsidy',
    'Repayment'
  ];

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newMsg: LoanAssistantMessage = { role: 'user', content: trimmed };
    const nextMessages = [...messages, newMsg];
    
    setMessages(nextMessages);
    setInput('');
    setIsSending(true);

    try {
      const reply = await loanAssistantClient.sendMessage(nextMessages, context);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isSending]);

  const renderWelcomeState = () => (
    <View style={styles.welcomeContainer}>
      <View style={styles.robotContainer}>
         <AppIcon name="robot" size={120} color={theme.colors.primary} />
      </View>
      
      <View style={styles.welcomeBubble}>
        <AppIcon name="auto-fix" size={20} color={theme.colors.primary} style={{marginRight: 8}}/>
        <AppText style={styles.welcomeText}>
          Hi {beneficiaryName ? beneficiaryName.split(' ')[0] : ''}, you can ask me anything about your loan
        </AppText>
      </View>

      <View style={styles.suggestionsContainer}>
        <View style={styles.suggestionHeader}>
            <AppIcon name="lightbulb-on-outline" size={20} color={theme.colors.primary} />
            <AppText style={styles.suggestionTitle}>I suggest some topics you can ask me..</AppText>
        </View>
        <View style={styles.chipsGrid}>
          {suggestions.map((s) => (
            <Chip 
              key={s} 
              label={s} 
              onPress={() => handleSend(s)}
              style={styles.chip}
              backgroundColor={theme.colors.surfaceVariant}
              tone="primary"
            />
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <AppText style={styles.headerTitle}>NIDHIMITRA</AppText>
        <TouchableOpacity>
            <AppIcon name="message-text-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {messages.length === 0 ? renderWelcomeState() : (
            <View style={styles.messagesList}>
                {messages.map((msg, idx) => (
                    <View key={idx} style={[
                        styles.messageBubble,
                        msg.role === 'user' ? styles.userBubble : styles.botBubble,
                    msg.role === 'user' ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.surface }
                    ]}>
                        <AppText style={[
                            styles.messageText,
                      msg.role === 'user' ? { color: theme.colors.onPrimary } : { color: theme.colors.text }
                        ]}>
                            {msg.content}
                        </AppText>
                    </View>
                ))}
                {isSending && (
                  <View style={[styles.messageBubble, styles.botBubble, { backgroundColor: theme.colors.surface }]}>
                        <ActivityIndicator color={theme.colors.primary} size="small" />
                    </View>
                )}
            </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}
          >
            <TextInput
                style={styles.input}
                placeholder="Ask anything..."
            placeholderTextColor={theme.colors.subtext}
                value={input}
                onChangeText={setInput}
            />
            <TouchableOpacity style={styles.micButton}>
                <AppIcon name="microphone" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleSend(input)}
            >
                <AppIcon name="send" size={20} color="#FFF" />
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 200,
    },
    welcomeContainer: {
      alignItems: 'center',
      paddingTop: 40,
      paddingHorizontal: 20,
      gap: 20,
    },
    robotContainer: {
      marginBottom: 10,
    },
    welcomeBubble: {
      flexDirection: 'row',
      backgroundColor: theme.mode === 'dark' ? theme.colors.surfaceVariant : `${theme.colors.secondary}1A`,
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
      width: '100%',
      gap: 8,
    },
    welcomeText: {
      fontSize: 16,
      color: theme.colors.subtext,
      flex: 1,
    },
    suggestionsContainer: {
      width: '100%',
    },
    suggestionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 8,
    },
    suggestionTitle: {
      fontSize: 14,
      color: theme.colors.subtext,
    },
    chipsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    chip: {
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 30,
      shadowColor: theme.colors.border,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.mode === 'dark' ? 0.4 : 0.1,
      shadowRadius: 4,
      elevation: 5,
      position: 'absolute',
      bottom: 110,
      left: 20,
      right: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      gap: 8,
    },
    input: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 10,
      color: theme.colors.text,
    },
    micButton: {
      padding: 10,
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
      gap: 16,
    },
    messageBubble: {
      padding: 16,
      borderRadius: 16,
      maxWidth: '80%',
    },
    userBubble: {
      alignSelf: 'flex-end',
      borderBottomRightRadius: 4,
    },
    botBubble: {
      alignSelf: 'flex-start',
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    messageText: {
      fontSize: 15,
      lineHeight: 22,
    },
  });
