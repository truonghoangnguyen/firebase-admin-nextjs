interface Config {
  api: {
    upload: string;
  };
}

// Simple switch for environments
// const USE_PRODUCTION = true; // Set this to true for production, false for local

const LOCAL_API = 'http://127.0.0.1:5001/boringketo/us-central1/upload';
const PRODUCTION_API = 'https://us-central1-boringketo.cloudfunctions.net/upload';

const config: Config = {
  api: {
    upload: process.env.NODE_ENV === 'development' ? LOCAL_API : PRODUCTION_API,
  },
};

export default config;