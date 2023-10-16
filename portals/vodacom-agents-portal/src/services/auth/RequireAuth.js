import { useSelector } from "react-redux";
import { isEmpty } from "../../utils/helpers";
import { Navigate } from "react-router-dom";

const RequireAuth = ({ children }) => {
  const authState = useSelector((state) => state.auth);
  // console.log(`authState ${JSON.stringify(authState)}`)

  //TODO: Remove Once Done
  if (isEmpty(authState.token)) {
    return <Navigate to="/login" />;
  }

  //Todo check token expiry
  return children;
};

export default RequireAuth;
