const git = require('./node_modules/isomorphic-git');
const http = require('./node_modules/isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '..');
const token = process.env.GITHUB_TOKEN || process.argv[2];

async function main() {
  try {
    console.log('Initializing git repository at', dir);
    await git.init({ fs, dir });

    console.log('Staging files...');
    await git.add({ fs, dir, filepath: '.' });

    console.log('Creating commit...');
    const sha = await git.commit({
      fs,
      dir,
      author: {
        name: 'Vincenzo AFK',
        email: 'vincenzo@example.com',
      },
      message: 'Complete TN Land Tracker project (Frontend, Backend, Supabase, Leaflet, Disclaimers)',
    });

    console.log('Successfully created commit:', sha);

    console.log('Setting remote origin...');
    await git.addRemote({
      fs,
      dir,
      remote: 'origin',
      url: 'https://github.com/vincenzo-afk/tn-land-tracker.git',
      force: true,
    });

    if (token) {
      console.log('Pushing to https://github.com/vincenzo-afk/tn-land-tracker.git...');
      const pushResult = await git.push({
        fs,
        http,
        dir,
        remote: 'origin',
        ref: 'main',
        onAuth: () => ({ username: token }),
      });
      console.log('Push result:', pushResult);
    } else {
      console.log('Git repo staged and committed locally!');
      console.log('To push to GitHub, run: node git-helper.js <YOUR_GITHUB_TOKEN>');
    }
  } catch (err) {
    console.error('Git helper error:', err.message || err);
  }
}

main();
