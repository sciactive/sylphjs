import { lstatSync } from 'node:fs';

export default {
  '**/*': (stagedFiles) =>
    stagedFiles
      .filter((filename) => !lstatSync(filename).isSymbolicLink())
      .map(
        (filename) =>
          `prettier --write --ignore-path .prettierignore --ignore-unknown '${filename}'`,
      ),
};
