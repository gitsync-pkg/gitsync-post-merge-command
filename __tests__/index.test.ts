import * as fs from 'fs';
import {createRepo, runCommand} from '@gitsync/test';
import postMerge from '..';

describe('post-merge command', () => {
  test('run command', async () => {
    // Prepare repos
    const bare = await createRepo(true);
    const source = await createRepo();
    await source.run(['remote', 'add', 'origin', bare.dir]);

    const source2 = await createRepo();
    await source2.run(['remote', 'add', 'origin', bare.dir]);

    const target = await createRepo();
    await source.commitFile('.gitsync.json', JSON.stringify({
      repos: [
        {
          sourceDir: 'package-name',
          target: target.dir,
        }
      ]
    }));
    await source.run(['push', 'origin', 'master']);
    await source2.run(['pull', 'origin', 'master']);

    // Start test
    await source.commitFile('package-name/test.txt');
    await source.run(['push', 'origin', 'master']);

    await source2.run(['pull', 'origin', 'master']);
    await runCommand(postMerge, source2);

    expect(fs.existsSync(target.getFile('test.txt'))).toBeTruthy();
  });
});


