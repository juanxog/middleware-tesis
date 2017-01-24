// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var morgan     = require('morgan');
var config     = require('./config'); // get our config file
var User_bd   = require('./models/user'); // get our mongoose model
var cursos   = require('./models/cursos'); // get our mongoose model
var grupos   = require('./models/grupos'); // get our mongoose model
var posibilidades   = require('./models/posibilidades'); // get our mongoose model
var actividades   = require('./models/actividades'); // get our mongoose model
var md5 = require('md5');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var request = require('request');

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,auth');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


var port     = process.env.PORT || 8080; // set our port

var mongoose   = require('mongoose');

mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable


// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

var verifytoken = function(req,res,next){
    
    
    // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['auth'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        
        req.body.verifyuser = decoded._doc;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
      
    res.end();
    
  }
  
    
}


// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });	
});

// on routes that end in /bears
// ----------------------------------------------------
router.route('/auth').post(function(req, res) {
	
    var username = req.body.user;
    var pass = req.body.pass;
    var pass_hash = md5(pass);

    // find the user
	User_bd.findOne({
		'user' : username
	}, function(err, user) {

		if (err) throw err;
        
		if (!user) {
			res.json({ success: false, message: 'Authentication failed. User not found.' });
		} else if (user) {

			// check if password matches
			if (user.password != pass_hash) {
				res.json({ success: false, message: 'Authentication failed. Wrong password.' });
			} else {

				// if user is found and password is right
				// create a token
				var token = jwt.sign(user, app.get('superSecret'), {
					expiresIn: 86400 // expires in 24 hours
				});

				res.json({
					success: true,
					message: 'Enjoy your token!',
					token: token, 
                    info: user
				});
			}		

		}

	});
    
})


// ----------------------------------------------------
router.route('/cursos/:profesor').get( verifytoken,  function(req, res) {
    
    var profesor = req.body.verifyuser._id;
    var id = mongoose.Types.ObjectId;
    var userv = req.body.verifyuser;
    
    // find the user
	cursos.find({
		'profesor' : profesor 
	}, function(err, curso) {

		if (err) throw err;
        
        
        res.json({ success: true , info: curso , user: userv});
    
	});
	
})



router.route('/cursos/actividad/:curso').get( verifytoken,  function(req, res) {
    
    var curso = req.params.curso;
    var id = mongoose.Types.ObjectId;
    var userv = req.body.verifyuser;
    
	actividades.find({
		'curso' : curso 
	}, function(err, actividad) {

		if (err) throw err;
        
        
        res.json({ success: true , info: actividad, user: userv });
    
	});
	
})


router.route('/cursos/actividad/ver/:actividad').get( verifytoken,  function(req, res) {
    
    var actividad_x = req.params.actividad;
    var id = mongoose.Types.ObjectId;
    var userv = req.body.verifyuser;
    
    
    actividades
    .findOne({ '_id' : actividad_x  })
    .populate('grupo')
    .exec(function (err, actividad) {
      
        if (err) throw err;
        
         grupos.populate(actividad, {
          path: 'grupo.grupo'
        }, function (error, updatedUser) {
          //assuming no error,
            
             res.json({ success: true , info: updatedUser, user: userv });
        });
        
        
        
    });
    
	
	
})

router.route('/estudiantes/disponibles').post( verifytoken,  function(req, res) {
    
    var estudiantes = req.body.estudiantes;
    
    
    console.log(req.body.estudiantes);
    
    if(estudiantes == null)
    {
        estudiantes = [];
    }
    
    var estudiantes_wrapper = [];
    for(var i=0;i<estudiantes.length;i++)
    {
        estudiantes_wrapper[i] = estudiantes[i]._id;
    }
    
	User_bd.find({
		'esprofesor' : false,
        _id: {$nin: estudiantes_wrapper}
	}, function(err, disponibles) {

		if (err) throw err;
        
        
        res.json({ success: true , info: disponibles });
    
	});
	
})


router.route('/estudiantes/generarposibles').post( verifytoken,  function(req, res) {
    
    var curso = req.body.curso;
    
    cursos
    .findOne({ _id: curso })
    .populate('matricula')
    .exec(function (err, cursillo) {
      if (err) return handleError(err);
        
        request({
            method: 'POST',
            uri: 'http://192.168.0.102:8080/tesis/' ,
            body:  cursillo.matricula 
            ,
            json: true
        }, function optionalCallback(err, httpResponse, body) {
            
            if (err) {
                return console.error('upload failed:', err);
            }
            console.log('Upload successful!  Server responded with:', body);
                
            res.json({ success: true , info: body });
        });
        
        
    });
    
    
	
})




router.route('/crear/curso').post( verifytoken,  function(req, res) {
    
    var estudiantes = req.body.estudiantes;
    var nombre = req.body.nombre;
    var profe = req.body.verifyuser._id;
    
    var mat_wrapper = [];
    for(var i=0;i<estudiantes.length;i++)
    {
        mat_wrapper[i] = estudiantes[i]._id;
    }
    
    var cursos_insert = new cursos({materia:nombre,asignaciones:[],profesor:profe,matricula:mat_wrapper});
    
    cursos_insert.save();
    
    res.json({ success: true });
    

})


router.route('/update/grupo').post( verifytoken,  function(req, res) {
    
    var grupo = req.body;
    
    
    var i=0;
    
    for(i=0;i<grupo.length;i++)
    {
        grupos.findByIdAndUpdate(grupo[i]._id, { $set: { nota: grupo[i].nota }}, { new: true } )
        .populate('grupo')
        .exec( function (err, result) {
          if (err) return handleError(err);
                
            
                posibilidades.findOneAndUpdate( { _id : result.id_eval }, { $push: { notas: result.nota } }, { new: true }, function (errx, resultx) {
                    
                    if (errx){ console.log("1"); return ; }  
                    
                    console.log("----------------------------------");
                    
                    console.log(result);
                    
                    console.log("***********************************");
                    
                    console.log(resultx);
                    
                    console.log("----------------------------------");
                    
                    var t=0;
                    var sum=0;
                    for(t=0;t<resultx.notas.length;t++)
                    {
                        sum = sum + resultx.notas[t];
                    }
                    
                    sum = sum/resultx.notas.length;
                    
                    posibilidades.findOneAndUpdate( { _id: resultx._id  }, { $set: { valor: sum }  }, { new: true }, function (erry, resulty){
                        if (erry){  console.log(erry); return ;}
            
                        res.json({ success: true });
                        
                    });
                    
                });
            
        });
    }
    
})

router.route('/crear/actividad').post( verifytoken,  function(req, res) {
    
    var grupos_inner = req.body.grupo;
    var nombre = req.body.nombre;
    var profe = req.body.verifyuser._id;
    var curso = req.body.curso;
    var grupos_rr =  [];
    var actividad_id ;
    
    var actividad_insert = new actividades({nombre:nombre,grupo:grupos_rr,profesor:profe,curso:curso});
    
    actividad_insert.save(function(err, obj, num){

            if (err) throw err;

            actividad_id = obj._id;

        
            for(var i=0;i<grupos_inner.length;i++)
            {
                var array_aux_e =  [];
                for(var j=0;j<grupos_inner[i].students.length;j++)
                {
                    array_aux_e.push(grupos_inner[i].students[j]._id);        

                }

                var grupos_insert = new grupos({grupo:array_aux_e,actividad:actividad_id,nota: -1, exp: grupos_inner[i].valor, id_eval: grupos_inner[i].id_eval });

                grupos_insert.save(function(err, obj, num){

                    if (err) throw err;

                    grupos_rr.push(obj._id);
                    
                    actividades.update({ _id: actividad_id }, { $set: { grupo: grupos_rr }}, function(){
                
                        res.json({ success: true });

                    });

                });
            }
        
            

    });
    
    
})






// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);