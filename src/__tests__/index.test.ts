import { migrate } from "../index";

const success = () => Promise.resolve();
const failure = () => Promise.reject();

const migrations = {
  one: {
    success: {
      version: "1",
      up: success,
      down: success,
    },
    failure: {
      version: "1",
      up: failure,
      down: failure,
    },
  },
  two: {
    success: {
      version: "2",
      up: success,
      down: success,
    },
    failure: {
      version: "2",
      up: failure,
      down: failure,
    },
  },
  three: {
    success: {
      version: "3",
      up: success,
      down: success,
    },
    failure: {
      version: "3",
      up: failure,
      down: failure,
    },
  },
};

test("should run migrations UP", async () => {
  const expected = {
    success: true,
    targetVersion: "2",
    direction: "UP",
    started: ["1", "2"],
    fulfilled: ["1", "2"],
  };
  const received = await migrate([migrations.one.success, migrations.two.success, migrations.three.success], null, {
    targetVersion: "2",
  });
  expect(received).toEqual(expected);
});

test("should run migrations UP, with current version supplied", async () => {
  const expected = {
    success: true,
    targetVersion: "2",
    direction: "UP",
    started: ["2"],
    fulfilled: ["2"],
  };
  const received = await migrate([migrations.one.success, migrations.two.success, migrations.three.success], "1", {
    targetVersion: "2",
  });
  expect(received).toEqual(expected);
});

test("should run migrations DOWN", async () => {
  const expected = {
    success: true,
    targetVersion: "1",
    direction: "DOWN",
    started: ["3", "2"],
    fulfilled: ["3", "2"],
  };
  const received = await migrate([migrations.one.success, migrations.two.success, migrations.three.success], "3", {
    targetVersion: "1",
  });
  expect(received).toEqual(expected);
});

test("should run all migrations UP, when no current version is supplied", async () => {
  const expected = {
    success: true,
    targetVersion: "3",
    direction: "UP",
    started: ["1", "2", "3"],
    fulfilled: ["1", "2", "3"],
  };
  const received = await migrate([migrations.one.success, migrations.two.success, migrations.three.success], null);
  expect(received).toEqual(expected);
});

test("should stop migrations UP, when error occurs", async () => {
  const expected = {
    success: false,
    targetVersion: "3",
    direction: "UP",
    started: ["1", "2"],
    fulfilled: ["1"],
  };
  const received = await migrate([migrations.one.success, migrations.two.failure, migrations.three.success], null);
  expect(received).toEqual(expected);
});

// ToDo: This test fails, if the second migrations fails and it's not clear why
test("should stop migrations DOWN, when error occurs", async () => {
  const expected = {
    success: false,
    targetVersion: "1",
    direction: "DOWN",
    started: ["3"],
    fulfilled: [],
  };
  const received = await migrate([migrations.one.success, migrations.two.success, migrations.three.failure], "3", {
    targetVersion: "1",
  });
  expect(received).toEqual(expected);
});
