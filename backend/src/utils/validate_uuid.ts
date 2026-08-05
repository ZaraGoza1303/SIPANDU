const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isValidUUID = (value: string | undefined | null): boolean => {
    if (!value) return false;
    return UUID_REGEX.test(value);
};
