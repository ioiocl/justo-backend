module.exports = function(app, jwt, MongoClient, util, setup, passport) {

    app.get('/policy', function(req, res) {
		console.log('LIFE')
        res.redirect('policy.html');
    });

    app.get('/auth/facebook',
        passport.authenticate('facebook'),
        function(req, res) {

        });


    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            failureRedirect: '/login.html'
        }),
        function(req, res) {
			console.log("Llamando al redirect")
            res.redirect('/account/fb');
        });

    app.get('/auth/twitter',
        passport.authenticate('twitter'),
        function(req, res) {

        });

    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            failureRedirect: '/login.html'
        }),
        function(req, res) {
            res.redirect('/account/tw');
        });

	    app.get('/auth/goog',
        passport.authenticate('google'),
        function(req, res) {

        });

    app.get('/auth/goog/callback',
        passport.authenticate('google', {
            failureRedirect: '/login.html'
        }),
        function(req, res) {
            res.redirect('/account/go');
        });
	
		

    app.get('/account/:sn', function(req, res) {
        var sn = req.params.sn

        var id = req.user.id

        console.log("EL SN :" + sn)

        if (sn == "fb") {
            id = id + "fb"
        } else if (sn == "tw") {
            id = id + "tw"
        } else if (sn == "go") {
            id = id + "go"
        }

        var token = jwt.sign({
            "id": id,
            "name": req.user.displayName
        }, setup.secret, {
            expiresIn: '24h'
        });

        MongoClient.connect(setup.database, function(err, db) {
            if (err) throw err;
            var dbo = db.db("justoahora");
            dbo.collection("user").find({
                "id": id
            }).toArray(function(err, user) {
                if (user.length == 0) {
					console.log("NO ENCONTRADO :")
					
                    var token = jwt.sign({
                        "id": id,
                        "name": req.user.displayName
                    }, setup.secret, {
                        expiresIn: '24h'
                    });

                    res.redirect(setup.url_server + '/account.html?token=' + token);
                } else {
					console.log("ENCONTRADO :")
					
                    var token = jwt.sign({
                        "id": user[0].id,
                        "name": user[0].name
                    }, setup.secret, {
                        expiresIn: '24h'
                    });

                    res.redirect(setup.url_server + '/index.html?token=' + token + '&authorID=' + user[0].id);
                }
                //res.send(messages);
            });
        });


    });
	
	
	app.post('/signUpLightUser', function(req, res) {
        
		var username = req.body.username
        var password = req.body.password
		var email = req.body.email

        MongoClient.connect(setup.database, function(err, db) {
            if (err) throw err;
            var dbo = db.db("justoahora");
            dbo.collection("user").find({
                "name": username
            }).toArray(function(err, user) {
                if (user.length == 0) {
					console.log("NO ENCONTRADO :")
					
					var id = Math.floor((Math.random() * 1000000000000000) + 1)
					
                    var token = jwt.sign({
                        "id": id,
                        "name": username
                    }, setup.secret, {
                        expiresIn: '24h'
                    });


					
					var newUser = {
						'name': username,
						'id': id,
						'password' : password,
						'email': email,
						
					};
					MongoClient.connect(setup.database, function(err, db) {
						if (err) throw err;
						var dbo = db.db("justoahora");
						dbo.collection("user").insertOne(newUser, function(err, res) {
							if (err) throw err;

							db.close();


						});
					});
					
                    res.send({"status" :"OK","token": token});
                } else {

                    res.send({"status" :"NOK"});
                }
                
            });
        });


    });

	app.post('/signInLightUser', function(req, res) {
        
		var username = req.body.username
        var password = req.body.password
		

        MongoClient.connect(setup.database, function(err, db) {
            if (err) throw err;
            var dbo = db.db("explguru");
            dbo.collection("user").find({
                "name": username,
				"password": password
            }).toArray(function(err, user) {
                if (user.length == 0) {
					
					res.send({"status" :"NOK"});
                } else {

				    var token = jwt.sign({
                        "name": user[0].name,
                        "id": user[0].id
                    }, setup.secret, {
                        expiresIn: '24h'
                    });
				
                    res.send({"status" :"OK","token": token});
                }
                
            });
        });


    });
	
	
    app.post('/profile', util.ensureAuthorized, function(req, res) {
	
	var user = util.getUserFromToken(req)
	console.log("Usuario :"+ JSON.stringify(user))

        MongoClient.connect(setup.database, function(err, db) {
            if (err) throw err;
            var dbo = db.db("justoahora");
            dbo.collection("user").find({
                'id': user.id
            }).toArray(function(err, messages) {
                res.send(messages);
            });
        });

    });
	
	
}