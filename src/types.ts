export type MigrationOptions = {
  targetVersion?: MigrationVersion;
};

export type MigrationVersion = string | "latest";

export interface Migration {
  version: MigrationVersion;
  up: () => Promise<void | MigrationError>;
  down: () => Promise<void | MigrationError>;
}

export interface MigrationResult {
  success: boolean;
  targetVersion: MigrationVersion;
  direction: "UP" | "DOWN";
  started: string[];
  fulfilled: string[];
  errorMessage?: MigrationError;
}

export type MigrationError = string | Error;
