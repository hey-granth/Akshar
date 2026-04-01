const realtimeHttpBase = process.env.NEXT_PUBLIC_REALTIME_HTTP_URL ?? "http://localhost:4001";
const realtimeWsBase = process.env.NEXT_PUBLIC_REALTIME_WS_URL ?? "ws://localhost:4002";

export function getRealtimeHttpBase(): string {
  return realtimeHttpBase;
}

export function getRealtimeWsBase(): string {
  return realtimeWsBase;
}

export async function postAgentAction(path: string, payload: object): Promise<Response> {
  return fetch(`${realtimeHttpBase}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}
