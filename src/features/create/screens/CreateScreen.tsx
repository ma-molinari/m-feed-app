import { StyleSheet, Text, View } from 'react-native';

import { typography } from '@theme/typography';

export function CreateScreen() {
  return (
    <View style={styles.container}>
      <Text style={[typography.title, styles.label]}>Create</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#FFFFFF',
  },
});
