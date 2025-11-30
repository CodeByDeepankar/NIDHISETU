import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/atoms/app-icon';
import { AppText } from '@/components/atoms/app-text';
import { InputField } from '@/components/atoms/input-field';
import { useAppTheme } from '@/hooks/use-app-theme';
import { googlePlaces, type AddressDetails, type AddressSuggestion } from '@/services/googlePlaces';

export interface AddressAutocompleteFieldProps {
  label: string;
  value?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  country?: string;
  onChange?: (text: string) => void;
  onResolved?: (payload: {
    suggestion: AddressSuggestion;
    details?: AddressDetails | null;
  }) => void;
}

export const AddressAutocompleteField = ({
  label,
  value,
  placeholder,
  helperText,
  errorText,
  disabled,
  country = 'IN',
  onChange,
  onResolved,
}: AddressAutocompleteFieldProps) => {
  const theme = useAppTheme();
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AddressSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string>();

  const components = useMemo(() => `country:${country.toLowerCase()}`, [country]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    if (!query.trim()) {
      setResults([]);
      setSearchError(undefined);
      return;
    }
    let cancelled = false;
    setSearching(true);
    googlePlaces
      .autocomplete(query, { components })
      .then((suggestions) => {
        if (!cancelled) {
          setResults(suggestions);
          setSearchError(undefined);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.warn('Address autocomplete failed', error);
          setSearchError('Unable to fetch suggestions right now.');
          setResults([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSearching(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [components, query, visible]);

  const open = () => {
    if (disabled) {
      return;
    }
    setVisible(true);
    setQuery('');
    setResults([]);
    setSearchError(undefined);
  };

  const close = () => {
    setVisible(false);
    setQuery('');
    setResults([]);
    setSearchError(undefined);
  };

  const handleSelect = async (suggestion: AddressSuggestion) => {
    onChange?.(suggestion.description);
    try {
      const details = await googlePlaces.details(suggestion.placeId);
      onResolved?.({ suggestion, details });
    } catch (error) {
      console.warn('Failed to lookup place details', error);
      onResolved?.({ suggestion, details: undefined });
    }
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
          rightIcon="map-search-outline"
          helperText={helperText}
          errorText={errorText}
        />
      </Pressable>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: theme.colors.card, borderRadius: theme.radii.xl }]}
            accessibilityViewIsModal
            accessibilityLiveRegion="polite"
          >
            <View style={styles.sheetHeader}>
              <AppText variant="titleMedium" color="text">
                Search address
              </AppText>
              <Pressable onPress={close} accessibilityRole="button">
                <AppIcon name="close" size={22} color="muted" />
              </Pressable>
            </View>
            <InputField
              placeholder="Type area, city, PIN..."
              value={query}
              onChangeText={setQuery}
              autoFocus
              leftIcon="magnify"
            />
            {searching ? (
              <View style={styles.feedbackRow}>
                <ActivityIndicator color={theme.colors.primary} />
                <AppText variant="labelSmall" color="muted">
                  Fetching suggestions...
                </AppText>
              </View>
            ) : null}
            {searchError ? (
              <AppText variant="labelSmall" color="error" style={{ marginTop: 4 }}>
                {searchError}
              </AppText>
            ) : null}
            <FlatList
              data={results}
              keyExtractor={(item) => item.placeId}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 16 }}
              renderItem={({ item }) => (
                <Pressable style={styles.optionRow} onPress={() => handleSelect(item)}>
                  <AppText variant="bodyLarge" color="text">
                    {item.mainText ?? item.description}
                  </AppText>
                  {item.secondaryText ? (
                    <AppText variant="bodySmall" color="muted">
                      {item.secondaryText}
                    </AppText>
                  ) : null}
                </Pressable>
              )}
              ListEmptyComponent={() => (
                <AppText variant="bodySmall" color="muted" style={{ textAlign: 'center', marginTop: 12 }}>
                  {query ? 'No suggestions' : 'Start typing to search'}
                </AppText>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  sheet: {
    padding: 16,
    maxHeight: '80%',
    gap: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionRow: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
  },
});
