import Dashboard from "views/Dashboard.js";
import UserProfile from "views/UserProfile.js";
import TableList from "views/TableList.js";
import Login from "views/Login.js";
import Signup from "views/Signup.js";

const dashboardRoutes = [

  {
    path: "/Home",
    name: "Home",
    icon: "nc-icon nc-alien-33",
    component: Dashboard,
    layout: "/admin",
  },
  {
    path: "/tableliste",
    name: "Param",
    icon: "nc-icon nc-settings-gear-64",
    component: UserProfile,
    layout: "/admin",
    className:'test'
  },
  {
    path: "/listusers",
    name: "List Users",
    icon: "nc-icon nc-circle-09",
    component: TableList,
    layout: "/admin",
    className:'test',
    dropdown:'true'
  },
  {
    path: "/login",
    name: "Login",
    icon: "nc-icon nc-circle-09",
    component: Login,
    layout: "/admin",
    className:'test',
    dropdown:'true'
  },
  {
    path: "/signup",
    name: "SignUp",
    icon: "nc-icon nc-circle-09",
    component: Signup,
    layout: "/admin",
    className:'test',
    dropdown:'true'
  },

];

export default dashboardRoutes;
