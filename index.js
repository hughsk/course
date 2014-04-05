var slice = Function.prototype.call.bind(Array.prototype.slice)
var quotemeta = require('quotemeta')
var methods = require('methods')
var url = require('url')

var regex = {
    urlVariable: /^\:(.+)$/
  , trailingSlash: /\/$/g
}

module.exports = createRouter

methods = methods.map(function(method) {
  return method.toUpperCase()
})

function createRouter() {
  var routes = []
  var filter = []

  methods.forEach(function(method) {
    return router[
      method.toLowerCase()
    ] = addRouteFilter(function(filter) {
      return function(path, req, res) {
        return req.method === method
          && filter(path, req, res)
      }
    })
  })

  router.use =
  router.all =
  router.any = addRouteFilter(function(filter) {
    return function(path, req, res) {
      return filter(path, req, res)
    }
  })

  return router

  function router(req, res, done) {
    var path = url.parse(req.url)
      .pathname
      .replace(regex.trailingSlash, '') || '/'

    var start = matches(path, req, res)
    var length = routes.length
    var i = start

    if (typeof start !== 'number') {
      process.nextTick(done)
      return false
    } else {
      process.nextTick(handle)
      return true
    }

    function handle() {
      var ctx = filter[i](path, req, res)

      return ctx
        ? routes[i].call(ctx, req, res, next)
        : next()
    }

    function next(err) {
      if (err) return done(err)
      if (++i === length) return done()
      handle()
    }
  }

  function matches(path, req, res) {
    var l = filter.length

    for (var i = 0; i < l; i++) {
      var r = filter[i](path, req, res)
      if (r) return i
    }
  }

  function addRouteFilter(fn) {
    return function(passes) {
      var middle

      if (typeof passes === 'function') {
        middle = slice(arguments)
        passes = truthy
      } else {
        middle = slice(arguments, 1)
        passes = fn(createFilter(passes))
      }

      for (var i = 0; i < middle.length; i++) {
        filter.push(passes)
        routes.push(middle[i])
      }

      return router
    }
  }

  function createFilter(test) {
    var names = []

    if (typeof test === 'string')
      test = convert(test, names)

    if (!(test instanceof RegExp)) {
      throw new Error(
        'Route should be either a string ' +
        'or a regular expression'
      )
    }

    return function(path) {
      var result = path.match(test)
      if(!result) return null

      var l = names.length
      var output = {}
      var i = 0
      var n = 1

      for (; i < l; i++, n++) {
        output[i] = result[n]

        if (names[i] !== null)
          output[names[i]] = result[n]
      }

      return output
    }
  }

  function convert(url, names) {
    names = names || []

    var expression = url
      .split('/')
      .filter(Boolean)
      .map(decide)
      .join('/')

    return new RegExp(
      '^/' + expression + '$'
    )

    function decide(part) {
      if (part === '*') {
        names.push(null)
        return '([^/]*)'
      }

      var name = part.match(regex.urlVariable)
      if(!name) return quotemeta(part)

      names.push(name[1])
      return '([^/]*)'
    }
  }
}


function truthy() {
  return true
}
