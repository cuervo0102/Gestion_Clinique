import React from 'react';
import '../tooplate-style.css';
import 'bootstrap/dist/css/bootstrap.min.css';



const HomeSection = () => {
  return (
    <section id="home" className="slider" data-stellar-background-ratio="0.5">
      <div className="container">
        <div className="row">
          <div className="owl-carousel owl-theme">
            <div className="item item-first">
              <div className="caption">
                <div className="col-md-offset-1 col-md-10">
                  <h3>Let's make your life happier</h3>
                  <h1>Healthy Living</h1>
                  <a href="#team" className="section-btn btn btn-default smoothScroll">
                    Meet Our Doctors
                  </a>
                </div>
              </div>
            </div>

            <div className="item item-second">
              <div className="caption">
                <div className="col-md-offset-1 col-md-10">
                  <h3>Aenean luctus lobortis tellus</h3>
                  <h1>New Lifestyle</h1>
                  <a href="#about" className="section-btn btn btn-default btn-gray smoothScroll">
                    More About Us
                  </a>
                </div>
              </div>
            </div>

            <div className="item item-third">
              <div className="caption">
                <div className="col-md-offset-1 col-md-10">
                  <h3>Pellentesque nec libero nisi</h3>
                  <h1>Your Health Benefits</h1>
                  <a href="#news" className="section-btn btn btn-default btn-blue smoothScroll">
                    Read Stories
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeSection;
