const path = require('path');
module.exports = {
  apps: [{
    name: 'taskflow-node',
    cwd: path.resolve(__dirname, '../Backend-node'),
    script: 'src/server.js',
    autorestart: true,
  }],
};
