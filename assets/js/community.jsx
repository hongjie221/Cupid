import React from "react";
import { Switch, Route, NavLink, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import {
  Navbar,
  Nav,
  Row,
  InputGroup,
  FormControl,
  Button,
  ListGroupItem,
  ListGroup
} from "react-bootstrap";
import * as _ from "lodash";
import store from "./store";
import { channels } from "./socket";

function Community(props) {
  let url = "/community";
  const friends = props.friends;
  let mbox = props.msg_box;
  let navs = _.map(friends, (f, index) => (
    <ListGroupItem key={"nav_" + index} action>
      <Nav.Item>
        <NavLink
          to={`${url}/${f.id}`}
          exact
          activeClassName="active"
          className="nav-link"
        >
          <div>
            <Friend name={f.user.name} content={f.user.email} />
          </div>
        </NavLink>
      </Nav.Item>
    </ListGroupItem>
  ));
  let routes = _.map(friends, (f, index) => (
    <Route
      key={"route_" + index}
      path={`${url}/${f.id}`}
      exact
      children={<ChatView mbox={mbox[f.id]} id={f.id} />}
    />
  ));
  return (
    <Row>
      <div className="col-md-3 overflow-auto community">
        <Navbar bg="grey" variant="light">
          <Nav>
            <ListGroup className="nav flex-column">{navs}</ListGroup>
          </Nav>
        </Navbar>
      </div>

      <div className="col-md-9 border padding margin-top">
        <Switch>
            {routes}
            <Route
            path={`${url}/`}
            exact
            children={() => (<div className="title">Pick a Friend to Chat</div>)}
            />
        </Switch>
      </div>
    </Row>
  );
}

// Component to display a single friend
function Friend(props) {
  return (
    <div>
      <div className="error-input">{props.name}</div>
      <div>{props.content}</div>
    </div>
  );
}

// Component for the box containing all the chat contents
function ChatView(props) {
    // expected format for props.mbox
    // let mock = [{name: "tom", msg: "hello"}, 
    // {name: "alice", msg: "hello!"}, 
    // {name: "tom", msg: "let's talke"}]
    let msgs = _.map(
        props.mbox, (msg, index) => (
            <Message 
                key={"msg_" + index} 
                name={msg.name} 
                msg={msg.msg} />
        )
    );
    return (
        <div>
            <div className="chat-view border margin-top long_word overflow-auto">
                { msgs }
            </div>
            <InputWithRouter id={props.id}/>
        </div>
    );
}

// Component for the input box
function Input(props) {
  let text = props.chat.text;
  let id = props.id;
  return (
    <InputGroup className="mb-3">
      <FormControl
        as="textarea"
        rows="2"
        placeholder="Send a Message"
        value={text}
        onChange={ev => changed({ text: ev.target.value })}
        // onKeyPress={(ev) => send_msg_enter(ev, id, text)}
      />
      <InputGroup.Append>
        <Button variant="outline-secondary" onClick={() => send_msg(id, text)}>
          <div>Send</div>
        </Button>
      </InputGroup.Append>
    </InputGroup>
  );

}

const InputWithRouter = withRouter(connect(({ chat }) => ({ chat }))(Input));

// Component for a single message
function Message(props) {
  return (
    <div className="row">
      <div className="col-sm-2">{props.name} :</div>
      <div className="col-sm-8">{props.msg}</div>
    </div>
  );
}

function changed(data) {
  store.dispatch({
    type: "CHANGE_TEXT",
    data: data
  });
}

function send_msg_enter(ev, id, text) {
  if (ev.charCode === 13) {
    send_msg(id);
  }
}

function send_msg(id, text) {
  let session = store.getState().session;
  if (text.length > 0) {
    channels[id].push("new_msg", { text: text, from: {name: session.user_name, id: session.user_id}});
    store.dispatch({
      type: "CHANGE_TEXT",
      data: { text: "" }
    });
  } else {
    store.dispatch({
      type: "NOTI",
      data: {
        id: (new Date()).getTime(),
        type: "danger",
        headline: "No Input",
        message: "Type something to send."
      }
    });
  }
}

export default withRouter(
  connect(({ friends, msg_box }) => ({ friends, msg_box }))(Community)
);
