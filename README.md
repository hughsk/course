# course [![Flattr this!](https://api.flattr.com/button/flattr-badge-large.png)](https://flattr.com/submit/auto?user_id=hughskennedy&url=http://github.com/hughsk/course&title=course&description=hughsk/course%20on%20GitHub&language=en_GB&tags=flattr,github,javascript&category=software)[![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges) #

A framework-independent express-like router.

## Usage ##

[![course](https://nodei.co/npm/course.png?mini=true)](https://nodei.co/npm/course)

### `router = require('course')()` ###

Creates a new router.

### `router[method]([urlPattern], middlewares...)` ###

Adds a new middleware to the router. `method` is an HTTP verb, such as `get`,
`post` or `put`, to filter requests by the request method used.

The first argument may optionally be a URL pattern or regular expression to
match URLs against. Each argument after the URL is an express-style middleware
function with the signature `(req, res, next)`.

### `router.any([urlPattern], middlewares...)` ###

Same as above, however without filtering by request method.

## Example ##

``` javascript
var db     = require('some-database')
var course = require('course')
var http   = require('http')
var router = course()

var server = http.createServer(function(req, res) {
  router(req, res, function(err) {
    if (err) return res.end(err.message)
    res.end('404')
  })
})

router.all(function(req, res, next) {
  // do something on every request...
  next()
})

// pass in URL filters, and multiple
// middlewares
router.get('/'
  , getUserData
  , loadHomeView
  , render
)

function getUserData(req, res, next) {
  db.getUser(function(err, user) {
    if (err) return next(err)
    req.user = user
    next()
  })
}

function loadHomeView(req, res, next) {
  req.view = require('./views/home')
  next()
}

function render(req, res, next) {
  req.end(req.view({
    user: req.user
  }))
}

// Or capture URL paths:
router.get('/user/:username/*', function(req, res, next) {
  var name = this.username
  var page = this[1]
})
```

## License ##

MIT. See [LICENSE.md](http://github.com/hughsk/course/blob/master/LICENSE.md) for details.
