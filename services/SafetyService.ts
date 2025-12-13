// Cloudflare Family DNS (Malware + Porn Block)
const DOH_ENDPOINT = 'https://family.cloudflare-dns.com/dns-query';

export const SafetyService = {
    checkUrl: async (url: string): Promise<boolean> => {
        try {
            if (!url) return true;

            const urlObj = new URL(url);
            const hostname = urlObj.hostname.toLowerCase();

            // Local fallback for obvious keywords strictly to avoid latency if possible, 
            // but DNS is the source of truth.
            if (hostname.includes('porn') || hostname.includes('xxx')) return false;

            // DNS-over-HTTPS Check
            const response = await fetch(`${DOH_ENDPOINT}?name=${hostname}&type=A`, {
                headers: {
                    'Accept': 'application/dns-json',
                }
            });

            if (!response.ok) {
                // If DNS fails, we default to SAFE or UNSAFE? 
                // "Fail Open" (Allow) is better for UX, "Fail Closed" (Block) is better for strictness.
                // Let's Fail Open but log warning.
                console.warn('SafetyService: DNS request failed', response.status);
                return true;
            }

            const data = await response.json();

            // Cloudflare Family resolves blocked sites to 0.0.0.0
            // Status: 0 (NOERROR) usually returns Answer with 0.0.0.0 
            // or Status: 3 (NXDOMAIN) if strict

            if (data.Answer) {
                const isBlocked = data.Answer.some((record: any) => record.data === '0.0.0.0' || record.data === '::');
                if (isBlocked) {
                    return false;
                }
            }

            return true;
        } catch (e) {
            console.warn('SafetyService: Error checking URL', e);
            return true;
        }
    }
};
