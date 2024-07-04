export interface Address {
  host: string | null;
  port: number | null;
}

export const parseAddress = (addr: string): Address => {
  const split = addr.split(":");

  const host = split[0] || null;
  const p = split[1] || null;

  const port = p ? parseInt(p, 10) : null;
  return { host, port };
};
