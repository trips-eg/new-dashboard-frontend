export interface Icountries {
  id: number;
  name: string;
  countryCode: string; //(+20)
  isoCode?: string; // (EG)
  module?: number;
  status?: boolean;
  cities?: string[];
}
