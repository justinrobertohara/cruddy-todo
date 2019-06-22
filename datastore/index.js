const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');
const readDirPromise = Promise.promisify(fs.readdir);
const readFilePromise = Promise.promisify(fs.readFile);


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
  var final = [];
  return readDirPromise(exports.dataDir)
    .then(function(files) {
      var data = [];
      for (let i = 0; i < files.length; i++) {
        var fileName = exports.dataDir + '/' + files[i];
        data.push(readFilePromise(fileName, 'utf8'));
      }
      return Promise.all(data).then(function(data2) {
        for (var j = 0; j < data2.length; j++) {
          final.push(
            {id: files[j],
              text: data2[j]}
          );
        }
        callback(null, final);
      });
    })
    .catch(function(err) {
      console.log('we got an error:', err);
    });
  // callback(null, final)
  // fs.readdir(exports.dataDir, (err, files) => {
  //   if (err) {
  //     callback(err);
  //   } else {
  //     var data = [];
  //     for (let i = 0; i < files.length; i++) {
  //       exports.readOne(files[i].substring(0, 5), function(err, todo) {
  //         if (err) {
  //           callback(err);
  //         } else {
  //           console.log(todo, 'this is our todo <-')
  //           var obj = {};
  //           obj['id'] = files[i].substring(0, 5);
  //           obj['text'] = todo;
  //           data.push(obj);
  //         }
  //       }) 
  //     }
  //   }
  //   callback(null, data);
  // });

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
  // var item = items[id];
  var fileName = exports.dataDir + '/' + id + '.txt';

  exports.readOne(id, function(err, fileText) {
    if (err) {
      callback(new Error(`Error reading file id: ${id}`));
    } else {
      fs.writeFile(fileName, text, function(err2, newText) {
        if (err2) {
          callback(new Error(`Error writing new file: ${id}`));
        } else {
          callback(null, { id, text });
        }
      });
    }
  });

};

exports.delete = (id, callback) => {
  let deleteFileName = exports.dataDir + '/' + id + '.txt';
  fs.unlink(deleteFileName, err => {
    if (err) {
      callback(err);
    } else {
      callback();
    }  
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
