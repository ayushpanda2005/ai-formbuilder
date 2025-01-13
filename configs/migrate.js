import { db } from './index.js'; // Explicitly include `.js` for module resolution
import { migrate } from 'drizzle-orm/neon-http/migrator';


const main = async () => {
    try {
        await migrate(db, {
            migrationsFolder: 'configs/migrations' // Update the folder path if it's not under `src`
        });
        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1)
    }
};

main();
