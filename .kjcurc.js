// @ts-check

/** @type {import("./src/types").JsCssUploader.Config} */
module.exports = {
  /** @type {import("./src/types").JsCssUploader.Entry} */
  dev: {
    app: "5",
    scope: "ALL",
    desktop: {
      js: ["./test/excludes/mock.js"],
    },
    mobile: true,
  },
  /** @type {import("./src/types").JsCssUploader.Entry} */
  test: {
    app: "6",
    extends: "dev",
    exec: ["node --version"],
  },
  /** @type {import("./src/types").JsCssUploader.Entry} */
  prod: {
    app: "7",
    extends: "dev",
  },
};
