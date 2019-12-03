import store from "./store";
import _ from "lodash";
import { init_channel } from "./socket";

export function post(path, body) {
    let state = store.getState();
    let token = state.session == null ? null : state.session.token;
    return fetch("/ajax" + path, {
        method: "post",
        credentials: "same-origin",
        headers: new Headers({
            "x-csrf-token": window.csrf_token,
            "content-type": "application/json; charset=UTF-8",
            accept: "application/json",
            "x-auth": token || ""
        }),
        body: JSON.stringify(body)
    }).then(resp => resp.json());
}

export function put(path, body) {
    let state = store.getState();
    let token = state.session == null ? null : state.session.token;
    return fetch("/ajax" + path, {
        method: "put",
        credentials: "same-origin",
        headers: new Headers({
            "x-csrf-token": window.csrf_token,
            "content-type": "application/json; charset=UTF-8",
            accept: "application/json",
            "x-auth": token || ""
        }),
        body: JSON.stringify(body)
    }).then(resp => resp.json());
}

export function get(path) {
    let state = store.getState();
    let token = state.session == null ? null : state.session.token;

    return fetch("/ajax" + path, {
        method: "get",
        credentials: "same-origin",
        headers: new Headers({
            "x-csrf-token": window.csrf_token,
            "content-type": "application/json; charset=UTF-8",
            accept: "application/json",
            "x-auth": token || ""
        })
    }).then(resp => resp.json());
}

export function register(form) {
    let state = store.getState();
    let data = state.forms.signup;

    post('/users', { 'user': data })
        .then((resp) => {
            if (resp.token) {
                localStorage.setItem('session', JSON.stringify(resp));
                store.dispatch({
                    type: 'RESET_REG',
                });
                store.dispatch({
                    type: 'LOG_IN',
                    data: resp,
                });
                form.redirect();
            } else {
                form.display_error(resp.errors);
            }
        });
}

export function submit_login(form) {
    let state = store.getState();
    let data = state.forms.login;

    post('/sessions', data)
        .then((resp) => {
            if (resp.token) {
                localStorage.setItem('session', JSON.stringify(resp));
                store.dispatch({
                    type: 'LOG_IN',
                    data: resp,
                });
                store.dispatch({
                    type: 'RESET_LOGIN'
                });
                form.redirect();
            } else {

                store.dispatch({
                    type: 'CHANGE_LOGIN',
                    data: { errors: resp.errors },
                });
            }
        });
}

export function get_profile() {
    let id = JSON.parse(localStorage.getItem("session")).user_id;

    get("/users/" + id).then(resp => {
        (resp.data);
        store.dispatch({
            type: "SHOW_PROFILE",
            data: resp.data
        });
    });
}

export function change_profile_desc() {
    let id = JSON.parse(localStorage.getItem("session")).user_id;
    let state = store.getState();
    let data = { user: state.profile.desc };

    put("/users/" + id, data).then(resp => {

        Object.assign(resp.data, { hint: "success" });
        store.dispatch({
            type: "SHOW_PROFILE",
            data: resp.data
        });
    });
}

export function change_location(lan, lon) {

    let id = JSON.parse(localStorage.getItem("session")).user_id;
    let data = { latitude: lan, longitude: lon };
    put("/users/" + id, data).then(resp => {

        Object.assign(resp.data, {});
        store.dispatch({
            type: "Update_Location",
            data: resp.data
        });
    });
}

export function upload_photo(form) {
    let state = store.getState();
    let data = state.upload_photo;

    if (data.new_photo == null) {
        return;
    }

    if (data.new_photo.size >= 1024000) {
        store.dispatch({
            type: "UPLOAD",
            data: { errors: "Photo size is larger than 1MB" }
        });
    } else {
        let reader = new FileReader();
        reader.addEventListener("load", () => {

            post("/photos", {
                photo: {
                    desc: data.photo_desc,
                    filename: data.new_photo.name,
                    photo_upload: reader.result
                }
            }).then(resp => {
                if (resp.data) {
                    form.redirect("/all_photos");
                }
            });
        });
        reader.readAsDataURL(data.new_photo);
    }
}

export function show_all_photos() {
    get("/photos").then(resp => {

        let photos = [];
        resp.data.map(x => photos.push(x));

        store.dispatch({
            type: "ALL_PHOTOS",
            data: {
                photos: photos
            }
        });
    });
}

export function show_all_matches() {
    get("/matches").then(resp => {

        store.dispatch({
            type: "MATCHES",
            data: {
                matches: resp.data
            }
        });
    });
}

export function load_ppl_nearby(lan, lon) {
    let id = JSON.parse(localStorage.getItem("session")).user_id;
    get("/users").then(resp => {

        store.dispatch({
            type: "MATCHES",
            data: {
                matches: resp.data
            }
        });
    });
}

export function get_tags() {
    get("/tags").then(resp => {

        store.dispatch({
            type: "GET_TAGS",
            data: {
                all_tags: resp.data
            }
        });
    });
}

export function current_user_tags() {
    get("/interest").then(resp => {

        store.dispatch({
            type: "ADD_TAGS",
            data: { current_tag: resp.data }
        });
    });
}

export function get_my_interests() {
    get("/interest").then(resp => {

        store.dispatch({
            type: "SHOW_PROFILE",
            data: { my_interests: resp.data }
        });
    });
}

export function change_tags() {
    let state = store.getState();
    let added_tag = state.add_tags.added_tag;
    let current_user_tag = state.add_tags.current_tag;
    let current_user_tag_id = current_user_tag.map(x => x.tag_id);

    if (added_tag === null || added_tag.length === 0) {
        store.dispatch({
            type: "ADD_TAGS",
            data: {
                errors: "No Tag Selected"
            }
        });
        return;
    } else {
        let data = added_tag.filter(x => !current_user_tag_id.includes(x));
        post("/interest", { interests: { ids: data } }).then(resp => {
            store.dispatch({
                type: "ADD_TAGS",
                data: {
                    errors: null,
                    status: resp.data
                }
            });
        });
    }
}

export function get_recommendation() {
    let state = store.getState();
    let data = state.users;
    post("/find_friends", {
        latitude: data.latitude,
        longitude: data.longitude
    }).then(resp => {

        store.dispatch({
            type: "USERS",
            data: {
                info: resp.data
            }
        });
    });
}

export function get_my_interests_photo_by_id(id) {
    get("/match_photos/" + id).then(resp => {
        store.dispatch({
            type: "USERS",
            data: {
                current_photos: resp.data
            }
        });
    });
}

export function like_user(id) {
    post("/likes/", { like_to_id: id }).then(resp => {
        // do nothing

    });
}


export function get_friends(socket) {
    get('/friends').then((resp) => {
        if (resp) {
            store.dispatch({
                type: 'CHANGE_FRIENDS',
                data: resp
            });
            if (socket) {
                // for each friend, initialize a channel

                _.forEach(resp, (f) => {
                        init_channel(f.id, socket)
                    }

                );

            }
        } else {

        }
    });
}

export function get_all_msg() {
    get('all_msg').then(
        (resp) => {
            if (resp) {
                store.dispatch({
                    type: 'NEW_MSG',
                    data: resp
                });
            } else {

            }
        }
    );
}