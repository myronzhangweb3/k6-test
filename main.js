import http from 'k6/http';
import { check } from 'k6';

const testUrl = 'https://airdrop-api.lumoz.org/api/airdrop/evm_total_airdrop?address=0xebb2AB9FE2A0B4808f3CCC3542e883c74Cf9a346';

export let options = {
  stages: [
    { duration: '5s', target: 10000 }, // ramp up to 100 users
    { duration: '10s', target: 10000 },  // stay at 100 users for 1 minute
    { duration: '5s', target: 0 },  // ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
  }
};

export default function () {
  let res = http.get(testUrl);

  check(res, { 'status was 200': (r) => r.status == 200 });
}

export function handleSummary(data) {
  console.log(`p(95): ${data.metrics.http_req_duration.values['p(95)']}ms`);
  console.log("QPS:", data.metrics.http_reqs.values.rate);
  console.log("通过率:", data.metrics.checks.values.rate);
  console.log("失败率:", data.metrics.http_req_failed.values.rate);
  console.log("最大虚拟用户数:", data.metrics.vus_max.values.max);

  const url = 'https://open.larksuite.com/open-apis/bot/v2/hook/75a79fe7-2d36-48fe-8630-71414f5a0bcc';
  const payload = JSON.stringify({
    msg_type: "text",
    content: {
      text: `Summary:\nTime: ${new Date().toISOString().replace('T', ' ').replace(/\..+/, '')}\nURL: ${testUrl}\np(95): ${data.metrics.http_req_duration.values['p(95)']}ms\nQPS: ${data.metrics.http_reqs.values.rate}\n通过率: ${data.metrics.checks.values.rate}\n失败率: ${data.metrics.http_req_failed.values.rate}\n最大虚拟用户数: ${data.metrics.vus_max.values.max}\nStages: ${JSON.stringify(options.stages)}`
    }
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  http.post(url, payload, params);
}