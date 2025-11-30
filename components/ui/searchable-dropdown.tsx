import { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { InputField } from '@/components/atoms/input-field';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { LocationOption } from '@/services/locationHierarchy';

interface SearchableDropdownProps {
  label: string;
  placeholder?: string;
  value?: string;
  onSelect: (option: LocationOption) => void;
  options: LocationOption[];
  loading?: boolean;
  disabled?: boolean;
  onSearch?: (query: string) => void;
  helperText?: string;
  errorText?: string;
}

export const SearchableDropdown = ({
  label,
  placeholder,
  value,
  onSelect,
  options,
  loading,
  disabled,
  onSearch,
  helperText,
  errorText,
}: SearchableDropdownProps) => {
  const theme = useAppTheme();
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const open = () => {
    if (disabled) {
      return;
    }
    setVisible(true);
  };

  const close = () => {
    setVisible(false);
    setSearchQuery('');
    onSearch?.('');
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    onSearch?.(text);
  };

  const handleSelect = (option: LocationOption) => {
    onSelect(option);
    close();
  };

  return (
    <>
      <Pressable onPress={open} disabled={disabled} style={{ opacity: disabled ? 0.6 : 1 }}>
        <InputField
          label={label}
          placeholder={placeholder}
          value={value}
          editable={false}
          pointerEvents="none"
          rightIcon="chevron-down"
          helperText={helperText}
          errorText={errorText}
        />
      </Pressable>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
        <View style={styles.modalOverlay}>
          <View style={[styles.sheet, { backgroundColor: theme.colors.card, borderRadius: theme.radii.xl }]}
            accessibilityViewIsModal
            accessibilityLiveRegion="polite"
          >
            <View style={styles.sheetHeader}>
              <AppText variant="titleMedium" color="text">
                {label}
              </AppText>
              <Pressable onPress={close} accessibilityRole="button">
                <AppIcon name="close" size={20} color="muted" />
              </Pressable>
            </View>
            <InputField
              placeholder="Search..."
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
              leftIcon="magnify"
            />
            {loading ? (
              <View style={styles.loaderRow}>
                <ActivityIndicator color={theme.colors.primary} />
                <AppText variant="bodySmall" color="muted">
                  Loading options...
                </AppText>
              </View>
            ) : (
              <FlatList
                data={options}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 16 }}
                renderItem={({ item }) => (
                  <Pressable style={styles.optionRow} onPress={() => handleSelect(item)}>
                    <AppText variant="bodyLarge" color="text">
                      {item.name}
                    </AppText>
                    {item.pincode ? (
                      <AppText variant="labelSmall" color="muted">
                        {item.pincode}
                      </AppText>
                    ) : null}
                  </Pressable>
                )}
                ListEmptyComponent={() => (
                  <AppText variant="bodySmall" color="muted" style={{ textAlign: 'center', marginTop: 12 }}>
                    No matches
                  </AppText>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    padding: 16,
    maxHeight: '80%',
    gap: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  optionRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.05)',
  },
});
