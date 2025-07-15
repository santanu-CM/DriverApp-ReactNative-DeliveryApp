import { NavigationContainerRef } from '@react-navigation/native';
import React from 'react';

const navigationRef = React.createRef();

export function navigate(name, params) {
    console.log(name,params, 'sfsdhflhdksfhdksjfhkdshfkdshfkdshfkdhskfhskfh')
  if (navigationRef.current) {
    navigationRef.current.navigate(name, params);
  }
}

export function getNavigationRef() {
  return navigationRef;
}