import { NextRequest } from "next/server";


export default function createNextRequest(body: any) {
  return {
    headers: { get: (_key: string) => null },
    json: async () => body,
  } as unknown as NextRequest;
}