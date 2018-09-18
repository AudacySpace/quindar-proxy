module.exports = function(){
    switch(process.env.NODE_ENV){
        case 'staging':
            return {
				'databaseURL' : 'mongodb://54.184.232.90:27017/quindar'
            };

        case 'production':
            return {
				'databaseURL' : ''
            };

        default:
            return {
				'databaseURL' : 'mongodb://54.184.232.90:27017/quindar'
            };
    }
};