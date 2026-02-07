import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
    migrations: [
        // {
        //   toVersion: 2,
        //   steps: [
        //     createTable({
        //       name: 'comments',
        //       columns: [
        //         { name: 'post_id', type: 'string', isIndexed: true },
        //         { name: 'body', type: 'string' },
        //       ],
        //     }),
        //   ],
        // },
    ],
});
