import fs from 'node:fs/promises';
import { createCommand } from 'commander';

import { getNymphInstance } from '@sciactive/sylphjs-server';

async function exportNymph(filename: string) {
  const { nymph } = getNymphInstance();

  const fhandle = await fs.open(filename, 'w');

  try {
    if (!fhandle) {
      throw new Error('Provided filename is not writeable.');
    }
    for await (let entry of nymph.driver.exportDataIterator()) {
      await fhandle.write(entry.content);
    }
    await fhandle.close();
  } catch (e: any) {
    console.error(e);
    await fhandle.close();
    process.exit(1);
  }

  process.exit(0);
}

async function importNymph(filename: string) {
  const {
    nymph,
    User,
    Group,
    Dashboard,
    LogEntry,
    PushSubscriptionWeb,
    StateObject,
  } = getNymphInstance();

  // Make sure all the tables exist.
  for (let CurClass of [
    User,
    Group,
    Dashboard,
    LogEntry,
    PushSubscriptionWeb,
    StateObject,
  ]) {
    try {
      await nymph.getEntity({ class: CurClass, return: 'guid' });
    } catch (e: any) {
      // Ignore errors.
    }
  }

  process.exit((await nymph.import(filename)) ? 0 : 1);
}

const dbCommand = createCommand();
dbCommand.name('db').description('Manage Nymph database.');

dbCommand
  .command('export')
  .description('Export Nymph DB.')
  .argument('<filename>', 'the NEX file to export to')
  .action(exportNymph);

dbCommand
  .command('import')
  .description('Import Nymph DB.')
  .argument('<filename>', 'the NEX file to import from')
  .action(importNymph);

export { dbCommand };
