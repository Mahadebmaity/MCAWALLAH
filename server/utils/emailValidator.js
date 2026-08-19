import dns from 'dns';

/**
 * Validates email format and verifies that the email domain actually exists and can receive mail.
 * Performs fast lookup for common email providers and DNS MX/A record verification for other domains.
 */
export const checkEmailExists = async (email) => {
    if (!email || typeof email !== 'string') {
        return { valid: false, message: 'Email address is required.' };
    }

    const normalized = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
        return { valid: false, message: 'Please provide a valid email format (e.g. name@example.com).' };
    }

    const domain = normalized.split('@')[1];
    if (!domain || domain.length < 3 || !domain.includes('.')) {
        return { valid: false, message: 'Invalid email domain.' };
    }

    // Common standard email domains are verified immediately
    const knownValidDomains = new Set([
        'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.in', 'yahoo.co.uk',
        'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
        'icloud.com', 'me.com', 'mac.com',
        'aol.com', 'zoho.com', 'proton.me', 'protonmail.com',
        'mail.com', 'gmx.com', 'yandex.com'
    ]);

    if (knownValidDomains.has(domain)) {
        return { valid: true, email: normalized, domain };
    }

    // Perform DNS MX record lookup for custom / other domains
    try {
        const mxPromise = dns.promises.resolveMx(domain);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('DNS_TIMEOUT')), 3000));

        const mxRecords = await Promise.race([mxPromise, timeoutPromise]);
        if (mxRecords && mxRecords.length > 0) {
            return { valid: true, email: normalized, domain };
        }
    } catch {
        // Fallback: Check if domain has active A records
        try {
            const aRecords = await dns.promises.resolve(domain);
            if (aRecords && aRecords.length > 0) {
                return { valid: true, email: normalized, domain };
            }
        } catch {
            return {
                valid: false,
                message: `The email domain "@${domain}" does not exist or has no active mail servers. Please provide a real email address.`
            };
        }
    }

    return {
        valid: false,
        message: `The email domain "@${domain}" does not appear to have active mail servers.`
    };
};
