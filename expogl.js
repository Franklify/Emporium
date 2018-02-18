
import * as THREE from 'three';
import ExpoTHREE from 'expo-three';
import Expo from 'expo';
import React from 'react';
import { 
  Image,
  StyleSheet, 
  Text, 
  View
} from 'react-native';

console.disableYellowBox = true;
const endpoint = 'http://10.19.186.14:6666/fakescrape';

const maxBarLength = 0.2;
const square = 0.005;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      width: 0.07,
      height: 0.07,
      reviews: [30, 10, 0, 0, 20],
      texter: "thinking..."
    };
  }

  /*componentWillMount() {
    //var testQuestion = "What's it made of?";
    //this._question(testQuestion);
  }

  async _item(item) {
    try {
      let response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item: item,
        }),
      });
      this.setState({texter: response._bodyText})
      return response._bodyText;
    } catch (error) {
      console.error(error);
    }
  }

  async _question(question) {
    try {
      let response = await fetch(endpoint, {
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
  }*/

  /*render() {
    return (
      <View style={styles.container}>
        <Text>{this.state.texter}</Text>
      </View>
    );
  }*/

  render() {
    console.log("working");
    return (
      <Expo.GLView
        ref={(ref) => this._glView = ref}
        style={{ flex: 1 }}
        onContextCreate={this._onGLContextCreate}
      />
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

    // Draw Header


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