import matter from "gray-matter";
import { LoaderContext } from "webpack";

type Metadata = object | undefined;

type MetadataMutator = (
  metadata?: Metadata,
  filePath?: string,
  content?: string
) => Metadata;

export interface LoaderOptions {
  layoutFile?: string;
  metadataMutator?: MetadataMutator;
}

const defaultLayoutLocation: string = "components/MDX/Layout";
const appendLayoutDefinition = (
  content: string,
  meta: Metadata,
  layoutFile: string = defaultLayoutLocation
): string => {
  if (typeof layoutFile !== "string")
    throw TypeError(
      "layoutFile is not a string. Received " + typeof layoutFile
    );
  return (
    `import withLayout from "${layoutFile}";
    export default withLayout(${JSON.stringify(meta)});
    ` + content
  );
};

export default async function (
  this: LoaderContext<LoaderOptions>,
  src: string | undefined
) {
  const { layoutFile, metadataMutator } = this.getOptions();
  const { content, data } = matter(src || "");
  const filePath: string = this.resourcePath.replace(process.cwd(), "");
  const meta: object =
    (metadataMutator ? metadataMutator(data, filePath, content) : data) || {};
  const code: string = appendLayoutDefinition(content, meta, layoutFile);
  return this.async()(null, code);
}
