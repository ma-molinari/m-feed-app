import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import type { MainStackParamList, TabParamList } from '@navigation/types';
import { RemoteImage } from '@shared/components/RemoteImage';

import { useUserSearch } from '../hooks/useUserSearch';
import { useUserSuggestions } from '../hooks/useUserSuggestions';
import type { SuggestionUser, UserSearchItem } from '../types';

type SearchTabNavigation = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Search'>,
  NativeStackNavigationProp<MainStackParamList>
>;

type UserRow = { id: number; username: string; fullName: string; avatar: string | null };

function SkeletonRow() {
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, styles.skeleton]} />
      <View style={styles.rowText}>
        <View style={[styles.skeletonLine, { width: 120 }]} />
        <View style={[styles.skeletonLine, { width: 80, marginTop: 4 }]} />
      </View>
    </View>
  );
}

function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </>
  );
}

function UserRowItem({ user, onPress }: { user: UserRow; onPress: () => void }) {
  const initials = user.fullName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <Pressable style={styles.row} onPress={onPress} android_ripple={{ color: colors.dark.border }}>
      {user.avatar ? (
        <RemoteImage uri={user.avatar} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.initialsContainer]}>
          <Text style={styles.initialsText}>{initials}</Text>
        </View>
      )}
      <View style={styles.rowText}>
        <Text style={styles.fullName} numberOfLines={1}>
          {user.fullName}
        </Text>
        <Text style={styles.username} numberOfLines={1}>
          @{user.username}
        </Text>
      </View>
    </Pressable>
  );
}

export function SearchScreen() {
  const navigation = useNavigation<SearchTabNavigation>();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const suggestions = useUserSuggestions();
  const searchResults = useUserSearch(debouncedQuery);

  const isSearching = query.length > 0;
  const isLoading = isSearching ? searchResults.isLoading : suggestions.isLoading;

  const suggestionUsers: UserRow[] = (suggestions.data ?? []).slice(0, 5).map(
    (u: SuggestionUser) => ({ id: u.id, username: u.username, fullName: u.fullName, avatar: u.avatar }),
  );

  const searchUsers: UserRow[] = (searchResults.data ?? []).map(
    (u: UserSearchItem) => ({ id: u.id, username: u.username, fullName: u.fullName, avatar: u.avatar }),
  );

  const listData: UserRow[] = isSearching ? searchUsers : suggestionUsers;

  const showEmpty =
    !isLoading &&
    isSearching &&
    debouncedQuery.length > 0 &&
    searchResults.isFetched &&
    searchUsers.length === 0;

  function handleClear() {
    setQuery('');
    inputRef.current?.focus();
  }

  function handleUserPress(userId: number) {
    navigation.navigate('UserProfile', { userId });
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Buscar usuários..."
          placeholderTextColor={colors.dark.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={handleClear} hitSlop={8} style={styles.clearButton}>
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        )}
      </View>

      {!isSearching && (
        <Text style={styles.sectionLabel}>Sugestões</Text>
      )}

      {isLoading ? (
        <SkeletonList count={isSearching ? 3 : 5} />
      ) : showEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nenhum usuário encontrado para "{debouncedQuery}"</Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <UserRowItem user={item} onPress={() => handleUserPress(item.id)} />
          )}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
    paddingTop: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    height: 44,
    color: colors.dark.text,
    ...typography.body,
  },
  clearButton: {
    paddingHorizontal: spacing.xs,
  },
  clearText: {
    color: colors.dark.textMuted,
    fontSize: 16,
  },
  sectionLabel: {
    color: colors.dark.textMuted,
    ...typography.caption,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  initialsContainer: {
    backgroundColor: colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: colors.dark.text,
    ...typography.subtitle,
  },
  rowText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  fullName: {
    color: colors.dark.text,
    ...typography.subtitle,
  },
  username: {
    color: colors.dark.textMuted,
    ...typography.caption,
    marginTop: 2,
  },
  skeleton: {
    backgroundColor: colors.dark.skeletonBase,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.dark.skeletonBase,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    color: colors.dark.textMuted,
    ...typography.body,
    textAlign: 'center',
  },
});
