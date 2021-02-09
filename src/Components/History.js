import React from 'react';
import './../Timeline.css';

function History() {
    return (
        <div id="history" className="container text-white">
            <h3>Work history</h3>
            <hr className="bg-white" />
            <div className="p-3">
                <ul className="timeline">
                    <li>
                        <div className="card bg-nn">
                            <div className="card-body">
                                <i>2018, August - 2019, June</i>
                                <h4>Teacher of Computer Science</h4>
                                <div>Teaching students on Computer Science, programming and robotics.</div>
                                <h6>H.Karasaev High School, Karakol, Kyrgyz Republic</h6>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="card bg-nn">
                            <div className="card-body">
                                <i>2019, October - </i>
                                <h4>Frontend Developer</h4>
                                <div>UI and web tasks. Website developments with JavaScript, Java, HTML, CSS.</div>
                                <h6>C-technology Demirbank, Bishkek, Kyrgyz Republic</h6>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default History;