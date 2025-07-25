module.exports = (err, req, res, next) => {
  console.error("ERROR:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    status: false,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
