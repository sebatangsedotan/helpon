import fileUpload from 'express-fileupload';

export const allowFileUpload = fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 },
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: '/tmp/',
  debug: process.env.NODE_ENV !== 'production'
});
