import packageInfo from '../../package.json';

/** `ng build --configuration staging`: the Staging copy of web-api (a restored, cleaned copy of production's data). */
export const environment = {
  appVersion: packageInfo.version,
  apiUrl: 'https://staging-api.trips.eg/api/',
  imgUrl: 'https://staging-api.trips.eg/',
  production: true
};
