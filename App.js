
import * as THREE from 'three';
import ExpoTHREE from 'expo-three';
import Expo from 'expo';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

console.disableYellowBox = true;

export default class App extends React.Component {
 render() {
    return (
      <Expo.GLView
        ref={(ref) => this._glView = ref}
        style={{ flex: 1 }}
        onContextCreate={this._onGLContextCreate}
      />
    );
  }
  _onGLContextCreate = async (gl) => {
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

    const texture = await ExpoTHREE.loadAsync('https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png');

    const geometry = new THREE.BoxGeometry(0.07, 0.07, 0.001);
    const material = new THREE.MeshBasicMaterial({
      // NOTE: How to create an Expo-compatible THREE texture
      map: await ExpoTHREE.createTextureAsync({
        asset: Expo.Asset.fromModule(require('./assets/icons/logo.png')),
      }),
    });
    const cube = new THREE.Mesh(geometry, material);
    camera.position.z = -0.4;
    scene.add(cube);

    const animate = () => {
      requestAnimationFrame(animate);
      cube.rotation.y += 0.001;
      renderer.render(scene, camera);
      gl.endFrameEXP();
    }
    animate();
  }
}