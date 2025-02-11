import { randomSeed } from 'k6';

import * as oai from './helpers/openaiGeneric.js';
import { any, sequenceScenarios } from './helpers/utils.js';
import { fimCompletion } from './payloads/completions.js';

const prefixes = [
  '//',
  '#',
  '/*',
  'def',
  'class',
  'function',
  '--',
  'import',
]

const testUrl = __ENV.TEST_URL;
const model = __ENV.MODEL;
const scenarioValues = __ENV.SCENARIO_VALUES
    ? __ENV.SCENARIO_VALUES.split(',').map(Number)
    : [];
// In seconds
const duration = __ENV.DURATION;
const stream = __ENV.STREAM==='true';
const headers = __ENV.HEADERS;

const config = {
  prefix: any(prefixes),
  // Should be an array of OpenAI-compatible clients
  clients: [
    oai.createClient({
      url: testUrl,
      options: {
        model: model,
      },
    }),
  ],
}


const scenario = (i, vus) => ({
  [`client_${i}_${vus}vu`]: {
    executor: 'constant-vus',
    vus,
    env: { clientIndex: i.toString() }
  }
})

// For every client - run a few stages
// with various concurrency
export const options = {
  scenarios: sequenceScenarios({
    ...config.clients.reduce((scenarios, _, i) => {
      // Use the scenarioValues array to dynamically generate scenarios
      scenarioValues.forEach(value => {
        scenarios = {
          ...scenarios,
          ...scenario(i, value),
        };
      });
      return scenarios;
    }, {})
  }, duration)
};

let counter = 0;
export default function run() {
  randomSeed(counter++);

  const client = config.clients[0];
  const payload = fimCompletion({
    prefix: config.prefix,
    stream: stream
  });

  const response = client.chatComplete(payload, {headers: JSON.parse(headers)});
  const content = oai.getContent(response);

  config.prefix += content;
  if (content === '') {
    config.prefix = any(prefixes);
  }
}