import * as THREE from 'three';
import ExpoTHREE from 'expo-three';
import Expo from 'expo';
import React from 'react';
import { captureScreen } from "react-native-view-shot";
import { 
  Image,
  //ImageBackground,
  InteractionManager,
  StyleSheet, 
  Text, 
  TouchableHighlight,
  View
} from 'react-native';

console.disableYellowBox = true;
paused = false;

// Product data bars
const maxBarLength = 0.2;
const square = 0.005;
var product = '';
var link = 'https://icons.iconarchive.com/icons/paomedia/small-n-flat/72/profile-icon.png';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 0.07,
      height: 0.07,
      w: 150,
      h: 150,
      db: [
        {
          name: 'wallet', 
          reviews: [6, 0, 0, 0, 0],
          photo: './assets/camera.png',
        },
        {
          name: 'echo', 
          reviews: [70, 14, 7, 4, 5],
          photo: './assets/dot.png',
        },
        {
          name: 'patagonia',
          reviews: [71, 8, 5, 13, 3],
          photo: './assets/patagonia.png',
        },
        {
          name: 'phone_case',
          reviews: [75, 11, 5, 4, 5],
          photo: './assets/case.png',
        },
        {
          name: 'grill',
          reviews: [30, 10, 0, 0, 20],
          photo: './assets/grill.png',
        },
        {
          name: 'car',
          reviews: [30, 10, 0, 0, 20],
          photo: './assets/cars.png',
        },
        {
          name: 'toilet_paper',
          reviews: [30, 10, 0, 0, 20],
          photo: './assets/toilet-raper.png',
        }, 
        {
          name: 'Roland',
          reviews: [30, 10, 0, 0, 20],
          photo: './assets/Roalnd.png',
        },
        {
          name: 'tshirt', 
          reviews: [30, 10, 0, 0, 20],
          photo: './assets/tshirt.png',
        },
        {
          name: 'converse',
          reviews: [30, 10, 0, 0, 20],
          reviews: './assets/converse.png',
        }, 
        {
          name: 'crocs',
          reviews: [30, 10, 0, 0, 20],
          reviews: './assets/converse.png',
        },
        {
          name: 'fitbit',
          reviews: [30, 10, 0, 0, 20],
          reviews: './assets/converse.png',
        }
      ],
      header: "Take a photo!",
      objec: "",
      source: { uri: "https://images-na.ssl-images-amazon.com/images/I/41WzAKf5CSL.jpg" }
    };
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      if (!paused) {
        var vibs = this._getInfo();
        if (vibs != product) {
          product = vibs;
        }
      }
    }, 5000);
  }
  
  // Takes what's on screen and displays Google Vision's results in text
  async _takePhoto() {
    paused = !paused;
    this.setState({header: 'Thinking...'});
    if (this._glView) {
      // Convert screenshot to Base64 image
      console.log("Getting Base64...");
      let snapshot = await Expo.takeSnapshotAsync(this._glView, {format: 'png', result: 'base64', quality: 1.0})

      console.log('Converted screenshot.');
      if (snapshot == null) {
        console.log('Snapshot was null.');
      }
      // Turns the Google Vision API response into readable data
      let result = await this._vision(snapshot);
      console.log(result);
      var item = this._analyze(result);
      this.setState({header: item});

      var info = this._item(item);
      console.log(info);
      paused = !paused;
    } else {
      console.log('Could not find GLView.');
    }
  }

  _formatter(s, sNew) {
    console.log("Header: " + s);
    return sNew + " " + s.replace(/(\r\n|\n|\r)/gm," ");
  }

  // Filters Google Vision's API 
  _analyze(result) {
    var header = '';
    var newHeader = '';
    var responses = result.responses[0];
    if (responses != null) {
      if ('logoAnnotations' in responses) {
        newHeader = responses.logoAnnotations[0].description;
        if ('textAnnotations' in responses) {
          newHeader = this._formatter(responses.textAnnotations[0].description, newHeader);
        }
      } else {
        if ('textAnnotations' in responses) {
          header = responses.textAnnotations[0].description;
          newHeader = this._formatter(header, '');
        } else if ('webDetection' in responses) {
          header = responses.webDetection.webEntities[0].description;
          newHeader = this._formatter(header, '');
        } else if ('labelAnnotations' in responses) {
          header = responses.labelAnnotations[0].description;
          newHeader = this._formatter(header, '');
        } else {
          newHeader = 'No results :(';
        }
      }
    } else {
      newHeader = 'No responses';
    }
    return newHeader;
  }

  async _vision(base64) {
    // Fetch from Google Vision
    console.log('Fetching Google Vision API results...');
    return await fetch('https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBd5Bv093rvwS65reLu6Wt2pm1nhXfdi2U', {
      method: 'POST',
      body: JSON.stringify({
        "requests": [
          {
            "image": {
              "content": base64
            },
            "features": [
              {
                //"type": "LOGO_DETECTION",
                //"type": "TEXT_DETECTION",
                "type": "WEB_DETECTION",
                //"type": "LABEL_DETECTION",
              }
            ]
          }
        ]
      })
    }).then((response) => {
      console.log('Google Vision response returned successfully.');
      return response.json();
    }, (err) => {
      console.error('promise rejected')
      console.error(err)
    });
  }

  // Vib's endpoint for item lookup
  // returns: image url, asin, sale rank, price
  async _item(item) {
    try {
      let response = await fetch('http://10.19.186.14:6666/watch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_name: item,
        }),
      });
      console.log(response.json());
      console.log(response._bodyText);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async _getInfo() {
    var request = new XMLHttpRequest();
    console.log('starting');
    request.onreadystatechange = (e) => {
      console.log('success');
      console.log(request);
      if (request.status === 200) {
        console.log(request.responseText);
        if (request.responseText != '') {
          console.log('AKSJDKAJSHDL');
          var url = JSON.parse(request.responseText);
          console.log(url);
          this.setState({source: { uri: url} });
          console.log(this.state.source);
        }
        return;
      }
    };

    request.open('GET', 'http://10.19.186.14:6666/watch');
    request.send();
  }
  // Vib's endpoint for question lookup
  // returns: comprehensive answer to query
  async _question(question) {
    try {
      let response = await fetch('http://10.19.186.14:6666/fakescrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
        }),
      });
      return response._bodyText;
    } catch (error) {
      console.error(error);
    }
  }
  
  /*
  // Test Google Vision by providing static background
  render() {
    return (
      <ImageBackground ref={(ref) => this._glView = ref} source={require('./assets/water.jpg')} style={{width: 400, height: 820}}>
        <TouchableHighlight 
          style={{ position: 'absolute', left: 35, top: 730 }}
          onPress={() => {this._takePhoto()}}>
          <Image
            style={{ width: 60, height: 60 }}
            source={require('./assets/camera.png')}
          />
        </TouchableHighlight>
        <Text style={{ position: 'absolute', left: 80, top: 50, backgroundColor: 'rgba(0,0,0,0)', color: 'black', fontSize: 30}}>
          {this.state.header}
        </Text>
        <Image
          style={{ position: 'absolute', left: 200, top: 650, width: this.state.w, height: this.state.h }}
          source={this.state.source}
          key={this.state.source.uri}
          />
      </ImageBackground>
    );
  }*/

  
  render() {
    phot = 'https://facebook.github.io/react-native/docs/assets/favicon.png';
    return (
      <View>
        <Expo.GLView
          ref={(ref) => this._glView = ref}
          style={{ height: 820 }}
          onContextCreate={this._onGLContextCreate}
        />
        <TouchableHighlight 
          style={{ position: 'absolute', left: 35, top: 730 }}
          onPress={() => {this._takePhoto()}}>
          <Image
            style={{ width: 60, height: 60 }}
            source={require('./assets/camera.png')}
          />
        </TouchableHighlight>
        <Text style={{ position: 'absolute', left: 100, top: 50, backgroundColor: 'rgba(0,0,0,0)', color: 'white', fontSize: 30}}>
          {this.state.header}
        </Text>
         <Image
          style={{ position: 'absolute', left: 200, top: 650, width: this.state.w, height: this.state.h }}
          source={this.state.source}
          key={this.state.source.uri}
          />
      </View>
    );
  }
  
  _onGLContextCreate = async (gl) => {
    console.log("working");
    const arSession = await this._glView.startARSessionAsync();

    const scene = new THREE.Scene();
    const camera = ExpoTHREE.createARCamera(
      arSession,
      gl.drawingBufferWidth,
      gl.drawingBufferHeight,
      0.01,
      1000
    );
    const renderer = ExpoTHREE.createRenderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    scene.background = ExpoTHREE.createARBackgroundTexture(arSession, renderer);

    // Draw Amazon Item
    const url = 'https://www.biography.com/.image/t_share/MTE5NDg0MDU0ODczNDc0NTc1/ben-affleck-9176967-2-402.jpg';
    const textureAsset = await ExpoTHREE.loadAsync(url);
    const texture = new THREE.Texture();
    texture.image = {
      data: textureAsset,
      width: textureAsset.width,
      height: textureAsset.height,
    };
    const geometry = new THREE.BoxGeometry(this.state.width, this.state.height, 0.001);
    const material = new THREE.MeshBasicMaterial({
      // NOTE: How to create an Expo-compatible THREE texture
      map: await ExpoTHREE.createTextureAsync({
        asset: Expo.Asset.fromModule(require('./assets/soylent.jpeg')),
      }),
    });
    const cube = new THREE.Mesh(geometry, material);
    camera.position.z = -0.4;
    scene.add(cube);

    /*
    // Draw Header
    var loader = new THREE.FontLoader();
    loader.load( './fonts/helvetiker_regular.typeface.json', function ( font ) {

      var textGeometry = new THREE.TextGeometry( 'Amazon Alexa Dot', {
        font: font,
        size: 80,
        height: 5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 10,
        bevelSize: 8,
        bevelSegments: 5
      } );
    } );

    var textMaterials = [
      new THREE.MeshBasicMaterial( { color: 0xffffff, overdraw: 0.5 } ),
      new THREE.MeshBasicMaterial( { color: 0x000000, overdraw: 0.5 } )
    ];
    
    var mesh = new THREE.Mesh( textGeometry, textMaterials );
    mesh.position.x = 0;
    mesh.position.y = 100;
    mesh.position.z = 0;
    group = new THREE.Group();
    group.add( mesh );
    scene.add( group );*/

    
    // Draw Reviews
    const reviews = this.state.db[3].reviews;
    var total = 0;
    for(var i in reviews) { total += reviews[i]; }

    var pos = this.state.height / 2;
    for (i=0; i < 5; i++) {
      var count = reviews[i];
      if (count == 0) {count = 0.001}
      var w = maxBarLength * count / total;

      var reviewGeometry = new THREE.BoxGeometry(w, square, square);
      var reviewMaterial = new THREE.MeshBasicMaterial({ color: 0xf2f23e });
      var review = new THREE.Mesh(reviewGeometry, reviewMaterial);
      review.position.x = - w / 2 - this.state.width / 2 - 0.005;
      pos = pos - 0.010;
      review.position.y = pos;
      scene.add(review);
    }

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    }
    animate();
  }
}