import { createCommand } from 'commander';

import { getNymphInstance } from '@sciactive/sylphjs-server';

async function migrateReimportAll() {
  const { nymph } = getNymphInstance();

  const exportIterator = nymph.driver.exportDataIterator();
  let count = 0;
  let error = 0;

  for await (let item of exportIterator) {
    if (item.type === 'entity') {
      try {
        await nymph.driver.importDataIterator(
          `#nex2\n${item.content}`.split('\n'),
        );
        count++;
      } catch (e: any) {
        console.log(`Error: ${e}`);
        console.log(item.content);
        console.log('');
        console.log('');
        error++;
      }
    }
  }

  console.log(`\n\n${count} entities reimported.`);
  console.log(`${error} error(s).`);
}

const migrateCommand = createCommand();
migrateCommand.name('migrate').description('Migrate database objects.');

migrateCommand
  .command('reimport-all')
  .description(
    'Export and import all entities. (Handles Nymph level migrations.)',
  )
  .action(migrateReimportAll);

export { migrateCommand };
