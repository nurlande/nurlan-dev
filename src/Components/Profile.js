import React from 'react';

function Profile() {
  return (
    <div className="container">
        <div className="card border-light mb-3 profile-card bg-nn">
            <div className="card-body text-white">
                <div className="row">
                    <div className="col-sm-6 text-left pt-5 pr-5">
                        <h3 className="header mt-5">Hi, I'm Nurlan</h3>
                        <p>Front-end JavaScript Developer</p>
                        <p className="font-size-xs">
                        I am a competent Front-end Web Developer with a track record in versatiling websites, coding and programming. I have good technical and problem solving skills, enabling me to solve problems in website developing and fixing bugs.
                        </p>
                        <hr className="bg-light"/>
                        <div>
                            <div className="my-2"><i className="fa fa-calendar mr-1"></i> 20th September 1995</div> 
                            <div className="my-2"><i className="fa fa-home mr-1"></i> Bishkek, Kyrgyz Republic</div>
                            <div className="my-2"><i className="fa fa-phone mr-"></i>  +996 (779) 467 956</div>
                            <div className="my-2"><i className="fa fa-envelope mr-1"></i> kurmanbekov2222@mail.com</div>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <img className="img img-fluid" src="./assets/t3.png" alt="pic" />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

export default Profile;