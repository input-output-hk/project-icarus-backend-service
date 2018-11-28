module.exports = {
  apps : [{
    name: 'backend-service',
    script: './flow-files/index.js',
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
    env: {
      NODE_ENV: 'production'
    },
    env_development: {
      NODE_ENV: 'development'
    }
  }],

  deploy : {
    production : {
      user : 'ubuntu',
      host : 'localhost',
      ref  : 'origin/adalite',
      repo : 'git@github.com:vacuumlabs/project-icarus-backend-service.git',
      path : '',
      'post-deploy' : 'npm install && npm run flow-remove-types && pm2 reload ecosystem.config.js --env production'
    }
  }
};
