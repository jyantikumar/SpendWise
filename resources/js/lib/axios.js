// resources/js/lib/axios.js
import axios from 'axios';

export const http = axios.create({
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
    },
    withCredentials: true,
});

const token = document.querySelector('meta[name="csrf-token"]')?.content;
if (token) {
    http.defaults.headers.common['X-CSRF-TOKEN'] = token;
}