import axios from 'axios';


  /**
   * if REACT_APP_API_URL is set, we send back end requests to that, otherwise
   * we default to the same host that served up the client
   * useful for dev mode where the server might be hosted on a different url
   */
  const baseUrl = function() {
    console.log("baseUrl: " + process.env.REACT_APP_API_URL);

    return (process.env.REACT_APP_API_URL) ? process.env.REACT_APP_API_URL : "";
  }

const loginState = {
    storageKey : "login",

    set : function (val) {
        localStorage.setItem(this.storageKey, JSON.stringify(val));
    },

    get : function () {
        const str = localStorage.getItem(this.storageKey);
        return JSON.parse(str);
    }
}

const SpotifyApi = {

    isLoggedIn() {
        console.log("isLoggedIn: loginState: " + loginState.get())
        return loginState.get();
    },

    getLoginUrl() {
       return baseUrl() + "/api/login";
    },

    authenticated() {
        return new Promise((resolve, reject) => {
            axios.get(`/api/authenticated`).then(res => {
                console.log(res);
                console.log("authenticated: loginState: " + loginState.get())

                loginState.set(res.data);

                resolve(res.data);
            }).catch((e) => {
                console.log("error: " + JSON.stringify(e.response));

                resolve("error");
            })
        })
    },

     logout() {
        console.log("logout");
        loginState.set(false);
    },

    me() {
        return new Promise((resolve, reject) => {
            return axios.get(`/api/spotify/me`).then(res => {
                console.log(res);

                resolve(res.data);
            }).catch((e) => {
                console.log("error: " + JSON.stringify(e.response));

                reject("error");
            })
        })
    },

    getPlayLists() {
        return new Promise((resolve, reject) => {
            return axios.get(`/api/spotify/playlists`).then(res => {
                console.log(res);

                resolve(res.data);
            }).catch((e) => {
                console.log("error: " + JSON.stringify(e.response));

                reject("error");
            })
        })
    },

    shuffle(id) {
        return new Promise((resolve, reject) => {
            return axios.get(`/api/spotify/shuffle?playListId=` + id).then(res => {
                console.log(res);

                resolve(res.data);
            }).catch((e) => {
                console.log("error: " + JSON.stringify(e.response));

                reject("error");
            })
        })
    },

    progress() {
        return new Promise((resolve, reject) => {
            return axios.get(`/api/spotify/progress`).then(res => {
                console.log(res);

                resolve(res.data);
            }).catch((e) => {
                console.log("error: " + JSON.stringify(e.response));

                reject("error");
            })
        })
    },

};

export default SpotifyApi;