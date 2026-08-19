const { validateToken } = require("../services/auth");
const User = require("../models/user");

function checkForAuthenticationCookie(cookieName) {
  return async (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) {
      return next();
    }

    try {
      const userPayload = validateToken(tokenCookieValue);
      const user = await User.findById(userPayload._id).select(
        "_id email fullName profileImageUrl role",
      );
      req.user = user || undefined;
    } catch (error) {
      console.log(error);
    }
    next();
  };
}

module.exports = {
    checkForAuthenticationCookie
}