module.exports = function(app, jwt, MongoClient, setup) {
	
return {

    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('login.html');

    },
    ensureAuthorized: function(req, res, next) {
        var bearerToken;
        var bearerHeader = req.headers["authorization"];
        console.log("TOKEN AUTH :" + bearerHeader)
        if (typeof bearerHeader !== 'undefined') {
            var bearer = bearerHeader.split(" ");
            bearerToken = bearer[1];

            // verifies setup.setup.secret and checks exp
            jwt.verify(bearerToken, setup.secret, function(err, decoded) {
                if (err) {
                    //return res.json({ success: false, message: 'Failed to authenticate token.' });
                    res.send(403);
                } else {
                    // if everything is good, save to request for use in other routes
                    req.token = bearerToken;
                    next();
                }
            });


        } else {
            res.send(403);
        }

    },
    getUserFromToken: function(req) {
        var bearerHeader = req.headers["authorization"];
        if (typeof bearerHeader !== 'undefined') {
            var bearer = bearerHeader.split(" ");
            var bearerToken = bearer[1];

            var user = jwt.decode(bearerToken, setup.secret);
            return user;
        } else {
            return null;
        }
    },
	getUserByToken: function(token) {

        var bearerToken = token;
        var user = jwt.decode(bearerToken, setup.secret);
        return user;

    }
  }
}