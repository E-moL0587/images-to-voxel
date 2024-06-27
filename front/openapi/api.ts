import type { Configuration } from './configuration';
import type { AxiosPromise, AxiosInstance, AxiosRequestConfig } from 'axios';
import globalAxios from 'axios';
import { DUMMY_BASE_URL, setSearchParams, toPathString, createRequestFunction } from './common';
import type { RequestArgs } from './base';
import { BASE_PATH, BaseAPI, operationServerMap } from './base';

export const DefaultApiAxiosParamCreator = function (configuration?: Configuration) {
  return {
    postNumberArray: async (array: number[][], options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
      const localVarPath = `/incrementArray`;
      const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
      let baseOptions;
      if (configuration) {
        baseOptions = configuration.baseOptions;
      }

      const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options, data: array };
      const localVarHeaderParameter = {} as any;
      const localVarQueryParameter = {} as any;

      setSearchParams(localVarUrlObj, localVarQueryParameter);
      let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
      localVarRequestOptions.headers = { ...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers };

      return {
        url: toPathString(localVarUrlObj),
        options: localVarRequestOptions,
      };
    },
  };
};

export const DefaultApiFp = function(configuration?: Configuration) {
  const localVarAxiosParamCreator = DefaultApiAxiosParamCreator(configuration);
  return {
    async postNumberArray(array: number[][], options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<number[][]>> {
      const localVarAxiosArgs = await localVarAxiosParamCreator.postNumberArray(array, options);
      const index = configuration?.serverIndex ?? 0;
      const operationBasePath = operationServerMap['DefaultApi.postNumberArray']?.[index]?.url;
      return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, operationBasePath || basePath);
    },
  };
};

export const DefaultApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
  const localVarFp = DefaultApiFp(configuration);
  return {
    postNumberArray(array: number[][], options?: any): AxiosPromise<number[][]> {
      return localVarFp.postNumberArray(array, options).then((request) => request(axios, basePath));
    },
  };
};

export class DefaultApi extends BaseAPI {
  public postNumberArray(array: number[][], options?: AxiosRequestConfig) {
    return DefaultApiFp(this.configuration).postNumberArray(array, options).then((request) => request(this.axios, this.basePath));
  }
}
