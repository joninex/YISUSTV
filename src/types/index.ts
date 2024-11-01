export interface Channel {
  name: string;
  url: string;
  country?: string;
  language?: string;
  category?: string;
  quality?: string;
  logo?: string;
  tvg?: {
    id?: string;
    name?: string;
    logo?: string;
    url?: string;
  };
}

export interface Filter {
  country?: string;
  language?: string;
  category?: string;
}