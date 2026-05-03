export const formatCurrency = (amount, locale = "vi-VN", currency = "VND") => {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount || 0);
};

export const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export const formatShortDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};
