import React from "react";
import './App.css';

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {clips: [], currentClip: "", currentIt: 0};
    this.nextClip = this.nextClip.bind(this);
    this.prevClip = this.prevClip.bind(this);
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
          this.setState({currentClip: this.state.clips[0] + '&autoplay=true&parent=localhost'});
        })
        .catch(err => err);
  }

  nextClip(){
      if (this.state.currentIt < this.state.clips.length){
          this.setState((state) => {
              return {currentIt: state.currentIt + 1}
          });
          this.setState({currentClip: this.state.clips[this.state.currentIt] + '&autoplay=true&parent=localhost'})
      }
  }

  prevClip(){
    if (this.state.currentIt > 0){
        this.setState((state) => {
            return {currentIt: state.currentIt - 1}
        });
        this.setState({currentClip: this.state.clips[this.state.currentIt] + '&autoplay=true&parent=localhost'})
    }
  }

  componentDidMount() {
    this.fetchClips().catch(err => err);
  }

  render() {
    if (!this.state.clips) {
      return <span>Loading...</span>;
    }

    return (
        <div className="App">
            <button className="navButton" onClick={this.prevClip}>
                Previous
            </button>
          <iframe
              title="clip1"
              className="clip-iframe"
              src={this.state.currentClip}
              frameBorder="0" allowFullScreen="{true}" scrolling="no" height="720" width="1280"
          />
            <button className="navButton" onClick={this.nextClip}>
                Next
            </button>
        </div>
    );
  }
}