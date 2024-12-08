import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const service: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8080',// url = base url + request url
    timeout: 5000
});

service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = sessionStorage.getItem('token') ; // 获取 token
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // 添加 token 到请求头
        }
        return config;
    },
    (error: AxiosError) => {
        console.log(error);
        return Promise.reject(error); // 需要传递错误信息
    }
);
service.interceptors.response.use(
    (response: AxiosResponse) => {
        if (response.status === 200) {
            return response;
        } else {
            Promise.reject();
        }
    },
    (error: AxiosError) => {
        console.log(error);
        return Promise.reject(error);
    }
);

export default service;
