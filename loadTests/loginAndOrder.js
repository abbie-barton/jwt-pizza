import { sleep, check, fail, group } from 'k6'
import http from 'k6/http'
import jsonpath from 'https://jslib.k6.io/jsonpath/1.0.2/index.js'
import tempo from 'https://jslib.k6.io/http-instrumentation-tempo/1.0.0/index.js'
import pyroscope from 'https://jslib.k6.io/http-instrumentation-pyroscope/1.0.1/index.js'

export const options = {
  cloud: {
    distribution: { 'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 100 } },
    apm: [],
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: 'ramping-vus',
      gracefulStop: '30s',
      stages: [
        { target: 5, duration: '30s' },
        { target: 15, duration: '1m' },
        { target: 10, duration: '30s' },
        { target: 0, duration: '30s' },
      ],
      gracefulRampDown: '30s',
      exec: 'scenario_1',
    },
  },
}

tempo.instrumentHTTP({ propagator: 'w3c' })
pyroscope.instrumentHTTP()

const commonHeaders = {
  accept: '*/*',
  'accept-encoding': 'gzip, deflate, br, zstd',
  'accept-language': 'en-US,en;q=0.9',
  'content-type': 'application/json',
  origin: 'https://pizza.abbiebarton.click',
  priority: 'u=1, i',
  'sec-ch-ua': '"Not-A.Brand";v="99", "Google Chrome";v="157", "Chromium";v="157"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-site',
}

export function scenario_1() {
  let response
  const vars = {}

  // Login
  response = http.put(
    'https://pizza-service.abbiebarton.click/api/auth',
    '{"email":"d@jwt.com","password":"diner"}',
    { headers: commonHeaders }
  )
  if (!check(response, { 'status equals 200': (r) => r.status.toString() === '200' })) {
    console.log(response.body)
    fail('Login was *not* 200')
  }
  vars['token'] = jsonpath.query(response.json(), '$.token')[0]

  const authHeaders = { ...commonHeaders, authorization: `Bearer ${vars['token']}` }

  sleep(8.8)

  // get menu
  response = http.get('https://pizza-service.abbiebarton.click/api/order/menu', { headers: authHeaders })

  // get franchise
  response = http.get(
    'https://pizza-service.abbiebarton.click/api/franchise?page=0&limit=20&name=*',
    { headers: authHeaders }
  )
  sleep(5.5)

  // get user details
  response = http.get('https://pizza-service.abbiebarton.click/api/user/me', { headers: authHeaders })
  sleep(1)

  // create order
  response = http.post(
    'https://pizza-service.abbiebarton.click/api/order',
    '{"items":[{"menuId":2,"description":"Pepperoni","price":0.0042}],"storeId":"1","franchiseId":1}',
    { headers: authHeaders }
  )
  if (!check(response, { 'purchase status equals 200': (r) => r.status.toString() === '200' })) {
    console.log(response.body)
    fail('Purchase was *not* 200')
  }
  vars['pizzaJwt'] = jsonpath.query(response.json(), '$.jwt')[0]

  sleep(6.5)

  // verify order — uses the JWT returned by the purchase
  response = http.post(
    'https://pizza-factory.cs329.click/api/order/verify',
    JSON.stringify({ jwt: vars['pizzaJwt'] }),
    { headers: authHeaders } // TODO: confirm the verify request headers match your original recording
  )
}
