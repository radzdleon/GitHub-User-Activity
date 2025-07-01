const https = require('https');

function fetchGitHubActivity(username) {
  const url = `https://api.github.com/users/${username}/events`;

  const options = {
    headers: {
      'User-Agent': 'node.js', // GitHub requires this header
    },
  };

  https.get(url, options, (res) => {
    let data = '';

    res.on('data', chunk => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode !== 200) {
        console.log(`Error: HTTP ${res.statusCode}`);
        return;
      }

      try {
        const events = JSON.parse(data);

        if (events.length === 0) {
          console.log(`No recent activity for ${username}`);
          return;
        }

        for (let event of events) {
          const repo = event.repo.name;
          const type = event.type;

          switch (type) {
            case 'PushEvent':
              const commits = event.payload.commits.length;
              console.log(`- Pushed ${commits} commit(s) to ${repo}`);
              break;
            case 'IssuesEvent':
              const action = event.payload.action;
              console.log(`- ${capitalize(action)} an issue in ${repo}`);
              break;
            case 'WatchEvent':
              console.log(`- Starred ${repo}`);
              break;
            case 'ForkEvent':
              console.log(`- Forked ${repo}`);
              break;
            case 'PullRequestEvent':
              const prAction = event.payload.action;
              console.log(`- ${capitalize(prAction)} a pull request in ${repo}`);
              break;
            default:
              console.log(`- ${type} in ${repo}`);
          }
        }
      } catch (err) {
        console.log('Error parsing JSON:', err.message);
      }
    });
  }).on('error', err => {
    console.log('Request failed:', err.message);
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Get username from CLI
const args = process.argv.slice(2);

if (args.length !== 1) {
  console.log('Usage: node github-activity.js <username>');
} else {
  fetchGitHubActivity(args[0]);
} 
