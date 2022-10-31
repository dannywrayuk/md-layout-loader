# Overview

A Webpack loader for wrapping markdown in a Layout.

Working in conjunction with `@mdx-js/loader`, this loader allows you to easily wrap your markdown content in a layout or other react parent components with minimal config.

# Installation

Via npm

```
npm i @dannywrayuk/md-layout-loader
```

The loader should be added to the webpack config after the mdx loader,

```js
config.module.rules.push({
  test: /\.mdx?$/,
  use: [
    options.defaultLoaders.babel,
    {
      loader: "@mdx-js/loader",
      options: {
        providerImportSource: "@mdx-js/react",
      },
    },
    {
      loader: "@dannywrayuk/md-layout-loader",
      options: {
        layoutFile,
        metadataMutator,
      },
    },
  ],
});
```

## Usage

The loader takes two options, `layoutFile` and `metadataMutator`. Both are optional and `layoutFile` will default to `components/MDX/Layout`.

`layoutFile` should be the location of a function that will accept a page's metadata as input and return a react component that will wrap the page's content.
It may look something like,

```js
export default (meta) =>
  ({ children }) =>
    (
      <SomeLayout data={meta}>
        <MDXProvider components={MDXComponents}>{children}</MDXProvider>
      </SomeLayout>
    );
```

`metadataMutator` provides an opportunity to mutate the metadata at build-time before it is passed to the layout. This is useful for expensive computations such as keyword extraction.
This should be a function that accepts the page's metadata, path and content. An example of this can be seen here,

```js
module.exports = (metadata, filePath, fileContent) => ({
  ...metadata,
  generatedKeywords: generateKeywords(fileContent),
});
```

## Example

If you require an example usage of this loader, a working implementation can be seen live on my [personal site](https://github.com/dannywrayuk/dannywraycouk).
