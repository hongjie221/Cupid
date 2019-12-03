import { createStore, combineReducers } from "redux";
import deepFreeze from "deep-freeze-strict";
import _ from "lodash";

let default_reg = {
    email: "",
    password: "",
    name: "",
    gender: "Male",
    desc: ""
};

function signup(
    st0 = default_reg,
    action
) {
    switch (action.type) {
        case "SIGN_UP":
            return Object.assign({}, st0, action.data);
        case "RESET_REG":
            return default_reg;
        default:
            return st0;
    }
}

let default_login = { email: null, password: null, errors: null };

function login(st0 = default_login, action) {
    switch (action.type) {
        case "CHANGE_LOGIN":
            return Object.assign({}, st0, action.data);
        case "RESET_LOGIN":
            return default_login;
        default:
            return st0;
    }
}

function upload_photo(st0 = { new_photo: null, photo_desc: "No description", errors: null }, action) {
    switch (action.type) {
        case "UPLOAD":
            return Object.assign({}, st0, action.data);
        default:
            return st0;
    }
}


function all_photos(st0 = { photos: null, errors: null }, action) {
    switch (action.type) {
        case "ALL_PHOTOS":
            return Object.assign({}, st0, action.data);
        default:
            return st0;
    }
}


function profile(st0 = {
    email: null,
    name: null,
    desc: null,
    my_interests: null,
    hint: null,
    errors: null
}, action) {
    switch (action.type) {
        case "SHOW_PROFILE":
            return Object.assign({}, st0, action.data);
        default:
            return st0;
    }
}


function matches(st0 = { matches: null, selected: null }, action) {
    switch (action.type) {
        case "MATCHES":
            return Object.assign({}, st0, action.data);
        default:
            return st0;
    }
}

function add_tags(st0 = { all_tags: null, current_tag: null, added_tag: null, errors: null, status: null }, action) {
    switch (action.type) {
        case "GET_TAGS":
            return Object.assign({}, st0, action.data);
        case "ADD_TAGS":
            return Object.assign({}, st0, action.data)
        default:
            return st0;
    }
}


function users(st0 = { info: null, current_photos: null, user_index: 0, photo_index: 0, longitude: null, latitude: null }, action) {
    switch (action.type) {
        case "USERS":
            return Object.assign({}, st0, action.data);
        default:
            return st0;
    }
}

function chat(st0 = { text: "" }, action) {
    switch (action.type) {
        case "CHANGE_TEXT":
            return Object.assign({}, st0, action.data);
        default:
            return st0;
    }
}


function forms(st0, action) {
    let reducer = combineReducers({
        signup,
        login,
    })
    return reducer(st0, action);
}

let session0 = localStorage.getItem('session');
if (session0) {
    session0 = JSON.parse(session0);
}

function session(st0 = session0, action) {
    switch (action.type) {
        case 'LOG_IN':
                console.log(action);
            return action.data;
        case 'LOG_OUT':
            return null;
        default:
            return st0;
    }
}

function geolocation(st0 = { latitude: 0, longitude: 0 }, action) {
    switch (action.type) {
        case "Update_Location":
            return Object.assign({}, st0, action.data);
        default:
            return st0;
    }
}
// add or remove friends
function friends(st0 = [], action) {
    switch (action.type) {
        case 'CHANGE_FRIENDS':
            return action.data;
        default:
            return st0;
    }
}


function msg_box(st0 = {}, action) {
    // expected data format {match_id: {all the message}}
    switch (action.type) {
        case 'NEW_MSG':
            return Object.assign({}, st0, action.data);
        default:
            return st0;
    }
}

function noti(st0 = [], action) {
    switch (action.type) {
        case 'NEW_MATCH':
            let alt = {
                id: (new Date()).getTime(),
                type: action.data.type,
                headline: action.data.headline,
                message: action.data.message
              };
            return _.concat(st0, alt);
        case 'NOTI':
            return _.concat(st0, action.data);
        case 'REMOVE_ALT':
            return _.filter(st0, (n) => (n.id !== action.data.id));
        default:
            return st0;
    }
}


function root_reducer(st0, action) {
    let reducer = combineReducers({
        forms,
        session,
        profile,
        upload_photo,
        all_photos,
        matches,
        add_tags,
        users,
        friends,
        msg_box,
        chat,
        noti
    });
    return deepFreeze(reducer(st0, action));
}



let store = createStore(root_reducer);
// let store = createStore(root_reducer,
//     window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
export default store;