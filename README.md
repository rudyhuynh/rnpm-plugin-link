# React Native Link Images
[This project are in progress]

## What is this?
Similar to `react-native link`, but instead, `react-native link-images` will link your images to android and ios project in React Native project.

## Installation
````
npm install rudyhuynh/rnpm-plugin-link-images@v2.0.0 --save-dev
````

## Usage
* Assumes your images are in `src/assets` (ex: image-file-name.png), update your `package.json`:
````
"rnpm": {
  "assets": [
    "src/assets"
  ]
}
````
* Run `react-native link-images`
* Using linked images in React Native:
````
<Image source={{uri: 'image-file-name.png'}} />
````