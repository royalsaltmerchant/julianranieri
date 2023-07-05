#!/bin/bash

pushd tools
  node templateEngine.js
  node generateFileStructure.js
popd