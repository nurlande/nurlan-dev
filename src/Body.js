import React from 'react';
import Profile from './Components/Profile';
import Skills from './Components/Skills';
import Projects from './Components/Projects';
import Contacts from './Components/Contacts';
import History from './Components/History';
// import Storage from './Storage';
// import fire from './../fire';

class Body extends React.Component {

  render() {
    return (
      <div> {/* Nav Menu fix and set*/}
        <Profile />
        <Skills /> {/* AutoIncrement Animation: Next sprint*/}
        <Projects />
        <History />
        <Contacts /> {/* Detailed info Email send add: Next spring*/}
        {/* Alternatively add feedback block: Next sprint*/}
      </div>
    );
  }
}

export default Body;
