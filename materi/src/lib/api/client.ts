/** @module httpClient */

/**
 * opsi untuk melakukan request
 */
export interface RequestOption {
  /**
   * metode request
   */
  method: 'GET' | 'POST' | 'PUT' | 'OPTION';
  /**
   * payload di dalam body yang akan dikirimkan
   */
  body?: any;
  /**
   * tambahan konfigurasi
   */
  customConf?: any;
}

/**
 * ### basic client untuk request ke `server`
 * @param endpoint target / url endpoint
 * @param options tambahan opsi [request](http://localhost)
 * @returns hasil request
 */
async function client(endpoint: string, options: RequestOption): Promise<any> {
  const headers = { 'Content-Type': 'application/json' };

  const config = {
    method: options?.method ?? 'GET',
    ...options?.customConf,
    headers: {
      ...headers,
      ...options?.customConf?.headers,
    },
  };

  if (options?.body) {
    config.body = JSON.stringify(options?.body);
  }

  let data;
  try {
    const response = await window.fetch(endpoint, config);
    data = await response.json();
    if (!response.ok) {
      throw new Error(data?.statusText ?? 'Gagal request ke api');
    }

    return data;
  } catch (err) {
    return Promise.reject(err?.message || data);
  }
}

/**
 * request dengan method GET
 * @param endpoint target / url endpoint
 * @param options tambahan opsi request
 */
client.get = (endpoint: string, customConf: any = {}): Promise<any> => {
  const config: RequestOption = {
    method: 'GET',
    ...customConf,
  };
  return client(endpoint, config);
};

/**
 * request dengan method POST
 * @param endpoint target / url endpoint
 * @param body konten dari request
 * @param options tambahan opsi request
 */
client.post = <T>(
  endpoint: string,
  body: any,
  customConf: any = {}
): Promise<T> => {
  return client(endpoint, { method: 'POST', body, ...customConf });
};

/**
 * request dengan method PUT
 * @param endpoint target / url endpoint
 * @param body konten dari request
 * @param options tambahan opsi request
 */
client.put = (
  endpoint: string,
  body?: any,
  customConf: any = {}
): Promise<any> => {
  return client(endpoint, { method: 'PUT', body, ...customConf });
};

export { client as httpClient };
