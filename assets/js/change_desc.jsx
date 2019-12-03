import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import { Form, Button, Alert } from "react-bootstrap";
import { Redirect } from "react-router";
import { change_profile_desc } from "./ajax";
import { get_profile } from "./ajax";
//import { submit_login } from './ajax';

class ChangeDesc extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: null
    };
  }

  redirect(path) {
    this.setState({
      redirect: path
    });
  }

  changed(data) {
    this.props.dispatch({
      type: "SHOW_PROFILE",
      data: data
    });
    
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />;
    }

    let {
      email,
      name,
      new_photo,
      desc,
      all_photos,
      my_interests,
      hint,
      errors
    } = this.props;

    if (desc == null) {
      get_profile();
      return (
        <div>
          <p>Loading</p>
        </div>
      );
    }

    let hint_msg = null;
    if (hint) {
      hint_msg = <Alert variant="primary">{hint}</Alert>;
    }

    return (
      <div>
        <h1>Change Description</h1>
        {hint_msg}

        <div className="row justify-content-center">
          <Form.Group controlId="desc">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              value={desc}
              onChange={ev => this.changed({ desc: ev.target.value })}
              className=" photo-desc "
            />
          </Form.Group>
        </div>
        <div className="row justify-content-center">
          <Form.Group controlId="submit">
            <Button variant="primary" onClick={() => change_profile_desc()}>
              Submit
            </Button>
          </Form.Group>
        </div>
      </div>
    );
  }
}

function state2props(state) {
  return state.profile;
}

export default connect(state2props)(ChangeDesc);
