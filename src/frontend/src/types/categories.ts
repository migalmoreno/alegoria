interface SubCategory {
  example: string;
  name: string;
  category: string;
  description: string;
}

interface Category {
  name: string;
  subcategories: SubCategory[];
  root: string;
  base_pattern?: string;
  description: string;
  domains?: string[];
  legacy_domains?: string[];
}

interface Extractor {
  category: string;
  subcategory: string;
  groups: string[];
  config_path: string[];
  url: string;
}

export type { Extractor, SubCategory, Category };
