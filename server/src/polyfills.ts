import { fetch, Headers, Request, Response, FormData } from 'undici';

/** Node 16 does not ship global fetch; required by @google/generative-ai */
if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = fetch as unknown as typeof globalThis.fetch;
  globalThis.Headers = Headers as unknown as typeof globalThis.Headers;
  globalThis.Request = Request as unknown as typeof globalThis.Request;
  globalThis.Response = Response as unknown as typeof globalThis.Response;
}

if (typeof globalThis.FormData === 'undefined') {
  globalThis.FormData = FormData as unknown as typeof globalThis.FormData;
}
