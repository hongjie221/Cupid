import React from "react";
import ReactDOM from "react-dom";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    NavLink, Redirect, withRouter,
    useHistory
} from "react-router-dom";
import { Navbar, Nav, Col } from "react-bootstrap";
import { Provider, connect } from "react-redux";
import Login from "./login";
import SignUp from "./signup";
import Profile from "./profile";
import AllPhotos from "./all_photos"
import UploadNewPhoto from "./upload"
import Matches from './matches'
import AddTag from './add_tag'
import Users from "./users"
import Index from "./index"
import ChangeDesc from "./change_desc"
import store from "./store";
import { FaHeartbeat, FaHome, FaRegUser, FaRegComment } from "react-icons/fa";
import Community from "./community"
import DebugRouter from "./debug_router"
import { get_friends } from "./ajax"
import { init_socket, socket, channels, leave } from "./socket";
import { AlertList, Alert, AlertContainer } from "react-bs-notifier";



export default function init_page(root) {
  let tree = (
    <Provider store={store}>
      <Page />
    </Provider>
  );
  ReactDOM.render(tree, root);
}


function Page(props) {


  return (
    <Router>
      <Navbar bg="light" variant="primary">
        <Col md="10">
          <Nav>
            <Nav.Item className="col-2">
              <NavLink to="/" exact activeClassName="active" className="nav-link">
                <FaHome /> Home
                </NavLink>
            </Nav.Item>
            <Nav.Item className="col-2">
              <NavLink
                to="/profile"
                exact
                activeClassName="active"
                className="nav-link"
              >
                <FaRegUser /> Profile
              </NavLink>
            </Nav.Item>
            <Nav.Item className="col-2">
              <NavLink
                to="/users"
                exact
                activeClassName="active"
                className="nav-link"
              >
                <FaHeartbeat /> Discover
                </NavLink>
              </Nav.Item>
              <Nav.Item className="col-2">
                <NavLink
                  to="/community"
                  activeClassName="active"
                  className="nav-link"
                >
                  <FaRegComment /> Matches
                </NavLink>
            </Nav.Item>
          </Nav>
        </Col>
        <Col md="2">
          <SessionWithRouter />
        </Col>
      </Navbar>
      <Alter />

      <Switch>
          <Route exact path="/">
              <Index />
          </Route>
        <Route exact path="/login">
          <Login />
        </Route>

        <Route exact path="/sign_up">
          <SignUp />
        </Route>

        <PrivateRoute exact path="/all_photos">
          <AllPhotos />
        </PrivateRoute>

          <PrivateRoute path="/community">
              <Community />
          </PrivateRoute>

          {/* <PrivateRoute exact path="/community/:id">
              <Community />
          </PrivateRoute> */}

        <PrivateRoute exact path="/profile">
          <Profile />
        </PrivateRoute>

        <PrivateRoute exact path="/upload_new_photo">
          <UploadNewPhoto />
        </PrivateRoute>
        <Route exact path="/matches">
          <Matches />
        </Route>
        <PrivateRoute exact path="/add_tags">
          <AddTag />
        </PrivateRoute>

        <PrivateRoute exact path="/users">
          <Users />
        </PrivateRoute>

        <PrivateRoute exact path="/change_desc">
          <ChangeDesc />
        </PrivateRoute>

      </Switch>
    </Router>
  );
}

function PrivateRoute({ children, ...rest }) {
    let session = store.getState().session;
    return (
        <Route
            {...rest}
            render={( { location }) =>
                session  ? (
                    children
                ) : (
                    <Redirect
                        to={{
                            pathname: '/login',
                            state: { from: location }
                        }}
                    />
                )
            }
        />
    );
}

let Session = (props) => {
  let {session, dispatch, history} = props;
  function logout(ev) {
    ev.preventDefault();
    localStorage.removeItem('session');
    leave();
    dispatch({
      type: 'LOG_OUT',
    });
    history.push('/');
  }

  if (session) {
    init_socket(session);
    get_friends(socket);
    return (
      <Nav>
        <Nav.Item>
          <p className="nav-link py-2">{session.user_name}</p>
        </Nav.Item>
        <Nav.Item>
          <a className="nav-link" href="#" onClick={logout}>Logout</a>
        </Nav.Item>
      </Nav>
    );
  }
  else {
    return (
      <Nav>
        <Nav.Item>
          <NavLink to="/login" exact activeClassName="active" className="nav-link">
            Login
            </NavLink>
        </Nav.Item>
      </Nav>
    );
  }
};

function areEqual(prevProps, nextProps) {
  return true;
}

let connectSession = connect(({session}) => ({session}))(Session);

let SessionWithRouter = withRouter(React.memo(connectSession, areEqual));

let Alter = connect(({ noti }) => ({ noti }))(({ noti, dispatch }) => {

  function onDismiss(alert) {
    dispatch({
      type: 'REMOVE_ALT',
      data: alert
    });
  }

  return (
    <AlertList
					alerts={ noti }
					timeout={ 1000 }
					dismissTitle="Begone!"
          onDismiss={ onDismiss }
				/>
  );



});



