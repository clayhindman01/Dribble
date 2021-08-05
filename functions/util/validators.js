//Check if a string is empty after trimming off the white space
const isEmpty = (string) => {
    if (string.trim() === '') return true;
    else return false;
}

//Check that the email is a valid email
const isEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(emailRegEx)) return true;
    else return false;
}

exports.validateSignupData = (data) => {
    let errors = {};

    // Check if email is empty or a valid email
    if(isEmpty(data.email)) {
        errors.email = "Must not be empty"
    } else if(!isEmail(data.email)) {
        errors.email = "Must be a valid email address"
    }

    //Check if password is empty
    if(isEmpty(data.password)) {
        errors.password = "Must not be empty"
    }

    //Check that both passwords match
    if(data.password !== data.confirmPassword) {
        errors.confirmPassword = "Passwords must match"
    }

    //Check if handle is empty
    if(isEmpty(data.handle)) {
        errors.handle = "Must not be empty"
    }

    return {
        errors,
        valid: Object.keys(errors).length === 0? true : false
    }
}

exports.validateLoginData = (data) => {
    let errors = {};
    
    if(isEmpty(data.email)) errors.email = "Must not be empty";
    if(isEmpty(data.password)) errors.password = "Must not be empty";

    return {
        errors,
        valid: Object.keys(errors).length === 0? true : false
    }

}