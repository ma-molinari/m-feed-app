import { useMutation } from '@tanstack/react-query';

import { updatePassword } from '../services/profileApi';

export function useUpdatePassword() {
  return useMutation({
    mutationFn: updatePassword,
  });
}
