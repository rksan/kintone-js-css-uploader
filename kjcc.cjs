// @ts-check

/** @type {import("./src/types/js-css-uploader").KintoneJsCssUploaderConfig} */
module.exports = {
  /** @type {import("./src/types/js-css-uploader").KintoneJsCssUploaderEntry} */
  dev: {
    app: "5",
    scope: "ALL",
    /** @type {import("./src/types/js-css-uploader").KintoneJsCssUploaderEntryKind} */
    desktop: {
      js: ["./test/mock/mock.js"],
    },
    /** @type {import("./src/types/js-css-uploader").KintoneJsCssUploaderEntryKind} */
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
