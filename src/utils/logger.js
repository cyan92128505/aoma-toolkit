import log4js from 'log4js';
log4js.configure({
  appenders: { console_log: { type: 'console' } },
  categories: { default: { appenders: ['console_log'], level: 'all' } },
});

const logger = log4js.getLogger();

export default logger;
