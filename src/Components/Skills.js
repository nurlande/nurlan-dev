import React from 'react';
import Progress from './Common/Progress';
import fire from '../config/fire';
import Loading from './Common/Loading';

class Skills extends React.Component {

    constructor() {
        super();
        this.state = {
            skills: [],
            loading: true
        };
    }
    componentDidMount() {
        this.getSkills();
    }
    getSkills() {
        const db = fire.firestore();
        db.collection("skills").get().then(querySnapshot => {
            const data = querySnapshot.docs.map(doc => {
                const dats = doc.data()
                return { id: doc.id, ...dats }
            });
            data.sort((a,b) => a.order < b.order ? -1 : 1);
            this.setState({
                skills: data,
                loading: false
            })
        });
    }
    render() {
        const skillBars = this.state.skills.map((skill) => <Progress key={skill.id} skill={skill} />)
        return (
            <div className="container text-white" id="skills">
                <h3>Skills</h3>
                <hr className="bg-white" />
                <div className="text-right my-3">
                    <a href="/skills" className="btn btn-outline-primary btn-sm">Show More...</a>
                </div>
                <div className="row">
                    <div className="col-sm-5 text-center">
                        <img src="./assets/Development3.png" className="img img-fluid" alt="img-skills" />
                        <br />
                    </div>
                    <div className="col-sm-7">
                        {this.state.loading ? (<Loading />) : skillBars}
                    </div>
                </div>
            </div>
        )
    }
}

export default Skills;