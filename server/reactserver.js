const express = require('express'); // Express web server framework
const cors = require('cors')
const cookieParser = require('cookie-parser');
const session = require("express-session");
const path = require('path');

const Redirect = require('./redirect');

var JsonResponse = function (res) {
    this.send = function (obj) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(obj));
    };

    this.error = function (err) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500);
        res.send(JSON.stringify(err));
    };
}

/**
 * do a bunch of default initialization for a backend/frontend app
 * such as cors support, static dir and session state
 * 
 * @param {String} clientDirStatic directory for client static files
 * @returns an initialized express app
 */
const initExpress = function (clientDirStatic) {
    const app = express();

    app.use(cors())

    app.use(express.static(clientDirStatic))
        .use(cookieParser());

    app.use(
        session({
            secret: "MyMiddlewareSecretSessionId",
            resave: true,
            saveUninitialized: true
        })
    );

    return app;
}

const ReactServer = function (clientDirStatic) {
    const app = initExpress(clientDirStatic);

    /**
     * start the server on the specified port
     * 
     * @param {Number} port 
     */
    this.listen = function (port) {
        // catch all other non-API calls and redirect back to our REACT app
        app.get('/*', function (req, res) {
            const defaultFile = path.join(clientDirStatic, 'index.html');
            res.sendFile(defaultFile);
        });

        app.listen(port);
    }


    /**
     * We don't do anything here at the moment, but we might want to initialize
     * user data later.
     * 
     * @param {Object} session 
     */
    this.login = function (session) {
        return true;
    }

    /**
     * Kills any current session data, effectively resetting user state
     * 
     * @param {Object} session 
     * @returns true if the session was destroyed
     */
    this.logout = function (session) {

        return new Promise(function (resolve, reject) {
            if (session) {
                session.destroy(err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            }
        });

    }

    /**
     * Do all the pre and post processing from the raw express function to our 
     * higher level functions.  The idea is to allow the functions to focus on 
     * taking an action and returning a JSON result.  
     * The supplied fn will be get access to session
     * and query data.  By default, the function will return a  
     * Javascript object that will be turned into JSON to send back.  Some
     * special objects can be returned instead of JSON to handle other cases
     * where a result isn't being returned.  A redirect is the most common example.
     * In those cases, the fn just returns a redirect object, which will then be
     * processed by this function.
     * 
     * @param {String} path 
     * @param {Function} fn user supplied function that will received a context object
     */
    const getMethod = function (path, fn) {

        const handler = function (req, res) {
            const jsonResponse = new JsonResponse(res);

            // call the function supplied and process the result
            console.log(`DEBUG: handler for ${path} called.`);

            fn({ session: req.session, query: req.query })
                .then((result) => {

                    // if result is an instance of a special object (like a redirect)
                    // we handle that here.  Otherwise we assume it's a JSON response and
                    // send that back

                    if (result instanceof Redirect) {
                        console.log('DEBUG: found redirect!');

                        const url = result.getUrl();
                        res.redirect(url);
                    } else {
                        jsonResponse.send(result);
                    }
                })
                .catch((e) => {

                    // errors are processed as 500 errors with a message
                    if (e instanceof Error) {
                        console.log('DEBUG: caught error: ', e.message);
                        jsonResponse.error(e.message);
                    } else {
                        // if it's not an error object, just return the raw error
                        console.log('DEBUG: caught error: ', e);
                        jsonResponse.error(e);
                    }
                })
        }

        // register this path with our handler function to wrap the user function
        app.get(path, handler);
    }

    /**
     * main function for defining REST methods for this server
     * 
     * @param {String} path path for this method
     * @param {String} verb GET (for now)
     * @param {Function} fn function called when this method is invoked
     */
    this.method = function (path, verb, fn) {
        switch (verb.toUpperCase()) {
            case 'GET':
                return getMethod(path, fn);

            default:
                throw new Error(`invalid verb ${verb} supplied to method`)
        }
    }
}

module.exports = ReactServer;