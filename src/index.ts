import { runSequence } from "@klw/node-sequential-promises";
import { Migration, MigrationOptions, MigrationResult, MigrationVersion } from "./types";

/**
 * Runs your database migrations up and down.
 *
 * @param migrations - Array of all Migrations. See docs/types for details.
 * @param currentVersion - The current version (or null) if the database is not set up yet.
 * @param options - Set the target version with {targetVersion: string}
 *
 * Will fallback to latest version, if target version is not specified.
 */
export const migrate = async (
  migrations: Migration[],
  currentVersion: MigrationVersion | null,
  options?: MigrationOptions,
): Promise<MigrationResult | undefined> => {
  const latestVersion = migrations[migrations.length - 1].version;
  const targetVersion = options?.targetVersion || "latest";
  const newVersion = targetVersion === "latest" ? latestVersion : targetVersion || latestVersion;
  const curVersionIndex = migrations.findIndex((x) => x.version === currentVersion);
  const newVersionIndex = migrations.findIndex((x) => x.version === newVersion);

  // Don't know what to do with not-matching version
  if (currentVersion && curVersionIndex === -1) {
    return Promise.reject(`No matching currentVersion (${currentVersion}) found.`);
  }

  // Define actual migrations to run
  const migrateUp = newVersionIndex >= curVersionIndex;
  const steps = migrateUp
    ? migrations.slice(curVersionIndex + 1, newVersionIndex + 1)
    : migrations.slice(newVersionIndex + 1, curVersionIndex + 1).reverse();

  // Target version number
  const returnTargetVersion = migrations[newVersionIndex].version;

  // No migrations to run
  if (steps.length === 0) {
    return Promise.resolve({
      success: true,
      started: [],
      fulfilled: [],
      direction: "UP",
      targetVersion: returnTargetVersion,
    });
  }

  // Actually run migrations
  const result = await runSequence(steps.map((step) => (migrateUp ? step.up : step.down)));

  const started = result.started.map((index) => steps[index].version);
  const fulfilled = result.fulfilled.map((index) => steps[index].version);
  return {
    targetVersion: returnTargetVersion,
    direction: migrateUp ? "UP" : "DOWN",
    success: result.success,
    started,
    fulfilled,
    errorMessage: result.error,
  };
};
