module.exports = {
    apps: [{
        name: 'movnly-backend',
        script: 'dist/main.js',
        instances: 'max',
        exec_mode: 'cluster',
        autorestart: true,
        watch: false,
        max_memory_restart: '512M',
        error_file: './logs/pm2-error.log',
        out_file: './logs/pm2-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        env_production: {
            NODE_ENV: 'production',
            PORT: 3002,
        },
    }],
};
