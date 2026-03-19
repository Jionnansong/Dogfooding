
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

// Simulation of standard error message UI
const notifyError = (msg: string) => {
  console.error(`[API Error]: ${msg}`);
  // In a real app, use antd.message.error(msg)
};

const API_BASE_URL_DEV = 'http://localhost:3000/api/v1';
const API_BASE_URL_PROD = 'https://api.miaostars.com/v1';

const baseURL = process.env.NODE_ENV === 'production' ? API_BASE_URL_PROD : API_BASE_URL_DEV;

class Request {
  private instance: AxiosInstance;

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config);

    // Request Interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const token = store.getState().auth.token;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers['Content-Type'] = 'application/json';
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const { data } = response;
        // Business logic success check
        return data;
      },
      (error) => {
        if (axios.isCancel(error)) {
          console.log('Request canceled', error.message);
          return Promise.reject(error);
        }

        const status = error.response?.status;
        switch (status) {
          case 401:
            notifyError('登录已过期，请重新登录');
            store.dispatch(logout());
            window.location.hash = '/login';
            break;
          case 403:
            notifyError('权限不足，无法访问该资源');
            break;
          case 500:
            notifyError('服务器内部错误');
            break;
          default:
            notifyError(error.message || '未知网络错误');
        }
        return Promise.reject(error);
      }
    );
  }

  public request<T>(config: AxiosRequestConfig): Promise<T> {
    return this.instance.request(config);
  }

  public get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config);
  }

  public post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config);
  }
}

export const request = new Request({
  baseURL,
  timeout: 10000,
});

export default request;
