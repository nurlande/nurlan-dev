import React from 'react';

function ProjectCard(props) {
    return (
        <div className="col-sm-4 project-image">
            <div className="text-center">
                <a href={props.project.link} target="_blank" rel="noreferrer">
                    <img src={props.project.image} className=" img img-fluid" alt="aikosoft website screen" />
                </a>
                <h5><b>{props.project.name}</b></h5>
                <p>{props.project.description}</p>
            </div>
        </div>
    );
}

export default ProjectCard;