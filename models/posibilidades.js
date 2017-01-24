var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
var userSchema = mongoose.model('Posibilidades', new Schema({ 

    posibles: [{ type: Schema.Types.String }],
    valor: { type: Number },
    notas : [ {type: Number} ]
    
	
}),'Posibilidades');

module.exports = mongoose.model('Posibilidades', userSchema);