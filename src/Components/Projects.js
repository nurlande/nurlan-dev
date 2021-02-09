import React from 'react';
import fire from '../config/fire';
import ProjectCard from './Common/ProjectCard';
import Loading from './Common/Loading';

class Projects extends React.Component {
    constructor() {
        super();
        this.state = {
            projects: [],
            loading: true
        };
    }
    componentDidMount() {
        this.getProjects();
    }
    getProjects() {
        const db = fire.firestore();
        db.collection("projects").get().then(querySnapshot => {
            const data = querySnapshot.docs.map(doc => {
                const dats = doc.data()
                return { id: doc.id, ...dats }
            });
            console.log(data);
            this.setState({
                projects: data,
                loading: false
            })
        });
    }
    render() {
        const projects = this.state.projects.map(
            (proj) => <ProjectCard key={proj.id} project={proj} />)
        return (
            <div className="container-fluid text-white" id="projects">
                <div className="container">
                    <h2>Projects</h2>
                    <hr className="bg-white" />
                    <div className="text-right">
                        <a href="/projects" className="btn btn-outline-primary btn-sm">All Projects <i className="fa fa-angle-right"></i></a>
                    </div>
                    {this.state.loading ? (<Loading />) : (<div className="row">{projects}</div>)}

                </div>
            </div>
        )
    }
}

export default Projects;