import { useState } from "react";
import '../styles/form.css'


function Login() {

  // objects with form data and validation messages
  const [formData, setFormData] = useState({
    USERNAME: "",
    PASSWORD: "",
  });
  const [validation, setValidation] = useState({
    USERNAME: "",
    PASSWORD: "",
    SUBMIT: ""
  });

  // for reset button
  const clearData = () => {
    setFormData({
      USERNAME: "",
      PASSWORD: "",
    })
    setValidation({
      USERNAME: "",
      PASSWORD: "",
      SUBMIT: ""
    })
  }

  // upadte values in useState object
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // validation function for every input field
  const validateField = (fieldName, value) => {
    let error = "";
    
    switch (fieldName) {
      case "USERNAME" : {
        if (value === ""){
          error = "Username cannot be empty."
        }
        break;
      }
      case "PASSWORD" : {
        if (value === ""){
          error = "Password cannot be empty."
        }
        break;
      }
      default : {
        console.log("Wrong value.")
      }
    }

    // update validation message to coresponding input field
    setValidation(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  // validate form after unfocusing input field
  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  // submit button handler
  const sendData = () => {
    // validate all input fileds
    Object.keys(formData).forEach((key) => {
      validateField(key, formData[key])
    })

    // check validation messages
    Object.values(validation).forEach((value) => {
      if(value !== ""){
        setValidation(prev => ({
          ...prev,
          SUBMIT: "Can't login. The form contains errors."
        }));
      }
    })
  }

return(
    <div>
      <form action={sendData} method="POST">
        <div className="form-section">
        <h1>Login</h1>
          <div className="form-group">
            <div className="input-group">
              <label className="input-label">Username</label>
              <input className="input-field" type="text" name="USERNAME" value={formData.USERNAME} onBlur={handleBlur} onChange={handleChange}></input>
            </div>
            <label className="validation-error">{validation.USERNAME}</label>
          </div>
          <div className="form-group">         
            <div className="input-group">
              <label className="input-label">Password</label>
              <input className="input-field" type="password" name="PASSWORD" value={formData.PASSWORD} onBlur={handleBlur} onChange={handleChange}></input>
            </div>
            <label className="validation-error">{validation.PASSWORD}</label>
          </div>
          <div className="button-group">
            <button type="submit" name="submit-login-form" className="green-button">Login</button>
            <button type="reset" className="red-button" onClick={clearData}>Clear</button>
            <label className="validation-error">{validation.SUBMIT}</label>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Login;