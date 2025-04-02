import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "devextreme/dist/css/dx.fluent.saas.light.css";
import PublicContainer from "./containers/PublicContainer";
import Me from "./pages/Me";
import PrivateContainer from "./containers/PrivateContainer";
import ProtectedRoute from "./components/public/auth/ProtectedRoute";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<PublicContainer />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>
          <Route
            path="/me"
            element={
              <ProtectedRoute>
                <PrivateContainer>
                  <Me />
                </PrivateContainer>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
