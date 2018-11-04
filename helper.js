exports.setUserInfo = function setUserInfo(request){
    console.log(request);
    let getUserInfo = {
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
        userPhoto:request.userPhoto,
      };
    
      return getUserInfo;
}

exports.setActiveUserData = function setActiveUserData(request){
    request.password = null;
    request.unreadCount = request.unreadCount;
    request.mealAssigned = null;
    return request;
}
