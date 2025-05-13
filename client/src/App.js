import { BrowserRouter, Route, Redirect } from "react-router-dom";
import SignUp from "./components/SignUp";
import Login from "./components/Login";


function App() {
  return (
    <BrowserRouter>
      {/* <Route exact path="/" component={Home} /> */}
      <Route path="/login" exact element={<Login />} />
      <Route path="/" element={<Navigate replace to="/login" />} />
      <Route path="/register" exact element={<SignUp />} />
      {/* <PrivateRoute path="/dashboard" component={Dashboard} /> */}
    </BrowserRouter>
  );
}

// const PrivateRoute = ({ component: Component, ...rest }) => {
//   <Route {...rest} render={ props => (
//     isAuthenticated() ? <Component {...props} /> : <Redirect to="/login"/>
//   )} />
// };

export default App;
