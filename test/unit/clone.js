'use strict';

var fs = require('fs');
var assert = require('assert');

var sharp = require('../../index');
var fixtures = require('../fixtures');

sharp.cache(0);

describe('Clone', function() {
  it('Read from Stream and write to multiple Streams', function(done) {
    var finishEventsExpected = 2;
    // Output stream 1
    var output1 = fixtures.path('output.multi-stream.1.jpg');
    var writable1 = fs.createWriteStream(output1);
    writable1.on('finish', function() {
      sharp(output1).toBuffer(function(err, data, info) {
        if (err) throw err;
        assert.strictEqual(true, data.length > 0);
        assert.strictEqual(data.length, info.size);
        assert.strictEqual('jpeg', info.format);
        assert.strictEqual(320, info.width);
        assert.strictEqual(240, info.height);
        fs.unlinkSync(output1);
        finishEventsExpected--;
        if (finishEventsExpected === 0) {
          done();
        }
      });
    });
    // Output stream 2
    var output2 = fixtures.path('output.multi-stream.2.jpg');
    var writable2 = fs.createWriteStream(output2);
    writable2.on('finish', function() {
      sharp(output2).toBuffer(function(err, data, info) {
        if (err) throw err;
        assert.strictEqual(true, data.length > 0);
        assert.strictEqual(data.length, info.size);
        assert.strictEqual('jpeg', info.format);
        assert.strictEqual(100, info.width);
        assert.strictEqual(122, info.height);
        fs.unlinkSync(output2);
        finishEventsExpected--;
        if (finishEventsExpected === 0) {
          done();
        }
      });
    });
    // Create parent instance
    var rotator = sharp().rotate(90);
    // Cloned instances with differing dimensions
    rotator.clone().resize(320, 240).pipe(writable1);
    rotator.clone().resize(100).pipe(writable2);
    // Go
    fs.createReadStream(fixtures.inputJpg).pipe(rotator);
  });
});