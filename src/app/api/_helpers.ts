import { NextRequest, NextResponse } from "next/server";


/** Standard JSON response helpers */
export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Parse pagination params from query string */
export function parsePagination(req: NextRequest) {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10)));
  return { page, limit, skip: (page - 1) * limit };
}

/** Parse a specific search param */
export function param(req: NextRequest, key: string): string | null {
  return new URL(req.url).searchParams.get(key);
}

/** Convert a MongoDB document to a plain serializable object */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serialize(doc: any) {
  if (!doc) return doc;
  // For MongoDB driver documents, just ensure id is set and remove _id
  const obj = doc;
  if (doc._id && !doc.id) {
    obj.id = doc._id.toString();
  }
  delete obj._id;
  return obj;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeMany(docs: any[]) {
  return docs.map(serialize);
}
