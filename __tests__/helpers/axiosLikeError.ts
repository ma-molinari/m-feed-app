/** Plain object: `axios.isAxiosError` only checks `isAxiosError === true` (avoid importing axios in Jest). */
export function axiosLikeError(status: number, data?: object) {
  return {
    isAxiosError: true,
    name: 'AxiosError',
    message: 'fail',
    response: {
      status,
      data: data ?? {},
      statusText: 'Error',
      headers: {},
      config: {},
    },
    config: {},
  };
}
