module.exports = {
    port:process.env.PORT || 8888,
    database:'mongodb://localhost:27017/fit_treat'
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