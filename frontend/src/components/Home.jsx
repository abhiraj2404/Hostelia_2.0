import React from "react";
import Hero from "./homeComponents/Hero";
import About from "./homeComponents/About";
import Services from "./homeComponents/Services";
import Features from "./homeComponents/Features";
import FAQ from "./homeComponents/FAQ";

const Home = () => {
  return (
    <div>
      <div id="home">
        <Hero />
      </div>
      <div id="about">
        <About />
      </div>
      <div id="services">
        <Services />
      </div>
      <div id="features">
        <Features />
      </div>
      <div id="faq">
        <FAQ />
      </div>
    </div>
  );
};

export default Home;
