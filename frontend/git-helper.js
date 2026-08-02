const git = require('./node_modules/isomorphic-git');
const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '..');

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

    console.log('Repository initialized, staged, and committed successfully!');
  } catch (err) {
    console.error('Git helper error:', err);
  }
}

main();
