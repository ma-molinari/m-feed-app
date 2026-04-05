import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';

import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '../src/services/queryClient';

/** Smoke test do TanStack Query provider usado em `App.tsx`. */
describe('QueryClientProvider', () => {
  it('renderiza filhos', () => {
    const { getByText } = render(
      <QueryClientProvider client={queryClient}>
        <View>
          <Text>ok</Text>
        </View>
      </QueryClientProvider>,
    );
    expect(getByText('ok')).toBeTruthy();
  });
});
