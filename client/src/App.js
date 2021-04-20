import React from "react";
import './App.css';

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {clips: []};
  }

  async fetchClips() {
    fetch("http://localhost:9000/")
        .then(res => res.json())
        .then(data => {
          let clips = []
          data.forEach(function(clip){
            clips.push('https://clips.twitch.tv/embed?clip=' + clip.substring(clip.indexOf('.tv')+4))
          })
          this.setState({clips: clips});
        })
        .catch(err => err);
  }

  componentDidMount() {
    this.fetchClips().catch(err => err);
  }

  render() {
    if (!this.state.clips) {
      return <span>Loading...</span>;
    }

    let clip = this.state.clips[0] + '&autoplay=true&parent=localhost';

    return (
        <div className="App">
          <iframe
              title="clip1"
              className="clip-iframe"
              src={clip}
              frameBorder="0" allowFullScreen="{true}" scrolling="no" height="400" width="620"
          />
        </div>
    );
  }
}