import axios from 'axios'
import WechatError from './error'

export interface RemoteFetchOptions {
  timeoutMs?: number;
  maxBytes?: number;
  allowPrivateIp?: boolean;
  allowedHosts?: string[];
}

const DEFAULT_TIMEOUT_MS = 30_000
const DEFAULT_MAX_BYTES = 10 * 1024 * 1024

function isBlockedHostname (hostname: string): boolean {
  const host = hostname.toLowerCase()
  if (host === 'localhost' || host.endsWith('.localhost')) {
    return true
  }
  if (host === '0.0.0.0' || host === '::1') {
    return true
  }
  if (/^127\./.test(host)) {
    return true
  }
  if (/^10\./.test(host)) {
    return true
  }
  if (/^192\.168\./.test(host)) {
    return true
  }
  if (/^169\.254\./.test(host)) {
    return true
  }
  const parts = host.split('.').map(Number)
  if (parts.length === 4 && parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
    return true
  }
  return false
}

export function assertRemoteUrlAllowed (
  rawUrl: string,
  options: RemoteFetchOptions = {}
): URL {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    throw new WechatError(`Invalid remote URL: ${rawUrl}`)
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new WechatError(`Remote URL must use http or https: ${rawUrl}`)
  }

  if (options.allowedHosts?.length) {
    const allowed = options.allowedHosts.map((h) => h.toLowerCase())
    if (!allowed.includes(parsed.hostname.toLowerCase())) {
      throw new WechatError(`Remote host is not allowed: ${parsed.hostname}`)
    }
  }

  if (!options.allowPrivateIp && isBlockedHostname(parsed.hostname)) {
    throw new WechatError(`Remote host is not allowed: ${parsed.hostname}`)
  }

  return parsed
}

export async function fetchRemoteBuffer (
  rawUrl: string,
  options: RemoteFetchOptions = {}
): Promise<{
  buffer: Buffer;
  headers: Record<string, string | string[] | undefined>;
}> {
  const parsed = assertRemoteUrlAllowed(rawUrl, options)
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES

  const { data, headers } = await axios({
    url: parsed.toString(),
    responseType: 'arraybuffer',
    timeout: timeoutMs,
    maxContentLength: maxBytes,
    maxBodyLength: maxBytes
  })

  return {
    buffer: Buffer.from(data),
    headers: headers as Record<string, string | string[] | undefined>
  }
}
