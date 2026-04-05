/* global module */
'use strict';

function createInstance(defaults) {
  const d = defaults && typeof defaults === 'object' ? defaults : {};
  const requestInterceptors = [];
  const responseInterceptors = [];

  return {
    defaults: d,
    interceptors: {
      request: {
        use(fn) {
          requestInterceptors.push(fn);
        },
      },
      response: {
        use(onFulfilled, onRejected) {
          responseInterceptors.push({ onFulfilled, onRejected });
        },
      },
    },
    async get(url, cfg) {
      const c = cfg && typeof cfg === 'object' ? cfg : {};
      let config = {
        ...d,
        ...c,
        url,
        method: 'get',
        headers: { ...d.headers, ...c.headers },
      };
      for (const fn of requestInterceptors) {
        const out = await fn(config);
        if (out !== undefined && out !== null) {
          config = out;
        }
      }
      const adapter = c.adapter;
      if (typeof adapter !== 'function') {
        throw new Error('apiClient tests must pass adapter on get()');
      }
      try {
        let response = await adapter(config);
        for (const { onFulfilled } of responseInterceptors) {
          if (onFulfilled) {
            response = await onFulfilled(response);
          }
        }
        return response;
      } catch (err) {
        for (const { onRejected } of responseInterceptors) {
          if (onRejected) {
            await onRejected(err);
          }
        }
        throw err;
      }
    },
  };
}

module.exports = {
  __esModule: true,
  default: {
    create: (defaults) => createInstance(defaults),
  },
};
