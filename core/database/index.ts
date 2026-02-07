import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema';
import migrations from './migrations';
// Import models here later when created
// import Post from './model/Post'

const adapter = new SQLiteAdapter({
    schema,
    // (You might want to comment out migrations until you create the file)
    // migrations,
    // (optional database name or file system path)
    // dbName: 'myapp',
    // (recommended option, should work flawlessly out of the box on iOS. On Android,
    // additional installation steps have to be taken:
    // https://watermelondb.dev/Installation.html#android)
    jsi: true, /* Platform.OS === 'ios' */
    onSetUpError: error => {
        // Database failed to load -- offer the user to reload the app or log out
        console.error('Database setup error:', error);
    }
});

export const database = new Database({
    adapter,
    modelClasses: [
        // Post,
    ],
});
