const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  var id = counter.getNextUniqueId(function(err, uniqueId) {
    if (err) {
      callback(err);
    } else {
      var fileName = exports.dataDir + '/' + uniqueId + '.txt';
      fs.writeFile(fileName, text, function(err, data) {
        if (err) {
          callback(err);
        } else {
          id = uniqueId;
          //console.log('this is our object ', { id, text }, ' this is the type ', typeof { id, text });
          callback(null, { id, text });
        }
      });
    }
  });
  
  //items[id] = text;
};

exports.readAll = (callback) => {
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      callback(err);
    } else {
      var data = [];
      for (let i = 0; i < files.length; i++) {
        var obj = {};
        obj['id'] = files[i].substring(0, 5);
        obj['text'] = files[i].substring(0, 5);
        data.push(obj);
      }
    }
    callback(null, data);
  });
  
};

exports.readOne = (id, callback) => {
  var fileName = exports.dataDir + '/' + id + '.txt';
  fs.readFile(fileName, 'utf8', function(err, file) {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      var text = file;
      callback(null, { id, text });
    }
  });
};

exports.update = (id, text, callback) => {
  var item = items[id];
  if (!item) {
    callback(new Error(`No item with id: ${id}`));
  } else {
    items[id] = text;
    callback(null, { id, text });
  }
};

exports.delete = (id, callback) => {
  var item = items[id];
  delete items[id];
  if (!item) {
    // report an error if item not found
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback();
  }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
