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
            clips.push(clip);
          })
          this.setState({clips: clips});
          this.setState({currentClip: this.state.clips[0]});
        })
        .catch(err => err);
  }

  nextClip(){
      if (this.state.currentIt < this.state.clips.length){
          this.setState((state) => {
              return {currentIt: state.currentIt + 1}
          });
          this.setState({currentClip: this.state.clips[this.state.currentIt]})
      }
  }

  prevClip(){
    if (this.state.currentIt > 0){
        this.setState((state) => {
            return {currentIt: state.currentIt - 1}
        });
        this.setState({currentClip: this.state.clips[this.state.currentIt]})
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
            <video className="videoClip" src={this.state.currentClip} autoPlay={false}>

            </video>
            <button className="navButton" onClick={this.nextClip}>
                Next
            </button>
        </div>
    );
  }
}