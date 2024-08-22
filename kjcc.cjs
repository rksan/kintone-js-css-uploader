// @ts-check

/** @type {import("./src/types").JsCssUploader.Config} */
module.exports = {
  /** @type {import("./src/types").JsCssUploader.Entry} */
  dev: {
    app: "5",
    scope: "ALL",
    desktop: {
      js: ["./test/mock/mock.js"],
    },
    mobile: true,
  },
  test: {
    extends: "dev",
    exec: ["node --version"],
  },
  prod: {
    extends: "dev",
  },
};
