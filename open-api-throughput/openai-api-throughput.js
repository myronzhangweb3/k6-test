import {randomSeed} from 'k6';

import * as oai from './helpers/openaiGeneric.js';
import {any, sequenceScenarios} from './helpers/utils.js';
import {fimCompletion} from './payloads/completions.js';
import http from 'k6/http';

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

const larkUrl = __ENV.LARK_URL;
const testUrl = __ENV.TEST_URL;
const model = __ENV.MODEL;
const scenarioValues = __ENV.SCENARIO_VALUES
    ? __ENV.SCENARIO_VALUES.split(',').map(Number)
    : [];
// In seconds
const duration = __ENV.DURATION;
const stream = __ENV.STREAM === 'true';
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
        env: {clientIndex: i.toString()}
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

export function handleSummary(data) {
    console.log(`p(95): ${data.metrics.http_req_duration.values['p(95)']}ms`);
    console.log("QPS:", data.metrics.http_reqs.values.rate);
    console.log("通过率:", data.metrics.checks.values.rate);
    console.log("失败率:", data.metrics.http_req_failed.values.rate);
    console.log("最大虚拟用户数:", data.metrics.vus_max.values.max);

    const payload = JSON.stringify({
        msg_type: "text",
        content: {
            text: `LLM Test Summary:\nTime: ${new Date().toISOString().replace('T', ' ').replace(/\..+/, '')}\nURL: ${testUrl}\nModel: ${model}\np(95): ${data.metrics.http_req_duration.values['p(95)']}ms\nQPS: ${data.metrics.http_reqs.values.rate}\n通过率: ${data.metrics.checks.values.rate}\n失败率: ${data.metrics.http_req_failed.values.rate}\n最大虚拟用户数: ${data.metrics.vus_max.values.max}\nDuration: ${JSON.stringify(duration)}`
        }
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    http.post(larkUrl, payload, params);
}