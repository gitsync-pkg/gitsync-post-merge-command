import {CommandModule} from 'yargs';
import {Config} from '@gitsync/config';
import git from "git-cli-wrapper";
import log from "@gitsync/log";
import commit from '@gitsync/commit-command';

let command: CommandModule = {
  handler: () => {
  }
};

command.command = 'post-merge';

command.describe = 'A git hook, use to sync the commits to relative repositories after merge.';

command.handler = async () => {
  if (process.env.GITSYNC_UPDATE) {
    log.info('Gitsync is updating commit, skipping post merge.');
    return;
  }

  const source = git('.');
  const config = new Config();

  const result = await source.run(['diff', '--name-only', 'HEAD', 'ORIG_HEAD']);
  log.info('Found changed files: \n' + result);

  const files = result.split("\n");
  const changedRepos = config.getReposByFiles(files);

  for (const repo of changedRepos) {
    await runCommand(commit, {
      sourceDir: repo.sourceDir,
      yes: true,
    });
  }
}

async function runCommand(command: CommandModule, options: any) {
  await command.handler(options);
}

export default command;
