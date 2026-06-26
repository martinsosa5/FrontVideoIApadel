// src/pages/Home.jsx
import React from 'react';
import HeroBanner from '../components/HeroBanner/HeroBanner';
import JugadoresPreview from '../components/JugadoresPreview/JugadoresPreview';
import PartidosPreview from '../components/PartidosPreview/PartidosPreview';
import Organiza from '../components/Organiza/Organiza';
import AfterParty from '../components/AfterParty/AfterParty';
import SmartCamera from '../components/SmartCamera/SmartCamera';
import SmartCameraModule from '../components/SmartCamera/SmartCameraModule';

function Home() {
  return (
    <>
      {/* <HeroBanner />
      <PartidosPreview /> 
      <JugadoresPreview />
      <Organiza /> */}
      <SmartCameraModule />
    </>
  );
}

export default Home;