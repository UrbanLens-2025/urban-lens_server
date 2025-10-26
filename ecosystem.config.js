module.exports = {
  apps: [
    {
      name: 'urbanlens-api', // This name is used by PM2 to identify and manage the process.
      script: 'dist/main.js', // Path to your main entry file, relative to the config file location.
      watch: false,
      autorestart: true,
      max_memory_restart: '2G',
      env: {
        RUNTIME_VERSION: process.env.RUNTIME_VERSION,
        DEPLOYED_AT: process.env.DEPLOYED_AT,
      },
      // By omitting the 'env' block here, PM2 automatically picks up
      // all the secrets and variables defined in your GitHub Actions 'deploy' job.
    },
  ],
};
