import React, { Component } from 'react';
import { BrowserRouter as Router} from 'react-router-dom';

class DebugRouter extends Router {
    constructor(props){
      super(props);
      
      this.history.listen((location, action)=>{
        console.log(
          `The current URL is ${location.pathname}${location.search}${location.hash}`
        )
        console.log(`The last navigation action was ${action}`, JSON.stringify(this.history, null,2));
      });
    }
  }

  export default DebugRouter;