import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import { Form, Button, Alert } from "react-bootstrap";
import { Redirect } from "react-router";
import { get_tags } from "./ajax";
import { change_tags } from "./ajax";
import {current_user_tags} from "./ajax"
import MultiSelect from "@khanacademy/react-multi-select";
//import { submit_login } from './ajax';

class AddTag extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: null
    };
  }

  componentDidMount() {
    this.props.dispatch({
      type: "ADD_TAGS",
      data: {all_tags: null, current_tag: null, added_tag: null, errors: null, status: null}
    });
  }

  redirect(path) {
    this.setState({
      redirect: path
    });
  }

  changed(data) {
    this.props.dispatch({
      type: "ADD_TAGS",
      data: { added_tag: data }
    });
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />;
    }

    let { all_tags, current_tag, added_tag, errors, status} = this.props;

    if (all_tags == null) {
      get_tags();
      current_user_tags();
      return (
        <div>
          <p>Loading</p>
        </div>
      );
    }
    let error_msg = null;
    if (errors) {
      error_msg = <Alert variant="danger">{errors}</Alert>;
    }
    let status_msg = null
    if (status) {
        status_msg = <Alert variant="primary">{status}</Alert>;
    }
    console.log(this.props)
    let selected = this.props.added_tag == null ? [] : this.props.added_tag;
    let options = [];
    all_tags.map(x => options.push({ label: x.name, value: x.id }));
    return (
      <div>
        <h1>Add Tag</h1>
        {error_msg}
        {status_msg}
        <Form.Group controlId="tag">
          <MultiSelect
            options={options}
            selected={selected}
            onSelectedChanged={selected => this.changed(selected)}
          />
        </Form.Group>

        <Form.Group controlId="submit">
          <Button variant="primary" onClick={() => change_tags()}>
            Submit
          </Button>
        </Form.Group>
      </div>
    );
  }
}

function state2props(state) {
  return state.add_tags;
}

export default connect(state2props)(AddTag);
