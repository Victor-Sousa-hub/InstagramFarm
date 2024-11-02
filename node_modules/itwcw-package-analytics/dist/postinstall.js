const jetpack = require('fs-jetpack');
const fetch = require('wonderful-fetch');
const path = require('path');

// const argv = require('yargs').argv;

module.exports = async function (options) {
  // Set the options
  options = options || {};
  options.cwd = options.cwd || process.cwd();
  options.npmPackageName = options.npmPackageName || '';
  options.isPostInstall = typeof options.isPostInstall === 'undefined' ? false : options.isPostInstall;

  // Get the package.json files
  const thisPackageJSON = require('../package.json');
  const theirPackageJSON = require(path.join(options.cwd, 'package.json'));

  // Send analytics
  await sendAnalytics(thisPackageJSON, theirPackageJSON)
  .then((r) => {
    console.log(`[itwcw-package-analytics]: Sent analytics code=${r.status}`);
  })
  .catch(e => {
    console.log(`[itwcw-package-analytics]: Failed to send analytics`, e);
  });
}

// Send analytics
function sendAnalytics(thisPackageJSON, theirPackageJSON) {
  return new Promise(async function(resolve, reject) {
    const uuidv5 = require('uuid').v5;
    const os = require('os');
    const userInfo = os.userInfo();

    // Build url and body
    const analyticsId = 'G-9YP4NNBLY3';
    const analyticsSecret = 'w3Z2tfucR9KFPB8it5WkyQ';
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${analyticsId}&api_secret=${analyticsSecret}`;
    const mac = getDeviceUniqueId();
    const uuid = uuidv5(mac, '4caf995a-3d43-451b-b34d-e535d2663bc1');
    const simpleOS = getSimpleOS(os.platform());
    const name = (theirPackageJSON.name || 'unknown')
      // Replace anything not a letter, number, or underscore with an underscore
      .replace(/[^a-zA-Z0-9_]/g, '_')
      // Remove leading and trailing underscores
      .replace(/^_+|_+$/g, '')
      // Remove multiple underscores
      .replace(/_+/g, '_');

    // Build body
    const body = {
      client_id: uuid,
      user_id: uuid,
      // timestamp_micros: new Date().getTime() * 1000,
      user_properties: {
        // operating_system: simpleOS, // CAUSES EVENT TO NOT BE SENT
      },
      user_data: {
      },
      // consent: {},
      // non_personalized_ads: false,
      events: [{
        name: name,
        params: {
          packageName: theirPackageJSON.name,
          packageVersion: theirPackageJSON.version,
          preparePackageVersion: thisPackageJSON.version,
          os: simpleOS,
          platform: os.platform(),
          arch: os.arch(),
          release: os.release(),
          hostname: os.hostname(),
          cpus: os.cpus().length,
          memory: os.totalmem(),
          uptime: os.uptime(),
          username: userInfo.username,
          homedir: userInfo.homedir,
          shell: userInfo.shell,
          uid: userInfo.uid,
          gid: userInfo.gid,
        },
      }],
    }

    // Get the user's location
    const geolocationCachePath = path.resolve(os.tmpdir(), 'itwcw-package-analytics-geolocation-cache.json');
    const geolocation = await fetch('https://ipapi.co/json/', {
      response: 'json',
      tries: 2,
      timeout: 30000,
    })
    .then((r) => {
      // Save to tmpdir
      jetpack.write(geolocationCachePath, JSON.stringify(r, null, 2));

      return r;
    })
    .catch((e) => {
      console.log(`[itwcw-package-analytics]: Failed to get geolocation`, e.message);

      // Try to get from cache
      if (jetpack.exists(geolocationCachePath)) {
        console.log(`[itwcw-package-analytics]: Used cached geolocation`);

        return JSON.parse(jetpack.read(geolocationCachePath));
      }
    });

    // Add the geolocation to the body
    if (geolocation) {
      body.user_data.city = geolocation.city || 'Unknown';
      body.user_data.region = geolocation.region || 'Unknown';
      body.user_data.country = geolocation.country || 'Unknown';

      body.user_properties.language = (geolocation.languages || 'Unknown').split(',')[0];
    }

    // Log the options
    // console.log(`[itwcw-package-analytics]: Sending analytics mac=${mac}, uuid=${uuid}...`, body, body.events[0].params);
    console.log(`[itwcw-package-analytics]: Sending analytics mac=${mac}, uuid=${uuid}...`);

    // Send event
    fetch(url, {
      method: 'post',
      response: 'raw',
      tries: 2,
      timeout: 30000,
      body: body,
    })
    .then((r) => {
      resolve(r);
    })
    .catch((e) => {
      reject(e);
    });
  });
}

const getDeviceUniqueId = () => {
  const os = require('os');
  const interfaces = os.networkInterfaces();

  // Find the first valid MAC address
  for (const name in interfaces) {
    for (const net of interfaces[name]) {
      if (!net.internal && net.mac && net.mac !== '00:00:00:00:00:00') {
        return net.mac;
      }
    }
  }

  // Log
  console.warn('No valid MAC address found. Generating a random MAC address.');

  // Generate a random MAC address
  const hexDigits = '0123456789ABCDEF';
  let mac = '';
  for (let i = 0; i < 6; i++) {
    let byte = '';
    for (let j = 0; j < 2; j++) {
      byte += hexDigits.charAt(Math.floor(Math.random() * 16));
    }
    mac += byte;
    if (i !== 5) mac += ':';
  }
  return mac;
};

const getSimpleOS = (platform) => {
  switch (platform) {
    case 'darwin':
      return 'mac';
    case 'win32':
      return 'windows';
    case 'linux':
      return 'linux';
    default:
      return platform;
  }
};

