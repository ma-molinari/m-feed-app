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

import { Ionicons } from '@expo/vector-icons';
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

const AVATAR_FALLBACK_HUES = ['#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B'] as const;

function avatarTintFromId(id: number): string {
  const i = Math.abs(id) % AVATAR_FALLBACK_HUES.length;
  return AVATAR_FALLBACK_HUES[i] ?? AVATAR_FALLBACK_HUES[0];
}

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

  const a11yLabel = `${user.fullName}, @${user.username}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityHint="Abre o perfil deste utilizador"
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
      android_ripple={{ color: colors.dark.border }}
    >
      {user.avatar ? (
        <RemoteImage uri={user.avatar} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.initialsContainer, { backgroundColor: avatarTintFromId(user.id) }]}>
          <Text style={styles.initialsOnColor}>{initials}</Text>
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
      <Ionicons name="chevron-forward" size={20} color={colors.dark.textMuted} style={styles.rowChevron} />
    </Pressable>
  );
}

function ListRowSeparator() {
  return <View style={styles.rowSeparator} />;
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
  const trimmedQuery = query.trim();
  const isDebouncing = trimmedQuery !== debouncedQuery;
  const isLoading = isSearching ? searchResults.isLoading : suggestions.isLoading;
  const searchBarBusy =
    isSearching && (isDebouncing || searchResults.isFetching || searchResults.isLoading);

  const suggestionUsers: UserRow[] = (suggestions.data ?? []).slice(0, 5).map(
    (u: SuggestionUser) => ({ id: u.id, username: u.username, fullName: u.fullName, avatar: u.avatar }),
  );

  const searchUsers: UserRow[] = (searchResults.data ?? []).map(
    (u: UserSearchItem) => ({ id: u.id, username: u.username, fullName: u.fullName, avatar: u.avatar }),
  );

  const listData: UserRow[] = isSearching ? searchUsers : suggestionUsers;

  const showSearchEmpty =
    !isLoading &&
    isSearching &&
    debouncedQuery.length > 0 &&
    searchResults.isFetched &&
    searchUsers.length === 0;

  const showSuggestionsEmpty =
    !isLoading && !isSearching && suggestionUsers.length === 0;

  const showDebouncingPlaceholder =
    isSearching && debouncedQuery.length === 0 && !isLoading;

  function handleClear() {
    setQuery('');
    inputRef.current?.focus();
  }

  function handleUserPress(userId: number) {
    navigation.navigate('UserProfile', { userId });
  }

  function handleGoFeed() {
    navigation.navigate('Home');
  }

  const listHeader = (
    <>
      <View style={styles.searchBar}>
        <Ionicons
          name="search"
          size={18}
          color={colors.dark.searchBarIcon}
          style={styles.searchIconWrap}
        />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Buscar utilizadores…"
          placeholderTextColor={colors.dark.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Buscar utilizadores"
          accessibilityHint="Escreva um nome ou nome de utilizador"
        />
        {searchBarBusy ? (
          <ActivityIndicator
            size="small"
            color={colors.dark.searchBarIcon}
            style={styles.searchBarSpinner}
            accessibilityLabel="A pesquisar"
          />
        ) : null}
        {query.length > 0 && !searchBarBusy ? (
          <Pressable
            onPress={handleClear}
            hitSlop={8}
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Limpar pesquisa"
          >
            <Ionicons name="close-circle" size={22} color={colors.dark.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {!isSearching ? (
        <Text style={styles.sectionLabel}>Sugestões</Text>
      ) : null}
      {isLoading ? <SkeletonList count={isSearching ? 3 : 5} /> : null}
    </>
  );

  const listEmpty = (() => {
    if (isLoading) {
      return null;
    }
    if (showDebouncingPlaceholder) {
      return null;
    }
    if (showSearchEmpty) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Nenhum utilizador encontrado para &quot;{debouncedQuery}&quot;
          </Text>
          <Text style={styles.emptyHint}>Experimente outras palavras-chave</Text>
        </View>
      );
    }
    if (showSuggestionsEmpty) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Nenhuma sugestão no momento</Text>
          <Text style={styles.emptyHint}>Digite para buscar pessoas</Text>
        </View>
      );
    }
    return null;
  })();

  const showFeedFooter =
    !isLoading &&
    !showDebouncingPlaceholder &&
    (listData.length > 0 || showSuggestionsEmpty || showSearchEmpty);

  const listFooter = showFeedFooter ? (
    <View style={styles.footer}>
      <Pressable
        onPress={handleGoFeed}
        style={({ pressed }) => [styles.footerLink, pressed && styles.footerLinkPressed]}
        accessibilityRole="button"
        accessibilityLabel="Ver feed"
        accessibilityHint="Abre o separador inicial com publicações"
      >
        <Text style={styles.footerLinkText}>Ver feed</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.dark.textMuted} />
      </Pressable>
    </View>
  ) : null;

  return (
    <View style={styles.container}>
      <FlatList
        data={isLoading ? [] : listData}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <UserRowItem user={item} onPress={() => handleUserPress(item.id)} />
        )}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        ItemSeparatorComponent={ListRowSeparator}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
    paddingTop: spacing.md,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
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
  searchIconWrap: {
    marginRight: spacing.xs,
  },
  searchBarSpinner: {
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
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
    minHeight: 56,
  },
  rowPressed: {
    backgroundColor: colors.dark.listRowPressed,
  },
  rowSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.dark.border,
    marginLeft: spacing.md + 44 + spacing.sm,
  },
  rowChevron: {
    marginLeft: spacing.xs,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  initialsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsOnColor: {
    color: '#FFFFFF',
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
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    minHeight: 200,
  },
  emptyTitle: {
    color: colors.dark.text,
    ...typography.subtitle,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.dark.textMuted,
    ...typography.body,
    textAlign: 'center',
  },
  emptyHint: {
    color: colors.dark.textMuted,
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    alignItems: 'center',
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
  },
  footerLinkPressed: {
    backgroundColor: colors.dark.listRowPressed,
  },
  footerLinkText: {
    color: colors.dark.textMuted,
    ...typography.body,
  },
});
