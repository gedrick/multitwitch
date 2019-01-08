module.exports = {
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '^/auth/twitch': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '^/callback': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
};
