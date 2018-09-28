exports.setUserInfo = function setUserInfo(request){
    const getUserInfo = {
        _id: request._id,
        firstName: request.firstName,
        lastName:request.lastName,
        email: request.email,
        age: request.age,
        weight: request.weight,
        height: request.height,
        bmi:request.bmi,
        medicalCondition:request.medicalCondition,
        targetWeight:request.targetWeight,
        targetDate:request.targetDate,
        targetCalories:request.targetCalories,
        userPhoto:Buffer,
      };
    
      return getUserInfo;
}

exports.setActiveUserData = function setActiveUserData(request){
request.password = null;
    return request;
}
