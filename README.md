# node-database-migration

A database migration runner that

- will run your migration functions
- will find and run migrations based on your settings (defaults to latest version and a new database).
- stops running migrations, when one fails
- runs all remaining migrations, if `curVersion` is `null`.

## Usage

Import package and run migrations:

```
yarn add @klw/node-database-migration
```

```
import { migrate } from "@klw/node-database-migration";

const curVersion = null;
const migrations = {
  one: {
      version: "1",
      up: () => Promise.resolve(), // Your migration function
      down: () => Promise.resolve(),
  },
  two: {
      version: "2",
      up: () => Promise.resolve(),
      down: () => Promise.resolve(),
  },
  three: {
      version: "3",
      up: () => Promise.resolve(),
      down: () => Promise.resolve(),
  },
};

const result = await migrate([migrations.one, migrations.two, migrations.three], curVersion);
```

### Your Migration Functions

The migration runner uses the Promise API:

- `return Promise.resolve()` to show a successful migration
- `return Promise.reject()` to stop executing
- `return Promise.reject(error)` to stop executing and have your custom error returned

`error` can be `string` or `Error`.

### Advanced Options

You may add `options` to your migrations.

```
const options = { targetVersion: "5" }
const result = await migrate(migrations, curVersion, options);
```

Currently only the `targetVersion` option is available. This will enable you to downgrade.

## Return value

The migration runner will stop running migrations, if one fails. In either case you will get a resolved `Promise`.
When all migrations succeed:

```
{
    success: true,
    targetVersion: "3",
    direction: "UP",
    started: ["1", "2", "3"],
    fulfilled: ["1", "2", "3"],
}
```

When migration 2 fails:

```
{
    success: false,
    targetVersion: "3",
    direction: "UP",
    started: ["1", "2"],
    fulfilled: ["1"],
    errorMessage: "Migration function 2 failed and this is the custom error message for it.",
}
```
