import postgres from "postgres";

declare global {
  // eslint-disable-next-line no-var
  var __sql: postgres.Sql | undefined;
}

export function getSql(): postgres.Sql {
  if (!global.__sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL nu este setat");
    global.__sql = postgres(url, {
      ssl: "require",
      max: 5,
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 15,
    });
  }
  return global.__sql;
}
