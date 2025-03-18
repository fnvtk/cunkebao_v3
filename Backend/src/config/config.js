export default {
  WEBSITE_NAME: process.env.VUE_APP_WEBSITE_NAME || 'CPS',
  BASE_API_URL: process.env.VUE_APP_API_BASE_URL || '',
  BASE_WWW_URL: process.env.VUE_APP_WWW_BASE_URL || '',
  BASE_WS_URL: process.env.VUE_APP_WEB_SOCKET_URL || '',
  WS_DEBUG: false,
}
