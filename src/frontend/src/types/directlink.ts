export interface DirectLinkItem {
  category: "directlink";
  domain: string;
  extension: string;
  filename: string;
  fragment: string | null;
  path: string;
  query: string | null;
  subcategory: string;
}
