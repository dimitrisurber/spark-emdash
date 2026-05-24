export interface FieldGroup {
  label: string;
  cols: 1 | 2 | 3;
  fields: string[];
}

export type BlockLayouts = Record<string, FieldGroup[]>;

export interface IllustrationMap {
  [key: string]: string;
}

export interface SparkConfig {
  layouts?: BlockLayouts;
  illustrations?: IllustrationMap;
}
