const path = require('path');

module.exports = {
  apps: [{
    name: 'semi-social-node',
    cwd: path.resolve(__dirname, '../Backend-Node'),
    script: 'src/server.js',
    autorestart: true,
  }],
};
