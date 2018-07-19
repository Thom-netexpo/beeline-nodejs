/* eslint-env node, jest */
const http = require("http"),
  instrumentHttp = require("./http"),
  schema = require("../schema"),
  tracker = require("../async_tracker"),
  event = require("../event_api");

function newMockContext() {
  return { id: 0, spanId: 50000, stack: [] };
}

instrumentHttp(http);

let server;
beforeAll(() => {
  server = http.createServer((req, res) => {
    res.end();
  });

  server.listen(9009, "localhost");
});

afterAll(() => {
  server.close();
  server = null;
});

beforeEach(() => {
  event.configure({ api: "mock" });
});
afterEach(() => {
  event._resetForTesting();
});

test("url as a string", done => {
  tracker.setTracked(newMockContext());

  http.get("http://localhost:9009", _res => {
    expect(event._apiForTesting().sentEvents).toMatchObject([
      {
        [schema.EVENT_TYPE]: "http",
        [schema.TRACE_SPAN_NAME]: "GET",
        url: "http://localhost:9009/",
      },
    ]);
    done();
  });
});

test("url as options", done => {
  tracker.setTracked(newMockContext());

  http.get(
    {
      hostname: "localhost",
      port: 9009,
    },
    _res => {
      expect(event._apiForTesting().sentEvents).toEqual([
        expect.objectContaining({
          [schema.EVENT_TYPE]: "http",
          name: "GET",
          url: "http://localhost:9009/",
        }),
      ]);
      done();
    }
  );
});