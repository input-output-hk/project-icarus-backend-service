module.exports = {
  apps: [{
    name: 'backend-service',
    script: './build/index.js',
    args: '',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    min_uptime: '24h',
    max_restarts: 50,
    out_file: './logs/server.log',
    error_file: './logs/server.log',
    merge_logs: true,
    env: {
      NODE_ENV: 'production',
    },
    env_development: {
      NODE_ENV: 'development',
    },
  }],
};
