import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/publicLayout/PublicHeader";
import Footer from "../../components/publicLayout/PublicFooter";
import ChooseYourPath from "../../components/landing/ChooseYourPath";
import Features from "../../components/landing/Features";
import HowItWorks from "../../components/landing/HowItWorks";
import Trending from "../../components/landing/Trending";

export default function Landing() {
  return (
    <>
      <Header />
      <main>
        <section id="home" className="hero-section">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-7">
                <h1 className="display-4 slogan">
                  <span className="slogan-word">
                    <span className="slogan-initial">B</span>
                    <span className="slogan-rest">uild.</span>
                  </span>{" "}
                  <span className="slogan-word">
                    <span className="slogan-initial">B</span>
                    <span className="slogan-rest">log.</span>
                  </span>{" "}
                  <span className="slogan-word">
                    <span className="slogan-initial">C</span>
                    <span className="slogan-rest">onnect.</span>
                  </span>
                </h1>
                <p className="lead quote">
                  Welcome to the rabbit hole. Enjoy the trip.
                </p>
                <p>
                  <Link className="btn btn-cta" to="/blogs" role="button">
                    Browse Blogs
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
        <ChooseYourPath />
        <Features />
        <HowItWorks />
        <Trending />
      </main>
      <Footer />
    </>
  );
}
