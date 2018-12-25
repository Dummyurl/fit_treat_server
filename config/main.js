module.exports = {
    //userId:'appconsultme@gmail.com', // use only for local testing
    userId:'app116066240@heroku.com',
    password:'Welcome12#',
    crptrKey:'R@nd0m5tr1ngt0g3ner@t3Pa55w0rd',
    port:process.env.PORT || 8989,
    database:'mongodb://localhost:27018/fit_treat'
    //database:'mongodb://fitTreat:Welcome12#@ds119343.mlab.com:19343/fit_treat'
    
    /* 
        AWS S3 URL
    */
   //local
   ,
   s3URL:'C:/Users/balkrishna.meena/Desktop/ConsultApp/Data Set/images/'
   //cloud
   //s3URL:'https://s3.us-east-2.amazonaws.com/fittreatstorage/meal_images_dev/'
}