var albumBucketName = 'moitest';
var bucketRegion = 'ap-northeast-2';
var IdentityPoolId = 'ap-northeast-2:4cf237d2-ea9e-4783-a6ec-3ef40048dfdb';

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
});

var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {Bucket: albumBucketName}
});


function listAlbums() {
    s3.listObjects({Delimiter: '/'}, function(err, data) {
      if (err) {
        return alert('There was an error listing your albums: ' + err.message);
      } else {
        var albums = data.CommonPrefixes.map(function(commonPrefix) {
          var prefix = commonPrefix.Prefix;
          var albumName = decodeURIComponent(prefix.replace('/', ''));
          return getHtml([
            '<li style="list-style: none">',
              // '<span onclick="deleteAlbum(\'' + albumName + '\')">X</span>',
              '<span onclick="viewAlbum(\'' + albumName + '\')">',
                albumName,
              '</span>',
            '</li>'
          ]);
        });
        var message = albums.length ?
          getHtml([
            // '<p>Click on an album name to view it.</p>',
            // '<p>Click on the X to delete the album.</p>'
          ]) :
          '<p>You do not have any albums. Please Create album.';
        var htmlTemplate = [
          // '<h2>Albums</h2>',
          message,
          '<ul>',
            getHtml(albums),
          // '</ul>',
          // '<button onclick="createAlbum(prompt(\'Enter Album Name:\'))">',
          //   'Create New Album',
          // '</button>'
        ]
        document.getElementById('app').innerHTML = getHtml(htmlTemplate);
      }
    });
  }

  function createAlbum(albumName) {
    albumName = albumName.trim();
    if (!albumName) {
      return alert('Album names must contain at least one non-space character.');
    }
    if (albumName.indexOf('/') !== -1) {
      return alert('Album names cannot contain slashes.');
    }
    var albumKey = encodeURIComponent(albumName) + '/';
    s3.headObject({Key: albumKey}, function(err, data) {
      if (!err) {
        return alert('Album already exists.');
      }
      if (err.code !== 'NotFound') {
        return alert('There was an error creating your album: ' + err.message);
      }
      s3.putObject({Key: albumKey}, function(err, data) {
        if (err) {
          return alert('There was an error creating your album: ' + err.message);
        }
        alert('Successfully created album.');
        viewAlbum(albumName);
      });
    });
  }

  function viewAlbum(albumName) {
    var albumPhotosKey = encodeURIComponent(albumName) + '//';
    s3.listObjects({Prefix: albumPhotosKey}, function(err, data) {
      if (err) {
        return alert('There was an error viewing your album: ' + err.message);
      }
      // 'this' references the AWS.Response instance that represents the response
      var href = this.request.httpRequest.endpoint.href;
      var bucketUrl = href + albumBucketName + '/';
  
      var photos = data.Contents.map(function(photo) {
        var photoKey = photo.Key;
        var photoUrl = bucketUrl + encodeURIComponent(photoKey);
        return getHtml([
        ]);
      });
      var message = photos.length ?
        '<p></p>' :
        '<p></p>';
      var htmlTemplate = [

        message,
        // '<div>',
        //   getHtml(photos),
        // '</div>',
        '<input id="photoupload" type="file" accept="image/*;capture=camera">',
        '<button id="addphoto" onclick="addPhoto(\'' + albumName +'\')">',
          '답안 제출하기',
        '</button>',

      ]
      document.getElementById('app').innerHTML = getHtml(htmlTemplate);
    });
  }

  function addPhoto(albumName) {
    var files = document.getElementById('photoupload').files;
    if (!files.length) {
      return alert('Please choose a file to upload first.');
    }
    const code = document.getElementById("code")
  
    var file = files[0];
    var fileName = code.value+"png";
    var albumPhotosKey = encodeURIComponent(albumName) + '//';
  
    var photoKey = albumPhotosKey + fileName;
    s3.upload({
      Key: photoKey,
      Body: file,
      ACL: 'public-read'
    }, function(err, data) {
      if (err) {
        return alert('There was an error uploading your photo: ', err.message);
      }
      alert('성공적으로 제출했습니다!');
      viewAlbum(albumName);
    });
  }

  function deletePhoto(albumName, photoKey) {
    s3.deleteObject({Key: photoKey}, function(err, data) {
      if (err) {
        return alert('There was an error deleting your photo: ', err.message);
      }
      alert('Successfully deleted photo.');
      viewAlbum(albumName);
    });
  }

  function deleteAlbum(albumName) {
    var albumKey = encodeURIComponent(albumName) + '/';
    s3.listObjects({Prefix: albumKey}, function(err, data) {
      if (err) {
        return alert('There was an error deleting your album: ', err.message);
      }
      var objects = data.Contents.map(function(object) {
        return {Key: object.Key};
      });
      s3.deleteObjects({
        Delete: {Objects: objects, Quiet: true}
      }, function(err, data) {
        if (err) {
          return alert('There was an error deleting your album: ', err.message);
        }
        alert('Successfully deleted album.');
        listAlbums();
      });
    });
  }