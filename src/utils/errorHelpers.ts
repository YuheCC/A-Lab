export type ResponseError = Error & { status?: number; response?: Response };

const formatErrorDetail = (input: unknown): string | null => {
    if (input == null) return null;
    if (typeof input === 'string') return input;
    if (Array.isArray(input)) {
        const parts = input
            .map((item) => formatErrorDetail(item))
            .filter((value): value is string => Boolean(value));
        return parts.length > 0 ? parts.join(', ') : null;
    }
    if (typeof input === 'object') {
        const candidate = input as Record<string, unknown>;
        const messageFields = ['detail', 'message', 'msg', 'error'];
        for (const field of messageFields) {
            const value = candidate[field];
            if (typeof value === 'string') {
                return value;
            }
        }
        try {
            return JSON.stringify(input);
        } catch {
            return String(input);
        }
    }
    return String(input);
};

export const extractErrorMessage = async (
    response: Response,
    fallbackMessage: string
): Promise<string> => {
    if (response.status === 400) {
        try {
            const data = await response.clone().json();
            const detailMessage =
                formatErrorDetail(data?.detail) ??
                formatErrorDetail(data?.error) ??
                formatErrorDetail(data?.message);
            if (detailMessage?.trim()) {
                return detailMessage.trim();
            }
        } catch (parseError) {
            try {
                const fallbackText = (await response.clone().text()).trim();
                if (fallbackText) {
                    return fallbackText;
                }
            } catch (textError) {
                console.warn('Failed to parse response text when handling 400 error', textError);
            }
            console.warn('Failed to parse 400 response JSON payload', parseError);
        }
    }
    return fallbackMessage;
};

export const raiseResponseError = async (
    response: Response,
    fallbackMessage: string
): Promise<never> => {
    const message = await extractErrorMessage(response, fallbackMessage);
    const error = new Error(message) as ResponseError;
    error.status = response.status;
    error.response = response;
    throw error;
};

