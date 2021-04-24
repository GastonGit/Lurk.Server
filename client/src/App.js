import React from "react";
import './App.css';

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {addedClips: [], clips: [], currentClip: "", noClips: false};
    this.nextClip = this.nextClip.bind(this);
  }

  async fetchClips() {
    fetch("http://localhost:9000/")
        .then(res => res.json())
        .then(data => {
          let clips = []
          data.forEach(function(clip){
            clips.push(clip);
          })
          this.setState({clips: [...clips], addedClips: [...clips]});

          if (clips.length === 0){
              this.setState({noClips: true});
          } else {
              this.nextClip();
          }
        })
        .catch(err => err);
  }

  updateList(){
      fetch("http://localhost:9000/")
          .then(res => res.json())
          .then(data => {
              let newClips = [...data]
              for (let i = 0; i < newClips.length; i++){
                  if (!this.state.addedClips.includes(newClips[i])){
                      let clips = [...this.state.clips];
                      clips.push(newClips[i]);

                      let addedClips = [...this.state.addedClips];
                      addedClips.push(newClips[i]);

                      this.setState({
                          clips: clips,
                          addedClips: addedClips
                      });
                  }
              }

              if (this.state.noClips){
                  this.setState({noClips: false})
                  this.nextClip();
              }
          })
          .catch(err => err);
  }

    nextClip(){
      if (this.state.clips.length > 0){
          let updatedArray = [...this.state.clips];
          let currentClip = updatedArray.shift();
          this.setState({
              currentClip: currentClip,
              clips: updatedArray
          })
      } else {
          this.setState({noClips: true})
      }
    }

  componentDidMount() {
    this.fetchClips().catch(err => err);
    document.querySelector(".videoClip").onended = function() {
          this.nextClip();
      }.bind(this);

    let updateInterval = setInterval(this.updateList.bind(this), 5000)
    this.setState({updateInterval: updateInterval});
  }

  componentWillUnmount(){
      clearInterval(this.state.updateInterval);
  }

    render() {
    if (!this.state.clips) {
      return <span>Loading...</span>;
    }

    return (
        <div className="App">
            <video className="videoClip" src={this.state.currentClip} autoPlay={true} muted>

            </video>
        </div>
    );
  }
}