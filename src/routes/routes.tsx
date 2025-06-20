import { RouteObject } from "react-router-dom";
import LayoutDefault from "../components/LayoutDefault/LayoutDefault";
import Login from "../components/Auth/Login";
import ProtectedRoute from "./ProtectedRoute";
import Home from "../components/Home/Home";
import Register from "../components/Auth/Register";

export const appRoutes: RouteObject[] = [
  {
    // path: "/",
    // element: <IntroScreen />,
    path: "/",
    element: <Login />,
  },
  {
    path: "/",
    element: <LayoutDefault />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "home",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
    ],
  },
];
