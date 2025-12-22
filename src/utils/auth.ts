export async function hashBeadPattern(pattern: number[]): Promise<string> {
    // Convert pattern array to string, e.g., [5] -> "5" or [1,2] -> "1-2"
    const patternString = pattern.join('-');
    const encoder = new TextEncoder();
    const data = encoder.encode(patternString);

    // Hash using Web Crypto API (SHA-256)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert buffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
}

export async function validateBeadPass(input: number[], storedHash: string): Promise<boolean> {
    const inputHash = await hashBeadPattern(input);
    return inputHash === storedHash;
}
