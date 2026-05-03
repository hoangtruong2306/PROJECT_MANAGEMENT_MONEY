module.exports = async (req, res, next) => {
    try {
        if (!req.userId || req.role !== "admin") {
            return res.status(403).json({ message: "Forbidden: Admins only" });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
