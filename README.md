# k6 Test

## Env
```
cp .env.example .env
```

## Docker

### Web API
```
docker-compose up k6-api-test --build
```

### LLM
> 参考：https://github.com/av/harbor/blob/v0.2.27/k6/scripts/openai-api-throughput.js
```
docker-compose up k6-llm-test --build
```

# 指标

| 指标名称                  | 说明                                                                                   |
|---------------------------|----------------------------------------------------------------------------------------|
| checks                    | 100.00% 960 out of 960 - 所有检查都通过了，没有失败的检查。                             |
| data_received             | 1.2 MB  167 kB/s - 接收到的数据总量和平均接收速度。                                     |
| data_sent                 | 104 kB  15 kB/s - 发送的数据总量和平均发送速度。                                       |
| http_req_blocked          | avg=212.07ms, min=0s, med=1µs, max=3.51s, p(90)=676.53ms, p(95)=2.05s - 请求阻塞时间。 |
| http_req_connecting       | avg=52.93µs, min=0s, med=0s, max=1.08ms, p(90)=250.4µs, p(95)=545.14µs - 连接时间。    |
| http_req_duration         | avg=216.5ms, min=176.18ms, med=200.57ms, max=498.82ms, p(90)=271.16ms, p(95)=279.58ms - 请求持续时间。 |
| http_req_failed           | 0.00%   0 out of 960 - 没有失败的请求。                                                |
| http_req_receiving        | avg=183.27µs, min=8µs, med=78µs, max=8.15ms, p(90)=315.1µs, p(95)=650.79µs - 接收时间。|
| http_req_sending          | avg=92.89µs, min=7µs, med=73µs, max=4.58ms, p(90)=136.1µs, p(95)=183.09µs - 发送时间。|
| http_req_tls_handshaking  | avg=211.94ms, min=0s, med=0s, max=3.51s, p(90)=675.3ms, p(95)=2.05s - TLS 握手时间。  |
| http_req_waiting          | avg=216.22ms, min=176.07ms, med=200.24ms, max=498.69ms, p(90)=271.12ms, p(95)=279.53ms - 等待时间。 |
| http_reqs                 | 960     134.703662/s - 总请求数和每秒请求数。                                          |
| iteration_duration        | avg=428.86ms, min=176.31ms, med=200.75ms, max=4s, p(90)=952.98ms, p(95)=2.33s - 迭代持续时间。 |
| iterations                | 960     134.703662/s - 总迭代数和每秒迭代数。                                          |
| vus                       | 6       min=6          max=100 - 当前活动的虚拟用户数。                                |
| vus_max                   | 100     min=100        max=100 - 最大虚拟用户数。                                      |
