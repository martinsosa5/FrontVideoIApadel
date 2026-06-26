// src/pages/Home.jsx
import React from 'react';
import HeroBanner from '../components/HeroBanner/HeroBanner';
import JugadoresPreview from '../components/JugadoresPreview/JugadoresPreview';
import PartidosPreview from '../components/PartidosPreview/PartidosPreview';
import Organiza from '../components/Organiza/Organiza';
import AfterParty from '../components/AfterParty/AfterParty';
import SmartCamera from '../components/SmartCamera/SmartCamera';

function Home() {
  return (
    <>
      {/* <HeroBanner />
      <PartidosPreview /> 
      <JugadoresPreview />
      <Organiza /> */}
      <SmartCamera />
    </>
  );
}

export default Home;