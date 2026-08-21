const notFound = (req, res, next) => {
    const error = new Error(`Not Found ${req.originalUrl}`);
    res.status(404);
    next(error);
};
const errorHandler = (err, req, res, next) => {
    if (err.name === "CastError") {
        return res.status(400).json({ message: `Invalid ${err.path || "ID format"}: ${err.value}` });
    }
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    return res.status(statusCode).json({ message: err.message });
};
export { notFound, errorHandler };
//# sourceMappingURL=errors.js.map