import React from 'react';

function Contacts() {
    return (
        <div id="contacts" className="container-fluid">
            <div className="container text-white">
                <h3 className="title">Contact Me</h3>
                <hr className="bg-white" />
                <div className="text-center">
                    <a href="https://wa.me/+996779467956" className="text-white">
                        <i className="fa fa-whatsapp fa-3x m-5" aria-hidden="true"></i>
                    </a>
                    <a href="https://telegram.me/nurlandev" className="text-white">
                        <i className="fa fa-telegram fa-3x m-5" aria-hidden="true"></i>
                    </a>
                    <a href="tel:+996779467956" className="text-white">
                        <i className="fa fa-phone fa-3x m-5" aria-hidden="true"></i>
                    </a>
                    <a href="https://www.facebook.com/nurland22" className="text-white">
                        <i className="fa fa-facebook fa-3x m-5" aria-hidden="true"></i>
                    </a>
                    <a href="https://twitter.com/nurland_" className="text-white">
                        <i className="fa fa-twitter fa-3x m-5" aria-hidden="true"></i>
                    </a>
                    <a href="https://instagram.com/nurland_" className="text-white">
                        <i className="fa fa-instagram fa-3x m-5" aria-hidden="true"></i>
                    </a>
                        {/* <form>
                            <div className="form-group">
                                <label htmlFor="email">Email address</label>
                                <input type="email" className="form-control" id="email" placeholder="name@example.com" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="subject">Subject</label>
                                <input type="email" className="form-control" id="subject" placeholder="Subject" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea className="form-control" id="message" rows="3"></textarea>
                            </div>
                            <div className="form-group text-right">
                                <button type="submit" className="btn btn-primary">Send</button>
                            </div>
                        </form> */}
                </div>
            </div>
        </div>
    )
}

export default Contacts;