import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from '@/Components/ui/sonner'; // 👈 1. Import Toaster

const appName = import.meta.env.VITE_APP_NAME || 'SpendWise';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <Toaster position="top-right" theme="dark" richColors /> {/* 👈 2. Mount globally here */}
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});