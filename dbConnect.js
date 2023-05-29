const mongoose = require('mongoose')
module.exports = async  ()=>{
    const dataBaseURL = process.env.MongoDB;
      try {
        const connect= await mongoose.connect(dataBaseURL, {
            useNewUrlParser: true, 
            useUnifiedTopology: true
          })
          console.log("connect"+connect.connection.host);
        
      } catch (error) {
        console.log(error);
        process.exit(1)
      }
}