import React from "react";
import { RouteObject } from "react-router-dom";
import IntroScreen from "../components/IntroScreen/IntroScreen";
import LayoutDefault from "../components/LayoutDefault/LayoutDefault";
import Login from "../components/Auth/Login";
import ProtectedRoute from "./ProtectedRoute";
import Home from "../components/Home/Home";

export const appRoutes: RouteObject[] = [
  {
    path: "/",
    element: <IntroScreen />,
  },
  {
    path: "/",
    element: <LayoutDefault />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      // {
      //   path: "register",
      //   element: <Register />,
      // },
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
