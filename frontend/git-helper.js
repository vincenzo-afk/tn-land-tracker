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

    let currentBranch = 'master';
    try {
      currentBranch = (await git.currentBranch({ fs, dir })) || 'master';
    } catch (e) {}

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
      message: 'Complete TN Land Tracker project (Frontend, Backend, Supabase, Leaflet, Scrapers)',
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
      try {
        const pushResult = await git.push({
          fs,
          http,
          dir,
          remote: 'origin',
          ref: currentBranch,
          remoteRef: 'main',
          force: true,
          onAuth: () => ({ username: token, password: '' }),
        });
        console.log('Push result successfully finished:', JSON.stringify(pushResult));
      } catch (err1) {
        console.log('Auth attempt 1 failed:', err1.message || err1);
        const pushResult = await git.push({
          fs,
          http,
          dir,
          remote: 'origin',
          ref: currentBranch,
          remoteRef: 'main',
          force: true,
          onAuth: () => ({ username: 'x-access-token', password: token }),
        });
        console.log('Push result successfully finished:', JSON.stringify(pushResult));
      }
    } else {
      console.log('Git repo staged and committed locally!');
    }
  } catch (err) {
    console.error('Git helper error:', err.message || err);
  }
}

main();
