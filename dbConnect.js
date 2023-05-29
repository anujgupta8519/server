const mongoose = require('mongoose')
module.exports = async  ()=>{
    const dataBaseURL = `mongodb+srv://krishnagupta6264:VoRBKXTBOj83RJGa@cluster0.yiwz21q.mongodb.net/?retryWrites=true&w=majority`;
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