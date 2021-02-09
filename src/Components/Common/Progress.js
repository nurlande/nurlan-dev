import React from 'react';

function Progress(props) {
    const classBar = "progress-bar progress-bar-striped " + props.skill.background; 
  return (
    <div className="mb-3 row">
        <div className="col-sm-2">{props.skill.name}</div>
        <div className="col-sm-10">
            <div className="progress">
                <div className={classBar} role="progressbar" 
                style={{width: props.skill.percent+"%"}} aria-valuenow="10" aria-valuemin="0" 
                aria-valuemax="100">{props.skill.percent + "%"}</div>  
            </div>
        </div>
    </div>
  );
}

export default Progress;