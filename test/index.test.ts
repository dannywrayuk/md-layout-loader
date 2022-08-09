import unboundLoader, { LoaderOptions } from "../src/index";

const defaultLayoutLocation = "components/MDX/Layout";
const mockPageSrc = `---
title: Hello Title
---
Hello Loader`;
const mockCallback = jest.fn();
const mockResourcePath = "resourcePath";
const getLoader = (options?: LoaderOptions) =>
  // @ts-ignore
  unboundLoader.bind({
    getOptions: () => options || {},
    async: () => mockCallback,
    resourcePath: mockResourcePath,
  });

afterEach(() => {
  mockCallback.mockClear();
});

describe("Default options", () => {
  test("With blank input", async () => {
    const loader = getLoader();
    await loader("");
    expect(mockCallback).toBeCalledWith(
      null,
      `import withLayout from "${defaultLayoutLocation}";
    export default withLayout({});
    `
    );
  });

  test("With no metadata", async () => {
    const loader = getLoader();
    await loader("Hello Loader");
    expect(mockCallback).toBeCalledWith(
      null,
      `import withLayout from "${defaultLayoutLocation}";
    export default withLayout({});
    Hello Loader`
    );
  });

  test("With only metadata", async () => {
    const mockSrc = `---
title: Hello Title
---`;
    const loader = getLoader();
    await loader(mockSrc);
    expect(mockCallback).toBeCalledWith(
      null,
      `import withLayout from "${defaultLayoutLocation}";
    export default withLayout({"title":"Hello Title"});
    `
    );
  });

  test("With metadata and content", async () => {
    const loader = getLoader();
    await loader(mockPageSrc);
    expect(mockCallback).toBeCalledWith(
      null,
      `import withLayout from "${defaultLayoutLocation}";
    export default withLayout({"title":"Hello Title"});
    Hello Loader`
    );
  });
});

describe("Custom layoutFile", () => {
  test("With empty string", async () => {
    const loader = getLoader({ layoutFile: "" });
    await loader(mockPageSrc);
    expect(mockCallback).toBeCalledWith(
      null,
      `import withLayout from "";
    export default withLayout({"title":"Hello Title"});
    Hello Loader`
    );
  });

  test("With path string", async () => {
    const loader = getLoader({ layoutFile: "file/path" });
    await loader(mockPageSrc);
    expect(mockCallback).toBeCalledWith(
      null,
      `import withLayout from "file/path";
    export default withLayout({"title":"Hello Title"});
    Hello Loader`
    );
  });

  test("With wrong type", async () => {
    // @ts-ignore
    const loader = getLoader({ layoutFile: { hello: "error" } });
    try {
      await loader("");
    } catch (e) {
      expect(String(e)).toMatch(
        "TypeError: layoutFile is not a string. Received object"
      );
    }
  });
});

describe("Custom Mutator Function", () => {
  test("With void function", async () => {
    const mockMutator = jest.fn();
    const loader = getLoader({ metadataMutator: mockMutator });
    await loader(mockPageSrc);

    expect(mockMutator).toBeCalledWith(
      { title: "Hello Title" },
      mockResourcePath,
      "Hello Loader"
    );
    expect(mockCallback).toBeCalledWith(
      null,
      `import withLayout from "${defaultLayoutLocation}";
    export default withLayout({});
    Hello Loader`
    );
  });
  test("With blank function", async () => {
    const mockMutator = jest.fn((x) => x);
    const loader = getLoader({ metadataMutator: mockMutator });
    await loader(mockPageSrc);

    expect(mockMutator).toBeCalledWith(
      { title: "Hello Title" },
      mockResourcePath,
      "Hello Loader"
    );
    expect(mockCallback).toBeCalledWith(
      null,
      `import withLayout from "${defaultLayoutLocation}";
    export default withLayout({"title":"Hello Title"});
    Hello Loader`
    );
  });

  test("With extra data", async () => {
    const mockMutator = jest.fn((x) => ({ ...x, test: "extra" }));
    const loader = getLoader({ metadataMutator: mockMutator });
    await loader(mockPageSrc);

    expect(mockMutator).toBeCalledWith(
      { title: "Hello Title" },
      mockResourcePath,
      "Hello Loader"
    );
    expect(mockCallback).toBeCalledWith(
      null,
      `import withLayout from "${defaultLayoutLocation}";
    export default withLayout({"title":"Hello Title","test":"extra"});
    Hello Loader`
    );
  });

  test("With wrong type", async () => {
    // @ts-ignore
    const loader = getLoader({ metadataMutator: { hello: "error" } });
    try {
      await loader(mockPageSrc);
    } catch (e) {
      expect(String(e)).toMatch("TypeError: metadataMutator is not a function");
    }
  });
});
