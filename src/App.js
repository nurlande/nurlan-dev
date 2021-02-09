import './App.css';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import Body from './Body';
import Header from './Core/Header';
import Footer from './Core/Footer';
import Skills from './Components/Skills';
import Projects from './Components/Projects';

function App() {
  return (
    <Router>
      <div className="hero-image">
        <Header />
        <div className="routes">
          <Route exact path="/" component={Body} />
          <Route exact path="/skills" component={Skills} />
          <Route exact path="/projects" component={Projects} />
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
