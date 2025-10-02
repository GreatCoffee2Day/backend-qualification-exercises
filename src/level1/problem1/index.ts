export type Value = string | number | boolean | null | undefined |
  Date | Buffer | Map<unknown, unknown> | Set<unknown> |
  Array<Value> | { [key: string]: Value };


/**
 * Transforms JavaScript scalars and objects into JSON
 * compatible objects.
 */

export function serialize(value: Value): unknown {
  if (
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (value instanceof Date) {
    return { __t: "Date", __v: value.getTime() };
  }

  if (typeof Buffer !== "undefined" && Buffer.isBuffer(value)) {
    return { __t: "Buffer", __v: Array.from(value) };
  }

  if (value instanceof Set) {
    return { __t: "Set", __v: [...value].map(serialize) };
  }

  if (value instanceof Map) {
    return {
      __t: "Map",
      __v: [...value.entries()].map(([k, v]) => [serialize(k as Value), serialize(v as Value)]),
    };
  }

  if (Array.isArray(value)) {
    return value.map(serialize);
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, serialize(v as Value)])
    );
  }

  return value;
}

/**
 * Converts JSON-compatible objects back into JavaScript values.
 */

export function deserialize<T = unknown>(value: unknown): T {
  if (
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value as T;
  }

  if (Array.isArray(value)) {
    return value.map(deserialize) as T;
  }

  if (typeof value === "object" && value !== null) {
    if ("__t" in value) {
      const { __t, __v } = value as any;
      
      if (__t === "Date") return new Date(__v) as T;
      if (__t === "Buffer") return Buffer.from(__v) as T;
      if (__t === "Set") return new Set(__v.map(deserialize)) as T;
      if (__t === "Map") {
        return new Map(__v.map(([k, v]: any) => [deserialize(k), deserialize(v)])) as T;
      }
    }

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, deserialize(v)])
    ) as T;
  }

  return value as T;
}