import { useState } from "react";
import '../styles/form.css'

function SignUp() {

  const [formData, setFormData] = useState({
    USERNAME: "",
    FIRSTNAME: "",
    LASTNAME: "",
    EMAIL: "",
    PASSWORD: "",
    VERIFYPASSWORD: ""
  });
  const [validation, setValidation] = useState({
    USERNAME: "",
    FIRSTNAME: "",
    LASTNAME: "",
    EMAIL: "",
    PASSWORD: "",
    VERIFYPASSWORD: ""
  });

  const clearData = () => {
    setFormData({
      USERNAME: "",
      FIRSTNAME: "",
      LASTNAME: "",
      EMAIL: "",
      PASSWORD: "",
      VERIFYPASSWORD: ""
    })
  }


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateField = (fieldName, value) => {
    let error = "";
    let regex;
    
    switch (fieldName) {
      case "USERNAME" : {
        regex = /^[a-zA-Z0-9]{3,20}$/
        if (!regex.test(value)) {
          error = "Username can only contain letters and numbers.";
        }
        if (value === ""){
          error = "Username cannot be empty."
        }
        break;
      }
      case "FIRSTNAME" : {
        regex = /^[A-Z][a-zęóąśłżźćń]{2,30}$/
        if (!regex.test(value)) {
          error = "First name must start with a capital letter.";
        }
        if (value === ""){
          error = "First name cannot be empty."
        }
        break;
      }
      case "LASTNAME" : {
        regex = /^[A-Z][a-zęóąśłżźćń]{2,35}$/
        if (!regex.test(value)) {
          error = "Last name must start with a capital letter and.";
        }
        if (value === ""){
          error = "Last name cannot be empty."
        }
        break;
      }
      case "EMAIL" : {
        regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(value)) {
          error = "Email is invalid.";
        }
        if (value === ""){
          error = "Email cannot be empty."
        }
        break;
      }
      case "PASSWORD" : {
        // regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/; // strong password
        regex = /^.{3,}$/;
        if (!regex.test(value)) {
          error = "Password is too weak.";
        }
        if (value === ""){
          error = "Password cannot be empty."
        }
        break;
      }
      case "VERIFYPASSWORD" : {
        if (value !== formData.PASSWORD) {
          error = "Password does not match.";
        }
        if (value === ""){
          error = "Password cannot be empty."
        }
        break;
      }
      default : {
        console.log("Wrong value.")
      }
    }

    setValidation(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  
  return(
    <div>
      <form action="" method="POST">
        <div className="form-section">
        <h1>Create new account</h1>
          <div className="form-group">
            <div className="input-group">
              <label className="input-label">Username</label>
              <input className="input-field" type="text" name="USERNAME" value={formData.USERNAME} onBlur={handleBlur} onChange={handleChange}></input>
            </div>
            <label className="validation-error">{validation.USERNAME}</label>
          </div>
          <div className="form-group">
            <div className="input-group">
              <label className="input-label">First Name</label>
              <input className="input-field" type="text" name="FIRSTNAME" value={formData.FIRSTNAME} onBlur={handleBlur} onChange={handleChange}></input>
            </div>
            <label className="validation-error">{validation.FIRSTNAME}</label>
          </div>
          <div className="form-group">
            <div className="input-group">
              <label className="input-label">Last Name</label>
              <input className="input-field" type="text" name="LASTNAME" value={formData.LASTNAME} onBlur={handleBlur} onChange={handleChange}></input>
            </div>
            <label className="validation-error">{validation.LASTNAME}</label>
          </div>
          <div className="form-group">
            <div className="input-group">
              <label className="input-label">Email</label>
              <input className="input-field" type="text" name="EMAIL" value={formData.EMAIL} onBlur={handleBlur} onChange={handleChange}></input>
            </div>
            <label className="validation-error">{validation.EMAIL}</label>
          </div>
          <div className="form-group">         
            <div className="input-group">
              <label className="input-label">Password</label>
              <input className="input-field" type="password" name="PASSWORD" value={formData.PASSWORD} onBlur={handleBlur} onChange={handleChange}></input>
            </div>
            <label className="validation-error">{validation.PASSWORD}</label>
          </div>
          <div className="form-group">
            <div className="input-group">
              <label className="input-label">Verify Password</label>
              <input className="input-field" type="password" name="VERIFYPASSWORD" value={formData.VERIFYPASSWORD} onBlur={handleBlur} onChange={handleChange}></input>
            </div>
            <label className="validation-error">{validation.VERIFYPASSWORD}</label>
          </div>
          <div className="button-group">
            <button type="submit-signup-form" className="green-button">Create account</button>
            <button type="reset" className="red-button" onClick={clearData}>Clear</button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default SignUp;