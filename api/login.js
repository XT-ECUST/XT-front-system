import request from './request'

export function login(loginForm) {
    return request({
        url: '/login',
        method: 'post',
        data: loginForm
    })
}

export function register(registerForm) {
    return request({
        url: '/register',
        method: 'post',
        data: registerForm
    })
}



