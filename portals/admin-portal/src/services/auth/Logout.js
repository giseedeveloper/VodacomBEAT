 import {useDispatch } from "react-redux";
import { clearSession } from "../../state/auth/authStore";


const Logout = ({ children }) => {
  const dispatch = useDispatch();
  dispatch(clearSession()); 
  //Todo check token expiry
  return children;
};

export default Logout;
