import http from 'k6/http';
import { check } from 'k6';

if (!__ENV.TEST_URL) {
  throw new Error('TEST_URL is not set');
}
if (!__ENV.STAGES) {
  throw new Error('STAGES is not set');
}
if (!__ENV.METHOD) {
  throw new Error('METHOD is not set'); 
}
if (__ENV.METHOD === 'POST' && !__ENV.PAYLOAD) {
  throw new Error('PAYLOAD is required for POST method');
}
if (!__ENV.LARK_URL) {
  throw new Error('LARK_URL is not set');
}

const testUrl = __ENV.TEST_URL;
const method = __ENV.METHOD.toUpperCase();
const larkUrl = __ENV.LARK_URL;
const headers = __ENV.HEADERS;

export let options = {
  stages: JSON.parse(__ENV.STAGES),
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
  }
};

export default function () {
  let res;
  if (method === 'GET') {
    res = http.get(testUrl);
  } else if (method === 'POST') {
    const params = {
      headers: JSON.parse(headers),
    };
    res = http.post(testUrl, JSON.parse(__ENV.PAYLOAD), params);
  }

  check(res, { 'status was 200': (r) => r.status == 200 });
}

export function handleSummary(data) {
  console.log(`p(95): ${data.metrics.http_req_duration.values['p(95)']}ms`);
  console.log("QPS:", data.metrics.http_reqs.values.rate);
  console.log("通过率:", data.metrics.checks.values.rate);
  console.log("失败率:", data.metrics.http_req_failed.values.rate);
  console.log("最大虚拟用户数:", data.metrics.vus_max.values.max);

  const requestInfo = method === 'POST' ? 
    `\nRequest Payload: ${__ENV.PAYLOAD}` :
    '';

  const payload = JSON.stringify({
    msg_type: "text",
    content: {
      text: `Summary:\nTime: ${new Date().toISOString().replace('T', ' ').replace(/\..+/, '')}\nURL: ${testUrl}\nMethod: ${method}${requestInfo}\np(95): ${data.metrics.http_req_duration.values['p(95)']}ms\nQPS: ${data.metrics.http_reqs.values.rate}\n通过率: ${data.metrics.checks.values.rate}\n失败率: ${data.metrics.http_req_failed.values.rate}\n最大虚拟用户数: ${data.metrics.vus_max.values.max}\nStages: ${JSON.stringify(options.stages)}`
    }
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  http.post(larkUrl, payload, params);
}