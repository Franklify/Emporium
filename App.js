
import * as THREE from 'three';
import ExpoTHREE from 'expo-three';
import Expo from 'expo';
import React from 'react';
import { captureScreen } from "react-native-view-shot";
import { 
  Image,
  StyleSheet, 
  Text, 
  TouchableHighlight,
  View
} from 'react-native';

console.disableYellowBox = true;

const maxBarLength = 0.2;
const square = 0.005;
const changed = true;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 0.07,
      height: 0.07,
      reviews: [30, 10, 0, 0, 20],
      header: "Take a photo!",
    };
  }
  
  async _takePhoto() {
    this.setState({header: 'Thinking...'});
    if (this._glView) {
      console.log("Getting Base64...");
      let snapshot = await Expo.takeSnapshotAsync(this._glView, {format: 'png', result: 'base64', quality: 1.0})

      console.log('Converted screenshot.');
      if (snapshot == null) {
        console.log('Snapshot was null.');
      }
      let result = await this._vision(snapshot);
      if (result.responses[0].labelAnnotations[0].description != null) {
        console.log(result.responses[0].labelAnnotations[0].description);
        var newHeader = result.responses[0].labelAnnotations[0].description;
        this.setState({header: newHeader.charAt(0).toUpperCase() + newHeader.slice(1)})
      }
    } else {
      console.log('Could not find GLView.');
    }
  }

  async _vision(base64) {
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
                "type": "LABEL_DETECTION"
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

  async _item(item) {
    try {
      let response = await fetch('http://10.19.186.14:6666/get_info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item: item,
        }),
      });
      this.setState({texter: response._bodyText})
      // image url, sale rank, price
      return response._bodyText;
    } catch (error) {
      console.error(error);
    }
  }

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
      this.setState({texter: response._bodyText})
      return response._bodyText;
    } catch (error) {
      console.error(error);
    }
  }

  render() {
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
    const url = 'https://www.biography.com/.image/t_share/MTE5NDg0MDU0ODczNDc0NTc1/ben-affleck-9176967-2-402.jpg'
    const texture = await ExpoTHREE.loadAsync(url);
    const geometry = new THREE.BoxGeometry(this.state.width, this.state.height, 0.001);
    const material = new THREE.MeshBasicMaterial({
      map: await ExpoTHREE.createTextureAsync({
        asset: Expo.Asset.fromModule(require('./assets/dot.jpg')),
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
    const reviews = this.state.reviews;
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
      //review.position.x = -0.1;
      review.position.y = pos;
      scene.add(review);
    }

    const animate = () => {
      requestAnimationFrame(animate);
      //cube.rotation.y += 0.001;
      renderer.render(scene, camera);
      gl.endFrameEXP();
    }
    animate();
  }
}