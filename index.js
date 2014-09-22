#!/usr/bin/env node

var fs = require('fs')
var split = require('split')
var stream = require('stream')

var file = process.argv[2]

if (!fs.existsSync(file)) {
  console.log('pass in a file')
  process.exit(1)
}

var fileStream = fs.createReadStream(file)

var pidStream = new stream.Transform({decodeStrings: false})

var files = {}

pidStream._write = function (data, encoding, done) {

  if (data.length) {
    var pid = ''
    try {
      pid = JSON.parse(data).pid
    } catch (e) {
      return done()
    }

    if (pid) {
      if (!files[pid]) {
        files[pid] = fs.createWriteStream('./' + pid + '.log')
      }
      files[pid].write(data + '\n')
    }
  }
  done()
}

pidStream._flush = function (done) {
  var pids = Object.keys(files)
  for (var i = 0; i < pids.length; i++) {
    files[pids[i]].end()
  }
  done()
}

fileStream.pipe(split()).pipe(pidStream)