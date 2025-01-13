import { migrateData } from './migrateData';

async function main() {
  try {
    await migrateData();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();